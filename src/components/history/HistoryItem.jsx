'use client'

import Link from 'next/link'

export default function HistoryItem({ icon, iconColor, title, subtitle, time, id }) {
  return (
    <Link
      href={`/chat/${id}`}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 -mx-3 hover:bg-slate-50 transition-colors group"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconColor} text-white`}>
        <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-slate-900 group-hover:text-slate-700">{title}</p>
        {subtitle && (
          <p className="truncate text-[11px] text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>
        )}
      </div>

      <time className="shrink-0 text-[11px] text-slate-400 uppercase tracking-wider whitespace-nowrap">
        {time}
      </time>
    </Link>
  )
}
