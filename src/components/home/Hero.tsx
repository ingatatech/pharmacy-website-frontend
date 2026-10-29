"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Pill,
  Search,
  ShieldCheck,
  Syringe,
} from "lucide-react";
import { T, useTranslated } from "@/lib/language-context";
import { WordReveal } from "@/components/WordReveal";
import { CapsuleMotif } from "@/components/home/CapsuleMotif";

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// HERO TEXT SLIDES — the sage background stays fixed; only this copy slides.
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
  const searchPlaceholder = useTranslated("Search products or medicines");
  const searchLabel = useTranslated("Search");

  // Scroll-linked parallax: the card cluster drifts down slightly slower
  // than the page scrolls past the hero, giving it a sense of depth.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const cardScrollY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 60]);

  // Mouse-parallax: the cluster leans gently toward the cursor.
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

  // Shared float for the overlapping cards. Rotations are separate so framer's
  // transform never fights the Tailwind translate utilities.
  function float(delay: number) {
    return prefersReducedMotion
      ? undefined
      : {
          animate: { y: [0, -8, 0] },
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay },
        };
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative -mt-20 overflow-hidden bg-[#D6E7DC]"
      aria-roledescription="carousel"
      aria-label="Pharmacy highlights"
    >
      {/* Solid, flat wavy anchor at the base — no photo, no gradient. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-24" aria-hidden="true">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0 82C180 128 380 26 580 44C790 63 900 150 1110 130C1240 118 1350 88 1440 108L1440 160L0 160Z"
            fill="#C6DBCE"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 sm:pb-32 sm:pt-28 lg:pb-36 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left: copy and conversion actions. */}
          <div className="max-w-xl">
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
                    <Heading className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-5xl">
                      {isActive ? <WordReveal text={slide.headline} /> : slide.headline}
                    </Heading>
                    <p className="mt-5 max-w-md text-sm font-medium leading-relaxed text-slate-600">
                      {isActive ? <WordReveal text={slide.subheading} delay={0.15} /> : slide.subheading}
                    </p>
                  </div>
                );
              })}
            </div>

            <motion.div {...fadeUp(0.5)} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <form
                action="/products"
                method="GET"
                className="flex min-w-0 flex-1 overflow-hidden rounded-md border border-line bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-brand/25"
              >
                <input
                  type="text"
                  name="q"
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label={searchLabel}
                  className="flex shrink-0 items-center justify-center bg-brand px-4 text-white transition-colors duration-200 hover:bg-brand-deep"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
              <Link
                href="/prescription-refill"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <T text="Refill a prescription" />
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            {/* Slider controls: dots on the left, prev/next arrows on the right. */}
            {count > 1 && (
              <motion.div {...fadeUp(0.6)} className="mt-10 flex items-center gap-6">
                <div className="flex items-center gap-2.5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={`${goToLabel} ${index + 1}`}
                      aria-current={index === active}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        index === active ? "w-7 bg-brand" : "w-2.5 bg-brand/25 hover:bg-brand/40"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => paginate(-1)}
                    aria-label={prevLabel}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/25 text-brand transition-colors duration-200 hover:bg-brand/10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => paginate(1)}
                    aria-label={nextLabel}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/25 text-brand transition-colors duration-200 hover:bg-brand/10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: clustered, overlapping cards instead of a photo. */}
          <motion.div
            {...fadeUp(0.45)}
            className="relative mx-auto aspect-square w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[460px]"
          >
            <CapsuleMotif
              tone="white"
              className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2"
            />
            <div
              className="absolute inset-x-10 bottom-8 h-20 rounded-full bg-brand/10 blur-2xl"
              aria-hidden="true"
            />

            <motion.div
              style={{ y: cardScrollY, x: cardX, rotateX: cardTiltY, transformPerspective: 900 }}
              className="absolute inset-0"
            >
              <motion.div
                {...float(0.6)}
                style={{ rotate: 9 }}
                className="absolute right-0 top-[14%] w-[48%] rounded-2xl bg-white/95 p-3.5 shadow-xl ring-1 ring-line backdrop-blur-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage text-brand">
                    <Syringe className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xs font-semibold text-ink">
                      <T text="Vaccinations" />
                    </p>
                    <p className="text-[10px] text-slate-500">
                      <T text="Walk-in" />
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                {...float(0.25)}
                style={{ rotate: -9 }}
                className="absolute left-0 top-[18%] w-[50%] rounded-2xl bg-white/95 p-3.5 shadow-xl ring-1 ring-line backdrop-blur-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage text-brand">
                    <Pill className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xs font-semibold text-ink">
                      <T text="Refills" />
                    </p>
                    <p className="text-[10px] text-slate-500">
                      <T text="In minutes" />
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                {...float(0.9)}
                style={{ rotate: 6 }}
                className="absolute bottom-[10%] right-[2%] w-[46%] rounded-2xl bg-brand p-3.5 shadow-xl ring-1 ring-brand-deep"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xs font-semibold text-white">
                      <T text="Consultation" />
                    </p>
                    <p className="text-[10px] text-white/70">
                      <T text="Ask a pharmacist" />
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Front card — the existing trust content, now the anchor of the stack. */}
              <motion.div
                {...float(0)}
                style={{ rotate: -2 }}
                className="absolute left-[13%] top-[34%] w-[74%] rounded-2xl bg-white p-5 shadow-[0_24px_60px_-24px_rgba(18,36,31,0.45)] ring-1 ring-line"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage text-brand">
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-ink">
                      <T text="Licensed pharmacists" />
                    </p>
                    <p className="text-xs text-slate-500">
                      <T text="On every shift" />
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  <p className="text-[11px] font-medium text-slate-500">
                    <T text="Verified medication" />
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
