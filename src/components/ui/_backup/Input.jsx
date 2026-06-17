'use client'

import React from 'react'
import { Search } from 'lucide-react'

export default function Input({ label = 'Search', icon, className = '', ...props }) {
  return (
    <label className="group relative block w-full text-slate-300">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 transition group-focus-within:text-indigo-200">
        {icon || <Search size={18} />}
      </span>
      <input
        className={`w-full rounded-3xl border border-slate-200 bg-[var(--surface)] py-3 pl-11 pr-4 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 ${className}`}
        {...props}
      />
    </label>
  )
}