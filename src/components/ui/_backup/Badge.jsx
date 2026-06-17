'use client'

import React from 'react'

const variants = {
  subtle: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-500/15 text-emerald-700',
  outline: 'border border-slate-200 text-slate-700',
}

export default function Badge({ variant = 'subtle', className = '', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}