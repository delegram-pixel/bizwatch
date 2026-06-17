'use client'

import React from "react";
import Link from "next/link";

export default function HistoryItem({
  icon,
  iconColor,
  title,
  subtitle,
  time,
  id,
}) {
  return (
    <Link to={`/chat/${id}`} className="block">
      <article className="group flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-[var(--surface-strong)] p-4 transition hover:border-slate-300 hover:bg-[var(--surface)] sm:p-5">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-3xl ${iconColor} text-white shadow-[0_16px_40px_-24px_rgba(124,58,237,0.18)]`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-black">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
        </div>
        <time className="shrink-0 text-xs uppercase tracking-[0.24em] text-slate-500">
          {time}
        </time>
      </article>
    </Link>
  );
}