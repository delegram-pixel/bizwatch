'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getGoogleAuthUrl } from '@/lib/api'
import Button from '@/components/ui/Button'
import {
  Mail, HardDrive, Calendar, FileSpreadsheet,
  Camera, Check, RefreshCw, Trash2, AlertTriangle,
  ChevronDown, Info,
} from 'lucide-react'

const GOOGLE_SERVICES = [
  { id: 'gmail', name: 'Gmail', Icon: Mail, description: 'Email threads and communication' },
  { id: 'drive', name: 'Google Drive', Icon: HardDrive, description: 'Files and documents' },
  { id: 'sheets', name: 'Google Sheets', Icon: FileSpreadsheet, description: 'Spreadsheet data' },
  { id: 'calendar', name: 'Google Calendar', Icon: Calendar, description: 'Events and scheduling' },
]

const INDUSTRIES = ['Logistics', 'Retail', 'Fashion', 'Food & Beverage', 'Consulting', 'Other']
const CURRENCIES = [
  { value: 'NGN', label: 'NGN (₦)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
]

const DEFAULT_AI_PREFS = {
  businessName: '',
  industry: 'Retail',
  location: '',
  currency: 'NGN',
  insightSensitivity: 'Medium',
  responseStyle: 'Analytical',
}

function getInitials(name?: string) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function loadAiPrefs() {
  try {
    const raw = localStorage.getItem('bizwatch_ai_prefs')
    const savedName = localStorage.getItem('bizwatch_business_name') || ''
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_AI_PREFS, ...parsed, businessName: savedName || parsed.businessName || '' }
    }
    return { ...DEFAULT_AI_PREFS, businessName: savedName }
  } catch {
    return { ...DEFAULT_AI_PREFS }
  }
}

function loadConnectedServices() {
  try {
    const raw = localStorage.getItem('bizwatch_connected_services')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { gmail: true, drive: true, sheets: true, calendar: true }
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-950/90 px-4 py-3 text-sm text-white shadow-2xl transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <Check size={14} className="text-green-400 shrink-0" />
      {message}
    </div>
  )
}

