import type { Service } from "@/types";
import { ServiceCard } from "@/components/services/ServiceCard";
import { CapsuleMotif } from "@/components/home/CapsuleMotif";
import { ServicesCarousel } from "@/components/home/ServicesCarousel";
import { WordReveal } from "@/components/WordReveal";

// Beyond this many, a static grid gets cramped — switch to the slider
// instead of truncating the list behind a "view all" link.
const CAROUSEL_THRESHOLD = 4;

export function ServicesSection({ services }: { services: Service[] }) {
  if (services.length === 0) {
    return null;
  }

  const useCarousel = services.length > CAROUSEL_THRESHOLD;

  // Literal class strings only — Tailwind's static scanner can't see a
  // template-interpolated `grid-cols-${n}` and would silently drop it.
  const gridClass =
    services.length === 1
      ? "mx-auto max-w-sm"
      : services.length === 2
        ? "sm:grid-cols-2"
        : services.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="relative overflow-hidden bg-sage">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-16 hidden opacity-[0.08] md:block"
      >
        <CapsuleMotif className="h-64 w-64" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-24">
        <span className="text-sm font-medium text-teal-600">
          <WordReveal text="What we offer" />
        </span>
        <h2 className="mx-auto mt-2 max-w-lg font-display text-3xl font-medium text-slate-900 sm:text-4xl">
          <WordReveal text="Services at every branch" />
        </h2>

        {useCarousel ? (
          <ServicesCarousel services={services} />
        ) : (
          <div className={`mt-14 grid gap-6 ${gridClass}`}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
