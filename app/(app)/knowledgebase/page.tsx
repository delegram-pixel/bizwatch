'use client'

import SourceCard from '@/components/Knowledgebase/SourceCard'
import CustomKnowledgeCard from '@/components/Knowledgebase/CustomKnowledgeCard'
import { sources, customSources } from '@/data/data'
import { Upload, Plus } from 'lucide-react'

export default function Knowledgebase() {
  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8 py-2">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Knowledgebase</h1>
        <p className="text-[13px] text-slate-500 mt-1 leading-relaxed max-w-xl">
          Build a central source of truth by syncing knowledge from every connected system and document library.
        </p>
      </div>

      {/* Connected Sources */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">Connected Sources</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Systems currently linked to your knowledgebase.</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors shrink-0">
            <Plus size={13} />
            <span className="hidden sm:inline">Add source</span>
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <SourceCard key={source.title} {...source} />
          ))}
        </div>
      </section>

      {/* Custom Knowledge */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">Custom Knowledge</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Manual docs and indexed files searchable across BizWatch.</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors shrink-0">
            <Upload size={13} />
            <span className="hidden sm:inline">Upload file</span>
          </button>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {customSources.map((source) => (
            <CustomKnowledgeCard key={source.title} {...source} />
          ))}
        </div>
      </section>

    </div>
  )
}
