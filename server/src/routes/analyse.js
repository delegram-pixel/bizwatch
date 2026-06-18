const { Router } = require('express')
const { google } = require('googleapis')
const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs/promises')
const os = require('os')
const path = require('path')
const { execFile, spawn } = require('child_process')
const util = require('util')
const execFileAsync = util.promisify(execFile)

async function ocrThenExtract(buffer) {
  const tmp = os.tmpdir()
  const stamp = Date.now()
  const inPath = path.join(tmp, `bizwatch-in-${stamp}.pdf`)
  const outPath = path.join(tmp, `bizwatch-out-${stamp}.pdf`)

  await fs.writeFile(inPath, buffer)

  // Try OCRmyPDF first (preferred, creates searchable PDF)
  try {
    // If Google Vision is enabled and client is available, prefer it for better layout handling
    if (process.env.ENABLE_GOOGLE_VISION === 'true') {
      try {
        const visionText = await visionOcrPdfFallback(inPath, buffer)
        if (visionText && visionText.trim().length > 0) {
          await Promise.allSettled([fs.unlink(inPath), fs.unlink(outPath)])
          return visionText
        }
      } catch (vErr) {
        console.warn('Google Vision OCR failed, falling back to ocrmypdf:', vErr.message)
      }
    }

    await execFileAsync('ocrmypdf', ['--skip-text', inPath, outPath])
    const outBuffer = await fs.readFile(outPath)
    const parsed = await new PDFParse({ data: outBuffer }).getText()
    // cleanup
    await Promise.allSettled([fs.unlink(inPath), fs.unlink(outPath)])
    return parsed.text || ''
  } catch (err) {
    // If ocrmypdf is not installed or fails, try pdftoppm + tesseract
    if (err.code !== 'ENOENT') {
      // proceed to fallback on other errors too
      console.warn('ocrmypdf failed, falling back to pdftoppm+tesseract:', err.message)
    }
  }

  // Fallback: convert PDF pages to PNGs, then run tesseract on each
  const prefix = path.join(tmp, `bizwatch-pg-${stamp}`)
  try {
    await execFileAsync('pdftoppm', ['-png', inPath, prefix])
    // pdftoppm writes files like prefix-1.png, prefix-2.png, ...
    const dirFiles = await fs.readdir(tmp)
    const pageFiles = dirFiles
      .filter((f) => f.startsWith(path.basename(prefix)))
      .map((f) => path.join(tmp, f))
      .sort()

    let combined = ''
    for (const imgPath of pageFiles) {
      try {
        // If Google Vision enabled, use it for image->text per page
        if (process.env.ENABLE_GOOGLE_VISION === 'true') {
          try {
            const pageBuffer = await fs.readFile(imgPath)
            const visionPageText = await visionOcrImage(pageBuffer)
            combined += String(visionPageText) + '\n'
            continue
          } catch (vErr) {
            console.warn('visionOcrImage failed, falling back to tesseract:', vErr.message)
          }
        }

        const { stdout } = await execFileAsync('tesseract', [imgPath, 'stdout'])
        combined += String(stdout) + '\n'
      } catch (tErr) {
        console.warn('tesseract failed on', imgPath, tErr.message)
      }
    }

    // cleanup
    const toRemove = [inPath, ...pageFiles]
    await Promise.allSettled(toRemove.map((p) => fs.unlink(p).catch(() => {})))
    return combined
  } catch (fallbackErr) {
    // cleanup input file
    await fs.unlink(inPath).catch(() => {})
    throw fallbackErr
  }
}

// Optional Google Vision helpers
async function visionOcrImage(buffer) {
  try {
    const vision = require('@google-cloud/vision')
    const client = new vision.ImageAnnotatorClient()
    const [result] = await client.documentTextDetection({ image: { content: buffer } })
    return result.fullTextAnnotation?.text ?? ''
  } catch (err) {
    throw err
  }
}

