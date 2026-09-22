import Link from "next/link";

export function ClosingCta() {
  return (
    <section className="bg-emerald-600">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 md:py-20 lg:py-24">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium text-white">
          Questions about a medication?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85">
          Our pharmacists are available at every branch for guidance on dosage, interactions and
          everyday care.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-md bg-white px-6 py-3 text-sm font-medium text-emerald-700 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Talk to a pharmacist
          </Link>
          <Link
            href="/locations"
            className="rounded-md border border-white px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Find a branch
          </Link>
        </div>
      </div>
    </section>
  );
}
