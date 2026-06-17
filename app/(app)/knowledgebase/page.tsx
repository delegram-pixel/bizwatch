'use client'

import SectionHeader from '@/components/SectionHeader'
import SourceCard from '@/components/Knowledgebase/SourceCard'
import CustomKnowledgeCard from '@/components/Knowledgebase/CustomKnowledgeCard'
import { sources, customSources } from '@/data/data'
import { Workflow } from 'lucide-react'

export default function Knowledgebase() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8 xl:px-10">
      <SectionHeader
        title="Knowledgebase"
        description="Build a central source of truth for your team by syncing knowledge from every system and document library."
      />

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-violet-600">
            <Workflow size={20} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Connected Sources</h2>
            <p className="text-sm text-slate-600">These are the systems currently linked to your knowledgebase.</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <SourceCard key={source.title} {...source} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Custom Knowledge</h2>
          <p className="text-sm text-slate-600">Manual docs and indexed files you can search across in BizWatch.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {customSources.map((source) => (
            <CustomKnowledgeCard key={source.title} {...source} />
          ))}
        </div>
      </section>
    </div>
  )
}
