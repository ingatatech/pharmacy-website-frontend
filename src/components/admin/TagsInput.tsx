"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

// Chip editor for string[] fields (article tags, site-setting core values,
// location available-services). Enter or comma commits the current input
// as a new chip; backspace on an empty input removes the last one.
export function TagsInput({
  label,
  values,
  onChange,
  placeholder = "Type and press Enter",
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    if (value && !values.includes(value)) {
      onChange([...values, value]);
    }
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== value))}
              className="text-slate-400 hover:text-slate-700"
              aria-label={`Remove ${value}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-[8rem] flex-1 border-none p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
}
