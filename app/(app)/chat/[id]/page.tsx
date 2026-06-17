'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BarChart2, Send, Paperclip, ArrowLeft, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendChatMessage } from '@/services/bizwatchApi'
import { chatHistory } from '@/data/chat-history'
import { saveChat, loadChat } from '@/services/chatStorage'

const INSIGHT_STYLES: Record<string, { wrapper: string; badge: string; dot: string }> = {
  opportunity: {
    wrapper: 'bg-green-500/10 border-green-500/20',
    badge: 'bg-green-500/20 text-green-400',
    dot: 'bg-green-400',
  },
  risk: {
    wrapper: 'bg-amber-500/10 border-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-400',
    dot: 'bg-amber-400',
  },
  warning: {
    wrapper: 'bg-red-500/10 border-red-500/20',
    badge: 'bg-red-500/20 text-red-400',
    dot: 'bg-red-400',
  },
  info: {
    wrapper: 'bg-blue-500/10 border-blue-500/20',
    badge: 'bg-blue-500/20 text-blue-400',
    dot: 'bg-blue-400',
  },
}

const DEFAULT_INSIGHT_STYLE = {
  wrapper: 'bg-slate-500/10 border-slate-500/20',
  badge: 'bg-slate-500/20 text-slate-400',
  dot: 'bg-slate-400',
}

interface Insight {
  type: string
  title: string
  body: string
}

interface Message {
  role: string
  content: string | null
  insights?: Insight[]
  error?: string
}

function InsightCard({ insight }: { insight: Insight }) {
  const s = INSIGHT_STYLES[insight.type] ?? DEFAULT_INSIGHT_STYLE
  return (
    <div className={`rounded-xl border p-3 ${s.wrapper} border-slate-200 bg-[var(--surface-strong)]`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
        <span className={`text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded ${s.badge}`}>
          {insight.type}
        </span>
      </div>
      <p className="text-xs font-semibold text-black mb-1 leading-snug">{insight.title}</p>
      <p className="text-xs text-slate-600 leading-relaxed">{insight.body}</p>
    </div>
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-sm rounded-2xl rounded-tr-sm bg-slate-100 px-4 py-3 text-sm text-black leading-relaxed border border-slate-200">
        {content}
      </div>
    </div>
  )
}

function AssistantMessage({ content, insights, error }: { content: string | null; insights?: Insight[]; error?: string }) {
  function handleCopy() {
    if (content) {
      navigator.clipboard.writeText(content).then(() => toast.success('Copied to clipboard'))
    }
  }

  return (
    <div className="flex items-start gap-3 group rounded-3xl border border-slate-200 bg-[var(--surface-strong)] p-4">
      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
        <BarChart2 size={14} className="text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        {error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
        ) : (
          <>
            <div className="text-sm text-black leading-relaxed space-y-3">
              {content?.split('\n\n').map((para, i) => (
                <p key={i}>
                  {para.split('\n').map((line, j, arr) => (
                    <span key={j}>
                      {line}
                      {j < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              ))}
            </div>
            {insights && insights.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <Copy size={12} />
                Copy
              </button>
              <button type="button" className="p-1 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 transition">
                <ThumbsUp size={12} />
              </button>
              <button type="button" className="p-1 rounded-lg text-slate-600 hover:text-red-600 hover:bg-slate-100 transition">
                <ThumbsDown size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
        <BarChart2 size={14} className="text-violet-600" />
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[var(--surface-strong)] border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatTitle, setChatTitle] = useState('Chat')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const createdAtRef = useRef(new Date().toISOString())

  useEffect(() => {
    const saved = loadChat(id)
    if (saved) {
      setChatTitle(saved.title)
      setMessages(saved.messages)
      createdAtRef.current = saved.createdAt
      return
    }

    const mockChat = chatHistory.find((c) => c.id === id)
    if (mockChat) {
      setChatTitle(mockChat.title)
      setMessages([
        {
          role: 'assistant',
          content: `You're viewing "${mockChat.title}". ${mockChat.description} The last message in this thread: "${mockChat.lastMessage}"`,
          insights: [],
        },
      ])
      return
    }

    router.replace('/new-chat')
  }, [id])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const result = await sendChatMessage(
        nextMessages
          .filter((m) => typeof m.content === 'string' && m.content.length > 0)
          .map((m) => ({ role: m.role, content: m.content as string })),
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.response, insights: result.insights ?? [] },
      ])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get a response. Please try again.')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: null, error: err instanceof Error ? err.message : 'Something went wrong.' },
      ])
    } finally {
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

  useEffect(() => {
    if (messages.length === 0) return
    saveChat({ id, title: chatTitle, messages, createdAt: createdAtRef.current })
  }, [messages, chatTitle])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  return (
    <div className="flex flex-col h-full overflow-hidden -mx-6 -my-6 sm:-mx-8 xl:-mx-10">
      <div className="shrink-0 flex items-center gap-3 px-6 sm:px-8 xl:px-10 py-4 border-b border-slate-200 bg-[var(--surface-strong)]">
        <button
          type="button"
          onClick={() => router.push('/new-chat')}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          <BarChart2 size={13} className="text-violet-600" />
        </div>
        <h2 className="text-sm font-medium text-black truncate">{chatTitle}</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="max-w-2xl mx-auto w-full px-6 sm:px-8 pt-8 pb-6 space-y-6">
          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <UserMessage key={i} content={msg.content as string} />
            ) : (
              <AssistantMessage key={i} content={msg.content} insights={msg.insights} error={msg.error} />
            ),
          )}
          {loading && <ThinkingBubble />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-[var(--surface)]">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[var(--surface-strong)] px-4 py-3 focus-within:border-violet-400/40 focus-within:ring-2 focus-within:ring-violet-500/10 transition">
            <button type="button" className="shrink-0 text-slate-600 hover:text-slate-900 transition pb-0.5">
              <Paperclip size={18} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question..."
              rows={1}
              disabled={loading}
              style={{ maxHeight: '10rem' }}
              className="flex-1 resize-none overflow-hidden bg-transparent text-sm text-black placeholder:text-slate-400 outline-none leading-relaxed disabled:opacity-60"
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10">⌘</kbd>
                ENTER
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-40 hover:bg-violet-500 transition shadow-[0_4px_16px_-4px_rgba(124,58,237,0.6)]"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            BizWatch AI can make mistakes. Check important business info.
          </p>
        </div>
      </div>
    </div>
  )
}
