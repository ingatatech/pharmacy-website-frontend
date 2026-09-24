"use client";

import type { WeeklyOpeningHours } from "@/types";

const DAYS: { key: keyof WeeklyOpeningHours; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

// One free-text input per day (e.g. "8:00 AM – 8:00 PM"), matching how
// groupOpeningHours (src/lib/opening-hours.ts) already collapses these on
// the public site — blank means "not listed", not "closed".
export function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: WeeklyOpeningHours;
  onChange: (value: WeeklyOpeningHours) => void;
}) {
  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">Opening hours</span>
      <div className="mt-1.5 grid gap-2.5 sm:grid-cols-2">
        {DAYS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2.5">
            <span className="w-24 shrink-0 text-xs font-medium text-slate-500">{label}</span>
            <input
              type="text"
              value={value[key] || ""}
              onChange={(event) => onChange({ ...value, [key]: event.target.value || undefined })}
              placeholder="8:00 AM – 8:00 PM"
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
