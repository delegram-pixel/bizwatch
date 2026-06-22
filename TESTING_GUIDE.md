# Quick Testing Guide

## Before You Start
Ensure both services are running:

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend (root)
npm run dev
```

---

## Test 1: Basic Chat Without File Request
**Goal:** Verify chat works without needing Google data

1. Navigate to: http://localhost:5173/chat
2. Ask: "What's the weather today?"
3. Should see a normal response (no Google data needed)
4. **Expected:** Chat works, no errors

---

## Test 2: Chat With File Request (No Files Yet)
**Goal:** Verify system handles no-file scenario gracefully

1. Ask: "Read my budget.xlsx"
2. Should see response: "Once your Google Workspace is connected, I can tell you exactly..."
3. **Expected:** Graceful fallback message

---

## Test 3: Connect Google Account
**Goal:** Enable file access

1. Click "Workspace" or "Settings"
2. Click "Connect to Google"
3. Authorize with your Google account
4. Confirm redirect back to app
5. **Expected:** Status shows "Google Drive: Connected"

---

## Test 4: Chat With File Request (With Access)
**Goal:** Verify AI reads actual files

1. Ask: "What's in my Google Drive?"
2. Should see:
   - List of recent files
   - File contents (first 5 extractable files)
   - Analysis of what's in them
3. **Expected:** File names and content appear in response

---

## Test 5: Ask About Specific File
**Goal:** Verify targeted file extraction

1. Ask: "Read my invoices.csv"
2. Should see:
   - That specific file listed
   - Its content extracted and displayed
3. **Expected:** Correct file targeted and content shown

---

## Test 6: Check Network Tab
**Goal:** Verify data flow through backend

1. Open DevTools (F12)
2. Go to Network tab
3. Ask a file-related question
4. Look for POST request to `/api/claude`
5. Click the request → Response tab
6. Should see `"content":[{"type":"text","text":"..."}]` with file data
7. **Expected:** Response contains injected Google Workspace data

---

## Test 7: Check Server Logs
**Goal:** Verify backend is processing requests

Look at the terminal running `npm run dev` in the server folder:

Should see logs like:
```
POST /api/claude
Could fetch Google data for chat
Returned message to client
```

Or for file requests:
```
POST /api/claude
Fetching Google data with extractContents: true
LIVE WORKSPACE DATA (as of 2026-06-04T15:30:00.000Z):
{
  "driveFiles": [
    { "name": "budget.xlsx", "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content": "..." }
  ],
  ...
}
```

---

## Test 8: Token Refresh (Long-Running Test)
**Goal:** Verify tokens auto-refresh without re-auth

1. Complete Test 3 (connect Google)
2. Make a request: "Show my calendar"
3. Wait for tokens to naturally expire (or manually invalidate in DB)
4. Make another request
5. **Expected:** Works without prompting to reconnect

---

## Troubleshooting

### Chat returns generic response (no file data)
**Check:**
- [ ] Is user authenticated? (see navbar user menu)
- [ ] Is Google Workspace connected? (Settings → Workspace status)
- [ ] Does browser send session cookie? (DevTools → Network → /api/claude → Cookies)
- [ ] Are file extracts working? (Check server logs for `extractFileContent`)

### 401 "Google authentication expired"
**Fix:**
- Reconnect Google account
- Server logs should show: `invalid_grant` error

### 403 "Permission denied"
**Fix:**
- Check file permissions in Google Drive
- Make sure file is shared with the account you logged in with

### Files show in list but not extracted
**Possible causes:**
- File type not supported (must be PDF, Google Doc, Google Sheet, or TXT)
- File too large (truncated at 4000 chars per file)
- Permission denied (should show 403 error)

### Server crashes on startup
**Check:**
- [ ] Did you run `npm run dev` in server folder first?
- [ ] Are all env vars set in `.env`?
- [ ] Did you run `npx prisma generate`?

---

## Files Changed

| File | Change | Status |
|------|--------|--------|
| `/src/api/claude.js` | Deleted | ✅ |
| `/src/services/bizwatchApi.js` | No changes needed | ✅ |
| `/server/src/routes/analyse.js` | Enhanced with token refresh + error handling | ✅ |

---

## Optional: Google Vision OCR (high accuracy)

If you enabled Google Vision (`ENABLE_GOOGLE_VISION=true`) you can use the Vision API for better OCR results on complex invoices. Follow these steps:

1. Create a Google Cloud project and enable the Vision API and Cloud Storage.
2. Create a service account and grant it `roles/storage.objectAdmin` and `roles/vision.admin` (or more limited roles as appropriate).
3. Create a Cloud Storage bucket and set `GOOGLE_CLOUD_STORAGE_BUCKET` to its name in your `.env`.
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the service account JSON, or export the JSON into the environment.
5. Add to server deps and install (already added to `server/package.json`):

```bash
cd server
npm install
```

6. Enable the feature in `.env`:

```
ENABLE_GOOGLE_VISION=true
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

Notes:
- The server will attempt Vision OCR on images when `ENABLE_GOOGLE_VISION` is `true`.
- For multi-page PDFs, the code will upload the PDF to the configured GCS bucket and call `asyncBatchAnnotateFiles`. You will need to fetch the output from the Cloud Storage output folder — the helper currently throws an instructive error after processing to indicate where outputs are stored.
- If Vision is not available, the server falls back to `ocrmypdf` and then `tesseract`.


## Success Indicators

You'll know it's working when:

1. ✅ Chat sends request to `/api/claude` (Network tab)
2. ✅ Server logs show "LIVE WORKSPACE DATA" injected
3. ✅ AI response includes actual file names and content
4. ✅ No errors about missing API keys in frontend
5. ✅ Token refresh happens silently on expiry
6. ✅ Asking about files returns specific data, not generic responses


the ai should only display work related