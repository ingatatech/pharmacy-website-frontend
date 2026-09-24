import Link from "next/link";
import { HeartPulse, Pill, Stethoscope, Syringe } from "lucide-react";
import type { Service } from "@/types";
import { T } from "@/lib/language-context";

export function serviceIcon(service: Service, className: string) {
  const text = `${service.name} ${service.shortDescription}`.toLowerCase();
  const props = { className, strokeWidth: 1.75 };
  if (text.includes("refill") || text.includes("prescription")) return <Pill {...props} />;
  if (text.includes("vaccin")) return <Syringe {...props} />;
  if (text.includes("counsel") || text.includes("consult")) return <Stethoscope {...props} />;
  return <HeartPulse {...props} />;
}

// Shared between the homepage teaser and the full /services catalog so the
// two never drift apart.
export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex min-h-[19rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-teal-800 hover:shadow-lg sm:min-h-[22rem] sm:p-11"
    >
      {/* Sweeps in from the right on hover, filling the card before the
          icon/text invert to white — same mechanic as qtglobal.rw's
          service cards (a growing panel behind the content, not a plain
          color swap). */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-0 bg-teal-800 transition-[width] duration-300 ease-out group-hover:w-full"
      />

      <div className="relative z-10">
        <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-slate-100 text-ink transition-colors duration-300 group-hover:bg-white">
          {serviceIcon(service, "h-7 w-7 sm:h-9 sm:w-9")}
        </div>
        <h3 className="mt-6 sm:mt-8 font-display text-xl sm:text-2xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-white">
          <T text={service.name} />
        </h3>
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-white/85">
          <T text={service.shortDescription} />
        </p>
      </div>
    </Link>
  );
}
