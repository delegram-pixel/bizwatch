'use client'

import React from 'react'
import { X } from 'lucide-react'
import Logo from './logo'
import SidebarNavlinks from './SidebarNavlinks'
import Bottom from './bottom'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-57.5 transform border-r border-slate-200 bg-[var(--surface-strong)] px-6 py-7 transition duration-300 ease-in-out sm:relative sm:translate-x-0 sm:h-full sm:flex sm:flex-col sm:overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-4 sm:hidden">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-slate-100 text-slate-600 transition cursor-pointer hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col flex-1 gap-8">
          <div className="hidden sm:block">
            <Logo />
          </div>
          <SidebarNavlinks />
        </div>
        <Bottom />
      </aside>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity sm:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      />
    </>
  )
}
