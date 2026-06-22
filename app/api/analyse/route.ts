import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSession } from '@/lib/session'
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

The data includes: driveFiles (recent Drive documents with content), emails (Gmail inbox), events (Calendar), and sheets (Google Sheets spreadsheets with CSV content).

Set connectedSources.sheets to true only if the sheets array is non-empty. For items derived from a sheet, set source to "sheets", source_file to the exact sheet name, and source_quote to the verbatim cell data that supports the item. Set source_file and source_quote to null for gmail and calendar sources.

Derive everything from the actual data provided. Use ₦ for financial figures unless another currency is evident. Be specific — reference actual file names, email senders, event titles.`

export async function POST(request: Request) {
  const session = await getSession(request)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { accessToken: true, refreshToken: true },
  })

  if (!user?.accessToken) {
    return NextResponse.json({ error: 'Google account not connected' }, { status: 401 })
  }

  try {
    const auth = makeOAuthClientWithTokens(user.accessToken, user.refreshToken ?? undefined)
    const { driveFiles, emails, events, sheets } = await fetchGoogleData(auth, { extractContents: true })

    console.log('[analyse] drive files:', driveFiles.map((f: any) => ({ name: f.name, type: f.type, hasContent: !!f.content, contentLength: f.content?.length ?? 0 })))
    console.log('[analyse] sheets:', sheets.map((s: any) => ({ name: s.name, hasContent: !!s.content, contentLength: s.content?.length ?? 0 })))

    const dataContext = JSON.stringify({ driveFiles, emails, events, sheets }, null, 2)
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: ANALYSE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the Google Workspace data for this business:\n\n${dataContext}\n\nGenerate the full analysis JSON.`,
        },
      ],
    })

    const raw = String((message.content?.[0] as any)?.text ?? '{}')
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const result = JSON.parse(cleaned)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('POST /api/analyse error:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
