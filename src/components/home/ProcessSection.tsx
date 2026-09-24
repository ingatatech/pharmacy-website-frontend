import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProcessCards } from "@/components/home/ProcessCards";
import { T } from "@/lib/language-context";
import { WordReveal } from "@/components/WordReveal";

// Side-by-side layout referencing the "text block beside a fanned card
// deck" composition: copy, heading and a pill CTA on the left, the card
// deck on the right, instead of a heading strip stacked above full-width
// cards.
export function ProcessSection() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <span className="block text-center font-display text-3xl font-medium text-slate-900 sm:text-4xl">
          <WordReveal text="How it works" />
        </span>

        <div className="mt-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-medium leading-[1.05] text-slate-900 sm:text-5xl">
              <WordReveal text="Refilling a prescription takes three steps" />
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              <T text="No queues, no guesswork — share your request, a licensed pharmacist reviews it, and you collect or get it delivered." />
            </p>
            <Link
              href="/prescription-refill"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <T text="Start a refill" />
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ProcessCards />
        </div>
      </div>
    </section>
  );
}
