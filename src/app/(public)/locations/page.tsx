import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { PharmacyLocation, Service } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { LocationCard } from "@/components/locations/LocationCard";

export const metadata: Metadata = {
  title: "Locations | Ingata Pharmacy",
  description: "Find an Ingata Pharmacy branch near you in Kigali, with hours, contact details and directions.",
};

async function getLocations(): Promise<PharmacyLocation[]> {
  try {
    return await apiFetch<PharmacyLocation[]>("/api/locations", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

async function getServices(): Promise<Service[]> {
  try {
    return await apiFetch<Service[]>("/api/services", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

export default async function LocationsPage() {
  const [locations, services] = await Promise.all([getLocations(), getServices()]);
  const serviceNameBySlug = new Map(services.map((service) => [service.slug, service.name]));

  return (
    <>
      <PageHeader
        eyebrow="Find us"
        title="Locations"
        description={
          locations.length > 0
            ? `${locations.length} ${locations.length === 1 ? "branch" : "branches"} across Kigali, each staffed by licensed pharmacists.`
            : "Every branch is staffed by licensed pharmacists."
        }
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          {locations.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              Branch details will be listed here shortly. In the meantime, reach us through the contact page.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  serviceNames={location.availableServices
                    .map((slug) => serviceNameBySlug.get(slug))
                    .filter((name): name is string => Boolean(name))}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
