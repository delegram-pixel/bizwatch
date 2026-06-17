'use client'

import PredictionCard from './PredictionCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'
import OutlookBanner from './OutlookBanner.jsx'

export default function PredictionPanel({ predictions, loading }) {
  const list = predictions?.predictions ?? []

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-black uppercase tracking-widest">Predictions</h2>
        {!loading && predictions?.outlook && (
          <span className="text-[10px] text-slate-600 font-mono capitalize">{predictions.outlook}</span>
        )}
      </div>

      {predictions?.outlook && !loading && (
        <div className="mb-3">
          <OutlookBanner outlook={predictions.outlook} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">Not enough data yet to make predictions.</p>
      ) : (
        <div className="space-y-3">
          {list.map((pred) => (
            <PredictionCard key={pred.id} prediction={pred} />
          ))}
        </div>
      )}
    </section>
  )
}