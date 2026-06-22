'use client'

import HistoryItem from './HistoryItem'

export default function HistorySection({ title, items }) {
  if (!items.length) return null

  return (
    <section>
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-1 px-3">
        {title}
      </p>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <HistoryItem key={item.id} {...item} />
        ))}
      </div>
    </section>
  )
}
