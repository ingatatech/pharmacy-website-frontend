import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { PharmacyLocation, Service, SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { TrustBand } from "@/components/home/TrustBand";
import { ClosingCta } from "@/components/home/ClosingCta";
import { coreValueIcon } from "@/lib/core-value-icon";
import { T } from "@/lib/language-context";

const DEFAULT_ABOUT =
  "We're a customer-focused pharmacy committed to trusted pharmaceutical products, professional service and reliable health information for the communities we serve.";
const DEFAULT_WHY_CHOOSE_US =
  "Every prescription is checked by a licensed pharmacist, and every branch keeps real stock on the shelf.";

export const metadata: Metadata = {
  title: "About Us | Ingata Pharmacy",
  description: "The mission, vision and values behind Ingata Pharmacy's branches across Kigali.",
};

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const settings = await apiFetch<SiteSetting>("/api/site-settings", { next: { revalidate: 300 } });
    return settings?.id ? settings : null;
  } catch {
    return null;
  }
}

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

export default async function AboutPage() {
  const [settings, locations, services] = await Promise.all([getSiteSettings(), getLocations(), getServices()]);

  const aboutUs = settings?.aboutUs || DEFAULT_ABOUT;
  const whyChooseUs = settings?.whyChooseUs || DEFAULT_WHY_CHOOSE_US;
  const coreValues = settings?.coreValues ?? [];
  const mission = settings?.mission;
  const vision = settings?.vision;

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="About Ingata Pharmacy"
        description="The story, mission and values behind every branch."
        variant="image"
      />

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="text-sm font-medium text-teal-600">
            <T text="Who we are" />
          </span>
          <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
            <T text="Pharmacy care you can rely on" />
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            <T text={aboutUs} />
          </p>
        </div>
      </section>

      {(mission || vision) && (
        <section className="bg-teal-50 py-16 sm:py-24">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-2 sm:px-6">
            {mission && (
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h2 className="font-display text-xl font-semibold text-slate-900">
                  <T text="Our mission" />
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  <T text={mission} />
                </p>
              </div>
            )}
            {vision && (
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h2 className="font-display text-xl font-semibold text-slate-900">
                  <T text="Our vision" />
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  <T text={vision} />
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {coreValues.length > 0 && (
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
            <span className="text-sm font-medium text-teal-600">
              <T text="What guides us" />
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
              <T text="Our core values" />
            </h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {coreValues.map((value) => {
                const Icon = coreValueIcon(value);
                return (
                  <li
                    key={value}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/50 p-6"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-white">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <span className="font-display text-base text-slate-900">
                      <T text={value} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <TrustBand whyChooseUs={whyChooseUs} branchCount={locations.length} serviceCount={services.length} />

      <ClosingCta />
    </>
  );
}