function ConfirmModal({ title, description, confirmLabel, onConfirm, onCancel }: {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-50 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 mt-0.5">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-black">{title}</h3>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/30"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[var(--surface)] p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-black">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-[var(--surface-strong)] px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-500 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10'

export default function Settings() {
  const { user } = useAuth()

  const [toast, setToast] = useState({ visible: false, message: '' })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ visible: true, message })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  const [modal, setModal] = useState<'clearHistory' | 'clearPrefs' | 'deleteAccount' | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [profileDirty, setProfileDirty] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('bizwatch_display_name')
    setDisplayName(saved || user?.name || '')
  }, [user])

  function saveProfile() {
    localStorage.setItem('bizwatch_display_name', displayName)
    setProfileDirty(false)
    showToast('Profile saved')
  }

  const [connected, setConnected] = useState<Record<string, boolean>>(loadConnectedServices)

  function toggleService(id: string) {
    setConnected((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem('bizwatch_connected_services', JSON.stringify(next))
      return next
    })
  }

  const [aiPrefs, setAiPrefs] = useState(loadAiPrefs)

  function updatePref(key: string, value: string) {
    setAiPrefs((prev: typeof DEFAULT_AI_PREFS) => ({ ...prev, [key]: value }))
  }

  function saveAiPrefs() {
    const { businessName, ...rest } = aiPrefs
    localStorage.setItem('bizwatch_ai_prefs', JSON.stringify({ ...rest, businessName }))
    localStorage.setItem('bizwatch_business_name', businessName)
    showToast('Preferences saved')
  }

  function confirmClearHistory() {
    Object.keys(localStorage).filter((k) => k.startsWith('chat_')).forEach((k) => localStorage.removeItem(k))
    setModal(null)
    showToast('Chat history cleared')
  }

  function confirmClearPrefs() {
    localStorage.removeItem('bizwatch_ai_prefs')
    localStorage.removeItem('bizwatch_business_name')
    setAiPrefs({ ...DEFAULT_AI_PREFS })
    setModal(null)
    showToast('AI preferences reset')
  }

  async function confirmDeleteAccount() {
    const BASE = process.env.NEXT_PUBLIC_API_URL
    await fetch(`${BASE}/api/auth/account`, { method: 'DELETE', credentials: 'include' }).catch(() => {})
    localStorage.clear()
    window.location.href = '/'
  }

  return (
    <>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-black">Settings</h1>
          <p className="mt-0.5 text-sm text-slate-600">Manage your account, integrations, and AI preferences.</p>
        </div>

        <SectionCard title="Profile" subtitle="Your public display name and account details.">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-violet-600/20 ring-2 ring-violet-500/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-violet-600">{getInitials(displayName || user?.name)}</span>
                  </div>
                )}
                <button type="button" title="Change photo" className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer">
                  <Camera size={11} />
                </button>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-black">{displayName || user?.name || 'Your Name'}</p>
                <p className="truncate text-xs text-slate-600">{user?.email || '—'}</p>
              </div>
            </div>

            <Field label="Display name">
              <input value={displayName} onChange={(e) => { setDisplayName(e.target.value); setProfileDirty(true) }} placeholder="Your name" className={inputCls} />
            </Field>

            <Field label="Email">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-[var(--surface-strong)] px-3.5 py-2.5">
                <Mail size={13} className="shrink-0 text-slate-600" />
                <span className="flex-1 truncate text-sm text-slate-700">{user?.email || 'Connected via Google'}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">Read-only</span>
              </div>
            </Field>

            <div className="flex justify-end">
              <div className="relative">
                {profileDirty && <span className="absolute -right-1 -top-1 z-10 h-2.5 w-2.5 rounded-full bg-yellow-400 ring-2 ring-[#0f0d17]" />}
                <Button variant="primary" onClick={saveProfile}>Save changes</Button>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Connected Accounts" subtitle="Manage your Google Workspace integrations.">
          <div className="flex flex-col gap-2">
            {GOOGLE_SERVICES.map(({ id, name, Icon, description }) => (
              <div key={id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[var(--surface-strong)] px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
                  <Icon size={15} className="text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-black">{name}</p>
                  <p className="truncate text-xs text-slate-600">{description}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${connected[id] ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-slate-500'}`}>
                  {connected[id] ? 'Connected' : 'Not connected'}
                </span>
                <Button variant={connected[id] ? 'outline' : 'primary'} size="md" onClick={() => toggleService(id)} className={`shrink-0 !px-3 !py-1.5 text-xs ${connected[id] ? '!text-red-400 hover:!border-red-500/30 hover:!bg-red-500/5' : ''}`}>
                  {connected[id] ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => { window.location.href = getGoogleAuthUrl() }}>
              <RefreshCw size={13} />
              Switch Google Account
            </Button>
            {!connected.drive && (
              <Button variant="outline" onClick={() => { setConnected((p) => { const n = { ...p, drive: true }; localStorage.setItem('bizwatch_connected_services', JSON.stringify(n)); return n }); showToast('Google Drive connected') }}>
                <HardDrive size={13} />
                Add Google Drive
              </Button>
            )}
          </div>
        </SectionCard>

        <SectionCard title="AI Preferences" subtitle="Customize how BizWatch AI understands your business.">
          <div className="flex flex-col gap-4">
            <Field label="Business name">
              <input value={aiPrefs.businessName} onChange={(e) => updatePref('businessName', e.target.value)} placeholder="e.g. Adeyemi Logistics Ltd" className={inputCls} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Industry">
                <div className="relative">
                  <select value={aiPrefs.industry} onChange={(e) => updatePref('industry', e.target.value)} className={`${inputCls} appearance-none cursor-pointer pr-9`}>
                    {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-white text-slate-900">{i}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </Field>
              <Field label="Location">
                <input value={aiPrefs.location} onChange={(e) => updatePref('location', e.target.value)} placeholder="e.g. Lagos" className={inputCls} />
              </Field>
            </div>
            <Field label="Currency">
              <div className="relative sm:w-44">
                <select value={aiPrefs.currency} onChange={(e) => updatePref('currency', e.target.value)} className={`${inputCls} appearance-none cursor-pointer pr-9`}>
                  {CURRENCIES.map((c) => <option key={c.value} value={c.value} className="bg-white text-slate-900">{c.label}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </Field>
            <Field label="Insight sensitivity">
              <div className="flex w-fit rounded-xl border border-slate-200 bg-[var(--surface-strong)] p-1">
                {['Low', 'Medium', 'High'].map((level) => (
                  <button key={level} type="button" onClick={() => updatePref('insightSensitivity', level)} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition cursor-pointer ${aiPrefs.insightSensitivity === level ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                    {level}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Response style">
              <div className="flex w-fit rounded-xl border border-slate-200 bg-[var(--surface-strong)] p-1">
                {['Analytical', 'Conversational'].map((style) => (
                  <button key={style} type="button" onClick={() => updatePref('responseStyle', style)} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition cursor-pointer ${aiPrefs.responseStyle === style ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                    {style}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex justify-end pt-1">
              <Button variant="primary" onClick={saveAiPrefs}><Check size={13} />Save preferences</Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Data & Privacy" subtitle="Control your stored data and account.">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 px-4 py-3">
              <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
              <p className="text-xs leading-relaxed text-slate-600">
                BizWatch only requests <span className="font-medium text-slate-900">read-only access</span> to your Google Workspace. We never modify or delete your data.
              </p>
            </div>
            <div className="flex flex-col divide-y divide-slate-200/50">
              {[
                { label: 'Clear chat history', desc: 'Remove all stored conversation data from this device.', action: 'Clear', modal: 'clearHistory' as const },
                { label: 'Clear AI preferences', desc: 'Reset all business settings and AI configuration to defaults.', action: 'Reset', modal: 'clearPrefs' as const },
                { label: 'Delete account', desc: 'Permanently delete your BizWatch account and all associated data.', action: 'Delete account', modal: 'deleteAccount' as const, icon: AlertTriangle },
              ].map(({ label, desc, action, modal: m, icon: Icon = Trash2 }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-black">{label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                  </div>
                  <Button variant="outline" onClick={() => setModal(m)} className="shrink-0 !border-red-500/20 !text-red-400 hover:!bg-red-500/5 hover:!border-red-500/30">
                    <Icon size={13} />{action}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <Toast message={toast.message} visible={toast.visible} />

      {modal === 'clearHistory' && (
        <ConfirmModal title="Clear chat history?" description="This will permanently delete all chat conversations stored on this device. This cannot be undone." confirmLabel="Clear history" onConfirm={confirmClearHistory} onCancel={() => setModal(null)} />
      )}
      {modal === 'clearPrefs' && (
        <ConfirmModal title="Clear AI preferences?" description="Your business name, industry, location, and all AI configuration will be reset to defaults." confirmLabel="Reset preferences" onConfirm={confirmClearPrefs} onCancel={() => setModal(null)} />
      )}
      {modal === 'deleteAccount' && (
        <ConfirmModal title="Delete your account?" description="This is permanent and cannot be undone. All your insights, integrations, and data will be removed from BizWatch." confirmLabel="Yes, delete my account" onConfirm={confirmDeleteAccount} onCancel={() => setModal(null)} />
      )}
    </>
  )
}
