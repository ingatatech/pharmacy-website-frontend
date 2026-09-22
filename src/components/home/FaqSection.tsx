import Link from "next/link";
import type { Faq } from "@/types";
import { FaqAccordion } from "@/components/faqs/FaqAccordion";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-teal-100 bg-sage">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <div className="text-center">
          <span className="text-sm font-medium text-teal-600">Have questions?</span>
          <h2 className="mx-auto mt-2 max-w-lg font-display text-3xl font-medium text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12">
          <FaqAccordion faqs={faqs.slice(0, 5)} />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faqs"
            className="text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
          >
            View all FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}
