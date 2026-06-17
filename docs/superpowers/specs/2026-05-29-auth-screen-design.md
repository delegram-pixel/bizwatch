# Auth Screen Design
**Date:** 2026-05-29  
**Status:** Approved

## Problem

The current `/connect` page presents a Google Workspace permissions list before users have even created an account. This conflates authentication with workspace data access, creating a poor first impression. Users should sign in first, then connect their workspace separately.

## Approach

Repurpose the existing `/connect` route as a clean login/signup screen. Remove all workspace permissions content from it. Workspace connection stays on the `/workspace` page (already in the sidebar). No new routes needed.

Auth method: **Sign in with Google** — the backend OAuth flow already handles both new and returning users transparently.

## Auth Screen (`/connect`)

**Stack:** shadcn/ui (`Card`, `Button`, `Separator`) + Tailwind v4. 21st.dev component patterns for reference.

**Layout:**
```
[BizWatch logo icon]
BizWatch

Sign in to BizWatch
Your AI-powered business intelligence layer

[ G  Continue with Google ]

New users are registered automatically
```

- Dark card on `#0F0D17` background, consistent with app theme
- Single action: Google OAuth button
- No permissions list, no workspace copy
- Error state: red banner if `?error=auth_failed` in URL (existing behaviour, keep it)

## Routing Changes

| Location | Before | After |
|----------|--------|-------|
| Landing page CTAs | "Connect your Google Workspace" → `/connect` | "Get started" / "Sign in" → `/connect` |
| `ProtectedRoute` | Redirect commented out | Uncommented — unauthenticated → `/connect` |
| After OAuth callback | Backend redirects to `/new-chat` | Change to `/analytics` (dashboard) — update `server/src/routes/auth.js` line 74 |
| `/workspace` | WorkspaceConnector with connect flow | No change |

## Mock Mode

When `VITE_USE_MOCK=true`:
- "Continue with Google" button dispatches `fetchUser` (returns `mockUser` with all 4 sources connected)
- Redirects to `/analytics`
- `ProtectedRoute` reads Redux auth state — mock user is populated on app load via `main.jsx` or `App.jsx` dispatch

## shadcn Setup

Project uses Tailwind v4. Run:
```
npx shadcn@latest init
```
Select: TypeScript → no, framework → Vite, style → Default, base color → Zinc, CSS variables → yes, Tailwind v4 → yes.

Add components:
```
npx shadcn@latest add button card separator
```

CSS variables for dark theme map to existing `@theme` tokens in `src/index.css`.

## Out of Scope

- Email/password auth (no backend endpoints exist)
- Workspace connect/disconnect sync (separate task)
- Changes to `/workspace` page UI
