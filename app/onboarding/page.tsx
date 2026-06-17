'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, ShoppingBag, Briefcase, Wrench } from 'lucide-react'

const types = [
  { key: 'logistics', icon: Truck, label: 'Logistics & Delivery' },
  { key: 'retail', icon: ShoppingBag, label: 'Retail & Products' },
  { key: 'services', icon: Briefcase, label: 'Professional Services' },
  { key: 'other', icon: Wrench, label: 'Other' },
]

export default function Onboarding() {
  const [selected, setSelected] = useState<string | null>(null)
  const router = useRouter()

  function handleContinue() {
    if (!selected) return
    localStorage.setItem('bizwatch_business_type', selected)
    router.push('/analytics')
  }

  return (
    <div className="min-h-screen bg-[#0F0D17] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <p className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">
            Step 1 of 1
          </p>
          <h1 className="text-2xl font-semibold text-white mb-2">One quick question</h1>
          <p className="text-sm text-slate-400">This helps BizWatch personalise your insights</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {types.map(({ key, icon: Icon, label }) => {
            const isSelected = selected === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className="flex flex-col items-center gap-3 rounded-2xl border p-6 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                style={{
                  borderColor: isSelected ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.03)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition"
                  style={{
                    background: isSelected ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isSelected ? '#9061F9' : '#8B8FA8',
                  }}
                >
                  <Icon size={22} />
                </div>
                <span
                  className="text-sm font-medium text-center leading-tight"
                  style={{ color: isSelected ? '#fff' : '#94a3b8' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className="w-full bg-violet-600 text-white font-semibold py-3.5 rounded-xl hover:bg-violet-500 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-[0_8px_32px_-8px_rgba(124,58,237,0.6)]"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  )
}
