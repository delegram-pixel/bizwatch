'use client'

import { useMemo, useState } from 'react'
import { Activity, Download } from 'lucide-react'
import HistorySearch from '@/components/history/HistorySearch'
import HistorySection from '@/components/history/HistorySection'
import { chatHistory } from '@/data/chat-history'
import { ICON_RULES } from '@/data/icon-rules'
import { loadChats } from '@/services/chatStorage'

function resolveIconAndColor(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase()
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((kw: string) => text.includes(kw))) {
      const Icon = rule.icon
      return { icon: <Icon size={16} />, iconColor: rule.color }
    }
  }
  return { icon: <Activity size={16} />, iconColor: 'bg-slate-400' }
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Older']

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDateGroup(dateStr: string) {
  const diffDays = Math.round((dayStart(new Date()).getTime() - dayStart(new Date(dateStr)).getTime()) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays <= 6) return 'This Week'
  if (diffDays <= 13) return 'Last Week'
  return 'Older'
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const diffDays = Math.round((dayStart(new Date()).getTime() - dayStart(date).getTime()) / 86_400_000)
  if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays <= 6) return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function History() {
  const [query, setQuery] = useState('')
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)

  const historyGroups = useMemo(() => {
    const grouped: Record<string, { id: string; icon: React.ReactNode; iconColor: string; title: string; subtitle: string; time: string }[]> = {}

    const savedChats = loadChats().map((c: { id: string; title: string; lastMessage?: string; updatedAt: string }) => ({
      id: c.id,
      title: c.title,
      description: c.lastMessage ?? '',
      updatedAt: c.updatedAt,
    }))

    for (const chat of [...savedChats, ...chatHistory]) {
      const group = getDateGroup(chat.updatedAt)
      if (!grouped[group]) grouped[group] = []
      const { icon, iconColor } = resolveIconAndColor(chat.title, chat.description ?? '')
      grouped[group].push({
        id: chat.id,
        icon,
        iconColor,
        title: chat.title,
        subtitle: chat.description ?? '',
        time: formatTime(chat.updatedAt),
      })
    }

    return GROUP_ORDER.filter((g) => grouped[g]).map((g) => ({ title: g, items: grouped[g] }))
  }, [])

  const filteredGroups = useMemo(
    () =>
      historyGroups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.subtitle.toLowerCase().includes(query.toLowerCase()),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [query, historyGroups],
  )

  return (
    <div className="mx-auto max-w-2xl w-full py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">History</h1>
          <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
            Search past conversations and jump back into insights.
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors shrink-0">
          <Download size={13} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <HistorySearch value={query} onChange={handleSearch} onFilter={() => null} />
      </div>

      {/* List */}
      {filteredGroups.length > 0 ? (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <HistorySection key={group.title} title={group.title} items={group.items} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-[13px] text-slate-400">No conversations found.</p>
        </div>
      )}
    </div>
  )
}
