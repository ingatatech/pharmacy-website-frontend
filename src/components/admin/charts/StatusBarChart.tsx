// Dependency-free horizontal bar chart (plain divs sized by percentage) —
// used for "count by status" breakdowns on the dashboard. Kept intentionally
// simple rather than pulling in a charting library for a handful of bars.
export function StatusBarChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-display text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 space-y-3">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{d.label}</span>
              <span className="font-medium text-slate-700">{d.value}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
      </div>
    </div>
  );
}
