'use client'

import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useEngines } from '@/hooks/useEngines'
import AlertPanel from '@/components/AlertPanel'
import InsightPanel from '@/components/InsightPanel'
import PredictionPanel from '@/components/PredictionPanel'
import ConnectionStatus from '@/components/ConnectionStatus'
import { RefreshCw, TrendingUp, Lightbulb, Bell, BarChart2 } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

function StatCard({ icon: Icon, label, value, badge, color = '#7C3AED' }: {
  icon: React.ElementType
  label: string
  value: string | number
  badge?: string
  color?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[var(--surface)] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {badge && (
          <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-black font-mono">{value}</p>
        <p className="text-xs text-slate-600 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function Analytics() {
  const { user } = useAuth()
  const businessType = typeof window !== 'undefined'
    ? (localStorage.getItem('bizwatch_business_type') ?? 'general')
    : 'general'
  const { data, loading, error, lastUpdated, analyse } = useEngines(businessType)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    analyse()
  }, [analyse])

  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return }
    if (!loading && error) toast.error(error)
  }, [loading])

  const insightCount = data?.insights?.insights?.length ?? 0
  const alertCount = data?.alerts?.unread_count ?? 0
  const predCount = data?.predictions?.predictions?.length ?? 0
  const connectedSources = user?.connectedSources ?? {}
  const connectedCount = Object.values(connectedSources).filter(Boolean).length

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 py-6 px-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
          <p className="text-sm text-slate-600 mt-0.5">Overview — real-time business intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-slate-500 hidden sm:block">{timeAgo(lastUpdated)}</span>
          )}
          <button
            type="button"
            onClick={() => analyse(true)}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-slate-200 bg-[var(--surface)] text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh All
          </button>
        </div>
      </div>

      <ConnectionStatus sources={connectedSources} lastUpdated={lastUpdated} onRefresh={() => analyse(true)} loading={loading} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BarChart2} label="Connected sources" value={connectedCount} badge="All time" color="#7C3AED" />
        <StatCard icon={Lightbulb} label="Insights found" value={loading ? '—' : insightCount} badge={insightCount > 0 ? `Today ↑ ${insightCount}` : undefined} color="#4A9EFF" />
        <StatCard icon={Bell} label="Active alerts" value={loading ? '—' : alertCount} color="#FF4757" />
        <StatCard icon={TrendingUp} label="Predictions" value={loading ? '—' : predCount} color="#00E87A" />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-col-3 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-[var(--surface)] p-5">
          <InsightPanel insights={data?.insights} loading={loading} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-[var(--surface)] p-5">
          <AlertPanel alerts={data?.alerts} loading={loading} />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-[var(--surface)] p-5">
        <PredictionPanel predictions={data?.predictions} loading={loading} />
      </div>
    </div>
  )
}
