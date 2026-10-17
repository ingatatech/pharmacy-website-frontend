import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Faq, SiteSetting } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/lib/language-context";

async function getFaq(id: string): Promise<Faq | null> {
  try {
    return await apiFetch<Faq>(`/api/faqs/${id}`, { next: { revalidate: 300 } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const faq = await getFaq(id);
  if (!faq) {
    return {};
  }
  return {
    title: `${faq.question} | Ingata Pharmacy`,
    description: faq.answer,
  };
}

export default async function FaqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [faq, settings] = await Promise.all([getFaq(id), getSiteSettings()]);

  if (!faq) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title={faq.question}
        backHref="/faqs"
        backLabel="All FAQs"
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <T text="Back to FAQs" />
          </Link>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              <T text={faq.question} />
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              <T text={faq.answer} />
            </p>
          </div>

          {settings?.phone && (
            <div className="mt-10 flex items-center justify-between rounded-2xl border border-teal-100 bg-teal-50 p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-teal-800">
                  <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    <T text="Still have questions?" />
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    <T text="Our pharmacists are happy to talk through anything not covered here." />
                  </p>
                </div>
              </div>
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 transition-colors duration-200 hover:border-teal-300"
              >
                {settings.phone}
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
