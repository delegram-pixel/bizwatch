You are a senior full-stack engineer fixing the BizWatch overwatch system.

The full analysis is already done. Here is what is broken and what to fix, in priority order:

## FIXES TO IMPLEMENT

### Fix 1: Delete the wrong file
Delete `/src/api/claude.js` entirely. It is a frontend file making direct Anthropic API calls with exposed API keys and non-existent MCP URLs. It must go.

### Fix 2: Route frontend chat through the backend
In `/src/services/bizwatchApi.js`, ensure the chat request goes through the Express backend with session credentials:
- URL must proxy through Vite to the backend `/api/claude`
- Request must include `credentials: 'include'` to send the session cookie

### Fix 3: Update the backend `/api/claude` chat route
In `/server/src/routes/analyse.js`, update the POST `/api/claude` handler to:
- Retrieve the authenticated user's Google tokens from PostgreSQL via Prisma
- Call `fetchGoogleData(auth, { extractContents: true })` before calling Claude
- Inject the returned `driveFiles`, `emails`, and `events` into the system prompt
- Call Claude via the Anthropic SDK server-side (never client-side)
- Return the response to the frontend

### Fix 4: Add token refresh logic
In the function that creates the OAuth2 client (`makeOAuthClient`), add a listener:
- Listen for the `tokens` event on the auth client
- When fired, update the user's `accessToken` and `refreshToken` in PostgreSQL via Prisma

### Fix 5: Improve file extraction error handling
In `extractFileContent()`, distinguish between error types:
- Unsupported file type → skip silently
- Permission denied (403) → flag for re-authentication
- Network failure → retry once, then return null with a clear reason

## RULES
- Do not use MCP for Google integration. Google does not provide MCP servers. Use OAuth2 + googleapis library only.
- API keys stay server-side only, never in frontend code.
- All Google data fetching happens on the backend using stored tokens.
- Show me the complete updated code for each file you change.