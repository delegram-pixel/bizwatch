'use client'

import React from 'react'
import HistoryItem from './HistoryItem'

export default function HistorySection({ title, items }) {
  if (!items.length) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-700">{title}</h2>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <HistoryItem key={item.id} {...item} />
        ))}
      </div>
    </section>
  )
}