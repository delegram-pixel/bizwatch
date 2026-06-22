'use client'

import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from '@/store/authSlice'
import Sidebar from '@/components/Sidebar/Sidebar'
import NavBar from '@/components/NavBar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchUser() as any)
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved === 'true') setSidebarCollapsed(true)
  }, [])

  function toggleCollapsed() {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar_collapsed', String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={toggleCollapsed}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <NavBar
          onOpenSidebar={() => setSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleCollapsed}
        />
        <main className="flex-1 overflow-y-auto scrollbar-none bg-[var(--surface)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
