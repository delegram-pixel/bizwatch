'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { confidenceDots, sourceLabel } from '../lib/utils.js'

export default function PredictionCard({ prediction }) {
  const { title, detail, confidence, timeframe, recommended_action, source } = prediction

  return (
    <Card className="border border-slate-200 ring-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-500">{confidenceDots(confidence)}</span>
          {timeframe && (
            <Badge variant="outline" className="text-[10px] font-mono">
              {timeframe}
            </Badge>
          )}
        </div>

        <h3 className="text-sm font-semibold text-black mt-2 leading-snug">{title}</h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{detail}</p>

        {recommended_action && (
          <div className="mt-3 pl-3" style={{ borderLeft: '2px solid #00E87A' }}>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Recommended</p>
            <p className="text-xs text-slate-700 mt-0.5">{recommended_action}</p>
          </div>
        )}

        <div className="mt-3">
          <Badge variant="outline" className="text-[10px] font-mono">
            {sourceLabel(source)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
