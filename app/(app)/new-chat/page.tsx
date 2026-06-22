'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, FileText, TrendingDown, Send, Paperclip, Loader2, BarChart2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendChatMessage } from '@/services/bizwatchApi'
import { saveChat } from '@/services/chatStorage'

const SUGGESTIONS = [
  {
    icon: TrendingUp,
    title: 'Revenue Trends',
    desc: 'Analyze Q4 revenue trends across all regions and highlight anomalies.',
  },
  {
    icon: FileText,
    title: 'Market Reports',
    desc: 'Summarize the latest market reports regarding semiconductor logistics.',
  },
  {
    icon: TrendingDown,
    title: 'Predict Churn',
    desc: 'Predict churn for next month based on current user engagement metrics.',
  },
]

export default function NewChat() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const result = await sendChatMessage([{ role: 'user', content: text }])
      const chatId = `chat_${Date.now()}`
      const label = text.length > 50 ? text.slice(0, 50) + '…' : text
      const initialMessages = [
        { role: 'user', content: text },
        { role: 'assistant', content: result.response, insights: result.insights ?? [] },
      ]
      saveChat({ id: chatId, title: label, messages: initialMessages, createdAt: new Date().toISOString() })
      router.push(`/chat/${chatId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.target as HTMLTextAreaElement
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  function handleSuggestion(desc: string) {
    setInput(desc)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center mb-6">
            <BarChart2 size={20} className="text-white" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
            How can I help with your business today?
          </h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Ask me to analyze data, summarize reports, or predict future market trends using your linked workspaces.
          </p>

          {/* Suggestion cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SUGGESTIONS.map(({ icon: Icon, title, desc }) => (
              <button
                key={title}
                type="button"
                onClick={() => handleSuggestion(desc)}
                disabled={loading}
                className="text-left rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-40"
              >
                <Icon size={16} className="text-slate-400 mb-3" />
                <p className="text-[13px] font-medium text-slate-800 mb-1">{title}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-violet-500 focus-within:bg-white transition-colors">
            <button type="button" className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors pb-0.5">
              <Paperclip size={16} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type your business inquiry..."
              rows={1}
              disabled={loading}
              style={{ maxHeight: '10rem' }}
              className="flex-1 resize-none overflow-hidden bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none leading-relaxed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-violet-600 text-white disabled:opacity-40 hover:bg-violet-700 transition-colors"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            BizWatch AI can make mistakes. Check important business info.
          </p>
        </div>
      </div>
    </div>
  )
}
