import Link from "next/link";
import { HeartPulse, Pill, Stethoscope, Syringe } from "lucide-react";
import type { Service } from "@/types";

function serviceIcon(service: Service, className: string) {
  const text = `${service.name} ${service.shortDescription}`.toLowerCase();
  const props = { className, strokeWidth: 1.75 };
  if (text.includes("refill") || text.includes("prescription")) return <Pill {...props} />;
  if (text.includes("vaccin")) return <Syringe {...props} />;
  if (text.includes("counsel") || text.includes("consult")) return <Stethoscope {...props} />;
  return <HeartPulse {...props} />;
}

export function ServicesSection({ services }: { services: Service[] }) {
  if (services.length === 0) {
    return null;
  }

  const shown = services.slice(0, 4);
  // Literal class strings only — Tailwind's static scanner can't see a
  // template-interpolated `grid-cols-${n}` and would silently drop it.
  const gridClass =
    shown.length === 1
      ? "mx-auto max-w-sm"
      : shown.length === 2
        ? "sm:grid-cols-2"
        : shown.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-24">
        <span className="text-sm font-medium text-teal-600">What we offer</span>
        <h2 className="mx-auto mt-2 max-w-lg font-display text-3xl font-medium text-slate-900 sm:text-4xl">
          Services at every branch
        </h2>

        <div
          className={`mt-14 grid divide-y divide-slate-200 sm:divide-x sm:divide-y-0 ${gridClass}`}
        >
          {shown.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group px-2 py-8 text-left first:pt-0 last:pb-0 sm:px-8 sm:py-0 sm:first:pl-0 sm:last:pr-0"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 transition-colors duration-200 group-hover:bg-teal-600 group-hover:text-white">
                {serviceIcon(service, "h-7 w-7")}
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold text-slate-900">
                {service.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {service.shortDescription}
              </p>
            </Link>
          ))}
        </div>

        <Link
          href="/services"
          className="mt-14 inline-flex rounded-sm text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          View all services
        </Link>
      </div>
    </section>
  );
}
