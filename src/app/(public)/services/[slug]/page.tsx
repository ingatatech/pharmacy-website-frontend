import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { PharmacyLocation, Service, SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { serviceIcon } from "@/components/services/ServiceCard";
import { groupOpeningHours } from "@/lib/opening-hours";
import { T } from "@/lib/language-context";

async function getService(slug: string): Promise<Service | null> {
  try {
    return await apiFetch<Service>(`/api/services/${slug}`, { next: { revalidate: 120 } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}

async function getLocations(): Promise<PharmacyLocation[]> {
  try {
    return await apiFetch<PharmacyLocation[]>("/api/locations?limit=50", { next: { revalidate: 300 } });
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) {
    return {};
  }
  return {
    title: service.metaTitle || `${service.name} | Ingata Pharmacy`,
    description: service.metaDescription || service.shortDescription,
  };
}

const DETAIL_SECTIONS: { key: keyof Service; label: string }[] = [
  { key: "detailedDescription", label: "About this service" },
  { key: "intendedCustomers", label: "Who it's for" },
  { key: "requirements", label: "What you'll need" },
  { key: "process", label: "How it works" },
  { key: "limitations", label: "Good to know" },
];

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, locations, settings] = await Promise.all([
    getService(slug),
    getLocations(),
    getSiteSettings(),
  ]);

  if (!service) {
    notFound();
  }

  // Branches that actually offer this service — the location model tags each
  // branch with the slugs it carries, so this stays correct as branches are
  // added or drop a service without any hard-coded slug check here.
  const branches = locations.filter(
    (location) => location.isActive && location.availableServices.includes(service.slug)
  );
  // Narrowed rather than asserted so the render below doesn't need `!`.
  const branchesWithHours = branches.filter(
    (branch): branch is PharmacyLocation & { openingHours: NonNullable<PharmacyLocation["openingHours"]> } =>
      branch.openingHours !== null
  );
  const contact = settings?.phone || settings?.email || settings?.address;

  return (
    <>
      {/* Same hero treatment as the product detail pages: "pattern" gives the
          photo a 25-55% teal wash so it actually reads through, where the
          default "light" variant was a flat slate-50 block with no image at
          all. image is left unset to fall back to page-bg.jpg. */}
      <PageHeader
        eyebrow={service.category?.name || "Service"}
        title={service.name}
        variant="pattern"
        backHref="/services"
        backLabel="All services"
      />

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="max-w-xl text-lg leading-relaxed text-slate-700">
              <T text={service.shortDescription} />
            </p>

            <div className="mt-10 space-y-10">
              {DETAIL_SECTIONS.map(({ key, label }) => {
                const value = service[key];
                if (!value || typeof value !== "string") return null;
                return (
                  <div key={key}>
                    <h2 className="font-display text-xl font-semibold text-slate-900">
                      <T text={label} />
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                      <T text={value} />
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-ink">
                {serviceIcon(service, "h-6 w-6")}
              </div>

              {service.keyBenefit && (
                <div className="mt-5 flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                  <p className="text-sm font-medium text-slate-900">
                    <T text={service.keyBenefit} />
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/prescription-refill"
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
                >
                  <T text="Get started" />
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900"
                >
                  <T text="Talk to a pharmacist" />
                </Link>
              </div>
            </div>

            <Link
              href="/services"
              className="inline-flex text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
            >
              ← <T text="Back to all services" />
            </Link>
          </div>
        </div>
      </section>

      {/* Location / operating hours / contact for this specific service. The
          branch list is filtered by availableServices, so a service with no
          branch carrying it renders only the contact card rather than an
          empty "Location" heading. */}
      {(branches.length > 0 || contact) && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16">
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              <T text="Plan your visit" />
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {branches.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-800">
                    <MapPin className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                    <T text="Location" />
                  </h3>
                  <ul className="mt-3 space-y-4">
                    {branches.map((branch) => (
                      <li key={branch.id}>
                        <Link
                          href={`/locations/${branch.slug}`}
                          className="text-sm font-medium text-slate-900 transition-colors duration-200 hover:text-teal-700"
                        >
                          {branch.branchName}
                        </Link>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{branch.address}</p>
                        {branch.telephone && (
                          <a
                            href={`tel:${branch.telephone}`}
                            className="mt-0.5 block text-sm text-slate-600 transition-colors duration-200 hover:text-teal-700"
                          >
                            {branch.telephone}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {branchesWithHours.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-800">
                    <Clock className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                    <T text="Operating hours" />
                  </h3>
                  <div className="mt-3 space-y-4">
                    {branchesWithHours.map((branch) => (
                      <div key={branch.id}>
                        {branchesWithHours.length > 1 && (
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {branch.branchName}
                          </p>
                        )}
                        <ul className="mt-1 space-y-1">
                          {groupOpeningHours(branch.openingHours).map((line) => (
                            <li key={line} className="text-sm text-slate-600">
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {contact && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-800">
                    <Phone className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                    <T text="Contact information" />
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {settings?.phone && (
                      <li>
                        <a
                          href={`tel:${settings.phone}`}
                          className="text-sm text-slate-600 transition-colors duration-200 hover:text-teal-700"
                        >
                          {settings.phone}
                        </a>
                      </li>
                    )}
                    {settings?.email && (
                      <li>
                        <a
                          href={`mailto:${settings.email}`}
                          className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors duration-200 hover:text-teal-700"
                        >
                          <Mail className="h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.75} aria-hidden="true" />
                          {settings.email}
                        </a>
                      </li>
                    )}
                    {settings?.address && (
                      <li className="flex items-start gap-1.5 text-sm leading-relaxed text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.75} aria-hidden="true" />
                        {settings.address}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
