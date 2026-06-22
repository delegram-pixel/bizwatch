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
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
          <Icon size={15} style={{ color }} />
        </div>
        {badge && (
          <span className="text-[10px] text-slate-400 font-mono leading-tight text-right">{badge}</span>
        )}
      </div>
      <div>
        <p className="text-xl font-semibold text-slate-900 font-mono leading-none">{value}</p>
        <p className="text-[11px] text-slate-500 mt-1">{label}</p>
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
    <div className="mx-auto max-w-6xl flex flex-col gap-5 py-2">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Real-time business intelligence</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lastUpdated && (
            <span className="text-[11px] text-slate-400 hidden sm:block">{timeAgo(lastUpdated)}</span>
          )}
          <button
            type="button"
            onClick={() => analyse(true)}
            disabled={loading}
            className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Connection status */}
      <ConnectionStatus sources={connectedSources} lastUpdated={lastUpdated} onRefresh={() => analyse(true)} loading={loading} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BarChart2} label="Connected sources" value={connectedCount} badge="All time" color="#7C3AED" />
        <StatCard icon={Lightbulb} label="Insights found" value={loading ? '—' : insightCount} badge={insightCount > 0 ? `↑ ${insightCount} today` : undefined} color="#4A9EFF" />
        <StatCard icon={Bell} label="Active alerts" value={loading ? '—' : alertCount} color="#FF4757" />
        <StatCard icon={TrendingUp} label="Predictions" value={loading ? '—' : predCount} color="#10b981" />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>
      )}

      {/* Insights + Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <InsightPanel insights={data?.insights} loading={loading} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <AlertPanel alerts={data?.alerts} loading={loading} />
        </div>
      </div>

      {/* Predictions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <PredictionPanel predictions={data?.predictions} loading={loading} />
      </div>

    </div>
  )
}
