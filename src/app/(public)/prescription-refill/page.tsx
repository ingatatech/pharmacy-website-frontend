import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { PharmacyLocation } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { RefillForm } from "@/components/refill/RefillForm";

export const metadata: Metadata = {
  title: "Refill a Prescription | Ingata Pharmacy",
  description: "Request a prescription refill online and pick it up or have it delivered.",
};

async function getLocations(): Promise<PharmacyLocation[]> {
  try {
    return await apiFetch<PharmacyLocation[]>("/api/locations", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

export default async function PrescriptionRefillPage() {
  const locations = await getLocations();

  return (
    <>
      <PageHeader
        eyebrow="Refill a prescription"
        title="Prescription refill"
        description="Share your prescription details and a licensed pharmacist will review your request — no account needed."
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 md:py-24">
          <RefillForm locations={locations} />
        </div>
      </section>
    </>
  );
}
