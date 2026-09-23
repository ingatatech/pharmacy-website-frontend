"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ClipboardList, PackageCheck, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Send your request",
    description: "Share your prescription details online or by phone — no account needed.",
  },
  {
    icon: ShieldCheck,
    title: "A pharmacist reviews it",
    description: "A licensed pharmacist checks dosage, interactions and availability before approval.",
  },
  {
    icon: PackageCheck,
    title: "Pick up or get it delivered",
    description: "Collect at your nearest branch or arrange delivery, whichever is easier.",
  },
];

const AUTOPLAY_MS = 2800;

// Circular distance from `active`, always in [-1, 0, 1] for a 3-item deck —
// lets the card immediately "before" and "after" the active one fan out to
// either side regardless of which index is actually active.
function fanOffset(index: number, active: number, length: number) {
  let diff = index - active;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

// Fanned card-deck layout, referencing a stacked/rotated testimonial deck:
// the active step sits upright and in front in solid brand teal, while the
// neighboring steps peek out rotated behind it on either side. Same "deck"
// idea as the reference, different palette (brand teal/sage, not blue/
// lavender) and real step content instead of testimonials.
export function ProcessCards() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Default to the narrower mobile-safe spread (matches the SSR/first-paint
  // markup, so there's never a flash of the wider desktop fan before this
  // upgrades on mount). Tied to the same `lg` breakpoint where ProcessSection
  // switches to its two-column layout — below that, the deck sits in a
  // full-width block (plenty of room); at `lg`+ it shares the row with the
  // text column, so the fan needs a narrower spread to stay clear of it.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => {
      setActive((current) => (current + 1) % STEPS.length);
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active, paused]);

  const spreadX = isDesktop ? 80 : 46;
  const spreadRotate = isDesktop ? 8 : 6;

  return (
    <div className="mt-10 lg:mt-0">
      <div
        className="relative mx-auto flex h-[360px] items-center justify-center sm:h-[400px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {STEPS.map((step, index) => {
          const offset = fanOffset(index, active, STEPS.length);
          const isActive = offset === 0;

          const x = prefersReducedMotion ? 0 : offset * spreadX;
          const rotate = prefersReducedMotion ? 0 : offset * spreadRotate;
          const y = isActive ? 0 : 18;
          const scale = isActive ? 1 : 0.9;
          const zIndex = isActive ? 30 : offset < 0 ? 20 : 10;

          return (
            <motion.button
              key={step.title}
              type="button"
              onClick={() => setActive(index)}
              aria-current={isActive ? "step" : undefined}
              animate={{ x, y, rotate, scale }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{ zIndex }}
              className={`absolute flex w-44 flex-col rounded-3xl border text-left transition-[background-color,border-color,box-shadow,padding] duration-300 ease-out sm:w-72 ${
                isActive
                  ? "cursor-default border-teal-900 bg-teal-800 px-5 py-6 shadow-2xl shadow-teal-900/25 sm:px-8 sm:py-10"
                  : offset < 0
                    ? "cursor-pointer border-slate-200 bg-white px-4 py-5 shadow-lg hover:-translate-y-0.5 sm:px-6 sm:py-7"
                    : "cursor-pointer border-sage bg-sage px-4 py-5 shadow-lg hover:-translate-y-0.5 sm:px-6 sm:py-7"
              }`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300 ${
                  isActive ? "bg-white/10 text-white" : "bg-white text-ink"
                }`}
              >
                <step.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>

              <p
                className={`mt-5 text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
                  isActive ? "text-gold" : "text-teal-700/70"
                }`}
              >
                Step {index + 1} of {STEPS.length}
              </p>

              <h3
                className={`mt-2 font-display text-lg font-semibold leading-snug transition-colors duration-300 sm:text-xl ${
                  isActive ? "text-white" : "text-slate-900"
                }`}
              >
                {step.title}
              </h3>

              {isActive && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="mt-4 text-sm leading-relaxed text-white/75"
                >
                  {step.description}
                </motion.p>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2.5">
        {STEPS.map((step, index) => (
          <button
            key={step.title}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show step ${index + 1}: ${step.title}`}
            aria-current={index === active ? "step" : undefined}
            className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${
              index === active ? "w-8 bg-teal-700" : "w-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
