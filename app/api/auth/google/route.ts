import { NextResponse } from 'next/server'
import { makeOAuthClient, AUTH_SCOPES } from '@/lib/google'

export async function GET() {
  const client = makeOAuthClient()
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: AUTH_SCOPES,
  })
  return NextResponse.redirect(url)
}
