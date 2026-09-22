import type { WeeklyOpeningHours } from "@/types";

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
export function groupOpeningHours(hours: WeeklyOpeningHours): string[] {
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
