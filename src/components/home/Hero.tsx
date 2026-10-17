"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { T, useTranslated } from "@/lib/language-context";
import { WordReveal } from "@/components/WordReveal";

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// HERO TEXT SLIDES — the background photo stays fixed; only this copy slides.
// The first slide is the admin-editable hero copy from Site Settings; add or
// edit the extra slides below to change the rest of the rotation.
// ---------------------------------------------------------------------------
const EXTRA_SLIDES: { headline: string; subheading: string }[] = [
  {
    headline: "Medication guidance you can trust",
    subheading: "Talk to a licensed pharmacist about your prescriptions, side effects and interactions.",
  },
  {
    headline: "Your health, close to home",
    subheading: "Refills, vaccinations and everyday care at a branch near you.",
  },
];

const AUTOPLAY_MS = 6000;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  };
}

export function Hero({
  headline,
  subheading,
}: {
  headline: string;
  subheading: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const slides = [{ headline, subheading }, ...EXTRA_SLIDES];
  const count = slides.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const paginate = useCallback(
    (direction: number) => {
      setActive((i) => (i + direction + count) % count);
    },
    [count],
  );

  const goTo = useCallback(
    (index: number) => setActive(((index % count) + count) % count),
    [count],
  );

  // Auto-advance, paused on hover/focus and disabled entirely when the visitor
  // has asked for reduced motion (the manual arrows/dots still work).
  useEffect(() => {
    if (prefersReducedMotion || paused || count <= 1) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, paused, count]);

  const prevLabel = useTranslated("Previous slide");
  const nextLabel = useTranslated("Next slide");
  const goToLabel = useTranslated("Go to slide");

  // Scroll-linked parallax: the trust card drifts down slightly slower
  // than the page scrolls past the hero, giving it a sense of depth.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const cardScrollY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 60]);

  // Mouse-parallax: the trust card leans gently toward the cursor.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.5 });
  const cardTiltY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.5 });

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(((event.clientX - rect.left) / rect.width - 0.5) * 16);
    mouseY.set(((event.clientY - rect.top) / rect.height - 0.5) * 16);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setPaused(false);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative -mt-20 overflow-hidden bg-teal-900"
      aria-roledescription="carousel"
      aria-label="Pharmacy highlights"
    >
      {/* The background photo is fixed — only the copy over it slides. */}
      <Image
        src="/images/page-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "75% center" }}
      />
      {/* A much lighter wash than a typical dark hero scrim — lets the
          photo's own pale-blue tone read through instead of flattening it
          to near-black, while staying just dark enough for white text. */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/55 via-teal-800/40 to-teal-700/25" />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-40">
        <div className="max-w-3xl">
          {/* All slides share one grid cell, so the tallest reserves the
              height and the controls below never jump as copy changes. */}
          <div className="grid">
            {slides.map((slide, index) => {
              const isActive = index === active;
              const Heading = isActive ? "h1" : "p";
              return (
                <div
                  key={index}
                  aria-hidden={!isActive}
                  className={`col-start-1 row-start-1 transition-[opacity,transform] duration-700 ease-out ${
                    isActive
                      ? "translate-x-0 opacity-100"
                      : `pointer-events-none opacity-0 ${index < active ? "-translate-x-10" : "translate-x-10"}`
                  }`}
                >
                  <Heading className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-white text-shadow-nav sm:text-6xl lg:text-7xl">
                    {isActive ? <WordReveal text={slide.headline} /> : slide.headline}
                  </Heading>
                  <p className="mt-6 max-w-md text-base font-medium leading-relaxed text-white text-shadow-nav sm:text-lg">
                    {isActive ? <WordReveal text={slide.subheading} delay={0.15} /> : slide.subheading}
                  </p>
                </div>
              );
            })}
          </div>

          <motion.div {...fadeUp(0.5)} className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/prescription-refill"
              className="group inline-flex items-center gap-2 rounded-md bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-teal-950 transition-colors duration-200 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <T text="Refill a prescription" />
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/services"
              className="text-sm font-semibold text-white text-shadow-nav transition-colors duration-200"
            >
              <T text="Browse services" />
            </Link>
          </motion.div>

          {/* Slider controls: dots on the left, prev/next arrows on the right. */}
          {count > 1 && (
            <motion.div {...fadeUp(0.6)} className="mt-12 flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`${goToLabel} ${index + 1}`}
                    aria-current={index === active}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === active ? "w-7 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => paginate(-1)}
                  aria-label={prevLabel}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/15"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => paginate(1)}
                  aria-label={nextLabel}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/15"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating trust card — real content (no invented ratings), echoing
          the "card overlaid on the photo" detail from the reference. */}
      <motion.div
        {...fadeUp(0.65)}
        style={{ y: cardScrollY, x: cardX, rotateX: cardTiltY }}
        className="absolute right-6 top-28 hidden rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-md sm:right-10 sm:top-32 sm:block"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-slate-900">
              <T text="Licensed pharmacists" />
            </p>
            <p className="text-xs text-slate-500">
              <T text="On every shift" />
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
