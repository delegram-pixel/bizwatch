import { google } from 'googleapis'
import path from 'path'

export const AUTH_SCOPES = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
]

const EXTRACTABLE_TYPES = new Set([
  'application/pdf',
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'text/plain',
])

const FILE_REQUEST_PATTERN = /\b(read|open|summarize|summarise|what(\'s| is) in| does .+ say|contents? of|extract|show me|analyse|analyze)\b/i

export function makeOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )
}

export function makeOAuthClientWithTokens(accessToken: string, refreshToken?: string) {
  const client = makeOAuthClient()
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  return client
}

export function isFileContentRequest(message: string) {
  return FILE_REQUEST_PATTERN.test(message)
}

export async function fetchGoogleData(auth: any, options: { extractContents?: boolean; targetFileName?: string } = {}) {
  const driveClient = google.drive({ version: 'v3', auth })
  const gmailClient = google.gmail({ version: 'v1', auth })
  const calendarClient = google.calendar({ version: 'v3', auth })

  const [driveRes, gmailRes, calendarRes, sheetsRes, extractableRes] = await Promise.allSettled([
    driveClient.files.list({
      pageSize: 50,
      orderBy: 'modifiedTime desc',
      fields: 'files(id,name,mimeType,modifiedTime,size)',
    }),
    gmailResToPromise(gmailClient),
    calendarClient.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    }),
    driveClient.files.list({
      pageSize: 5,
      orderBy: 'modifiedTime desc',
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id,name,mimeType,modifiedTime)',
    }),
    driveClient.files.list({
      pageSize: 10,
      orderBy: 'modifiedTime desc',
      q: "(mimeType='application/pdf' or mimeType='application/vnd.google-apps.document' or mimeType='text/plain')",
      fields: 'files(id,name,mimeType,modifiedTime)',
    }),
  ])

  const rawFiles = driveRes.status === 'fulfilled' ? driveRes.value.data.files ?? [] : []
  let driveFiles = rawFiles.map((f: any) => ({ name: f.name, type: f.mimeType, modified: f.modifiedTime }))

  if (options.extractContents) {
    const query = options.targetFileName?.toLowerCase() ?? ''
    const candidates = rawFiles.filter((f: any) => EXTRACTABLE_TYPES.has(f.mimeType))
    const nameMatches = query
      ? candidates.filter((f: any) => f.name.toLowerCase().includes(query) || query.includes(f.name.toLowerCase())).slice(0, 2)
      : []
    const extractable = nameMatches.length > 0 ? nameMatches : candidates.slice(0, 5)

    const contentResults = await Promise.allSettled(
      extractable.map((f: any) => extractFileContent(driveClient, { id: f.id, type: f.mimeType, name: f.name }))
    )

    driveFiles = rawFiles.map((f: any) => {
      const idx = extractable.findIndex((e: any) => e.id === f.id)
      const content = idx !== -1 && contentResults[idx].status === 'fulfilled' ? contentResults[idx].value : null
      return {
        name: f.name,
        type: f.mimeType,
        modified: f.modifiedTime,
        ...(content ? { content } : {}),
      }
    })
  }

  let emails: Array<{ subject: string; from: string; date: string }> = []
  if (gmailRes.status === 'fulfilled') {
    const ids = (gmailRes.value.data.messages ?? []).slice(0, 10).map((m: any) => m.id)
    const emailDetails = await Promise.allSettled(
      ids.map((id: string) =>
        gmailClient.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        })
      )
    )
    emails = emailDetails
      .filter((r: any) => r.status === 'fulfilled')
      .map((r: any) => {
        const headers = r.value.data.payload?.headers ?? []
        const get = (name: string) => headers.find((h: any) => h.name === name)?.value ?? ''
        return { subject: get('Subject'), from: get('From'), date: get('Date') }
      })
  }

  const events =
    calendarRes.status === 'fulfilled'
      ? (calendarRes.value.data.items ?? []).map((e: any) => ({ title: e.summary, start: e.start?.dateTime ?? e.start?.date, end: e.end?.dateTime ?? e.end?.date }))
      : []

  const rawSheets = sheetsRes.status === 'fulfilled' ? sheetsRes.value.data.files ?? [] : []
  const sheetContentResults = await Promise.allSettled(
    rawSheets.map((f: any) => extractFileContent(driveClient, { id: f.id, type: f.mimeType, name: f.name }))
  )
  const sheets = rawSheets.map((f: any, i: number) => ({
    name: f.name,
    modified: f.modifiedTime,
    ...(sheetContentResults[i].status === 'fulfilled' && sheetContentResults[i].value
      ? { content: sheetContentResults[i].value }
      : {}),
  }))

  return { driveFiles, emails, events, sheets }
}

async function gmailResToPromise(gmailClient: any) {
  return gmailClient.users.messages.list({ userId: 'me', maxResults: 30, q: 'in:inbox' })
}

async function extractFileContent(driveClient: any, file: { id: string; type: string; name: string }) {
  try {
    const { id, type, name } = file
    if (type === 'application/vnd.google-apps.document') {
      const res = await driveClient.files.export({ fileId: id, mimeType: 'text/plain' }, { responseType: 'text' })
      return String(res.data).slice(0, 7000)
    }

    if (type === 'application/vnd.google-apps.spreadsheet') {
      const res = await driveClient.files.export({ fileId: id, mimeType: 'text/csv' }, { responseType: 'text' })
      return String(res.data).slice(0, 7000)
    }

    if (type === 'application/pdf') {
      const res = await driveClient.files.get({ fileId: id, alt: 'media' }, { responseType: 'arraybuffer' })
      const buffer = Buffer.isBuffer(res.data) ? res.data : Buffer.from(res.data)
      try {
        const markdown = await extractWithMarkitdown(buffer)
        if (markdown && markdown.trim().length >= 50) return markdown.slice(0, 7000)
      } catch (err) {
        console.error('[markitdown] failed for file:', name, '—', (err as Error).message, '| falling back to pdf-parse')
      }
      try {
        const pdfParse = (await import('pdf-parse')) as any
        const parser = pdfParse.default || pdfParse
        const result = await parser(buffer)
        return result.text ? String(result.text).slice(0, 7000) : null
      } catch (err) {
        console.warn('[pdf-parse] failed:', (err as Error).message)
      }
      return null
    }

    if (type === 'text/plain') {
      const res = await driveClient.files.get({ fileId: id, alt: 'media' }, { responseType: 'text' })
      return String(res.data).slice(0, 7000)
    }

    return null
  } catch (err: any) {
    if (err.code === 403 || err.message?.includes('403')) return null
    if (err.code === 404 || err.message?.includes('404')) return null
    if (err.message?.includes('invalid_grant')) throw err
    return null
  }
}

async function extractWithMarkitdown(buffer: Buffer): Promise<string> {
  const { spawn } = await import('child_process')
  const script = path.join(process.cwd(), 'server', 'pdf_to_markdown.py')
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [script])
    const chunks: Buffer[] = []
    py.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
    py.stderr.on('data', (err: Buffer) => console.warn('[markitdown] stderr:', err.toString()))
    py.on('close', (code: number | null) => {
      if (code !== 0) return reject(new Error(`pdf_to_markdown exited with code ${code}`))
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    py.on('error', reject)
    py.stdin.write(buffer)
    py.stdin.end()
  })
}

export async function getGoogleProfile(code: string) {
  const client = makeOAuthClient()
  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)
  const oauth2 = google.oauth2({ version: 'v2', auth: client })
  const { data: profile } = await oauth2.userinfo.get()
  return { profile, tokens }
}
