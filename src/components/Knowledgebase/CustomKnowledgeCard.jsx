'use client'

import React from 'react'
import { FileText } from 'lucide-react'

export default function CustomKnowledgeCard({ title, time, status, size }) {
  const isSynced = status === 'Synchronized'
  const isIndexing = status === 'Indexing'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
          <FileText size={14} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-slate-900">{title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{time}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400 font-mono">{size}</span>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          isSynced
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : isIndexing
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {status}
        </span>
      </div>
    </div>
  )
}
