const express = require('express')
const cors = require('cors')
const session = require('express-session')
const { spawn } = require('child_process')
const path = require('path')
const connectPgSimple = require('connect-pg-simple')
const { Pool } = require('pg')
const { google } = require('googleapis')
const Anthropic = require('@anthropic-ai/sdk')

const app = express()

// Enable trust proxy for secure cookies to work on Vercel
app.set('trust proxy', 1)

const PgSession = connectPgSimple(session)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 10000,
})

app.use(express.json())

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))

app.use(session({
  store: new PgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }
}))

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )
}

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
]

app.get('/auth/google', (req, res) => {
  const client = getOAuthClient()
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
  res.redirect(url)
})

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query
  try {
    const client = getOAuthClient()
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data: profile } = await oauth2.userinfo.get()
    req.session.user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      connectedSources: {
        gmail: true,
        drive: true,
        sheets: true,
        calendar: true,
      },
    }
    req.session.googleToken = tokens.access_token
    req.session.save(() => {
      res.redirect(`${process.env.FRONTEND_URL}/analytics`)
    })
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.redirect(`${process.env.FRONTEND_URL}/connect?error=auth_failed`)
  }
})

app.get('/auth/me', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ user: null })
  res.json({ user: req.session.user })
})

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.json({ ok: true })
  })
})

app.get('/auth/token', (req, res) => {
  if (!req.session?.googleToken) return res.status(401).json({ error: 'Not authenticated' })
  res.json({ token: req.session.googleToken })
})

// ── Analytics ────────────────────────────────────────────────────────────────

const EXTRACTABLE_TYPES = new Set([
  'application/pdf',
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'text/plain',
])

const CHARS_PER_FILE = 7000

async function extractFileContent(driveClient, file) {
  try {
    const { id, type } = file
    if (type === 'application/vnd.google-apps.document') {
      const res = await driveClient.files.export({ fileId: id, mimeType: 'text/plain' }, { responseType: 'text' })
      return String(res.data).slice(0, CHARS_PER_FILE)
    }
    if (type === 'application/vnd.google-apps.spreadsheet') {
      const res = await driveClient.files.export({ fileId: id, mimeType: 'text/csv' }, { responseType: 'text' })
      return String(res.data).slice(0, CHARS_PER_FILE)
    }
    if (type === 'application/pdf') {
      const res = await driveClient.files.get({ fileId: id, alt: 'media' }, { responseType: 'arraybuffer' })
      const buffer = Buffer.isBuffer(res.data) ? res.data : Buffer.from(res.data)
      const markdown = await new Promise((resolve, reject) => {
        const script = path.join(__dirname, '..', 'pdf_to_markdown.py')
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
      const res = await driveClient.files.get({ fileId: id, alt: 'media' }, { responseType: 'text' })
      return String(res.data).slice(0, CHARS_PER_FILE)
    }
  } catch (err) {
    console.warn(`Could not extract content from "${file.name}":`, err.message)
  }
  return null
}

async function fetchGoogleData(accessToken) {
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  auth.setCredentials({ access_token: accessToken })

  const driveClient = google.drive({ version: 'v3', auth })
  const gmailClient = google.gmail({ version: 'v1', auth })
  const calendarClient = google.calendar({ version: 'v3', auth })

  const [driveRes, gmailRes, calendarRes] = await Promise.allSettled([
    driveClient.files.list({ pageSize: 20, orderBy: 'modifiedTime desc', fields: 'files(id,name,mimeType,modifiedTime)' }),
    gmailClient.users.messages.list({ userId: 'me', maxResults: 30, q: 'in:inbox' }),
    calendarClient.events.list({ calendarId: 'primary', timeMin: new Date().toISOString(), maxResults: 20, singleEvents: true, orderBy: 'startTime' }),
  ])

  const rawFiles = driveRes.status === 'fulfilled' ? (driveRes.value.data.files ?? []) : []
  const candidates = rawFiles.filter((f) => EXTRACTABLE_TYPES.has(f.mimeType)).slice(0, 5)
  const contentResults = await Promise.allSettled(
    candidates.map((f) => extractFileContent(driveClient, { id: f.id, type: f.mimeType, name: f.name }))
  )
  const driveFiles = rawFiles.map((f) => {
    const idx = candidates.findIndex((c) => c.id === f.id)
    const content = idx !== -1 && contentResults[idx].status === 'fulfilled' ? contentResults[idx].value : null
    return { name: f.name, type: f.mimeType, modified: f.modifiedTime, ...(content ? { content } : {}) }
  })

  let emails = []
  if (gmailRes.status === 'fulfilled') {
    const ids = (gmailRes.value.data.messages ?? []).slice(0, 10).map((m) => m.id)
    const details = await Promise.allSettled(
      ids.map((id) => gmailClient.users.messages.get({ userId: 'me', id, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date'] }))
    )
    emails = details.filter((r) => r.status === 'fulfilled').map((r) => {
      const headers = r.value.data.payload?.headers ?? []
      const get = (name) => headers.find((h) => h.name === name)?.value ?? ''
      return { subject: get('Subject'), from: get('From'), date: get('Date') }
    })
  }

  const events = calendarRes.status === 'fulfilled'
    ? (calendarRes.value.data.items ?? []).map((e) => ({ title: e.summary, start: e.start?.dateTime ?? e.start?.date, end: e.end?.dateTime ?? e.end?.date }))
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
      { "id": "ins_001", "type": "financial|communication|client|operational", "title": "<short title>", "detail": "<1-2 specific sentences>", "severity": "critical|warning|info", "source": "drive|gmail|sheets|calendar", "timestamp": "<ISO timestamp>" }
    ]
  },
  "predictions": {
    "outlook": "positive|cautious|negative",
    "predictions": [
      { "id": "pred_001", "type": "cashflow|workload|churn|growth", "title": "<short title>", "detail": "<specific forecast>", "confidence": "high|medium|low", "timeframe": "<e.g. 2 weeks>", "recommended_action": "<concrete action>", "source": "drive|gmail|sheets|calendar" }
    ]
  },
  "alerts": {
    "unread_count": <number>,
    "alerts": [
      { "id": "alert_001", "type": "churn_risk|contract_expiry|overdue_payment|deadline", "title": "<short title>", "detail": "<specific detail>", "urgency": "critical|high|medium", "action_required": "<concrete action>", "deadline": "<ISO timestamp or null>", "source": "drive|gmail|sheets|calendar", "client_or_entity": "<name or null>" }
    ]
  }
}

Derive everything from the actual data provided. Use ₦ for financial figures unless another currency is evident. Be specific — reference actual file names, email senders, event titles.`

app.post('/api/analyse', async (req, res) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Not authenticated' })
  const accessToken = req.session.googleToken
  if (!accessToken) return res.status(401).json({ error: 'Google account not connected' })

  try {
    const { driveFiles, emails, events } = await fetchGoogleData(accessToken)
    const dataContext = JSON.stringify({ driveFiles, emails, events }, null, 2)

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: ANALYSE_PROMPT,
      messages: [{ role: 'user', content: `Here is the Google Workspace data for this business:\n\n${dataContext}\n\nGenerate the full analysis JSON.` }],
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

module.exports = app