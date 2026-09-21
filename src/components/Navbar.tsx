"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/articles", label: "Blog" },
  { href: "/locations", label: "Find a Pharmacy" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
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
  // Every other route (and the homepage once scrolled) shows a solid dark
  // bar for legibility over ordinary content.
  const isHome = pathname === "/";
  const solid = scrolled || !isHome;
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-20 backdrop-blur-md transition-[background-color,box-shadow] duration-300 supports-[backdrop-filter]:bg-teal-900/25 ${
        solid
          ? "bg-teal-900 shadow-lg shadow-teal-950/20 supports-[backdrop-filter]:bg-teal-900/75"
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

        <nav className="mt-1.5 hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-sm py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:rounded-full after:bg-emerald-400 after:transition-all after:content-[''] ${
                  active
                    ? "text-white after:w-full"
                    : "text-white/80 after:w-0 hover:text-white hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="rounded-sm text-sm font-semibold text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Log in
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 bg-teal-900 px-4 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`block border-l-2 py-3 pl-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      active
                        ? "border-emerald-400 text-white"
                        : "border-transparent text-white/80 hover:text-white"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-4">
            <Link
              href="/login"
              className="text-sm text-white/80 hover:text-white"
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
