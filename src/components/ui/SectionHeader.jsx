'use client'


/** @param {{ title: any, description: any, action?: any }} props */
export default function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-black sm:text-3xl">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}