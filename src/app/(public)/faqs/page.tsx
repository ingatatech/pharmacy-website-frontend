import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { Faq } from "@/types";
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

export default async function FaqsPage() {
  const faqs = await getFaqs();

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
        </div>
      </section>
    </>
  );
}
