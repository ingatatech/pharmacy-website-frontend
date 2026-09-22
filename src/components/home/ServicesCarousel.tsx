"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Service } from "@/types";
import { ServiceCard } from "@/components/services/ServiceCard";

// A horizontal slider instead of a paginated "view all" link — used once
// there are more services than comfortably fit in a static grid, so every
// service stays reachable right on the homepage.
export function ServicesCarousel({ services }: { services: Service[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <div className="relative mt-14">
      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-2"
      >
        {services.map((service) => (
          <div key={service.id} data-card className="w-72 shrink-0 snap-start text-left sm:w-80">
            <ServiceCard service={service} />
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-sage to-transparent sm:w-16"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-sage to-transparent sm:w-16"
      />

      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        aria-label="Previous services"
        className="absolute left-1 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-ink shadow-sm transition-colors duration-200 hover:border-teal-800 hover:text-teal-800 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        aria-label="Next services"
        className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-ink shadow-sm transition-colors duration-200 hover:border-teal-800 hover:text-teal-800 sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
