"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import type { Article, Service } from "@/types";

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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
              src="/images/logo.jpeg"
              alt="Ingata Technologies"
              width={1600}
              height={389}
              priority
              className="h-7 w-auto sm:h-8"
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
                        ? "text-white drop-shadow-sm after:w-full"
                        : "text-white drop-shadow-sm after:w-0 hover:after:w-full"
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
          <Link
            href="/login"
            className={`rounded-sm text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              solid ? "text-slate-600 hover:text-slate-900" : "text-white drop-shadow-sm"
            }`}
          >
            Log in
          </Link>
        </nav>

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

      {menuOpen && (
        <nav
          className={`border-t px-4 pb-6 pt-2 lg:hidden ${
            solid ? "border-slate-200 bg-white" : "border-white/10 bg-teal-900"
          }`}
        >
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
            <Link
              href="/login"
              className={`text-sm ${solid ? "text-slate-600 hover:text-slate-900" : "text-white"}`}
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/prescription-refill"
              className="rounded-md bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              onClick={() => setMenuOpen(false)}
            >
              Refill a prescription
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
