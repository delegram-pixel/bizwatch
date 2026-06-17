'use client'

export default function SkeletonCard({ lines = 2 }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-white/10 rounded-full"
          style={{ width: i === 0 ? '55%' : '85%' }}
        />
      ))}
    </div>
  )
}