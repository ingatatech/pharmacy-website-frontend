import Link from "next/link";
import { T } from "@/lib/language-context";

export function ClosingCta() {
  return (
    <section className="bg-teal-900">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 md:py-20 lg:py-24">
        <span className="text-sm font-medium text-white/80">
          <T text="Get in touch" />
        </span>
        <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-medium text-white">
          <T text="Questions about a medication?" />
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85">
          <T text="Our pharmacists are available at every branch for guidance on dosage, interactions and everyday care." />
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-md bg-white px-6 py-3 text-sm font-medium text-teal-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <T text="Talk to a pharmacist" />
          </Link>
          <Link
            href="/locations"
            className="rounded-md border border-white px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <T text="Find a branch" />
          </Link>
        </div>
      </div>
    </section>
  );
}
