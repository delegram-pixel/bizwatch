'use client'

import { confidenceDots, sourceLabel } from '../lib/utils.js'

export default function PredictionCard({ prediction }) {
  const { title, detail, confidence, timeframe, recommended_action, source } = prediction

  return (
    <div className="rounded-xl border border-slate-200 bg-[var(--surface-strong)] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-slate-500">{confidenceDots(confidence)}</span>
        {timeframe && (
          <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {timeframe}
          </span>
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
        <span className="text-[10px] font-mono bg-white/10 text-slate-400 px-2 py-0.5 rounded">
          {sourceLabel(source)}
        </span>
      </div>
    </div>
  )
}