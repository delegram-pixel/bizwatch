import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'bizwatch_session'

const PROTECTED_PREFIXES = [
  '/new-chat',
  '/chat',
  '/analytics',
  '/history',
  '/knowledgebase',
  '/workspace',
  '/settings',
  '/api-settings',
  '/model',
  '/onboarding',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get(SESSION_COOKIE)
  if (!session?.value) {
    const url = request.nextUrl.clone()
    url.pathname = '/connect'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
