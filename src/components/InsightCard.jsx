'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { severityColor, sourceLabel } from '../lib/utils.js'

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

export default function InsightCard({ insight }) {
  const { type, title, detail, severity, source, source_file, source_quote } = insight
  const color = severityColor(severity)

  if (type === 'financial') {
    const match = title.match(/[₦#][\d,]+/)
    const bigNumber = match ? match[0] : null
    const label = bigNumber ? title.replace(bigNumber, '').trim() : title

    return (
      <Card className="border border-slate-200 ring-0 shadow-none">
        <CardContent className="p-4">
          {bigNumber && (
            <p className="text-2xl font-bold font-mono" style={{ color }}>
              {bigNumber}
            </p>
          )}
          {label && <p className="text-xs text-slate-600 mt-0.5">{label}</p>}
          <p className="text-xs text-slate-700 mt-2 leading-relaxed">{detail}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-[10px] font-mono">
              {sourceLabel(source)}
            </Badge>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>
              {severity}
            </span>
          </div>
          <SourceCitation source_file={source_file} source_quote={source_quote} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-200 ring-0 shadow-none">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-black leading-snug">{title}</h3>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{detail}</p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline" className="text-[10px] font-mono">
            {sourceLabel(source)}
          </Badge>
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>
            {severity}
          </span>
        </div>
        <SourceCitation source_file={source_file} source_quote={source_quote} />
      </CardContent>
    </Card>
  )
}
