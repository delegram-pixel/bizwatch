'use client'

import React from 'react'
import Badge from '../ui/Badge'
import { FileText } from 'lucide-react'



export default function CustomKnowledgeCard({ title, time, status, size }) {
  return (
    <article className="h-full rounded-3xl border border-slate-200 bg-[var(--surface-strong)] p-5 transition duration-200 hover:border-slate-300 hover:bg-[var(--surface)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-violet-600">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{time}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 text-[12px] text-slate-600">
        <span className="font-medium text-slate-700">{size}</span>
        <Badge variant={status === 'Synchronized' ? 'success' : 'outline'}>{status}</Badge>
      </div>
    </article>
  )
}