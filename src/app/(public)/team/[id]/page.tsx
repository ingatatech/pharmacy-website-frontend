import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Mail, Phone } from "lucide-react";
import { apiFetch, resolveUploadUrl } from "@/lib/api";
import type { PharmacyLocation, TeamMember } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/lib/language-context";
import { initials } from "@/lib/text";
import Image from "next/image";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = await getTeam();
  const member = team.find((m) => m.id === id);
  if (!member) {
    return {};
  }
  return {
    title: `${member.fullName} | Ingata Pharmacy`,
    description: member.bio || `${member.fullName} - ${member.role}`,
  };
}

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [team, locations] = await Promise.all([getTeam(), getLocations()]);
  const member = team.find((m) => m.id === id);

  if (!member) {
    notFound();
  }

  const location = locations.find((l) => l.id === member.locationId);

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title={member.fullName}
        backHref="/team"
        backLabel="Our team"
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
          <Link
            href="/team"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <T text="Back to team" />
          </Link>

          <div className="mt-8 grid gap-8 md:grid-cols-[300px_1fr]">
            <div className="flex flex-col items-center">
              {member.photoUrl ? (
                <div className="relative h-64 w-64 overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={resolveUploadUrl(member.photoUrl)}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-teal-50 text-5xl font-semibold text-teal-800">
                  {initials(member.fullName)}
                </div>
              )}
            </div>

            <div>
              <h1 className="font-display text-3xl font-semibold text-slate-900">{member.fullName}</h1>
              <p className="mt-2 text-lg font-medium text-teal-700">
                <T text={member.role} />
              </p>
              {member.credentials && (
                <p className="mt-1 text-sm text-slate-500">{member.credentials}</p>
              )}
              {location && (
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {location.branchName}
                </p>
              )}

              {member.bio && (
                <div className="mt-6">
                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    <T text="About" />
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">
                    <T text={member.bio} />
                  </p>
                </div>
              )}

              {location && (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    <T text="Contact" />
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {location.telephone && (
                      <a
                        href={`tel:${location.telephone}`}
                        className="flex items-center gap-2 hover:text-teal-700"
                      >
                        <Phone className="h-4 w-4" />
                        {location.telephone}
                      </a>
                    )}
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      {location.address}
                    </p>
                  </div>
                  <Link
                    href={`/locations/${location.slug}`}
                    className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    <T text="View branch details" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
