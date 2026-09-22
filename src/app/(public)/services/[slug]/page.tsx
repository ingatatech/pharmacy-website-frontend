import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Service } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { serviceIcon } from "@/components/services/ServiceCard";

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
  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <PageHeader eyebrow={service.category?.name || "Service"} title={service.name} />

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="max-w-xl text-lg leading-relaxed text-slate-700">
              {service.shortDescription}
            </p>

            <div className="mt-10 space-y-10">
              {DETAIL_SECTIONS.map(({ key, label }) => {
                const value = service[key];
                if (!value || typeof value !== "string") return null;
                return (
                  <div key={key}>
                    <h2 className="font-display text-xl font-semibold text-slate-900">{label}</h2>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">{value}</p>
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
                  <p className="text-sm font-medium text-slate-900">{service.keyBenefit}</p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/prescription-refill"
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
                >
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900"
                >
                  Talk to a pharmacist
                </Link>
              </div>
            </div>

            <Link
              href="/services"
              className="inline-flex text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
            >
              ← Back to all services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
