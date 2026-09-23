"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, Settings, User, X } from "lucide-react";
import type { Article, Service } from "@/types";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/text";

type DropdownItem = { href: string; label: string };
type NavLink = { href: string; label: string; dropdown?: DropdownItem[] };

export function Navbar({
  services = [],
  articles = [],
}: {
  services?: Service[];
  articles?: Article[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, ready } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only the homepage has a dark hero directly behind the header, so only
  // there does the header start fully transparent over it — matching
  // qtglobal.rw, where the nav floats over the hero with no visible seam.
  // Every other route (and the homepage once scrolled) shows a light bar
  // for legibility over ordinary content, kept airy rather than a heavy
  // dark band now that most page content sits on white/slate-50.
  const isHome = pathname === "/";
  const solid = scrolled || !isHome;
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  // Real sub-items (not placeholder links) — same "hover reveals a white
  // dropdown panel" pattern as qtglobal.rw's nav, e.g. its Blog menu.
  const navLinks: NavLink[] = [
    {
      href: "/services",
      label: "Services",
      dropdown: services.slice(0, 6).map((s) => ({ href: `/services/${s.slug}`, label: s.name })),
    },
    { href: "/products", label: "Products" },
    {
      href: "/articles",
      label: "Blog",
      dropdown: [...articles]
        .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
        .slice(0, 5)
        .map((a) => ({ href: `/articles/${a.slug}`, label: a.title })),
    },
    { href: "/locations", label: "Find a Pharmacy" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-20 backdrop-blur-md transition-[background-color,box-shadow] duration-300 supports-[backdrop-filter]:bg-teal-900/25 ${
          solid
            ? "bg-white/90 shadow-sm shadow-slate-900/5 supports-[backdrop-filter]:bg-white/80"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
            <span className="flex items-center rounded-md bg-white px-2.5 py-1.5">
              <Image
                src="/images/ingatalogo.png"
                alt="Ingata Pharmacies Ltd"
                width={2170}
                height={725}
                priority
                className="h-9 w-auto sm:h-10"
              />
            </span>
          </Link>

          <nav className="mt-1.5 hidden items-center gap-6 lg:flex xl:gap-9">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const hasDropdown = (link.dropdown?.length ?? 0) > 0;
              return (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex items-center gap-1 rounded-sm py-2 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:rounded-full after:bg-gold after:transition-all after:content-[''] ${
                      solid
                        ? active
                          ? "text-slate-900 after:w-full"
                          : "text-slate-600 after:w-0 hover:text-slate-900 hover:after:w-full"
                        : active
                          ? "text-white text-shadow-nav after:w-full"
                          : "text-white text-shadow-nav after:w-0 hover:after:w-full"
                    }`}
                  >
                    {link.label}
                    {hasDropdown && (
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>

                  {hasDropdown && (
                    <div className="invisible absolute left-0 top-full z-50 w-64 pt-3 opacity-0 transition-[opacity,visibility] duration-200 ease-out group-hover:visible group-hover:opacity-100">
                      <div className="-translate-y-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-out group-hover:translate-y-0">
                        <ul className="divide-y divide-slate-100">
                          {link.dropdown!.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="block px-5 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-teal-800"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={link.href}
                          className="block border-t border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold text-teal-700 transition-colors duration-200 hover:bg-slate-100"
                        >
                          View all {link.label.toLowerCase()}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* A third flex child, separate from the link list above, so the
              outer justify-between spreads Logo / Links / Login as three
              distinct groups (links landing near the middle) instead of
              bunching links and Login together at the right edge. */}
          <div className="hidden items-center lg:flex">
            {ready && user ? (
              <span className={solid ? "text-slate-700" : "text-white text-shadow-nav"}>
                <UserMenu user={user} />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className={`rounded-sm text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  solid ? "text-slate-600 hover:text-slate-900" : "text-white text-shadow-nav"
                }`}
              >
                Log in
              </button>
            )}
          </div>

          <button
            type="button"
            className={`rounded-md p-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 lg:hidden ${
              solid ? "text-slate-700" : "text-white"
            }`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`overflow-hidden border-t lg:hidden ${
                solid ? "border-slate-200 bg-white" : "border-white/10 bg-teal-900"
              }`}
            >
              <div className="px-4 pb-6 pt-2">
                <ul className="flex flex-col">
                  {navLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={`block border-l-2 py-3 pl-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                            solid
                              ? active
                                ? "border-gold text-slate-900"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                              : active
                                ? "border-gold text-white"
                                : "border-transparent text-white"
                          }`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div
                  className={`mt-3 flex flex-col gap-3 border-t pt-4 ${
                    solid ? "border-slate-200" : "border-white/10"
                  }`}
                >
                  {ready && user ? (
                    <>
                      <div className="flex items-center gap-3 pb-1">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
                          {initials(user.fullName)}
                        </span>
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${solid ? "text-slate-900" : "text-white"}`}>
                            {user.fullName}
                          </p>
                          <p className={`truncate text-xs ${solid ? "text-slate-500" : "text-white/60"}`}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/account"
                        className={`flex items-center gap-2.5 text-sm ${solid ? "text-slate-600 hover:text-slate-900" : "text-white"}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <User className="h-4 w-4" strokeWidth={1.75} />
                        Profile
                      </Link>
                      <Link
                        href="/account/settings"
                        className={`flex items-center gap-2.5 text-sm ${solid ? "text-slate-600 hover:text-slate-900" : "text-white"}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" strokeWidth={1.75} />
                        Settings
                      </Link>
                      <button
                        type="button"
                        className="flex items-center gap-2.5 text-left text-sm font-medium text-red-500"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                          router.push("/");
                          router.refresh();
                        }}
                      >
                        <LogOut className="h-4 w-4" strokeWidth={1.75} />
                        Log out
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={`text-left text-sm ${solid ? "text-slate-600 hover:text-slate-900" : "text-white"}`}
                      onClick={() => {
                        setMenuOpen(false);
                        setAuthOpen(true);
                      }}
                    >
                      Log in
                    </button>
                  )}
                  <Link
                    href="/prescription-refill"
                    className="rounded-md bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    onClick={() => setMenuOpen(false)}
                  >
                    Refill a prescription
                  </Link>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
