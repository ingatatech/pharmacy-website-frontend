import Link from "next/link";
import { ProcessCards } from "@/components/home/ProcessCards";

export function ProcessSection() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-teal-600">How it works</span>
            <h2 className="mt-2 max-w-lg font-display text-3xl font-medium text-slate-900 sm:text-4xl">
              Refilling a prescription takes three steps
            </h2>
          </div>
          <Link
            href="/prescription-refill"
            className="rounded-sm text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            Start a refill
          </Link>
        </div>

        <ProcessCards />
      </div>
    </section>
  );
}
