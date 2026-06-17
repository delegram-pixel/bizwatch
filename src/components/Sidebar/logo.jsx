'use client'

import React from 'react'

export default function Logo() {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-violet-500/20">
        BW
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">BizWatch AI</p>
        <p className="text-xs text-slate-500">Business Intelligence</p>
      </div>
    </div>
  )
}