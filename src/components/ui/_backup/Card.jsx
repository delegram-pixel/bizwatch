'use client'

import React from 'react'

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-[28px] border border-slate-200 bg-[var(--surface-strong)] p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.08)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}