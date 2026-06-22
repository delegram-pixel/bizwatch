'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquarePlus,
  TimerReset,
  FileChartColumn,
  Settings2,
  BookOpen,
} from 'lucide-react'

const links = [
  { label: 'New Chat', to: '/new-chat', icon: MessageSquarePlus },
  { label: 'History', to: '/history', icon: TimerReset },
  { label: 'Analytics', to: '/analytics', icon: FileChartColumn },
  { label: 'Knowledgebase', to: '/knowledgebase', icon: BookOpen },
  { label: 'Settings', to: '/settings', icon: Settings2 },
]

export default function SidebarNavlinks() {
  const pathname = usePathname()

  return (
    <ul className="flex flex-col gap-0.5">
      {links.map(({ label, to, icon: Icon }) => {
        const isActive = pathname === to || (to !== '/new-chat' && pathname.startsWith(to))
        return (
          <li key={label}>
            <Link
              href={to}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-slate-700' : 'text-slate-400'} />
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
