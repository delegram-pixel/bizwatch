'use client'

import React from 'react'
import { Funnel, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function HistorySearch({ value, onChange, onFilter }) {
  return (
    <div className="grid gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
          <Search size={16} />
        </span>
        <Input
          value={value}
          onChange={onChange}
          placeholder="Search past conversations..."
          className="pl-9 rounded-3xl border-slate-200 h-10"
        />
      </div>
      <Button
        variant="secondary"
        size="lg"
        className="w-full justify-center sm:w-auto"
        onClick={onFilter}
      >
        <Funnel size={16} />
        Filter
      </Button>
    </div>
  )
}
