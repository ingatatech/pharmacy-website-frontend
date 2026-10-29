"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CalendarDays } from "lucide-react";
import { T } from "@/lib/language-context";
import type { PharmacistShift, ScheduleBranchRef } from "@/types";

// Monday-first display. `index` matches Date#getDay() (0 = Sunday), so today's
// highlight works without a second lookup table.
const DAYS = [
  { index: 1, label: "Monday", short: "Mon" },
  { index: 2, label: "Tuesday", short: "Tue" },
  { index: 3, label: "Wednesday", short: "Wed" },
  { index: 4, label: "Thursday", short: "Thu" },
  { index: 5, label: "Friday", short: "Fri" },
  { index: 6, label: "Saturday", short: "Sat" },
  { index: 0, label: "Sunday", short: "Sun" },
] as const;

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

// The public DTO trims `locationId`, so fall back to the nested branch.
const branchIdOf = (shift: PharmacistShift) => shift.locationId ?? shift.location?.id ?? "";

export function ScheduleBoard({
  shifts,
  locations,
  showFilter = true,
  showBranchHeading = true,
}: {
  shifts: PharmacistShift[];
  locations: ScheduleBranchRef[];
  showFilter?: boolean;
  showBranchHeading?: boolean;
}) {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  // Client-only: the server snapshot is null so SSR markup never claims a day
  // based on the build machine's timezone, and the real day is filled in after
  // hydration without a setState-in-effect cascade.
  const today = useSyncExternalStore(
    () => () => {},
    () => new Date().getDay(),
    () => null,
  );

  const branches = useMemo(() => {
    const seen = new Map<string, ScheduleBranchRef>();
    for (const location of locations) seen.set(location.id, location);
    for (const shift of shifts) {
      if (shift.location && !seen.has(shift.location.id)) {
        seen.set(shift.location.id, {
          id: shift.location.id,
          branchName: shift.location.branchName,
          slug: shift.location.slug,
        });
      }
    }
    return [...seen.values()];
  }, [locations, shifts]);

  const visibleShifts = useMemo(
    () =>
      shifts.filter(
        (shift) => selectedBranch === "all" || branchIdOf(shift) === selectedBranch,
      ),
    [shifts, selectedBranch],
  );

  const visibleBranchIds = useMemo(() => {
    const ids = new Set(visibleShifts.map(branchIdOf));
    return branches.filter((branch) => ids.has(branch.id));
  }, [branches, visibleShifts]);

  if (shifts.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white/70 px-6 py-14 text-center">
        <CalendarDays className="mx-auto h-10 w-10 text-brand/40" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">
          <T text="Schedule being updated" />
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          <T text="Our weekly pharmacist schedule is being finalised. Please call your branch and we will be glad to help." />
        </p>
      </div>
    );
  }

  return (
    <div>
      {showFilter && branches.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedBranch("all")}
            aria-pressed={selectedBranch === "all"}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              selectedBranch === "all"
                ? "bg-brand text-white"
                : "bg-white/70 text-slate-600 ring-1 ring-line hover:text-ink"
            }`}
          >
            <T text="All branches" />
          </button>
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => setSelectedBranch(branch.id)}
              aria-pressed={selectedBranch === branch.id}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                selectedBranch === branch.id
                  ? "bg-brand text-white"
                  : "bg-white/70 text-slate-600 ring-1 ring-line hover:text-ink"
              }`}
            >
              {branch.branchName}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-10">
        {visibleBranchIds.map((branch) => {
          const branchShifts = visibleShifts.filter((shift) => branchIdOf(shift) === branch.id);

          return (
            <section key={branch.id}>
              {showBranchHeading && (
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-2xl font-semibold text-ink">{branch.branchName}</h2>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand/70">
                    <T text="Weekly roster" />
                  </p>
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {DAYS.map((day) => {
                  const dayShifts = branchShifts
                    .filter((shift) => shift.dayOfWeek === day.index)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));
                  const isToday = today === day.index;

                  return (
                    <div
                      key={day.index}
                      className={`rounded-xl border p-3.5 transition-colors ${
                        isToday
                          ? "border-brand/40 bg-white shadow-md"
                          : "border-line bg-white/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                          <T text={day.short} />
                        </p>
                        {isToday && (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                            <T text="Today" />
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 space-y-2">
                        {dayShifts.length === 0 ? (
                          <p className="text-xs text-slate-400">—</p>
                        ) : (
                          dayShifts.map((shift) => (
                            <div key={shift.id} className="rounded-lg bg-sage/80 p-2.5">
                              <p className="text-sm font-semibold leading-snug text-ink">
                                {shift.teamMember?.fullName ?? "Pharmacist"}
                              </p>
                              {shift.teamMember?.role && (
                                <p className="text-[11px] text-slate-500">{shift.teamMember.role}</p>
                              )}
                              <p className="mt-1 text-[11px] font-semibold text-brand">
                                {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                              </p>
                              {shift.note && (
                                <p className="mt-1 text-[11px] leading-snug text-slate-500">{shift.note}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
