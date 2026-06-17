const { Router } = require('express')
const { google } = require('googleapis')
const prisma = require('../lib/prisma')

const router = Router()

function makeOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

const SCOPES = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
]

// GET /auth/google — redirect to Google consent screen
router.get('/google', (req, res) => {
  const oauth2Client = makeOAuthClient()
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  })
  res.redirect(url)
})

// GET /auth/google/callback — Google redirects here after consent
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/connect?error=auth_failed`)
  }

  try {
    const oauth2Client = makeOAuthClient()
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Fetch Google profile
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: profile } = await oauth2.userinfo.get()

    // Upsert user in Neon via Prisma
    const user = await prisma.user.upsert({
      where: { googleId: profile.id },
      update: {
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? undefined,
      },
      create: {
        googleId: profile.id,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
    })

    req.session.userId = user.id
    req.session.save(() => {
      res.redirect(`${process.env.FRONTEND_URL}/analytics`)
    })
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.redirect(`${process.env.FRONTEND_URL}/connect?error=auth_failed`)
  }
})

// GET /auth/me — return current user from session
router.get('/me', async (req, res) => {
  if (!req.session?.userId) {
    console.log('No user session found')
    return res.status(401).json({ user: null })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { name: true, email: true, picture: true },
    })

    if (!user) {
      req.session.destroy(() => {})
      console.log('User not found')
      return res.status(401).json({ user: null })
    }

    res.json({
      user: {
        ...user,
        connectedSources: { drive: true, gmail: true, sheets: true, calendar: true },
      },
    })
  } catch (err) {
    console.error('GET /auth/me error:', err)
    res.status(500).json({ user: null })
  }
})

// POST /auth/logout — clear session
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.json({ ok: true })
  })
})

module.exports = router
