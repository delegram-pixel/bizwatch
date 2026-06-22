import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { makeOAuthClientWithTokens, fetchGoogleData } from '@/lib/google'

const ANALYSE_PROMPT = `You are BizWatch AI — a business intelligence layer for small business owners.

You will receive raw data from the user's Google Workspace. Analyse it and return a JSON object with this exact shape (no markdown, no preamble):
{
  "connectedSources": { "drive": true, "gmail": true, "sheets": true, "calendar": true },
  "insights": {
    "summary": "<2-3 sentence executive summary>",
    "insights": [
      { "id": "ins_001", "type": "financial|communication|client|operational", "title": "<short title>", "detail": "<1-2 specific sentences>", "severity": "critical|warning|info", "source": "drive|gmail|sheets|calendar", "timestamp": "<ISO timestamp>", "source_file": "<exact file name from driveFiles or null>", "source_quote": "<verbatim sentence or phrase from the document content that supports this insight, or null>" }
    ]
  },
  "predictions": {
    "outlook": "positive|cautious|negative",
    "predictions": [
      { "id": "pred_001", "type": "cashflow|workload|churn|growth", "title": "<short title>", "detail": "<specific forecast>", "confidence": "high|medium|low", "timeframe": "<e.g. 2 weeks>", "recommended_action": "<concrete action>", "source": "drive|gmail|sheets|calendar", "source_file": "<exact file name from driveFiles or null>", "source_quote": "<verbatim sentence or phrase from the document content that supports this prediction, or null>" }
    ]
  },
  "alerts": {
    "unread_count": <number>,
    "alerts": [
      { "id": "alert_001", "type": "churn_risk|contract_expiry|overdue_payment|deadline", "title": "<short title>", "detail": "<specific detail>", "urgency": "critical|high|medium", "action_required": "<concrete action>", "deadline": "<ISO timestamp or null>", "source": "drive|gmail|sheets|calendar", "client_or_entity": "<name or null>", "source_file": "<exact file name from driveFiles or null>", "source_quote": "<verbatim sentence or phrase from the document content that supports this alert, or null>" }
    ]
  }
}

Set connectedSources.sheets to true only if the sheets array is non-empty. Derive everything from the actual data provided. Use ₦ for financial figures unless another currency is evident.`

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: { accessToken: { not: null } },
    select: { id: true, accessToken: true, refreshToken: true },
  })

  const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
  const results = await Promise.allSettled(
    users.map(async (user) => {
      try {
        const auth = makeOAuthClientWithTokens(user.accessToken!, user.refreshToken ?? undefined)
        const { driveFiles, emails, events, sheets } = await fetchGoogleData(auth, { extractContents: true })
        const dataContext = JSON.stringify({ driveFiles, emails, events, sheets }, null, 2)

        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          system: ANALYSE_PROMPT,
          messages: [{ role: 'user', content: `Here is the Google Workspace data for this business:\n\n${dataContext}\n\nGenerate the full analysis JSON.` }],
        })

        const raw = String((message.content?.[0] as any)?.text ?? '{}')
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
        const result = JSON.parse(cleaned)

        await prisma.analysis.create({ data: { userId: user.id, result } })
        return { userId: user.id, status: 'ok' }
      } catch (err: any) {
        console.error(`[cron] analysis failed for user ${user.id}:`, err.message)
        return { userId: user.id, status: 'error', error: err.message }
      }
    })
  )

  const summary = results.map((r) => (r.status === 'fulfilled' ? r.value : { status: 'error' }))
  console.log('[cron] daily analysis complete:', JSON.stringify(summary))
  return NextResponse.json({ ran: users.length, summary })
}
