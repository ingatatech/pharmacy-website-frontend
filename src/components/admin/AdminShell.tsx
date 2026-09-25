"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  ClipboardList,
  FileText,
  Folder,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Pill,
  Quote,
  Settings,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/text";
import { GlobalSearch } from "@/components/admin/GlobalSearch";

type NavItem = { href: string; label: string; icon: typeof Home; roles: Array<"admin" | "pharmacist_reviewer"> };

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { href: "/admin/services", label: "Services", icon: Pill, roles: ["admin"] },
  { href: "/admin/products", label: "Products", icon: Package, roles: ["admin"] },
  { href: "/admin/categories", label: "Categories", icon: Folder, roles: ["admin"] },
  { href: "/admin/articles", label: "Articles", icon: FileText, roles: ["admin", "pharmacist_reviewer"] },
  { href: "/admin/locations", label: "Locations", icon: MapPin, roles: ["admin"] },
  { href: "/admin/team", label: "Team", icon: UserCircle, roles: ["admin"] },
  { href: "/admin/faqs", label: "FAQs", icon: ListChecks, roles: ["admin"] },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote, roles: ["admin"] },
  { href: "/admin/refill-requests", label: "Refill Requests", icon: ClipboardList, roles: ["admin"] },
  { href: "/admin/contact-inquiries", label: "Contact Inquiries", icon: MessageSquare, roles: ["admin"] },
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings, roles: ["admin"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["admin"] },
  { href: "/admin/audit-log", label: "Audit Log", icon: Archive, roles: ["admin"] },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role as "admin" | "pharmacist_reviewer" | undefined;
  const items = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`));

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {items.map((item) => {
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ink lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5">
          <Image src="/images/ingatalogo.png" alt="Ingata Pharmacies Ltd" width={2170} height={725} className="h-8 w-auto rounded bg-white p-1" />
          <span className="font-display text-sm font-semibold text-white">Admin</span>
        </Link>
        {nav}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-semibold text-white">
              {user ? initials(user.fullName) : ""}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
              <p className="truncate text-xs text-white/50">{user?.role}</p>
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
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="relative flex w-64 flex-col bg-ink">
            <div className="flex items-center justify-between px-5 py-5">
              <span className="font-display text-sm font-semibold text-white">Admin</span>
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
          <GlobalSearch />
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
