"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/text";
import { PHARMACIST_HOME } from "@/lib/admin-access";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

// A pharmacist's own area, separate from /admin on purpose. Deliberately not
// AdminShell with filtered items: this is a different job (one branch) and
// reads as a different tool, so it has its own nav and its own visual weight.
const NAV_ITEMS: NavItem[] = [
  { href: PHARMACIST_HOME, label: "Dashboard", icon: LayoutDashboard },
  { href: `${PHARMACIST_HOME}/articles`, label: "Review Queue", icon: ListChecks },
  { href: `${PHARMACIST_HOME}/refills`, label: "Refill Requests", icon: ClipboardList },
  { href: `${PHARMACIST_HOME}/inquiries`, label: "Inquiries", icon: MessageSquare },
  { href: `${PHARMACIST_HOME}/branch`, label: "My Branch", icon: MapPin },
];

export function PharmacistShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === PHARMACIST_HOME ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  // Shown in the header so the pharmacist always knows which branch they're
  // looking at — every list in this area is filtered by it.
  const branch = user?.location?.branchName;

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
              active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const identity = (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-semibold text-white">
        {user ? initials(user.fullName) : ""}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
        <p className="truncate text-xs text-white/50">{branch ?? "Pharmacist"}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors duration-150 hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col bg-teal-900 lg:flex">
        <Link href={PHARMACIST_HOME} className="flex items-center gap-2.5 px-5 py-5">
          <Image
            src="/images/ingatalogo.png"
            alt="Ingata Pharmacies Ltd"
            width={2170}
            height={725}
            className="h-8 w-auto rounded bg-white p-1"
          />
          <span className="font-display text-sm font-semibold text-white">Pharmacist</span>
        </Link>
        {nav}
        <div className="border-t border-white/10 p-4">{identity}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="relative flex w-64 flex-col bg-teal-900">
            <div className="flex items-center justify-between px-5 py-5">
              <span className="font-display text-sm font-semibold text-white">Pharmacist</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-white/70">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            <div className="border-t border-white/10 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 text-sm font-medium text-white/70 hover:text-white"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex shrink-0 items-center justify-center rounded-md p-2 text-slate-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-slate-900">Pharmacist Portal</p>
            {branch && <p className="truncate text-xs text-slate-500">{branch}</p>}
          </div>
          <Link
            href="/"
            className="ml-auto shrink-0 text-sm font-medium text-slate-500 transition-colors duration-150 hover:text-slate-900"
          >
            View public site →
          </Link>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
