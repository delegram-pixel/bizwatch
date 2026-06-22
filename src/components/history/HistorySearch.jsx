'use client'

import { Search, SlidersHorizontal } from 'lucide-react'

export default function HistorySearch({ value, onChange, onFilter }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 min-w-0">
        <Search size={14} className="pointer-events-none absolute inset-y-0 left-3 my-auto text-slate-400" />
        <input
          value={value}
          onChange={onChange}
          placeholder="Search past conversations..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      <button
        onClick={onFilter}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors whitespace-nowrap"
      >
        <SlidersHorizontal size={13} />
        <span className="hidden sm:inline">Filter</span>
      </button>
    </div>
  )
}
