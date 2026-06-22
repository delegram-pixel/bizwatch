'use client'

import { Bell, Menu, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function NavBar({ onOpenSidebar, sidebarCollapsed, onToggleSidebar }) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-20 w-full bg-white border-b border-slate-200">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Desktop: expand button (only when sidebar is collapsed) */}
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={onToggleSidebar}
              title="Expand sidebar"
              className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <Bell size={16} />
          </button>
          <Avatar className="h-8 w-8 rounded-lg border border-slate-200">
            <AvatarImage
              src={user?.picture || `https://i.pravatar.cc/40`}
              alt={user?.name || 'User Avatar'}
            />
            <AvatarFallback className="rounded-lg text-xs bg-slate-100 text-slate-700">
              {user?.name?.[0] ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
