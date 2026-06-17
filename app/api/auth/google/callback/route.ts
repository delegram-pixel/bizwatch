import { NextResponse } from 'next/server'
import { getGoogleProfile } from '@/lib/google'
import { prisma } from '@/lib/prisma'
import { createSession, commitSession } from '@/lib/session'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/connect?error=auth_failed`)
  }

  try {
    const { profile, tokens } = await getGoogleProfile(code)
    const user = await prisma.user.upsert({
      where: { googleId: profile.id! },
      update: {
        name: profile.name ?? '',
        email: profile.email ?? '',
        picture: profile.picture ?? undefined,
        accessToken: tokens.access_token ?? undefined,
        refreshToken: tokens.refresh_token ?? undefined,
      },
      create: {
        googleId: profile.id!,
        name: profile.name ?? '',
        email: profile.email ?? '',
        picture: profile.picture ?? undefined,
        accessToken: tokens.access_token ?? undefined,
        refreshToken: tokens.refresh_token ?? undefined,
      },
    })

    const session = await createSession(user.id)
    const response = NextResponse.redirect(`${origin}/analytics`)
    commitSession(response, session.id)
    return response
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(`${origin}/connect?error=auth_failed`)
  }
}
