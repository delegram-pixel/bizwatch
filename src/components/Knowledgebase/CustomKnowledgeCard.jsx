'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function CustomKnowledgeCard({ title, time, status, size }) {
  const isSynced = status === 'Synchronized'

  return (
    <Card className="h-full border border-slate-200 ring-0 shadow-none hover:border-slate-300 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-slate-100 text-violet-600">
            <FileText size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{time}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-3 text-[12px] text-slate-600">
          <span className="font-medium text-slate-700">{size}</span>
          <Badge
            variant={isSynced ? 'secondary' : 'outline'}
            className={isSynced ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/25' : ''}
          >
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
