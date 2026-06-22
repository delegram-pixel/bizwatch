'use client'

import React from 'react'

export default function SourceCard({ icon: Icon, title, description, status, accent }) {
  const isConnected = accent === 'connected'

  return (
    <div className={`flex flex-col gap-4 rounded-xl border p-4 transition-colors ${
      isConnected
        ? 'border-slate-200 bg-white hover:border-slate-300'
        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          <Icon size={16} />
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          isConnected
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {status}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-[13px] font-semibold text-slate-900">{title}</h3>
        <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>

      {!isConnected && (
        <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-colors">
          Connect
        </button>
      )}
    </div>
  )
}
