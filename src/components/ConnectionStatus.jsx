'use client'

import { RefreshCw } from 'lucide-react'
import { timeAgo, sourceLabel } from '../lib/utils.js'

const SOURCE_KEYS = ['sheets', 'drive', 'gmail', 'calendar']

export default function ConnectionStatus({ sources, lastUpdated, onRefresh, loading }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-slate-200 rounded-lg">
      <div className="flex items-center gap-3 flex-wrap min-w-0">
        {SOURCE_KEYS.map((key) => {
          const connected = sources?.[key]
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: connected ? '#10b981' : '#cbd5e1' }}
              />
              <span className="text-[12px] text-slate-500">{sourceLabel(key)}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {lastUpdated && (
          <span className="text-[11px] text-slate-400 hidden md:block">{timeAgo(lastUpdated)}</span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh analysis"
          className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  )
}
