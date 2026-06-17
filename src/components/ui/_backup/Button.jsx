'use client'

import React from 'react'

const variantStyles = {
  primary: 'bg-violet-600 text-white hover:bg-violet-500',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  outline: 'border border-slate-200 text-slate-900 hover:border-violet-400/50 hover:text-slate-950',
}

const sizeStyles = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}