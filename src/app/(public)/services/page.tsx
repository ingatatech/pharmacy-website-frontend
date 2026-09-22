import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { Service } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ClosingCta } from "@/components/home/ClosingCta";

export const metadata: Metadata = {
  title: "Services | Ingata Pharmacy",
  description: "Pharmacy services available across every Ingata Pharmacy branch in Kigali.",
};

async function getServices(): Promise<Service[]> {
  try {
    return await apiFetch<Service[]>("/api/services", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        eyebrow="What we offer"
        title="Services"
        description="Prescription refills, medication counseling, vaccinations and more — every branch is staffed by licensed pharmacists ready to help."
        variant="image"
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          {services.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              Services will be listed here shortly. In the meantime, call your nearest branch for details.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
