import type { LucideIcon } from "lucide-react";

// Simple stat card used across the top of the dashboard — deliberately
// plain (no chart) since a single number reads faster than a sparkline at
// a glance.
export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-semibold text-slate-900">{value}</p>
          <p className="truncate text-xs text-slate-500">{label}</p>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
