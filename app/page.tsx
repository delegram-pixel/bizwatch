'use client'

import { useRouter } from 'next/navigation'
import { BarChart2, AlertCircle, Users, DollarSign, ArrowRight } from 'lucide-react'

const problems = [
  {
    icon: DollarSign,
    title: 'Overdue invoices pile up',
    desc: 'Payments slip through the cracks while you focus on operations.',
  },
  {
    icon: Users,
    title: 'Clients go quiet unnoticed',
    desc: 'Key relationships fade before you realise something is wrong.',
  },
  {
    icon: AlertCircle,
    title: 'Cash shortfalls hit without warning',
    desc: 'Revenue gaps only become visible when it is already too late.',
  },
]

const engines = [
  {
    label: 'Insights',
    color: 'text-violet-600',
    dot: 'bg-violet-500',
    sample: '₦840,000 in overdue invoices — 3 clients have not paid in over 14 days.',
  },
  {
    label: 'Predictions',
    color: 'text-emerald-600',
    dot: 'bg-emerald-500',
    sample: 'Cash shortfall likely in ~5 weeks. Follow up on overdue invoices this week.',
  },
  {
    label: 'Alerts',
    color: 'text-red-600',
    dot: 'bg-red-500',
    sample: 'Zenith Logistics — Churn Risk. No response to 3 follow-up emails in 28 days.',
  },
]

export default function Landing() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <BarChart2 size={15} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm tracking-tight">BizWatch</span>
        </div>
        <button
          type="button"
          onClick={() => router.push('/connect')}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          Sign in →
        </button>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-24 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
          AI-powered for Nigerian small businesses
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-slate-900 mb-6">
          Your business is generating data.{' '}
          <span className="text-slate-400">Nobody is watching it.</span>
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-xl">
          BizWatch connects to your Google Workspace and tells you what's happening, what's coming,
          and what needs your attention — without you having to ask.
        </p>
        <button
          type="button"
          onClick={() => router.push('/connect')}
          className="inline-flex items-center gap-2 bg-violet-600 text-white font-semibold px-7 py-3 rounded-xl hover:bg-violet-700 transition-colors text-sm"
        >
          Get started — it's free
          <ArrowRight size={15} />
        </button>
        <p className="text-xs text-slate-400 mt-4">Read-only access · No data stored · Disconnect anytime</p>
      </section>

      {/* Problems */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <p className="text-center text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-10">
          The silent problems costing you money
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {problems.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 mb-4">
                <Icon size={16} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Engines */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <p className="text-center text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-10">
          Three AI engines working for you
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {engines.map(({ label, color, dot, sample }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                <p className={`text-[11px] font-semibold uppercase tracking-widest ${color}`}>{label}</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{sample}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="max-w-xl mx-auto px-6 pb-24">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-[15px] text-slate-700 leading-relaxed mb-5">
            "Built for Chisom — Lagos logistics founder, 8-person team, no time to audit her own spreadsheets."
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <img src="https://i.pravatar.cc/32?img=47" alt="Chisom" className="w-7 h-7 rounded-full" />
            <span className="text-xs text-slate-500">Chisom Okafor · BizWatch beta user</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center px-6 pb-24">
        <button
          type="button"
          onClick={() => router.push('/connect')}
          className="inline-flex items-center gap-2 bg-violet-600 text-white font-semibold px-7 py-3 rounded-xl hover:bg-violet-700 transition-colors text-sm"
        >
          Get started — it's free
          <ArrowRight size={15} />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-6 max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center shrink-0">
            <BarChart2 size={11} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-slate-500">BizWatch</span>
        </div>
        <p className="text-xs text-slate-400">© 2025 BizWatch. All rights reserved.</p>
      </footer>

    </div>
  )
}
