'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth.js'
import { Button } from '@/components/ui/button'

export default function Bottom() {
  const router = useRouter()
  const { logout } = useAuth()

  async function handleLogout() {
    await logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <div className="mt-auto pt-6 border-t border-slate-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="w-full justify-start text-xs text-slate-500 hover:text-slate-900 gap-2"
      >
        <LogOut size={14} />
        Logout
      </Button>
    </div>
  )
}
