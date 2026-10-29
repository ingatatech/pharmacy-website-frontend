import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { PharmacistShift, PharmacyLocation } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard";

export const metadata: Metadata = {
  title: "Pharmacist Schedule | Ingata Pharmacy",
  description:
    "See which licensed pharmacists are on duty at each Ingata Pharmacy branch this week.",
};

async function getShifts(): Promise<PharmacistShift[]> {
  try {
    return await apiFetch<PharmacistShift[]>("/api/schedule", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

async function getLocations(): Promise<PharmacyLocation[]> {
  try {
    return await apiFetch<PharmacyLocation[]>("/api/locations", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

export default async function SchedulePage() {
  const [shifts, locations] = await Promise.all([getShifts(), getLocations()]);

  return (
    <>
      <PageHeader
        eyebrow="Pharmacist schedule"
        title="Know who's on duty"
        description="Our weekly roster across every branch — find the pharmacist best placed to help you, then visit or call ahead."
      />

      <section className="bg-sage">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <ScheduleBoard shifts={shifts} locations={locations} />
        </div>
      </section>
    </>
  );
}
