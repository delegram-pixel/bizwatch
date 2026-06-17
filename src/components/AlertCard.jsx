'use client'

import { urgencyColor, urgencyLabel, formatDate } from '../lib/utils.js'

export default function AlertCard({ alert }) {
  const { title, detail, urgency, action_required, deadline, client_or_entity } = alert
  const color = urgencyColor(urgency)
  const isCritical = urgency === 'critical'

  return (
    <div
      className="rounded-xl border border-slate-200 bg-[var(--surface-strong)] p-4"
      style={{ borderLeftWidth: '3px', borderLeftColor: color }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {isCritical && (
            <span
              className="w-2 h-2 rounded-full animate-ping flex-shrink-0"
              style={{ background: color }}
            />
          )}
          <span
            className="text-[10px] font-semibold uppercase tracking-widest font-mono"
            style={{ color }}
          >
            {urgencyLabel(urgency)}
          </span>
        </div>
        {client_or_entity && (
          <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono shrink-0">
            {client_or_entity}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-black leading-snug">{title}</h3>
      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{detail}</p>

      {action_required && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Action</span>
          <p className="text-xs text-slate-600 mt-0.5">{action_required}</p>
        </div>
      )}

      {deadline && (
        <p className="text-[10px] mt-2" style={{ color: '#F5A623' }}>
          Deadline: {formatDate(deadline)}
        </p>
      )}
    </div>
  )
}