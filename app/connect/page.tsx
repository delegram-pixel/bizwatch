'use client'

import { Suspense, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchUser } from '@/store/authSlice'
import { getGoogleAuthUrl } from '@/lib/api'
import toast from 'react-hot-toast'
import type { AppDispatch } from '@/store'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
      <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.25 9c0-.51.09-1 .25-1.48V5.45H1.83a8 8 0 0 0 0 7.1l2.67-2.07z" />
      <path fill="#EA4335" d="M8.98 3.72c1.22 0 2.31.42 3.17 1.25l2.37-2.38A8 8 0 0 0 1.83 5.45L4.5 7.52A4.77 4.77 0 0 1 8.98 3.72z" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function ConnectPage() {
  return (
    <Suspense>
      <Connect />
    </Suspense>
  )
}

function Connect() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const hasError = searchParams.get('error') === 'auth_failed'

  async function handleSignIn() {
    if (loading) return
    setLoading(true)
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await dispatch(fetchUser())
      router.push('/analytics')
      return
    }
    try {
      window.location.href = getGoogleAuthUrl()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0A0812] flex items-center justify-center px-4 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(124,58,237,0.10) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-[360px] flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.4), 0 8px 32px rgba(124,58,237,0.35)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <span className="font-mono text-[13px] font-semibold tracking-[0.12em] text-white/70 uppercase">
            BizWatch
          </span>
        </div>

        <div
          className="w-full rounded-2xl p-px"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)' }}
        >
          <div className="rounded-2xl bg-[#110E1C] p-8 flex flex-col gap-6">
            {hasError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                Sign-in failed. Please try again.
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <h1 className="text-[1.35rem] font-semibold tracking-tight text-white leading-snug">
                Sign in to BizWatch
              </h1>
              <p className="text-[13px] text-white/40 leading-relaxed">
                Your AI-powered business intelligence layer
              </p>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-[13px] font-semibold text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
              >
                {loading ? <Spinner /> : <GoogleIcon />}
                {loading ? 'Signing in…' : 'Continue with Google'}
              </button>

              <p className="text-center text-[11px] text-white/25">
                New users are registered automatically
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-white/20 text-center">
          Read-only access · No raw data stored · Disconnect anytime
        </p>
      </div>
    </div>
  )
}
