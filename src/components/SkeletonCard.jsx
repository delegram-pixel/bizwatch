'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonCard({ lines = 2 }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3 rounded-full"
          style={{ width: i === 0 ? '55%' : '85%' }}
        />
      ))}
    </div>
  )
}
