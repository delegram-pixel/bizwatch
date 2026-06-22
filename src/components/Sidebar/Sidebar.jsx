'use client'

import React from 'react'
import { PanelLeftClose } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import Logo from './logo'
import SidebarNavlinks from './SidebarNavlinks'
import Bottom from './bottom'

export default function Sidebar({ isOpen, onClose, collapsed, onToggle }) {
  return (
    <>
      {/* Mobile: Sheet drawer */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="left" className="w-64 px-6 py-7 flex flex-col bg-white border-r border-slate-200 sm:hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo />
          <div className="flex flex-col flex-1 gap-8 mt-8">
            <SidebarNavlinks />
          </div>
          <Bottom />
        </SheetContent>
      </Sheet>

      {/* Desktop: collapsible sidebar */}
      {!collapsed && (
        <aside className="hidden sm:flex sm:flex-col sm:h-full sm:overflow-y-auto w-[14.5rem] shrink-0 border-r border-slate-200 bg-white px-5 py-7">
          <div className="flex flex-col flex-1 gap-8">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={onToggle}
                title="Collapse sidebar"
                className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
            <SidebarNavlinks />
          </div>
          <Bottom />
        </aside>
      )}
    </>
  )
}
