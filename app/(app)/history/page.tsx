'use client'

import { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
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
      return { icon: <Icon size={22} />, iconColor: rule.color }
    }
  }
  return { icon: <Activity size={22} />, iconColor: 'bg-violet-500' }
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
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)

  const historyGroups = useMemo(() => {
    const grouped: Record<string, { id: string; icon: React.ReactNode; iconColor: string; title: string; subtitle: string; time: string }[]> = {}

    const savedChats = loadChats().map((c: { id: string; title: string; lastMessage?: string; updatedAt: string }) => ({
      id: c.id,
      title: c.title,
      description: c.lastMessage ?? '',
      updatedAt: c.updatedAt,
    }))

    const allChats = [...savedChats, ...chatHistory]

    for (const chat of allChats) {
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
      historyGroups.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(query.toLowerCase()),
        ),
      })),
    [query, historyGroups],
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-0 py-6 sm:px-0 xl:px-0">
      <SectionHeader
        title="History"
        description="Search past conversations and jump back into the most important insights from your AI workspace."
        action={
          <Button variant="secondary" size="lg" className="hidden sm:inline-flex">
            Export
          </Button>
        }
      />

      <Card className="space-y-6">
        <HistorySearch value={query} onChange={handleSearch} onFilter={() => null} />
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <HistorySection key={group.title} title={group.title} items={group.items} />
          ))}
        </div>
      </Card>
    </div>
  )
}
