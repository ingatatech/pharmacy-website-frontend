import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { PharmacyLocation, Service, SiteSetting, TeamMember } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/lib/language-context";
import { initials } from "@/lib/text";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Team | Ingata Pharmacy",
  description: "Meet the pharmacists and staff at Ingata Pharmacy branches across Kigali.",
};

async function getTeam(): Promise<TeamMember[]> {
  try {
    return await apiFetch<TeamMember[]>("/api/team", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

async function getLocations(): Promise<PharmacyLocation[]> {
  try {
    return await apiFetch<PharmacyLocation[]>("/api/locations", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const settings = await apiFetch<SiteSetting>("/api/site-settings", { next: { revalidate: 300 } });
    return settings?.id ? settings : null;
  } catch {
    return null;
  }
}

export default async function TeamPage() {
  const [team, locations, settings] = await Promise.all([getTeam(), getLocations(), getSiteSettings()]);

  return (
    <>
      <PageHeader
        eyebrow="Our team"
        title="Meet the people behind your care"
        description="Licensed pharmacists and experienced staff dedicated to your health and wellness."
        variant="image"
      />

      <section className="bg-sage">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          {team.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => {
                const location = locations.find((l) => l.id === member.locationId);
                return (
                  <div key={member.id} className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center">
                    {member.photoUrl ? (
                      <div className="relative h-32 w-32 overflow-hidden rounded-full bg-slate-100">
                        <Image
                          src={member.photoUrl}
                          alt=""
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-teal-50 text-3xl font-semibold text-teal-800">
                        {initials(member.fullName)}
                      </div>
                    )}
                    <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">{member.fullName}</h3>
                    <p className="mt-1 text-sm font-medium text-teal-700">
                      <T text={member.role} />
                    </p>
                    {member.credentials && (
                      <p className="mt-0.5 text-xs text-slate-500">{member.credentials}</p>
                    )}
                    {location && (
                      <p className="mt-2 text-sm text-slate-600">{location.branchName}</p>
                    )}
                    {member.bio && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        <T text={member.bio} />
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-2xl font-medium text-slate-900">
                <T text="Team profiles coming soon" />
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                <T text="Our team information is being updated. Please check back shortly." />
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
