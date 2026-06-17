'use client'

import React from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import Logo from './logo'
import SidebarNavlinks from './SidebarNavlinks'
import Bottom from './bottom'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile: Sheet drawer */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="left" className="w-64 px-6 py-7 flex flex-col bg-[var(--surface-strong)] border-r border-slate-200 sm:hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo />
          <div className="flex flex-col flex-1 gap-8 mt-8">
            <SidebarNavlinks />
          </div>
          <Bottom />
        </SheetContent>
      </Sheet>

      {/* Desktop: static sidebar */}
      <aside className="hidden sm:flex sm:flex-col sm:h-full sm:overflow-y-auto w-57.5 border-r border-slate-200 bg-[var(--surface-strong)] px-6 py-7">
        <div className="flex flex-col flex-1 gap-8">
          <Logo />
          <SidebarNavlinks />
        </div>
        <Bottom />
      </aside>
    </>
  )
}
