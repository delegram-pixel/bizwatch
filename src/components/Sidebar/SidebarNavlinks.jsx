'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquarePlus,
  TimerReset,
  FileChartColumn,
  Layers,
  Settings2,
  BookOpen,
} from 'lucide-react'

const links = [
  { label: 'New Chat', to: '/new-chat', icon: MessageSquarePlus },
  { label: 'History', to: '/history', icon: TimerReset },
  { label: 'Analytics', to: '/analytics', icon: FileChartColumn },
  { label: 'Workspace', to: '/workspace', icon: Layers },
  { label: 'Knowledgebase', to: '/knowledgebase', icon: BookOpen },
  { label: 'Settings', to: '/settings', icon: Settings2 },
]

export default function SidebarNavlinks() {
  const pathname = usePathname()

  return (
    <ul className="flex flex-col">
      {links.map(({ label, to, icon: Icon }) => {
        const isActive = pathname === to || (to !== '/new-chat' && pathname.startsWith(to))
        return (
          <li key={label}>
            <Link
              href={to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[12px] font-medium leading-[16.8px] tracking-[0.14px] transition cursor-pointer ${
                isActive
                  ? 'bg-slate-100 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Icon size={20} className="text-inherit" />
              <span>{label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
