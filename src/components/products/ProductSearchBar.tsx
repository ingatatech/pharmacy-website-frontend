"use client";

import { Search } from "lucide-react";
import { useTranslated } from "@/lib/language-context";

export function ProductSearchBar({ defaultValue }: { defaultValue?: string }) {
  const placeholder = useTranslated("Search products or medicines by name, brand or ingredient");
  const searchLabel = useTranslated("Search");

  return (
    <form action="/products" method="GET" className="mx-auto flex max-w-xl overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />
      <button
        type="submit"
        aria-label={searchLabel}
        className="flex shrink-0 items-center justify-center gap-2 bg-teal-800 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">{searchLabel}</span>
      </button>
    </form>
  );
}
