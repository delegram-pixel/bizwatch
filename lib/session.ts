import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from './prisma'

const COOKIE_NAME = 'bizwatch_session'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60

function parseCookie(header: string | null, name: string) {
  if (!header) return null
  const cookies = header.split(';').map((cookie) => cookie.trim())
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`))
  return match ? match.split('=')[1] : null
}

export async function getSessionToken(request: Request) {
  return parseCookie(request.headers.get('cookie'), COOKIE_NAME)
}

export async function getSession(request: Request) {
  const token = await getSessionToken(request)
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true },
  })

  if (!session) return null
  if (session.expiresAt && session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: token } })
    return null
  }

  return session
}

export async function createSession(userId: string) {
  const sessionId = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000)
  return prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  })
}

export async function deleteSession(token: string) {
  return prisma.session.deleteMany({
    where: { id: token },
  })
}

export function commitSession(response: NextResponse, token: string) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
  })
  return response
}

export function clearSession(response: NextResponse) {
  response.cookies.delete({ name: COOKIE_NAME, path: '/' })
  return response
}
