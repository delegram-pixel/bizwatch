import { NextResponse } from 'next/server'
import { getSession, deleteSession, clearSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  const session = await getSession(request)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.session.deleteMany({ where: { userId: session.userId } })
  await prisma.user.delete({ where: { id: session.userId } })

  const response = NextResponse.json({ ok: true })
  clearSession(response)
  return response
}
