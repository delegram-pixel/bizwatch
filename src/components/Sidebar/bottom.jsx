'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth.js'

export default function Bottom() {
  const router = useRouter()
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <div className="pt-4 border-t border-slate-100">
      {user && (
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="h-6 w-6 rounded-md bg-slate-200 flex items-center justify-center text-slate-600 text-[11px] font-semibold shrink-0">
            {user.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-slate-700 truncate leading-tight">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate leading-tight">{user.email}</p>
          </div>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
      >
        <LogOut size={14} />
        Sign out
      </button>
    </div>
  )
}
