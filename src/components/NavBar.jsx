'use client'

import { Bell, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth.js";
import { logout } from "../lib/api.js";

const navLinks = [
  { label: "Models", to: "/model" },
  { label: "Knowledge Base", to: "/knowledgebase" },
  { label: "API", to: "/api" },
];

export default function NavBar({ onOpenSidebar }) {
  const { user } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 w-full bg-[var(--surface-strong)] border-b border-slate-200 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-6 py-4 sm:px-8">
        {/* Left: hamburger + nav tabs */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 shadow-sm shadow-slate-200/80 transition cursor-pointer hover:bg-slate-200 hover:text-slate-950 sm:hidden"
          >
            <Menu size={18} />
          </button>
          

          {/* <div className="hidden sm:flex min-w-0 flex-wrap items-center gap-1 overflow-x-auto ml-2">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `relative rounded-full px-3 py-2 text-[13px] font-medium transition cursor-pointer ${
                    isActive
                      ? 'text-white after:absolute after:left-1/2 after:bottom-0 after:-translate-x-1/2 after:h-0.5 after:w-6 after:rounded-full after:bg-white'
                      : 'text-biz-muted hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div> */}
        </div>

        {/* Right: bell + user */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 shadow-sm shadow-slate-200/80 transition cursor-pointer hover:bg-slate-200 hover:text-slate-950"
          >
            <Bell size={16} />
          </button>
          {/* {user && ( */}
          <>
            <img
              src={user?.picture ||`https://i.pravatar.cc/40`}
              alt={user?.name || "User Avatar"}
              className="h-9 w-9 rounded-2xl border border-slate-200 object-cover"
            />
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition cursor-pointer"
              title="Logout"
            >
              <LogOut size={13} />
            </button>
          </>
          {/* )} */}
        </div>
      </div>
    </header>
  );
}
