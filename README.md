# BizWatch

AI-powered business intelligence platform for small business owners. Connects to Google Workspace (Drive, Gmail, Calendar, Sheets), analyzes business data with Claude, and surfaces actionable insights, predictions, and alerts through a dashboard and natural language chat interface.

---

## What it does

- **Insights** — identifies critical patterns: overdue invoices, client churn risk, cash flow issues
- **Predictions** — forecasts upcoming challenges: cash shortfalls, workload spikes, contract renewals
- **Alerts** — flags urgent actions: expiring contracts, payment deadlines, unresponsive clients
- **Chat** — natural language Q&A about your business data, backed by live Google Workspace context

Data access is read-only. Users can disconnect at any time.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| State | Redux Toolkit |
| Backend | Next.js API routes (primary), Express.js (legacy) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7 |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Auth | Google OAuth 2.0 |
| Integrations | Google Drive, Gmail, Calendar, Sheets (via `googleapis`) |
| Deployment | Vercel |

---

## Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- [Google Cloud project](https://console.cloud.google.com) with OAuth 2.0 credentials and the following APIs enabled:
  - Google Drive API
  - Gmail API
  - Google Calendar API
  - Google Sheets API
- [Anthropic API key](https://console.anthropic.com)

---

## Setup

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# Fill in all values in .env (see Environment Variables below)

# 3. Set up the database
npx prisma generate
npx prisma db push
```

---

## Running locally

```bash
# Start the Next.js dev server (includes all API routes)
npm run dev
```

App is available at `http://localhost:3000`.

> The `server/` directory contains a legacy Express backend. It is not required for local development — all functionality runs through Next.js API routes.

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (e.g. `http://localhost:3000/api/auth/google/callback`) |
| `SESSION_SECRET` | Long random string used to sign session cookies |
| `DATABASE_URL` | PostgreSQL connection string |
| `CLAUDE_API_KEY` | Anthropic API key |
| `FRONTEND_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | API base URL exposed to the browser |
| `NEXT_PUBLIC_USE_MOCK` | Set to `true` to bypass Google auth with mock data |
| `ENABLE_GOOGLE_VISION` | (Optional) Enable Google Vision OCR for document parsing |
| `GOOGLE_CLOUD_STORAGE_BUCKET` | (Optional) GCS bucket for Vision API |
| `GOOGLE_APPLICATION_CREDENTIALS` | (Optional) Path to GCP service account JSON |

---

## Architecture

```
app/
├── (app)/              # Protected routes (require auth)
│   ├── analytics/      # Dashboard: insights, predictions, alerts
│   ├── chat/[id]/      # AI chat interface
│   ├── history/        # Chat history
│   ├── workspace/      # Google Workspace connection status
│   └── settings/       # User and API settings
├── api/
│   ├── claude/         # POST /api/claude — chat with Claude (Google data injected)
│   ├── analyse/        # POST /api/analyse — run full business analysis
│   └── auth/           # Google OAuth flow, session management
├── connect/            # Sign-in page
└── onboarding/         # First-run setup

lib/
├── google.ts           # Google OAuth client + Workspace data fetching
├── session.ts          # Cookie-based session management (Prisma-backed)
└── prisma.ts           # Prisma client singleton
```

### Auth flow

1. User clicks "Connect Google" → `GET /api/auth/google` redirects to Google consent screen
2. Google redirects to `GET /api/auth/google/callback` with authorization code
3. Code is exchanged for access + refresh tokens; user record is created or updated in PostgreSQL
4. A session cookie is set; subsequent requests are authenticated via `lib/session.ts`
5. Access tokens are refreshed automatically when they expire

### AI analysis flow

1. `POST /api/analyse` fetches data from Drive, Gmail, and Calendar using the user's stored tokens
2. Data is serialized and injected into a Claude system prompt
3. Claude returns structured JSON with `insights`, `predictions`, and `alerts` arrays
4. Results are rendered in the analytics dashboard

### Chat flow

1. `POST /api/claude` receives a user message
2. Recent Google Workspace data is fetched and injected as context
3. Conversation history is passed to Claude's Messages API
4. Response is streamed back to the client

---

## Database schema

```prisma
model User {
  id           String    // CUID
  googleId     String    // Unique Google account ID
  email        String    // Unique
  name         String
  picture      String?
  accessToken  String?   // Google OAuth access token
  refreshToken String?   // Google OAuth refresh token
  sessions     Session[]
  createdAt    DateTime
  updatedAt    DateTime
}

model Session {
  id        String
  userId    String?
  user      User?
  data      Json?
  createdAt DateTime
  expiresAt DateTime?   // 7-day TTL
}
```

---

## Deployment

The project is configured for Vercel. Set all environment variables in the Vercel dashboard before deploying.

```bash
npm run build   # Verify the build locally before pushing
```

Set `GOOGLE_REDIRECT_URI` and `FRONTEND_URL` to your production domain in the Vercel environment settings, and add the production callback URL to your Google OAuth app's authorized redirect URIs.

---

## Project structure overview

```
bizwatch/
├── app/              # Next.js app router (pages + API routes)
├── lib/              # Shared server-side utilities
├── src/              # Legacy Vite/React code (not active)
├── server/           # Legacy Express backend (not active)
├── prisma/           # Database schema + migrations
└── public/           # Static assets
```
