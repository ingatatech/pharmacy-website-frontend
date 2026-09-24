// Dependency-free daily trend chart (plain flex columns sized by height
// percentage) — two series (refill requests / contact inquiries) as paired
// bars per day, over the trailing N days.
export function TrendChart({
  title,
  series,
}: {
  title: string;
  series: { label: string; color: string; points: { date: string; value: number }[] }[];
}) {
  const max = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.value)));
  const days = series[0]?.points.map((p) => p.date) || [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-slate-900">{title}</h3>
        <div className="flex items-center gap-3">
          {series.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex h-32 items-end gap-1.5">
        {days.map((date, dayIndex) => (
          <div key={date} className="flex flex-1 items-end justify-center gap-0.5">
            {series.map((s) => {
              const value = s.points[dayIndex]?.value ?? 0;
              return (
                <div
                  key={s.label}
                  title={`${s.label}: ${value}`}
                  className="w-full rounded-t-sm transition-[height] duration-500"
                  style={{ height: `${Math.max(2, (value / max) * 100)}%`, backgroundColor: s.color }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        <span>{days[0]}</span>
        <span>{days[days.length - 1]}</span>
      </div>
    </div>
  );
}
