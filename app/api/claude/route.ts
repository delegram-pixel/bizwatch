import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { makeOAuthClientWithTokens, fetchGoogleData, isFileContentRequest } from '@/lib/google'

export async function POST(request: Request) {
  const body = await request.json()
  const { model, max_tokens, system, messages } = body

  if (!model || !messages) {
    return NextResponse.json({ error: 'model and messages are required' }, { status: 400 })
  }

  let enrichedSystem = system || ''
  const session = await getSession(request)

  if (session?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { accessToken: true, refreshToken: true },
    })

    if (user?.accessToken) {
      try {
        const auth = makeOAuthClientWithTokens(user.accessToken, user.refreshToken ?? undefined)
        const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user')?.content ?? ''
        const wantsFileContent = isFileContentRequest(lastUserMessage)
        const { driveFiles, emails, events } = await fetchGoogleData(auth, {
          extractContents: wantsFileContent,
          targetFileName: wantsFileContent ? lastUserMessage : undefined,
        })
        const dataContext = JSON.stringify({ driveFiles, emails, events }, null, 2)
        enrichedSystem = `${system || ''}\n\n---\n\nLIVE WORKSPACE DATA (as of ${new Date().toISOString()}):\n${dataContext}`
      } catch (err: any) {
        if (err.message?.includes('invalid_grant')) {
          return NextResponse.json({ error: 'Google authentication expired. Please reconnect your account.', code: 'AUTH_EXPIRED' }, { status: 401 })
        }
        console.warn('Could not fetch Google data for chat:', err.message)
      }
    }
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
    const message = await anthropic.messages.create({
      model,
      max_tokens,
      system: enrichedSystem,
      messages,
    })
    return NextResponse.json(message)
  } catch (err: any) {
    console.error('POST /api/claude error:', err)
    return NextResponse.json({ error: err.message ?? 'Claude API error' }, { status: 500 })
  }
}
