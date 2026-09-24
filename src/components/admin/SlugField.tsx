"use client";

import { useEffect, useRef } from "react";
import { slugify } from "@/lib/text";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

// A slug input that auto-derives its value from `sourceValue` (the name/
// title field) via slugify() — but only until the admin edits the slug
// directly, at which point it stops following the source.
export function SlugField({
  value,
  onChange,
  sourceValue,
}: {
  value: string;
  onChange: (value: string) => void;
  sourceValue: string;
}) {
  const touchedRef = useRef(false);

  useEffect(() => {
    if (touchedRef.current) return;
    onChange(slugify(sourceValue));
    // Deliberately excludes `onChange`/`value` — this only reacts to the
    // source text changing, not to its own writes back into the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceValue]);

  return (
    <div>
      <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
        Slug
      </label>
      <input
        id="slug"
        type="text"
        value={value}
        onChange={(event) => {
          touchedRef.current = true;
          onChange(slugify(event.target.value));
        }}
        required
        className={`mt-1.5 ${inputClass} font-mono`}
      />
      <p className="mt-1 text-xs text-slate-400">Used in the page URL. Auto-filled from the name until you edit it.</p>
    </div>
  );
}
