'use client'

import { severityColor, sourceLabel } from '../lib/utils.js'

export default function InsightCard({ insight }) {
  const { type, title, detail, severity, source } = insight
  const color = severityColor(severity)

  if (type === 'financial') {
    const match = title.match(/[₦#][\d,]+/)
    const bigNumber = match ? match[0] : null
    const label = bigNumber ? title.replace(bigNumber, '').trim() : title

    return (
      <div className="rounded-xl border border-slate-200 bg-[var(--surface-strong)] p-4">
        {bigNumber && (
          <p className="text-2xl font-bold font-mono" style={{ color }}>
            {bigNumber}
          </p>
        )}
        {label && <p className="text-xs text-slate-600 mt-0.5">{label}</p>}
        <p className="text-xs text-slate-700 mt-2 leading-relaxed">{detail}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] font-mono bg-white/10 text-slate-400 px-2 py-0.5 rounded">
            {sourceLabel(source)}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>
            {severity}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-[var(--surface-strong)] p-4">
      <h3 className="text-sm font-semibold text-black leading-snug">{title}</h3>
      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{detail}</p>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] font-mono bg-white/10 text-slate-400 px-2 py-0.5 rounded">
          {sourceLabel(source)}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>
          {severity}
        </span>
      </div>
    </div>
  )
}