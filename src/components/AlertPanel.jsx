'use client'

import AlertCard from './AlertCard.jsx'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function AlertPanel({ alerts, loading }) {
  const unread = alerts?.unread_count ?? 0
  const list = alerts?.alerts ?? []

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-black uppercase tracking-widest">Alerts</h2>
        {unread > 0 && (
          <Badge variant="destructive" className="text-[10px] font-bold">
            {unread}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
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
