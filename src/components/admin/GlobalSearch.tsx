"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FileText, Folder, ListChecks, MapPin, Package, Pill, Search, Users, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Article, Category, Faq, PharmacyLocation, Product, Service, User } from "@/types";

type SearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  group: string;
  icon: typeof Search;
};

// Fetches every searchable resource once (lazily, on first focus/keystroke)
// and caches it for the life of the admin shell — subsequent keystrokes
// just filter the cached list in memory rather than re-fetching, since the
// underlying admin/all endpoints return everything at once anyway.
export function GlobalSearch() {
  const { token, user } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function ensureLoaded() {
    if (loaded || loading || !token) return;
    setLoading(true);

    const isAdmin = user?.role === "admin";
    const empty = Promise.resolve([]);

    try {
      const [services, products, articles, locations, faqs, categories, users] = await Promise.all([
        isAdmin ? apiFetch<Service[]>("/api/services/admin/all", {}, token).catch(() => []) : empty,
        isAdmin ? apiFetch<Product[]>("/api/products/admin/all", {}, token).catch(() => []) : empty,
        apiFetch<Article[]>("/api/articles/admin/all", {}, token).catch(() => []),
        isAdmin ? apiFetch<PharmacyLocation[]>("/api/locations/admin/all", {}, token).catch(() => []) : empty,
        isAdmin ? apiFetch<Faq[]>("/api/faqs/admin/all", {}, token).catch(() => []) : empty,
        isAdmin ? apiFetch<Category[]>("/api/categories", {}, token).catch(() => []) : empty,
        isAdmin ? apiFetch<User[]>("/api/admin/users", {}, token).catch(() => []) : empty,
      ]);

      const results: SearchItem[] = [
        ...(services as Service[]).map((s) => ({
          id: s.id,
          title: s.name,
          subtitle: s.category?.name,
          href: `/admin/services/${s.id}`,
          group: "Services",
          icon: Pill,
        })),
        ...(products as Product[]).map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: p.brandName || undefined,
          href: `/admin/products/${p.id}`,
          group: "Products",
          icon: Package,
        })),
        ...(articles as Article[]).map((a) => ({
          id: a.id,
          title: a.title,
          subtitle: a.status.replace(/_/g, " "),
          href: `/admin/articles/${a.id}`,
          group: "Articles",
          icon: FileText,
        })),
        ...(locations as PharmacyLocation[]).map((l) => ({
          id: l.id,
          title: l.branchName,
          subtitle: l.address,
          href: `/admin/locations/${l.id}`,
          group: "Locations",
          icon: MapPin,
        })),
        ...(faqs as Faq[]).map((f) => ({
          id: f.id,
          title: f.question,
          href: `/admin/faqs/${f.id}`,
          group: "FAQs",
          icon: ListChecks,
        })),
        ...(categories as Category[]).map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: c.type === "service" ? "Services" : "Products",
          href: `/admin/categories/${c.id}`,
          group: "Categories",
          icon: Folder,
        })),
        ...(users as User[]).map((u) => ({
          id: u.id,
          title: u.fullName,
          subtitle: u.email,
          href: `/admin/users/${u.id}`,
          group: "Users",
          icon: Users,
        })),
      ];

      setItems(results);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  const needle = query.trim().toLowerCase();
  const filtered =
    needle.length === 0
      ? []
      : items
          .filter((item) => item.title.toLowerCase().includes(needle) || item.subtitle?.toLowerCase().includes(needle))
          .slice(0, 30);

  const grouped = new Map<string, SearchItem[]>();
  for (const item of filtered) {
    grouped.set(item.group, [...(grouped.get(item.group) || []), item]);
  }

  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            ensureLoaded();
          }}
          onFocus={() => {
            setOpen(true);
            ensureLoaded();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Search services, products, articles…"
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && needle.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
          {loading && !loaded && <p className="px-4 py-3 text-sm text-slate-400">Loading…</p>}
          {loaded && filtered.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-400">No results for &ldquo;{query}&rdquo;.</p>
          )}
          {[...grouped.entries()].map(([group, groupItems]) => (
            <div key={group}>
              <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group}</p>
              {groupItems.map((item) => (
                <Link
                  key={`${item.group}-${item.id}`}
                  href={item.href}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-100 hover:bg-slate-50"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1 truncate text-slate-800">{item.title}</span>
                  {item.subtitle && <span className="shrink-0 truncate text-xs text-slate-400">{item.subtitle}</span>}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
