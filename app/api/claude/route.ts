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

  const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
  let enrichedSystem = system || ''
  let pdfDocuments: { name: string; driveFileId: string; modifiedAt: string; data: string }[] = []
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
        const { driveFiles, emails, events, sheets, pdfDocuments: pdfs } = await fetchGoogleData(auth, {
          extractContents: true,
          targetFileName: isFileContentRequest(lastUserMessage) ? lastUserMessage : undefined,
        })

        const lastAnalysis = await prisma.analysis.findFirst({
          where: { userId: session.userId },
          orderBy: { createdAt: 'desc' },
          select: { result: true, createdAt: true },
        })

        pdfDocuments = pdfs
        const dataContext = JSON.stringify({ driveFiles, emails, events, sheets }, null, 2)
        const analysisContext = lastAnalysis
          ? `\n\nLAST ANALYSIS (${lastAnalysis.createdAt.toISOString()}):\n${JSON.stringify(lastAnalysis.result, null, 2)}`
          : ''

        enrichedSystem = `${system || ''}\n\n---\n\nLIVE WORKSPACE DATA (as of ${new Date().toISOString()}):\n${dataContext}${analysisContext}`
      } catch (err: any) {
        if (err.message?.includes('invalid_grant')) {
          return NextResponse.json({ error: 'Google authentication expired. Please reconnect your account.', code: 'AUTH_EXPIRED' }, { status: 401 })
        }
        console.warn('Could not fetch Google data for chat:', err.message)
      }
    }
  }

  // Files API: resolve or upload each PDF to get a persistent file_id
  const fileIdMap = new Map<string, string>() // driveFileId → anthropicFileId
  if (pdfDocuments.length > 0 && session?.userId) {
    const existing = await prisma.driveFile.findMany({
      where: { userId: session.userId, driveFileId: { in: pdfDocuments.map(p => p.driveFileId) } },
      select: { driveFileId: true, anthropicFileId: true, driveModifiedAt: true },
    })

    const staleIds = new Set<string>()
    for (const rec of existing) {
      const pdf = pdfDocuments.find(p => p.driveFileId === rec.driveFileId)!
      if (new Date(pdf.modifiedAt) <= rec.driveModifiedAt) {
        fileIdMap.set(rec.driveFileId, rec.anthropicFileId)
      } else {
        staleIds.add(rec.driveFileId)
      }
    }

    const toUpload = pdfDocuments.filter(p => !fileIdMap.has(p.driveFileId))
    await Promise.allSettled(
      toUpload.map(async (pdf) => {
        try {
          // Delete stale file from Anthropic before re-uploading
          if (staleIds.has(pdf.driveFileId)) {
            const stale = existing.find(r => r.driveFileId === pdf.driveFileId)!
            await anthropic.beta.files.delete(stale.anthropicFileId).catch(() => {})
          }

          const uploaded = await anthropic.beta.files.upload(
            { file: new File([Buffer.from(pdf.data, 'base64')], pdf.name, { type: 'application/pdf' }) },
            { headers: { 'anthropic-beta': 'files-api-2025-04-14' } },
          )
          await prisma.driveFile.upsert({
            where: { userId_driveFileId: { userId: session.userId!, driveFileId: pdf.driveFileId } },
            create: { userId: session.userId!, driveFileId: pdf.driveFileId, anthropicFileId: uploaded.id, driveModifiedAt: new Date(pdf.modifiedAt) },
            update: { anthropicFileId: uploaded.id, driveModifiedAt: new Date(pdf.modifiedAt) },
          })
          fileIdMap.set(pdf.driveFileId, uploaded.id)
        } catch (err) {
          console.warn('[files-api] upload failed for', pdf.name, '— falling back to base64:', (err as Error).message)
        }
      })
    )
  }

  try {
    let processedMessages = messages
    const usesFileRefs = pdfDocuments.some(p => fileIdMap.has(p.driveFileId))

    if (pdfDocuments.length > 0) {
      processedMessages = [...messages]
      const lastIdx = processedMessages.length - 1
      const lastMsg = processedMessages[lastIdx]
      const textContent =
        typeof lastMsg.content === 'string'
          ? lastMsg.content
          : Array.isArray(lastMsg.content)
            ? (lastMsg.content.find((b: any) => b.type === 'text')?.text ?? '')
            : ''

      processedMessages[lastIdx] = {
        ...lastMsg,
        content: [
          ...pdfDocuments.map(doc => {
            const fileId = fileIdMap.get(doc.driveFileId)
            return {
              type: 'document',
              source: fileId
                ? { type: 'file', file_id: fileId }
                : { type: 'base64', media_type: 'application/pdf', data: doc.data },
              title: doc.name,
              cache_control: { type: 'ephemeral' },
            }
          }),
          { type: 'text', text: textContent },
        ],
      }
    }

    const message = await anthropic.messages.create(
      { model, max_tokens, system: enrichedSystem, messages: processedMessages },
      usesFileRefs ? { headers: { 'anthropic-beta': 'files-api-2025-04-14' } } : undefined,
    )
    return NextResponse.json(message)
  } catch (err: any) {
    console.error('POST /api/claude error:', err)
    return NextResponse.json({ error: err.message ?? 'Claude API error' }, { status: 500 })
  }
}
