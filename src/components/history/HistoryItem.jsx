'use client'

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function HistoryItem({ icon, iconColor, title, subtitle, time, id }) {
  return (
    <Link href={`/chat/${id}`} className="block">
      <Card className="group border border-slate-200 ring-0 shadow-none hover:border-slate-300 transition-colors cursor-pointer">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl ${iconColor} text-white shadow-[0_16px_40px_-24px_rgba(124,58,237,0.18)]`}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-black">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
          </div>
          <time className="shrink-0 text-xs uppercase tracking-[0.24em] text-slate-500">
            {time}
          </time>
        </div>
      </Card>
    </Link>
  );
}
