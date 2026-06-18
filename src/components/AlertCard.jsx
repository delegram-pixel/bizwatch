'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { urgencyColor, urgencyLabel, formatDate } from '../lib/utils.js'

function SourceCitation({ source_file, source_quote }) {
  const [open, setOpen] = useState(false)
  if (!source_file || !source_quote) return null
  const excerpt = source_quote.length > 200 ? source_quote.slice(0, 200) + '…' : source_quote
  return (
    <div className="mt-3 pt-2 border-t border-slate-100">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-[10px] text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-1"
      >
        <span>{open ? '▼' : '▶'}</span> View source
      </button>
      {open && (
        <div className="mt-1.5 pl-2 border-l-2 border-slate-200">
          <p className="text-[10px] font-semibold text-slate-500">📄 {source_file}</p>
          <p className="text-[10px] text-slate-400 italic mt-0.5 leading-relaxed">"{excerpt}"</p>
        </div>
      )}
    </div>
  )
}

export default function AlertCard({ alert }) {
  const { title, detail, urgency, action_required, deadline, client_or_entity, source_file, source_quote } = alert
  const color = urgencyColor(urgency)
  const isCritical = urgency === 'critical'

  return (
    <Card
      className="border border-slate-200 ring-0 shadow-none"
      style={{ borderLeftWidth: '3px', borderLeftColor: color }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            {isCritical && (
              <span
                className="w-2 h-2 rounded-full animate-ping flex-shrink-0"
                style={{ background: color }}
              />
            )}
            <span
              className="text-[10px] font-semibold uppercase tracking-widest font-mono"
              style={{ color }}
            >
              {urgencyLabel(urgency)}
            </span>
          </div>
          {client_or_entity && (
            <Badge variant="outline" className="text-[10px] font-mono shrink-0">
              {client_or_entity}
            </Badge>
          )}
        </div>

        <h3 className="text-sm font-semibold text-black leading-snug">{title}</h3>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{detail}</p>

        {action_required && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Action</span>
            <p className="text-xs text-slate-600 mt-0.5">{action_required}</p>
          </div>
        )}

        {deadline && (
          <p className="text-[10px] mt-2" style={{ color: '#F5A623' }}>
            Deadline: {formatDate(deadline)}
          </p>
        )}
        <SourceCitation source_file={source_file} source_quote={source_quote} />
      </CardContent>
    </Card>
  )
}
