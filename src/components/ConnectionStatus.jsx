'use client'

import { RefreshCw } from 'lucide-react'
import { timeAgo, sourceLabel } from '../lib/utils.js'

const SOURCE_KEYS = ['sheets', 'drive', 'gmail', 'calendar']

export default function ConnectionStatus({ sources, lastUpdated, onRefresh, loading }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-[var(--surface)] border border-slate-200 rounded-xl">
      <div className="flex items-center gap-4 flex-wrap">
        {SOURCE_KEYS.map((key) => {
          const connected = sources?.[key]
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: connected ? '#00E87A' : '#3F4155' }}
              />
              <span className="text-xs text-slate-500">{sourceLabel(key)}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {lastUpdated && (
          <span className="text-xs text-slate-500">{timeAgo(lastUpdated)}</span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer disabled:opacity-40"
          title="Refresh analysis"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  )
}