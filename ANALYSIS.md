# BizWatch System Analysis: Tech Stack, AI Integration, and File Access Failure

## 1. TECHNOLOGY STACK

**Frontend:**
- React 19 + Vite (development server)
- TypeScript/JavaScript
- Redux + Redux Toolkit (state management)
- Tailwind CSS + Tailwind Merge (styling)
- React Router v7 (routing)
- Lucide React (icons)

**Backend:**
- Node.js v22.22.2
- Express.js (HTTP server)
- PostgreSQL via Neon (serverless database)
- Prisma ORM (database abstraction)
- Connect-pg-simple (session storage in PostgreSQL)

**AI & External Services:**
- Anthropic Claude SDK (v0.98.0 on frontend, v0.52.0 on backend)
- Google APIs library (googleapis v144.0.0)
- Google Auth Library (google-auth-library v9.15.0)
- PDF Parse (pdf-parse v2.4.5) for document extraction

**Runtime Environment:**
- Node.js CommonJS on backend
- ES Modules on frontend
- Vercel deployment-ready (serverless functions)

---

## 2. HOW THE AI IS BEING CALLED

### Current (Broken) Implementation: `/src/api/claude.js` 
This is **frontend code** that attempts to use MCP:
```javascript
// ❌ WRONG: Makes direct API call from frontend
const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': apiKey,  // ❌ API key exposed in browser
    'anthropic-beta': 'mcp-client-2025-04-04',  // MCP client header
  },
  body: JSON.stringify({
    mcp_servers: [  // ❌ Non-existent Google MCP server URLs
      {
        type: 'url',
        url: 'https://gmailmcp.googleapis.com/mcp/v1',  // ❌ This URL doesn't exist
        authorization_token: googleToken,  // ❌ googleToken never provided
      },
      // ... drive, calendar servers
    ],
  }),
})
```

**Problems:**
1. Makes API call directly from browser (security risk)
2. Tries to hardcode MCP server URLs that don't exist
3. Expects `x-google-token` header (never passed)
4. API key is client-side (massive security risk)

### Correct Implementation: `/server/src/routes/analyse.js`
This is **backend code** that actually works:
```javascript
// ✅ CORRECT: Uses googleapis library + OAuth2
const auth = makeOAuthClient(user.accessToken, user.refreshToken)
const { driveFiles, emails, events } = await fetchGoogleData(auth, { extractContents: true })

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
const message = await anthropic.messages.create({
  system: ANALYSE_PROMPT,
  messages: [{
    role: 'user',
    content: `Data:\n\n${JSON.stringify({ driveFiles, emails, events })}\n\nAnalyze it.`,
  }],
})
```

**Advantages:**
1. Fetches Google data server-side using stored tokens
2. Injects extracted file content into system prompt
3. Claude receives actual business data
4. API key stays server-side (secure)

### Chat Route: `/server/src/routes/analyse.js` POST `/api/claude`
The chat endpoint does similar work:
```javascript
// Fetch Google data if user asks about files
if (isFileContentRequest(lastUserMessage)) {
  const { driveFiles } = await fetchGoogleData(auth, { 
    extractContents: true,
    targetFileName: lastUserMessage 
  })
  enrichedSystem = `${system}\n\nLIVE DATA:\n${JSON.stringify(driveFiles)}`
}
```

---

## 3. HOW GOOGLE DRIVE & EXTERNAL SERVICES ARE CONNECTED

### OAuth 2.0 Flow
```
User → Frontend: "Connect to Google"
  ↓
Frontend: window.location.href = `${API_URL}/auth/google`
  ↓
Backend (/auth/google): 
  oauth2Client.generateAuthUrl() → redirects to Google consent screen
  ↓
User: Grants permissions (Drive, Gmail, Sheets, Calendar)
  ↓
Google: Redirects to /auth/google/callback?code=AUTH_CODE
  ↓
Backend (/auth/google/callback):
  - Exchanges code for access_token + refresh_token
  - Fetches user profile via oauth2.userinfo.get()
  - Stores user + tokens in PostgreSQL via Prisma
  - Sets session: req.session.userId = user.id
  - Redirects to /analytics
```

### Token Storage
- **Location:** PostgreSQL (table: `User`)
- **Fields:** `accessToken`, `refreshToken`
- **Lifecycle:** Stored after OAuth callback, used on every request to fetch Google data

### Data Extraction
The `fetchGoogleData()` function:
1. Creates OAuth2 client with stored tokens
2. Calls googleapis library for Drive, Gmail, Calendar APIs
3. For extractable file types (PDF, Docs, Sheets, TXT):
   - PDFs: Uses pdf-parse to extract text
   - Docs: Exports as plain text
   - Sheets: Exports as CSV
4. Limits content to 4000 chars per file (~1000 tokens)
5. Returns: `{ driveFiles, emails, events }`

### MCP Attempt (Not Used)
The `/src/api/claude.js` file tries to use Google MCP servers, but:
- **Those URLs don't exist:** `gmailmcp.googleapis.com`, `drivemcp.googleapis.com`
- **Never reaches that code:** Frontend calls the wrong endpoint
- **Google doesn't offer MCP servers:** Google's official integration is via OAuth + googleapis library

