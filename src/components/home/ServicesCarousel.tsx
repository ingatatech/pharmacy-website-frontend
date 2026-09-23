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
    const startedAt = track.scrollLeft;
    const target = Math.max(0, Math.min(track.scrollWidth - track.clientWidth, startedAt + direction * amount));
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
    // Some browser/embedding contexts silently drop smooth-scroll animations
    // on scroll-snap containers. If nothing has moved shortly after asking,
    // jump there directly so the buttons always visibly respond.
    window.setTimeout(() => {
      if (track.scrollLeft === startedAt) {
        track.scrollTo({ left: target, behavior: "instant" });
      }
    }, 350);
  }

  return (
    <div className="mt-14">
      <div className="relative">
        <div
          ref={trackRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-2"
        >
          {services.map((service) => (
            <div key={service.id} data-card className="w-80 shrink-0 snap-start text-left sm:w-[26rem]">
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
      </div>

      {/* Controls sit in their own row below the track, rather than
          floating on top of the edge cards, so they never overlap a
          card's clickable/hoverable area. */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Previous services"
          className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-ink shadow-sm transition-colors duration-200 hover:border-teal-800 hover:text-teal-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Next services"
          className="flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-ink shadow-sm transition-colors duration-200 hover:border-teal-800 hover:text-teal-800"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
