'use client'

import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from '@/store/authSlice'
import Sidebar from '@/components/Sidebar/Sidebar'
import NavBar from '@/components/NavBar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchUser() as any)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <NavBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[var(--surface)] px-6 py-6 sm:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
