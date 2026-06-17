'use client'

import { HelpCircle, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth.js'

export default function Bottom() {
  const router = useRouter()
  const { logout } = useAuth()

  async function handleLogout() {
    await logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <div className="mt-auto pt-6 space-y-3 border-t border-slate-200">
      <button
        type="button"
        className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition cursor-pointer hover:bg-violet-500"
      >
        Upgrade Plan
      </button>
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <HelpCircle size={14} />
          Help
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  )
}