// For PDFs, user should set up a GCS bucket and credentials. This helper attempts
// to use the Vision API by uploading to a bucket if env variables are set. If not,
// it throws to allow local ocrmypdf fallback.
async function visionOcrPdfFallback(inPath, buffer) {
  // If no bucket configured, bail out
  const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET
  if (!bucketName) throw new Error('GOOGLE_CLOUD_STORAGE_BUCKET not configured')

  // Lazy require to avoid hard dependency unless enabled
  const { Storage } = require('@google-cloud/storage')
  const vision = require('@google-cloud/vision')
  const storage = new Storage()
  const client = new vision.ImageAnnotatorClient()

  const gcsName = `bizwatch-ocr-${Date.now()}.pdf`
  const bucket = storage.bucket(bucketName)
  const file = bucket.file(gcsName)
  await file.save(buffer)

  const gcsUri = `gs://${bucketName}/${gcsName}`

  const request = {
    requests: [
      {
        inputConfig: {
          mimeType: 'application/pdf',
          gcsSource: { uri: gcsUri },
        },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        outputConfig: { gcsDestination: { uri: `gs://${bucketName}/vision-output-${Date.now()}/` } },
      },
    ],
  }

  const [operation] = await client.asyncBatchAnnotateFiles(request)
  await operation.promise()

  // Note: Parsing the output requires reading files from the GCS output location.
  // For brevity, throw instructive error to guide operator to retrieve results.
  throw new Error('Vision asyncBatchAnnotateFiles completed. Please fetch results from GCS output location.')
}
const prisma = require('../lib/prisma')
const requireAuth = require('../middleware/requireAuth')

const router = Router()

const EXTRACTABLE_TYPES = new Set([
  'application/pdf',
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'text/plain',
])

const CHARS_PER_FILE = 7000

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
      const buffer = Buffer.isBuffer(res.data) ? res.data : Buffer.from(res.data)
      const markdown = await new Promise((resolve, reject) => {
        const script = path.join(__dirname, '..', '..', 'pdf_to_markdown.py')
        const py = spawn('python3', [script])
        const chunks = []
        py.stdout.on('data', (chunk) => chunks.push(chunk))
        py.stderr.on('data', (err) => console.warn('pdf_to_markdown stderr:', err.toString()))
        py.on('close', (code) => {
          if (code !== 0) return reject(new Error(`pdf_to_markdown exited with code ${code}`))
          resolve(Buffer.concat(chunks).toString('utf8'))
        })
        py.on('error', reject)
        py.stdin.write(buffer)
        py.stdin.end()
      })
      return markdown.slice(0, CHARS_PER_FILE)
    }

    if (type === 'text/plain') {
      const res = await driveClient.files.get(
        { fileId: id, alt: 'media' },
        { responseType: 'text' }
      )
      return String(res.data).slice(0, CHARS_PER_FILE)
    }

    // Unsupported file type — skip silently
    return null
  } catch (err) {
    // Fix 5: Distinguish between error types
    if (err.code === '403' || err.message?.includes('403')) {
      console.warn(`Permission denied reading "${file.name}": ${err.message}`)
      return null  // User needs to re-authenticate
    }

    if (err.code === '404' || err.message?.includes('404')) {
      console.warn(`File "${file.name}" not found: ${err.message}`)
      return null  // File was deleted
    }

    if (err.message?.includes('invalid_grant')) {
      console.error(`Auth token invalid for "${file.name}": ${err.message}`)
      throw err  // Re-throw to trigger re-auth flow in caller
    }

    // Generic network or other errors
    console.warn(`Could not extract content from "${file.name}":`, err.message)
    return null
  }
}

const FILE_REQUEST_PATTERN = /\b(read|open|summarize|summarise|what(('s| is) in| does .+ say)|contents? of|extract|show me|analyse|analyze)\b/i

function isFileContentRequest(message) {
  return FILE_REQUEST_PATTERN.test(message)
}

function makeOAuthClient(accessToken, refreshToken, userId) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })

  // Fix 4: Add token refresh listener
  if (userId) {
    client.on('tokens', (tokens) => {
      if (tokens.access_token || tokens.refresh_token) {
        prisma.user
          .update({
            where: { id: userId },
            data: {
              ...(tokens.access_token && { accessToken: tokens.access_token }),
              ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
            },
          })
          .catch((err) => console.warn('Could not update tokens in DB:', err.message))
      }
    })
  }

  return client
}

