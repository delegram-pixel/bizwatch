'use client'

import { Bell, Menu } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function NavBar({ onOpenSidebar }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 w-full bg-[var(--surface-strong)] border-b border-slate-200 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            onClick={onOpenSidebar}
            className="sm:hidden rounded-3xl"
          >
            <Menu size={18} />
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="icon" className="rounded-2xl">
            <Bell size={16} />
          </Button>
          <Avatar className="h-9 w-9 rounded-2xl border border-slate-200">
            <AvatarImage
              src={user?.picture || `https://i.pravatar.cc/40`}
              alt={user?.name || "User Avatar"}
            />
            <AvatarFallback className="rounded-2xl text-xs">
              {user?.name?.[0] ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
