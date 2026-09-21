import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import type { PharmacyLocation, WeeklyOpeningHours } from "@/types";

const DAY_ORDER: Array<keyof WeeklyOpeningHours> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<keyof WeeklyOpeningHours, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

/** Collapses consecutive days that share the same hours, e.g. Mon–Fri instead of 5 separate lines. */
function groupOpeningHours(hours: WeeklyOpeningHours): string[] {
  const entries = DAY_ORDER.filter((day) => hours[day]).map((day) => ({ day, value: hours[day]! }));
  const groups: { days: (typeof DAY_ORDER)[number][]; value: string }[] = [];

  for (const entry of entries) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.value === entry.value) {
      lastGroup.days.push(entry.day);
    } else {
      groups.push({ days: [entry.day], value: entry.value });
    }
  }

  return groups.map(({ days, value }) => {
    const label =
      days.length > 1 ? `${DAY_LABELS[days[0]]}–${DAY_LABELS[days[days.length - 1]]}` : DAY_LABELS[days[0]];
    return `${label}: ${value}`;
  });
}

export function LocationsSection({ locations }: { locations: PharmacyLocation[] }) {
  if (locations.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-medium text-slate-900 sm:text-4xl">
            Find a branch near you
          </h2>
          <Link
            href="/locations"
            className="rounded-sm text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            View all branches
          </Link>
        </div>

        <div className={`mt-10 grid gap-6 ${locations.length > 1 ? "sm:grid-cols-2" : "max-w-md"}`}>
          {locations.slice(0, 2).map((location) => {
            const hourLines = location.openingHours ? groupOpeningHours(location.openingHours) : [];

            return (
              <div
                key={location.id}
                className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow duration-200 hover:border-teal-200 hover:shadow-md"
              >
                <h3 className="font-display text-xl font-semibold text-slate-900">
                  {location.branchName}
                </h3>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    {location.address}
                  </p>
                  {location.telephone && (
                    <p className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 shrink-0 text-teal-600" />
                      <a href={`tel:${location.telephone}`} className="hover:text-slate-900">
                        {location.telephone}
                      </a>
                    </p>
                  )}
                  {hourLines.length > 0 && (
                    <div className="flex items-start gap-2.5">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <div className="space-y-0.5">
                        {hourLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
