# BizWatch File Access Fixes: Implementation Guide

---

## FIX #1: Delete the Broken Frontend Claude Endpoint

### File to Delete
`/home/thevisionary/Documents/bizwatch/src/api/claude.js`

**Why:** This file makes direct API calls from the browser, attempts to use non-existent MCP URLs, and never receives the Google token it expects. It's incompatible with BizWatch's architecture.

---

## FIX #2: Update Frontend Service to Route Through Backend

### File: `src/services/bizwatchApi.js`

**Current (Broken):**
```javascript
const CLAUDE_API_URL = `${import.meta.env.VITE_API_URL}/api/claude`

export async function sendChatMessage(messages) {
  const res = await fetch(CLAUDE_API_URL, {  // ❌ Goes to frontend file
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })
  // ... rest of function
}
```

**Fixed:**
```javascript
// ✅ Route through backend proxy (Express handles this via Vite proxy config)
const CLAUDE_API_URL = '/api/claude'  // Proxies to http://localhost:3000/api/claude

export async function sendChatMessage(messages) {
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    credentials: 'include',  // ✅ Sends session cookie
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Claude API error ${res.status}`)
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text ?? ''

  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    return {
      response: parsed.response ?? cleaned,
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
    }
  } catch {
    return { response: cleaned, insights: [] }
  }
}
```

**Vite Config Already Supports This:** `/vite.config.js` already has the proxy configured:
```javascript
server: {
  proxy: {
    '/api/claude': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
    // ... other proxies
  },
}
```

✅ **No changes needed to vite.config.js**

---

## FIX #3: Enhance Backend Chat Route to Include Google Data

### File: `server/src/routes/analyse.js`

**Current Implementation:**
The POST `/api/claude` route exists but it's basic. Enhance it to match the analysis pattern:

**Current Code** (lines 318-346):
```javascript
// POST /api/claude — server-side proxy
router.post('/claude', async (req, res) => {
  try {
    const { model, max_tokens, system, messages } = req.body
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

    let enrichedSystem = system

    if (req.session?.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.session.userId },
          select: { accessToken: true, refreshToken: true },
        })

        if (user?.accessToken) {
          const auth = makeOAuthClient(user.accessToken, user.refreshToken)
          const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

          // Only extract file contents when the user is clearly asking about a file
          const wantsFileContent = isFileContentRequest(lastUserMessage)
          const { driveFiles, emails, events } = await fetchGoogleData(auth, {
            extractContents: wantsFileContent,
            targetFileName: wantsFileContent ? lastUserMessage : null,
          })
          const dataContext = JSON.stringify({ driveFiles, emails, events }, null, 2)
          enrichedSystem = `${system}\n\n---\n\nLIVE WORKSPACE DATA (as of this request):\n${dataContext}`
        }
      } catch (dataErr) {
        console.warn('Could not fetch Google data for chat:', dataErr.message)
        // Continue without data rather than failing the whole request
      }
    }

    const message = await anthropic.messages.create({ model, max_tokens, system: enrichedSystem, messages })
    res.json(message)
  } catch (err) {
    console.error('POST /api/claude error:', err)
    const status = err.status ?? 500
    res.status(status).json({ error: err.message ?? 'Claude API error' })
  }
})
```

**Enhanced with Token Refresh:**
```javascript
// POST /api/claude — server-side proxy with Google Workspace integration
router.post('/claude', async (req, res) => {
  try {
    const { model, max_tokens, system, messages } = req.body

    if (!model || !messages) {
      return res.status(400).json({ error: 'model and messages required' })
    }

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

    let enrichedSystem = system || ''
    let tokensRefreshed = false

    // ✅ FIX #4: Add token refresh + Google data injection
    if (req.session?.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.session.userId },
          select: { id: true, accessToken: true, refreshToken: true },
        })

        if (user?.accessToken) {
          const auth = makeOAuthClient(user.accessToken, user.refreshToken)

          // ✅ FIX #4: Refresh tokens if needed
          auth.on('tokens', (tokens) => {
            if (tokens.refresh_token || tokens.access_token) {
              prisma.user.update({
                where: { id: user.id },
                data: {
                  ...(tokens.access_token && { accessToken: tokens.access_token }),
                  ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
                },
              }).catch((err) => console.warn('Could not update tokens:', err.message))
              tokensRefreshed = true
            }
          })

          const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

          // Only extract file contents when the user is clearly asking about a file
          const wantsFileContent = isFileContentRequest(lastUserMessage)
          const { driveFiles, emails, events } = await fetchGoogleData(auth, {
            extractContents: wantsFileContent,
            targetFileName: wantsFileContent ? lastUserMessage : null,
          })

          const dataContext = JSON.stringify({ driveFiles, emails, events }, null, 2)
          enrichedSystem = `${system || ''}\n\n---\n\nLIVE WORKSPACE DATA (as of ${new Date().toISOString()}):\n${dataContext}`
        }
      } catch (dataErr) {
        console.warn('Could not fetch Google data for chat:', dataErr.message)
        // Continue without data rather than failing the whole request
        // ✅ FIX #5: More detailed logging
        if (dataErr.message?.includes('invalid_grant')) {
          return res.status(401).json({ 
            error: 'Google authentication expired. Please reconnect your account.',
            code: 'AUTH_EXPIRED'
          })
        }
      }
    }

    const message = await anthropic.messages.create({ 
      model, 
      max_tokens, 
      system: enrichedSystem, 
      messages 
    })
    res.json(message)
  } catch (err) {
    console.error('POST /api/claude error:', err)
    const status = err.status ?? 500
    res.status(status).json({ error: err.message ?? 'Claude API error' })
  }
})
```

---

## FIX #4: Add Token Refresh Logic

### Already Addressed in FIX #3

The enhanced route includes:
```javascript
auth.on('tokens', (tokens) => {
  prisma.user.update({
    where: { id: user.id },
    data: {
      ...(tokens.access_token && { accessToken: tokens.access_token }),
      ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
    },
  }).catch(...)
})
```

This ensures:
- When googleapis library refreshes an expired access_token
- The new token is automatically saved to the database
- Future requests use the valid token

---

## FIX #5: Improve Error Handling in `extractFileContent()`

### File: `server/src/routes/analyse.js`, Function `extractFileContent()` (lines 18-54)

**Current:**
```javascript
async function extractFileContent(driveClient, file) {
  try {
    const { id, type } = file

    if (type === 'application/vnd.google-apps.document') {
      const res = await driveClient.files.export(...)
      return String(res.data).slice(0, CHARS_PER_FILE)
    }
    // ... other types
  } catch (err) {
    console.warn(`Could not extract content from "${file.name}":`, err.message)  // ❌ Silent failure
  }
  return null
}
```

**Enhanced with Better Error Handling:**
```javascript
async function extractFileContent(driveClient, file) {
  try {
    const { id, type, name } = file

    if (type === 'application/vnd.google-apps.document') {
      const res = await driveClient.files.export(
        { fileId: id, mimeType: 'text/plain' },
        { responseType: 'text' }
      )
      return String(res.data).slice(0, CHARS_PER_FILE)
    }

    if (type === 'application/vnd.google-apps.spreadsheet') {
      const res = await driveClient.files.export(
        { fileId: id, mimeType: 'text/csv' },
        { responseType: 'text' }
      )
      return String(res.data).slice(0, CHARS_PER_FILE)
    }

    if (type === 'application/pdf') {
      const res = await driveClient.files.get(
        { fileId: id, alt: 'media' },
        { responseType: 'arraybuffer' }
      )
      const buffer = Buffer.isBuffer(res.data)
        ? res.data
        : Buffer.from(res.data)
      const parsed = await pdfParse(buffer)
      return parsed.text.slice(0, CHARS_PER_FILE)
    }

    if (type === 'text/plain') {
      const res = await driveClient.files.get(
        { fileId: id, alt: 'media' },
        { responseType: 'text' }
      )
      return String(res.data).slice(0, CHARS_PER_FILE)
    }

    // ✅ FIX #5: Log unsupported types (don't fail, just skip)
    console.debug(`File "${name}" (${type}) is not extractable`)
    return null
  } catch (err) {
    // ✅ FIX #5: Distinguish between different error types
    if (err.code === '403') {
      console.warn(`Permission denied reading "${file.name}": ${err.message}`)
      return null  // User needs to re-authenticate
    }

    if (err.code === '404') {
      console.warn(`File "${file.name}" not found: ${err.message}`)
      return null  // File was deleted
    }

    if (err.message?.includes('invalid_grant')) {
      console.error(`Auth token invalid for "${file.name}": ${err.message}`)
      throw err  // Re-throw to trigger re-auth flow
    }

    // Generic error
    console.warn(`Could not extract content from "${file.name}":`, err.message)
    return null
  }
}
```

---

## FIX #6: Update System Prompt to Be Honest About Data Availability

### File: `server/src/routes/analyse.js`, Variable `SYSTEM_PROMPT` (lines 258-271)

**Current:**
The ANALYSE_PROMPT assumes data is always available. 

**Enhanced to Handle Empty Data:**
```javascript
const ANALYSE_PROMPT = `You are BizWatch AI — a business intelligence layer for small business owners.

You will receive raw data from the user's Google Workspace. 

**IMPORTANT:** If the data structure is empty or contains no files/emails/events, respond with:
{
  "connectedSources": { "drive": true, "gmail": true, "sheets": true, "calendar": true },
  "insights": {
    "summary": "No recent activity found in your Google Workspace.",
    "insights": []
  },
  "predictions": {
    "outlook": "neutral",
    "predictions": []
  },
  "alerts": {
    "unread_count": 0,
    "alerts": []
  }
}

Otherwise, analyse the data and return a JSON object with this exact shape:
{
  "connectedSources": { "drive": true, "gmail": true, "sheets": true, "calendar": true },
  "insights": {
    "summary": "<2-3 sentence executive summary>",
    "insights": [
      { "id": "ins_001", "type": "financial|communication|client|operational", "title": "<short title>", "detail": "<1-2 specific sentences>", "severity": "critical|warning|info", "source": "drive|gmail|sheets|calendar", "timestamp": "<ISO timestamp>" }
    ]
  },
  // ... rest of schema
}

Derive everything from the actual data provided. Use ₦ for financial figures unless another currency is evident. Be specific — reference actual file names, email senders, event titles.`
```

---

## FIX #7: Add Session Validation Middleware

### File: Create `server/src/middleware/requireAuth.js` (Already Exists)

**Current:**
```javascript
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