---

## 4. EXACT POINT OF FAILURE: WHERE AI CANNOT READ FILES

### The Chain of Failure

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND CHAT REQUEST                                           │
│ User: "Read my budget.xlsx file"                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓ fetch(/api/claude, POST)
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND `src/api/claude.js` ❌ WRONG FILE                     │
│ - Receives request from frontend                                │
│ - Attempts to use fetch() directly to Anthropic API             │
│ - Looks for googleToken in x-google-token header                │
│ - **Token is NEVER passed from frontend** ← FAILURE POINT #1    │
│ - mcpServers array becomes [] (empty)                           │
│ - Sends request WITHOUT any MCP servers                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓ fetch(https://api.anthropic.com/v1/messages)
┌─────────────────────────────────────────────────────────────────┐
│ ANTHROPIC API                                                   │
│ - Receives messages WITHOUT data                                │
│ - No mcp_servers configured                                     │
│ - Claude cannot access Google Workspace                         │
│ - Response: Generic answer, no file content ← FAILURE POINT #2 │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ↓ response.json()
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND                                                        │
│ - Displays Claude's generic response                            │
│ - "I don't have access to your files"                           │
└─────────────────────────────────────────────────────────────────┘
```

### Root Causes

1. **Frontend calls wrong endpoint**: `/src/api/claude.js` is a frontend file (not backend), makes direct Anthropic calls
2. **No token passing mechanism**: Frontend has no access to Google tokens (they're server-side only)
3. **Wrong architecture**: Should go through Express backend to access stored tokens
4. **Hardcoded wrong MCP URLs**: `gmailmcp.googleapis.com/mcp/v1` doesn't exist
5. **MCP approach is wrong for Google**: Google doesn't provide official MCP servers; use OAuth2 + googleapis library

---

## 5. WHAT IS MISSING OR MISCONFIGURED

### Missing #1: Backend `/api/claude` Endpoint
The Express backend needs a proper `/api/claude` route that:
- Receives authenticated session
- Retrieves user's Google tokens from PostgreSQL
- Fetches Google data server-side
- Injects data into system prompt
- Calls Claude SDK
- Returns response

**Current Status:** Exists at `/server/src/routes/analyse.js` POST `/api/claude` but:
- Only handles full analysis mode
- Doesn't handle streaming chat properly
- Frontend doesn't route chat through it

### Missing #2: Frontend → Backend Routing
The frontend `src/services/bizwatchApi.js` calls:
```javascript
const CLAUDE_API_URL = `${import.meta.env.VITE_API_URL}/api/claude`
```

But this makes a direct fetch, not going through the backend route. It should:
```javascript
// ✅ GO THROUGH BACKEND FIRST
const res = await fetch('/api/claude', {  // Vite proxies to backend
  credentials: 'include',  // Sends session cookie
  ...
})
```

### Missing #3: MCP Implementation (Incorrect Approach)
The `/src/api/claude.js` file attempts to use MCP but:
- Google doesn't provide MCP servers
- URLs are hardcoded and non-existent
- Token isn't passed from frontend
- Should be deleted; OAuth2 approach is correct

### Missing #4: Token Refresh Logic
The backend fetches tokens but doesn't refresh them when expired:
```javascript
// ❌ MISSING: refresh token handling
const auth = makeOAuthClient(user.accessToken, user.refreshToken)
// If accessToken is expired, this call fails
```

**Should include:**
```javascript
// ✅ Check and refresh if needed
auth.on('tokens', (tokens) => {
  // Save new tokens to DB
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || user.refreshToken
    }
  })
})
```

### Missing #5: Error Handling for File Extraction
The `extractFileContent()` function catches errors but doesn't distinguish between:
- Unsupported file types (expected)
- Permission denied (need to re-authenticate)
- Temporary network failure (retry)

**Current behavior:**
```javascript
catch (err) {
  console.warn(`Could not extract content from "${file.name}":`, err.message)
}
return null  // User never knows why
```

---

## ARCHITECTURAL SUMMARY

### What's Working ✅
- Google OAuth2 authentication flow
- Token storage in PostgreSQL
- File extraction via googleapis library (PDFs, Docs, Sheets, TXT)
- Full analysis endpoint (`/api/analyse`)
- System prompt injection with live data

### What's Broken ❌
- Frontend Claude endpoint (`/src/api/claude.js`) is misconfigured
- Chat doesn't pass through backend to access Google data
- MCP approach is fundamentally wrong for Google integration
- Token refresh not implemented
- No file content in chat responses

### How to Fix (Priority Order)
1. Delete `/src/api/claude.js` (wrong approach)
2. Route frontend chat through `/api/claude` backend endpoint
3. Modify backend chat route to fetch Google data like `/api/analyse` does
4. Add token refresh logic
5. Add error handling distinguishing between error types
6. Test with real user file requests

---

## NEXT STEPS
Refer to [FIXES.md](FIXES.md) for specific code implementations.
