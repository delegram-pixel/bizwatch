'use client'

import React from 'react'

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-white">
        BW
      </div>
      <div>
        <p className="text-[13px] font-semibold text-slate-900 leading-tight">BizWatch AI</p>
        <p className="text-[11px] text-slate-400 leading-tight">Business Intelligence</p>
      </div>
    </div>
  )
}
