import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { PharmacyLocation } from "@/types";
import { RefillForm } from "@/components/refill/RefillForm";
import { RefillOverlay } from "@/components/refill/RefillOverlay";
import { T } from "@/lib/language-context";

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
    <RefillOverlay>
      <div className="p-6 sm:p-10">
        <div className="text-center">
          <span className="text-sm font-medium text-teal-600">
            <T text="Refill a prescription" />
          </span>
          <h1 className="mt-2 font-display text-2xl font-medium text-slate-900 sm:text-3xl">
            <T text="Prescription refill" />
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-slate-600">
            <T text="Share your prescription details and a licensed pharmacist will review your request — no account needed." />
          </p>
        </div>

        <div className="mt-8">
          <RefillForm locations={locations} />
        </div>
      </div>
    </RefillOverlay>
  );
}
