'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { severityColor, sourceLabel } from '../lib/utils.js'

export default function InsightCard({ insight }) {
  const { type, title, detail, severity, source } = insight
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
      </CardContent>
    </Card>
  )
}
