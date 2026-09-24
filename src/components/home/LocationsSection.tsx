import Link from "next/link";
import type { PharmacyLocation } from "@/types";
import { LocationCard } from "@/components/locations/LocationCard";

export function LocationsSection({ locations }: { locations: PharmacyLocation[] }) {
  if (locations.length === 0) {
    return null;
  }

  return (
    <section className="bg-sage">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-teal-600">Find us</span>
            <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
              Find a branch near you
            </h2>
          </div>
          <Link
            href="/locations"
            className="rounded-sm text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            View all branches
          </Link>
        </div>

        <div className={`mt-10 grid gap-6 ${locations.length > 1 ? "sm:grid-cols-2" : "max-w-md"}`}>
          {locations.slice(0, 2).map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      </div>
    </section>
  );
}
