import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.CLAUDE_API_KEY) {
    return res.status(500).json({ error: 'CLAUDE_API_KEY is not set on the server.' })
  }

  const body = req.body ?? {}
  const { model, max_tokens, system, messages } = body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
    const message = await anthropic.messages.create({ model, max_tokens, system, messages })
    res.json(message)
  } catch (err) {
    console.error('POST /api/claude error:', err?.message ?? err)
    const status = err.status ?? 500
    res.status(status).json({ error: err.message ?? 'Claude API error' })
  }
}
