import express from 'express'
import cors from 'cors'
import cookieSession from 'cookie-session'
import { google } from 'googleapis'
import 'dotenv/config'

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL,  // e.g. http://localhost:5173
  credentials: true,
}))

app.use(cookieSession({
  name: 'bizwatch_session',
  secret: process.env.SESSION_SECRET,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
}))

// ── OAuth client ──────────────────────────────────────────────────────────────

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,  // e.g. http://localhost:3001/auth/google/callback
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

// ── Routes ────────────────────────────────────────────────────────────────────

// 1. Start OAuth flow
app.get('/auth/google', (req, res) => {
  const client = getOAuthClient()
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
  res.redirect(url)
})

// 2. Google redirects here after user approves
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query

  try {
    const client = getOAuthClient()
    const { tokens } = await client.getToken(code)

    // Get user profile
    client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data: profile } = await oauth2.userinfo.get()

    // Store in session
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

    // Redirect back to frontend workspace page
    res.redirect(`${process.env.FRONTEND_URL}/workspace`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.redirect(`${process.env.FRONTEND_URL}/workspace?error=auth_failed`)
  }
})

// 3. Return current user (called by useAuth on every page load)
app.get('/auth/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ user: null })
  }
  res.json({ user: req.session.user })
})

// 4. Logout
app.post('/auth/logout', (req, res) => {
  req.session = null
  res.json({ ok: true })
})

// 5. Expose token to frontend securely (called after connect)
app.get('/auth/token', (req, res) => {
  if (!req.session?.googleToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  res.json({ token: req.session.googleToken })
})

app.listen(3001, () => console.log('Server running on http://localhost:3001'))