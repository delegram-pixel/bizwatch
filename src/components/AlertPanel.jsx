'use client'

import AlertCard from './AlertCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'

export default function AlertPanel({ alerts, loading }) {
  const unread = alerts?.unread_count ?? 0
  const list = alerts?.alerts ?? []

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-black uppercase tracking-widest">Alerts</h2>
        {unread > 0 && (
          <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
            {unread}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">No alerts right now. Your business looks clean.</p>
      ) : (
        <div className="space-y-3">
          {list.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </section>
  )
}