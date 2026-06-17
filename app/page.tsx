'use client'

import { useRouter } from 'next/navigation'
import { BarChart2, AlertCircle, Users, DollarSign } from 'lucide-react'

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
    color: '#4A9EFF',
    sample: '₦840,000 in overdue invoices — 3 clients have not paid in over 14 days.',
  },
  {
    label: 'Predictions',
    color: '#00E87A',
    sample: 'Cash shortfall likely in ~5 weeks. Follow up on overdue invoices this week.',
  },
  {
    label: 'Alerts',
    color: '#FF4757',
    sample: 'Zenith Logistics — Churn Risk. No response to 3 follow-up emails in 28 days.',
  },
]

export default function Landing() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0F0D17] text-white">
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <span className="font-mono font-semibold text-white text-sm">BizWatch</span>
        </div>
        <button
          type="button"
          onClick={() => router.push('/connect')}
          className="text-sm font-medium text-slate-300 hover:text-white transition cursor-pointer"
        >
          Sign in →
        </button>
      </header>

      <section className="flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          AI-powered for Nigerian small businesses
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight mb-6">
          Your business is generating data.{' '}
          <span className="text-slate-500">Nobody is watching it.</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl">
          BizWatch connects to your Google Workspace and tells you what's happening, what's coming,
          and what needs your attention — without you having to ask.
        </p>
        <button
          type="button"
          onClick={() => router.push('/connect')}
          className="bg-violet-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-500 transition cursor-pointer shadow-[0_8px_32px_-8px_rgba(124,58,237,0.6)] text-sm"
        >
          Get started — it's free
        </button>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-center text-sm font-mono text-slate-500 uppercase tracking-widest mb-10">
          The silent problems costing you money
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {problems.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 mb-4">
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-center text-sm font-mono text-slate-500 uppercase tracking-widest mb-10">
          Three AI engines working for you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {engines.map(({ label, color, sample }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              style={{ borderTopColor: color, borderTopWidth: '2px' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color }}>
                {label}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{sample}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-lg text-slate-200 leading-relaxed italic mb-4">
            "Built for Chisom — Lagos logistics founder, 8-person team, no time to audit her own
            spreadsheets."
          </p>
          <div className="flex items-center justify-center gap-2">
            <img src="https://i.pravatar.cc/32?img=47" alt="Chisom" className="w-8 h-8 rounded-full" />
            <span className="text-xs text-slate-500">Chisom Okafor · BizWatch beta user</span>
          </div>
        </div>
      </section>

      <section className="text-center px-6 pb-24">
        <button
          type="button"
          onClick={() => router.push('/connect')}
          className="bg-violet-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-500 transition cursor-pointer shadow-[0_8px_32px_-8px_rgba(124,58,237,0.6)] text-sm"
        >
          Get started — it's free
        </button>
        <p className="text-xs text-slate-600 mt-4">Read-only access. No data stored. Disconnect anytime.</p>
      </section>
    </div>
  )
}
