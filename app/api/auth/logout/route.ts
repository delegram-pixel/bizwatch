import { NextResponse } from 'next/server'
import { getSession, deleteSession, clearSession } from '@/lib/session'

export async function POST(request: Request) {
  const session = await getSession(request)
  if (session?.id) {
    await deleteSession(session.id)
  }

  const response = NextResponse.json({ ok: true })
  clearSession(response)
  return response
}
