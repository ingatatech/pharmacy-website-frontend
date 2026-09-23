import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Faq, SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { FaqAccordion } from "@/components/faqs/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQs | Ingata Pharmacy",
  description: "Answers to common questions about our pharmacy services, refills and branches.",
};

async function getFaqs(): Promise<Faq[]> {
  try {
    return await apiFetch<Faq[]>("/api/faqs", { next: { revalidate: 300 } });
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

export default async function FaqsPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSiteSettings()]);

  return (
    <>
      <PageHeader
        eyebrow="Help center"
        title="Frequently asked questions"
        description="Answers to the questions we hear most about services, refills and our branches."
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
          <FaqAccordion faqs={faqs} />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-teal-100 bg-teal-50 p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-teal-800">
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900">Still have questions?</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Our pharmacists are happy to talk through anything not covered here.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 transition-colors duration-200 hover:border-teal-300"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                  {settings.phone}
                </a>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
