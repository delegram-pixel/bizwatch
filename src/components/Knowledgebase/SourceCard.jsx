'use client'

import React from 'react'
import Badge from '../ui/Badge'

export default function SourceCard({ icon: Icon, title, description, status, accent }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-[var(--surface-strong)] p-8 transition duration-200 hover:border-slate-300 hover:bg-[var(--surface)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-violet-600 shadow-[0_20px_45px_-30px_rgba(124,58,237,0.18)]">
          <Icon size={24} />
        </div>
        <Badge variant={accent === 'connected' ? 'success' : 'outline'}>{status}</Badge>
      </div>
      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </article>
  )
}