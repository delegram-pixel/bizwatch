'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function SourceCard({ icon: Icon, title, description, status, accent }) {
  const isConnected = accent === 'connected'

  return (
    <Card className="group h-full border border-slate-200 ring-0 shadow-none hover:border-slate-300 transition-colors overflow-hidden">
      <CardContent className="flex flex-col p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-violet-600 shadow-[0_20px_45px_-30px_rgba(124,58,237,0.18)]">
            <Icon size={24} />
          </div>
          <Badge
            variant={isConnected ? 'secondary' : 'outline'}
            className={isConnected ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/25' : ''}
          >
            {status}
          </Badge>
        </div>
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
