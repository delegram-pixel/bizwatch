'use client'

import React from 'react'
import { Funnel, Search } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function HistorySearch({ value, onChange, onFilter }) {
  return (
    <div className="grid gap-4 sm:flex sm:items-center sm:justify-between">
      <Input
        value={value}
        onChange={onChange}
        placeholder="Search past conversations..."
        icon={<Search size={18} />}
        className="min-w-0"
      />
      <Button variant="secondary" size="lg" className="w-full justify-center sm:w-auto" onClick={onFilter}>
        <Funnel size={16} />
        Filter
      </Button>
    </div>
  )
}