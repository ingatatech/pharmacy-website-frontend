import Link from "next/link";
import type { PharmacyLocation, Service } from "@/types";
import { LocationCard } from "@/components/locations/LocationCard";
import { T } from "@/lib/language-context";

export function LocationsSection({
  locations,
  services = [],
}: {
  locations: PharmacyLocation[];
  services?: Service[];
}) {
  if (locations.length === 0) {
    return null;
  }

  // Branches store services as slugs; the cards show the human-readable names,
  // so resolve them here rather than rendering raw slugs like
  // "prescription-refills" on the card.
  const serviceNameBySlug = new Map(services.map((service) => [service.slug, service.name]));

  return (
    <section className="bg-sage">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-teal-600">
              <T text="Find us" />
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
              <T text="Find a branch near you" />
            </h2>
          </div>
          <Link
            href="/locations"
            className="rounded-sm text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <T text="View all branches" />
          </Link>
        </div>

        <div className={`mt-10 grid gap-6 ${locations.length > 1 ? "sm:grid-cols-2" : "max-w-md"}`}>
          {locations.slice(0, 2).map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              serviceNames={location.availableServices
                .map((slug) => serviceNameBySlug.get(slug))
                .filter((name): name is string => Boolean(name))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}