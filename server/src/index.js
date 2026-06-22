require('dotenv').config()

const express = require('express')
const session = require('express-session')
const connectPgSimple = require('connect-pg-simple')
const cors = require('cors')
const { Pool } = require('pg')

const authRouter = require('./routes/auth')
const analyseRouter = require('./routes/analyse')
const extractRouter = require('./routes/extract')

const app = express()
const PORT = process.env.PORT ?? 3000

const PgSession = connectPgSimple(session)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  max: process.env.VERCEL ? 1 : 10, // serverless needs minimal connections
})

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.use(express.json())

app.use(
  session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
)

app.use('/auth', authRouter)
app.use('/api', analyseRouter)
app.use('/api', extractRouter)

app.get('/health', (_, res) => res.json({ ok: true }))

// Local dev: start the server normally
// Vercel: export the app as a serverless function handler
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`BizWatch server running on http://localhost:${PORT}`)
  })
}

module.exports = app
