'use client'

import { Suspense, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchUser } from '@/store/authSlice'
import { getGoogleAuthUrl } from '@/lib/api'
import { BarChart2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { AppDispatch } from '@/store'

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
      <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.25 9c0-.51.09-1 .25-1.48V5.45H1.83a8 8 0 0 0 0 7.1l2.67-2.07z" />
      <path fill="#EA4335" d="M8.98 3.72c1.22 0 2.31.42 3.17 1.25l2.37-2.38A8 8 0 0 0 1.83 5.45L4.5 7.52A4.77 4.77 0 0 1 8.98 3.72z" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="none">
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
          <BarChart2 size={20} className="text-white" />
        </div>
        <span className="text-[12px] font-semibold tracking-[0.18em] uppercase text-slate-500">
          BizWatch
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8">
        {hasError && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Sign-in failed. Please try again.
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-[1.2rem] font-semibold text-slate-900 leading-snug">
            Sign in to BizWatch
          </h1>
          <p className="mt-1 text-[13px] text-slate-500 leading-relaxed">
            Your AI-powered business intelligence layer
          </p>
        </div>

        <div className="h-px bg-slate-100 mb-6" />

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner /> : <GoogleIcon />}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>
          <p className="text-center text-[11px] text-slate-400">
            New users are registered automatically
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-[11px] text-slate-400 text-center">
        Read-only access · No raw data stored · Disconnect anytime
      </p>
    </div>
  )
}
