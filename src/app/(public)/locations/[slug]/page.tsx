import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, MapPin, Navigation, Phone } from "lucide-react";
import { apiFetch, resolveUploadUrl } from "@/lib/api";
import type { PharmacyLocation, Service, TeamMember } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { groupOpeningHours } from "@/lib/opening-hours";
import { initials } from "@/lib/text";
import { T } from "@/lib/language-context";

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

async function getTeam(): Promise<TeamMember[]> {
  try {
    return await apiFetch<TeamMember[]>("/api/team", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locations = await getLocations();
  const location = locations.find((l) => l.slug === slug);
  if (!location) {
    return {};
  }
  return {
    title: `${location.branchName} | Ingata Pharmacy`,
    description: location.description || `Address, opening hours and services at ${location.branchName}.`,
  };
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [locations, services, team] = await Promise.all([getLocations(), getServices(), getTeam()]);
  const location = locations.find((l) => l.slug === slug);

  if (!location) {
    notFound();
  }

  const hourLines = location.openingHours ? groupOpeningHours(location.openingHours) : [];
  const hasCoordinates = location.latitude != null && location.longitude != null;
  const branchServices = services.filter((service) => location.availableServices.includes(service.slug));
  const branchTeam = team.filter((member) => member.locationId === location.id);

  return (
    <>
      <PageHeader
        eyebrow="Find us"
        title={location.branchName}
        description={location.description || undefined}
        variant="image"
        image={location.photoUrl ? resolveUploadUrl(location.photoUrl) : undefined}
      />

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            {location.photoUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100">
                <Image src={resolveUploadUrl(location.photoUrl)} alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
              </div>
            )}

            {hasCoordinates && (
              <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${location.photoUrl ? "mt-8" : ""}`}>
                <div className="relative h-80 w-full">
                  <iframe
                    title={`Map of ${location.branchName}`}
                    src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=16&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}

            {branchServices.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-slate-900">
                  <T text="Services at this branch" />
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {branchServices.map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-teal-300 hover:text-teal-700"
                    >
                      <T text={service.name} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {branchTeam.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-slate-900">
                  <T text="Meet the team" />
                </h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  {branchTeam.map((member) => (
                    <div key={member.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                      {member.photoUrl ? (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100">
                          <Image src={resolveUploadUrl(member.photoUrl)} alt="" fill sizes="56px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-800">
                          {initials(member.fullName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-display text-base font-semibold text-slate-900">{member.fullName}</p>
                        <p className="text-sm text-teal-700">
                          <T text={member.role} />
                        </p>
                        {member.credentials && <p className="mt-0.5 text-xs text-slate-500">{member.credentials}</p>}
                        {member.bio && (
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            <T text={member.bio} />
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <div className="space-y-4 text-sm text-slate-600">
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {location.address}
                </p>
                {location.telephone && (
                  <p className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <a href={`tel:${location.telephone}`} className="hover:text-slate-900">
                      {location.telephone}
                    </a>
                  </p>
                )}
                {hourLines.length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="space-y-0.5">
                      {hourLines.map((line) => (
                        <p key={line}>
                          <T text={line} />
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
                <Link
                  href="/prescription-refill"
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
                >
                  <T text="Refill a prescription" />
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href={`/contact?branch=${encodeURIComponent(location.branchName)}`}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900"
                >
                  <T text="Contact this branch" />
                </Link>
                {hasCoordinates && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <T text="Get directions" />
                  </a>
                )}
              </div>
            </div>

            <Link
              href="/locations"
              className="inline-flex text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
            >
              ← <T text="Back to all branches" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