async function fetchGoogleData(auth, { extractContents = false, targetFileName = null } = {}) {
  const driveClient = google.drive({ version: 'v3', auth })
  const gmailClient = google.gmail({ version: 'v1', auth })
  const calendarClient = google.calendar({ version: 'v3', auth })

  const [driveRes, gmailRes, calendarRes] = await Promise.allSettled([
    driveClient.files.list({
      pageSize: 20,
      orderBy: 'modifiedTime desc',
      fields: 'files(id,name,mimeType,modifiedTime,size)',
    }),
    gmailClient.users.messages.list({
      userId: 'me',
      maxResults: 30,
      q: 'in:inbox',
    }),
    calendarClient.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    }),
  ])

  // Build drive file list — keep id for content extraction
  const rawFiles = driveRes.status === 'fulfilled'
    ? (driveRes.value.data.files ?? [])
    : []

  let driveFiles
  if (extractContents) {
    // If a target filename is given, extract only files whose name matches the query.
    // Otherwise (e.g. /api/analyse full analysis) extract top 5 extractable files.
    const query = targetFileName?.toLowerCase() ?? ''
    const candidates = rawFiles.filter((f) => EXTRACTABLE_TYPES.has(f.mimeType))
    const nameMatches = query
      ? candidates.filter((f) => f.name.toLowerCase().includes(query) || query.includes(f.name.toLowerCase())).slice(0, 2)
      : []
    // Fall back to top 5 extractable files when no filename matches the query
    const extractable = nameMatches.length > 0 ? nameMatches : candidates.slice(0, 5)

    const contentResults = await Promise.allSettled(
      extractable.map((f) => extractFileContent(driveClient, { id: f.id, type: f.mimeType, name: f.name }))
    )
    driveFiles = rawFiles.map((f) => {
      const idx = extractable.findIndex((e) => e.id === f.id)
      const content = idx !== -1 && contentResults[idx].status === 'fulfilled'
        ? contentResults[idx].value
        : null
      return {
        name: f.name,
        type: f.mimeType,
        modified: f.modifiedTime,
        ...(content ? { content } : {}),
      }
    })
  } else {
    driveFiles = rawFiles.map((f) => ({
      name: f.name,
      type: f.mimeType,
      modified: f.modifiedTime,
    }))
  }

  // Fetch subject/sender for first 10 emails
  let emails = []
  if (gmailRes.status === 'fulfilled') {
    const messageIds = (gmailRes.value.data.messages ?? []).slice(0, 10).map((m) => m.id)
    const emailDetails = await Promise.allSettled(
      messageIds.map((id) =>
        gmailClient.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        })
      )
    )
    emails = emailDetails
      .filter((r) => r.status === 'fulfilled')
      .map((r) => {
        const headers = r.value.data.payload?.headers ?? []
        const get = (name) => headers.find((h) => h.name === name)?.value ?? ''
        return { subject: get('Subject'), from: get('From'), date: get('Date') }
      })
  }

  const events =
    calendarRes.status === 'fulfilled'
      ? (calendarRes.value.data.items ?? []).map((e) => ({
          title: e.summary,
          start: e.start?.dateTime ?? e.start?.date,
          end: e.end?.dateTime ?? e.end?.date,
        }))
      : []

  return { driveFiles, emails, events }
}

