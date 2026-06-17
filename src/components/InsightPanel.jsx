'use client'

import InsightCard from './InsightCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'

export default function InsightPanel({ insights, loading }) {
  const summary = insights?.summary
  const list = insights?.insights ?? []

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-black uppercase tracking-widest">Insights</h2>
        {list.length > 0 && (
          <span className="text-[10px] text-slate-500 font-mono">{list.length} found</span>
        )}
      </div>

      {summary && (
        <p className="text-xs italic text-slate-600 mb-3 leading-relaxed">{summary}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={3} />
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">Connect your Google Workspace to see insights.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {list.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </section>
  )
}