module.exports = requireAuth
```

**Enhanced to Check Google Connection:**
```javascript
const prisma = require('../lib/prisma')

async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // ✅ FIX #7: Ensure user has connected Google account
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, accessToken: true, googleId: true },
    })

    if (!user) {
      req.session.destroy(() => {})
      return res.status(401).json({ error: 'User not found' })
    }

    if (!user.accessToken) {
      return res.status(403).json({ 
        error: 'Google Workspace not connected',
        code: 'GOOGLE_NOT_CONNECTED'
      })
    }

    // Attach user to request for downstream routes
    req.user = user
  } catch (err) {
    return res.status(500).json({ error: 'Authentication check failed' })
  }

  next()
}

module.exports = requireAuth
```

---

## Summary of Changes

| Fix | File | Change | Impact |
|-----|------|--------|--------|
| #1 | `src/api/claude.js` | **DELETE** | Removes broken MCP implementation |
| #2 | `src/services/bizwatchApi.js` | Route via `/api/claude` (backend) | Chat gets Google data |
| #3 | `server/src/routes/analyse.js` | Enhance POST `/api/claude` | Token refresh + data injection |
| #4 | `server/src/routes/analyse.js` | Add auth.on('tokens') | Expired tokens auto-refresh |
| #5 | `server/src/routes/analyse.js` | Enhanced extractFileContent() | Better error messages |
| #6 | `server/src/routes/analyse.js` | Update ANALYSE_PROMPT | Handle empty data gracefully |
| #7 | `server/src/middleware/requireAuth.js` | Add Google connection check | Fail fast if not connected |

---

## Testing the Fixes

1. **Start the server:**
   ```bash
   cd server && npm run dev
   ```

2. **In another terminal, start Vite:**
   ```bash
   npm run dev
   ```

3. **Test file reading:**
   - Navigate to chat page
   - Ask: "Read my budget.xlsx file"
   - Should see file content in Claude's response

4. **Check browser DevTools:**
   - Network tab should show POST to `/api/claude`
   - Should proxy to `http://localhost:3000/api/claude`
   - Should include session cookie

5. **Check server logs:**
   - Should see "LIVE WORKSPACE DATA" injected into system prompt
   - Should see file names and content extracted

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "Cannot read properties of undefined" | Missing `/src/api/claude.js` after deletion | ✅ Confirm file is deleted |
| 401 Unauthorized | Session not sent | ✅ Check `credentials: 'include'` in fetch |
| 403 Google not connected | User hasn't done OAuth flow | ✅ Redirect to `/auth/google` |
| "invalid_grant" error | Access token expired, refresh token invalid | ✅ User needs to re-authenticate |
| No file content in response | `extractContents: false` or file type unsupported | ✅ Check file type is in EXTRACTABLE_TYPES |
| Vite proxy not working | Backend not running | ✅ Ensure `npm run dev` in server/ folder first |