const ANALYSE_PROMPT = `You are BizWatch AI — a business intelligence layer for small business owners.

You will receive raw data from the user's Google Workspace. Analyse it and return a JSON object with this exact shape (no markdown, no preamble):
{
  "connectedSources": { "drive": true, "gmail": true, "sheets": true, "calendar": true },
  "insights": {
    "summary": "<2-3 sentence executive summary>",
    "insights": [
      { "id": "ins_001", "type": "financial|communication|client|operational", "title": "<short title>", "detail": "<1-2 specific sentences>", "severity": "critical|warning|info", "source": "drive|gmail|sheets|calendar", "timestamp": "<ISO timestamp>", "source_file": "<exact file name from driveFiles or null>", "source_quote": "<verbatim sentence or phrase from the document content that supports this insight, or null>" }
    ]
  },
  "predictions": {
    "outlook": "positive|cautious|negative",
    "predictions": [
      { "id": "pred_001", "type": "cashflow|workload|churn|growth", "title": "<short title>", "detail": "<specific forecast>", "confidence": "high|medium|low", "timeframe": "<e.g. 2 weeks>", "recommended_action": "<concrete action>", "source": "drive|gmail|sheets|calendar", "source_file": "<exact file name from driveFiles or null>", "source_quote": "<verbatim sentence or phrase from the document content that supports this prediction, or null>" }
    ]
  },
  "alerts": {
    "unread_count": <number>,
    "alerts": [
      { "id": "alert_001", "type": "churn_risk|contract_expiry|overdue_payment|deadline", "title": "<short title>", "detail": "<specific detail>", "urgency": "critical|high|medium", "action_required": "<concrete action>", "deadline": "<ISO timestamp or null>", "source": "drive|gmail|sheets|calendar", "client_or_entity": "<name or null>", "source_file": "<exact file name from driveFiles or null>", "source_quote": "<verbatim sentence or phrase from the document content that supports this alert, or null>" }
    ]
  }
}

Derive everything from the actual data provided. Use ₦ for financial figures unless another currency is evident. Be specific — reference actual file names, email senders, event titles. For source_file and source_quote: populate these only when the item is derived from a Drive document — use the exact file name and copy the verbatim text from the document content. Set both to null when the source is gmail or calendar.`

// POST /api/claude — server-side proxy so the API key is never in the browser
// If the user is authenticated, fetches their Google Workspace data and injects
// it into the system prompt so the AI can answer questions about their business.
router.post('/claude', async (req, res) => {
  try {
    const { model, max_tokens, system, messages } = req.body

    if (!model || !messages) {
      return res.status(400).json({ error: 'model and messages are required' })
    }

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

    let enrichedSystem = system || ''

    // Fix 3: Inject Google Workspace data when user is authenticated
    if (req.session?.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.session.userId },
          select: { id: true, accessToken: true, refreshToken: true },
        })

        if (user?.accessToken) {
          // Fix 4: Pass userId to enable token refresh
          const auth = makeOAuthClient(user.accessToken, user.refreshToken, user.id)
          const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

          // Only extract file contents when the user is clearly asking about a file
          const wantsFileContent = isFileContentRequest(lastUserMessage)

          try {
            const { driveFiles, emails, events } = await fetchGoogleData(auth, {
              extractContents: wantsFileContent,
              targetFileName: wantsFileContent ? lastUserMessage : null,
            })
            const dataContext = JSON.stringify({ driveFiles, emails, events }, null, 2)
            enrichedSystem = `${system || ''}\n\n---\n\nLIVE WORKSPACE DATA (as of ${new Date().toISOString()}):\n${dataContext}`
          } catch (fetchErr) {
            // Fix 5: Detect authentication expiry
            if (fetchErr.message?.includes('invalid_grant')) {
              return res.status(401).json({
                error: 'Google authentication expired. Please reconnect your account.',
                code: 'AUTH_EXPIRED',
              })
            }
            console.warn('Could not fetch Google data for chat:', fetchErr.message)
            // Continue without data rather than failing the whole request
          }
        } else {
          // User hasn't connected Google account yet
          console.debug('User has not connected Google Workspace')
        }
      } catch (userErr) {
        console.warn('Could not retrieve user for chat:', userErr.message)
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

// POST /api/analyse
router.post('/analyse', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, accessToken: true, refreshToken: true },
    })

    if (!user?.accessToken) {
      return res.status(401).json({ error: 'Google account not connected' })
    }

    const auth = makeOAuthClient(user.accessToken, user.refreshToken, user.id)
    const { driveFiles, emails, events } = await fetchGoogleData(auth, { extractContents: true })

    const dataContext = JSON.stringify({ driveFiles, emails, events }, null, 2)

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: ANALYSE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the Google Workspace data for this business:\n\n${dataContext}\n\nGenerate the full analysis JSON.`,
        },
      ],
    })

    const raw = message.content[0]?.text ?? '{}'
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const result = JSON.parse(cleaned)

    res.json(result)
  } catch (err) {
    console.error('POST /api/analyse error:', err)
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
})

module.exports = router
