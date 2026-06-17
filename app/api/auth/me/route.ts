import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession(request)
  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      name: session.user.name,
      email: session.user.email,
      picture: session.user.picture,
      connectedSources: {
        drive: true,
        gmail: true,
        sheets: true,
        calendar: true,
      },
    },
  })
}
