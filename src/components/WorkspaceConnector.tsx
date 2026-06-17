'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ServiceId = 'googleDrive' | 'gmail' | 'googleSheets' | 'googleCalendar'
export type ConnectionStatus = 'idle' | 'loading' | 'connected' | 'error'

export interface WorkspaceConnectorProps {
  initialConnected: {
    googleDrive?: boolean
    gmail?: boolean
    googleSheets?: boolean
    googleCalendar?: boolean
  }
  /**
   * Fires when the user clicks "Continue with Google".
   * - Return `string[]` of service IDs → mock / test path, badges flip to CONNECTED locally.
   * - Return `void` → real OAuth redirect is in flight; component stays in loading state.
   * - Throw → error banner surfaces inside the card.
   */
  onInitOAuth: (payload: { services: string[] }) => Promise<string[] | void>
}

// ── Static integration definitions ───────────────────────────────────────────

const INTEGRATIONS: {
  id: ServiceId
  label: string
  icon: string
}[] = [
  { id: 'googleDrive',    label: 'Google Drive',    icon: 'logos:google-drive'     },
  { id: 'gmail',          label: 'Gmail',            icon: 'logos:google-gmail'     },
  { id: 'googleSheets',   label: 'Google Sheets',   icon: 'logos:google-sheets'    },
  { id: 'googleCalendar', label: 'Google Calendar', icon: 'logos:google-calendar'  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkspaceConnector({
  initialConnected,
  onInitOAuth,
}: WorkspaceConnectorProps) {
  const [statuses, setStatuses] = useState<Record<ServiceId, ConnectionStatus>>(
    () =>
      Object.fromEntries(
        INTEGRATIONS.map(({ id }) => [
          id,
          initialConnected[id] ? 'connected' : 'idle',
        ])
      ) as Record<ServiceId, ConnectionStatus>
  )
  const [globalLoading, setGlobalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allConnected = INTEGRATIONS.every(({ id }) => statuses[id] === 'connected')

  async function handleConnect() {
    if (allConnected || globalLoading) return
    setError(null)
    setGlobalLoading(true)

    const pending = INTEGRATIONS.filter(({ id }) => statuses[id] !== 'connected')

    // Flip all pending services to loading immediately for responsive feedback
    setStatuses((prev) => ({
      ...prev,
      ...Object.fromEntries(
        pending.map(({ id }) => [id, 'loading' as ConnectionStatus])
      ),
    }))

    try {
      const result = await onInitOAuth({ services: pending.map(({ id }) => id) })

      if (Array.isArray(result)) {
        // Mock / test path — flip returned IDs to connected
        setStatuses((prev) => ({
          ...prev,
          ...Object.fromEntries(
            result.map((id) => [id, 'connected' as ConnectionStatus])
          ),
        }))
        setGlobalLoading(false)
        toast.success('All services connected!')
      }
      // Real OAuth path — browser is navigating away; no further state needed
    } catch {
      setError('Connection failed. Please try again.')
      toast.error('Connection failed. Please try again.')
      setStatuses((prev) => ({
        ...prev,
        ...Object.fromEntries(
          pending.map(({ id }) => [id, 'error' as ConnectionStatus])
        ),
      }))
      setGlobalLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12 bg-[var(--surface)]">

      {/* BizWatch brand header */}
      <div className="text-center mb-8 space-y-1.5">
        <p className="text-3xl font-serif font-bold tracking-tight text-slate-900">
          BizWatch<span className="text-violet-600">.</span>
        </p>
        <p className="text-[10px] tracking-[0.3em] uppercase text-slate-500 font-medium">
          Your Business, Always Watched.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[22rem] rounded-2xl border border-slate-200 bg-[var(--surface-strong)] p-7 sm:max-w-md sm:p-8">

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-[1.05rem] font-semibold text-slate-900 mb-1.5">
            Connect your workspace
          </h2>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Grant BizWatch permissions to analyze your Google Workspace
            activity. We use this data solely to generate insights and
            proactive alerts.
          </p>
        </div>

        {/* Integration rows */}
        <div className="rounded-xl border border-slate-200/70 divide-y divide-slate-200/50 overflow-hidden mb-5">
          {INTEGRATIONS.map(({ id, label, icon }) => (
            <div
              key={id}
              className="flex items-center gap-3.5 px-4 py-3.5 bg-[var(--surface)]"
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 rounded-2xl bg-white shadow-sm">
                <Icon icon={icon} width={26} height={26} />
              </div>
              <span className="flex-1 text-[13px] font-medium text-slate-900">
                {label}
              </span>
              <StatusBadge status={statuses[id]} />
            </div>
          ))}
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleConnect}
          disabled={globalLoading || allConnected}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-[13px] font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_20px_-4px_rgba(124,58,237,0.35)] cursor-pointer"
        >
          {globalLoading ? (
            <Loader2 size={17} className="animate-spin text-gray-700" />
          ) : (
            <GoogleGLogo />
          )}
          {allConnected
            ? 'All services connected'
            : globalLoading
            ? 'Connecting…'
            : 'Continue with Google'}
        </button>

        <p className="mt-4 text-center text-[11px] text-slate-500 leading-relaxed">
          We never store your data content on our servers. Analysis is performed
          in real-time and metadata is encrypted with AES-256.
        </p>
      </div>

      {/* Footer nav */}
      <nav className="mt-8 flex gap-5 text-[11px] text-slate-500">
        {(['Privacy Policy', 'Terms of Service', 'Contact Support'] as const).map((link) => (
          <a key={link} href="#" className="hover:text-slate-300 transition-colors">
            {link}
          </a>
        ))}
      </nav>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const base =
    'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] whitespace-nowrap'

  if (status === 'connected')
    return (
      <span className={`${base} border border-emerald-500/25 bg-emerald-500/10 text-emerald-400`}>
        <CheckCircle2 size={9} />
        Connected
      </span>
    )

  if (status === 'loading')
    return (
      <span className={`${base} border border-slate-200 bg-slate-100 text-slate-600`}>
        <Loader2 size={9} className="animate-spin" />
        Connecting
      </span>
    )

  if (status === 'error')
    return (
      <span className={`${base} border border-red-500/20 bg-red-500/5 text-red-400`}>
        Error
      </span>
    )

  return (
    <span className={`${base} border border-slate-200 bg-slate-100 text-slate-600`}>
      Read Only
    </span>
  )
}

function GoogleGLogo() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
      <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.25 9c0-.51.09-1 .25-1.48V5.45H1.83a8 8 0 0 0 0 7.1l2.67-2.07z" />
      <path fill="#EA4335" d="M8.98 3.72c1.22 0 2.31.42 3.17 1.25l2.37-2.38A8 8 0 0 0 1.83 5.45L4.5 7.52A4.77 4.77 0 0 1 8.98 3.72z" />
    </svg>
  )
}