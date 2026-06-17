'use client'

import { outlookStyle, outlookDescription } from '../lib/utils.js'

export default function OutlookBanner({ outlook }) {
  if (!outlook) return null
  const style = outlookStyle(outlook)

  return (
    <div
      className="rounded-lg border px-4 py-2.5 text-sm font-medium flex items-center gap-2"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.text }} />
      <span className="capitalize font-semibold mr-1">{outlook}:</span>
      <span className="font-normal opacity-80">{outlookDescription(outlook)}</span>
    </div>
  )
}