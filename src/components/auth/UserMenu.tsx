"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/text";
import type { AuthUser } from "@/types";
import { T } from "@/lib/language-context";

// Same hover-reveals-a-white-panel mechanic as the Services/Blog nav
// dropdowns, just with an avatar trigger instead of a text link.
export function UserMenu({ user, onNavigate }: { user: AuthUser; onNavigate?: () => void }) {
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    onNavigate?.();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
          {initials(user.fullName) || <User className="h-4 w-4" strokeWidth={1.75} />}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-current transition-transform duration-200 group-hover:rotate-180" />
      </button>

      <div className="invisible absolute right-0 top-full z-50 w-64 pt-3 opacity-0 transition-[opacity,visibility] duration-200 ease-out group-hover:visible group-hover:opacity-100">
        <div className="-translate-y-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-out group-hover:translate-y-0">
          <div className="px-5 py-4">
            <p className="truncate font-display text-sm font-semibold text-slate-900">{user.fullName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            <li>
              <Link
                href="/account"
                onClick={onNavigate}
                className="flex items-center gap-2.5 px-5 py-3 text-sm text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-teal-800"
              >
                <User className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
                <T text="Profile" />
              </Link>
            </li>
            <li>
              <Link
                href="/account/settings"
                onClick={onNavigate}
                className="flex items-center gap-2.5 px-5 py-3 text-sm text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-teal-800"
              >
                <Settings className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
                <T text="Settings" />
              </Link>
            </li>
          </ul>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 border-t border-slate-100 bg-slate-50 px-5 py-3 text-left text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            <T text="Log out" />
          </button>
        </div>
      </div>
    </div>
  );
}
