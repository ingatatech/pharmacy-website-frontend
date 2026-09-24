// Dependency-free donut chart built from a CSS conic-gradient — no SVG
// trigonometry needed, and no charting library dependency. Each segment's
// share of the circle is its value / total.
export function StatusDonutChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  let cursor = 0;
  const stops = data.map((d) => {
    const start = (cursor / (total || 1)) * 360;
    cursor += d.value;
    const end = (cursor / (total || 1)) * 360;
    return `${d.color} ${start}deg ${end}deg`;
  });

  const gradient = total > 0 ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#e2e8f0 0deg 360deg)";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-display text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-2.5 flex items-center justify-center rounded-full bg-white">
            <span className="font-display text-lg font-semibold text-slate-900">{total}</span>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-1.5">
          {data.map((d) => (
            <li key={d.label} className="flex items-center justify-between gap-2 text-xs text-slate-600">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.label}</span>
              </span>
              <span className="shrink-0 font-medium text-slate-800">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
