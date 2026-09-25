"use client";

import { useRef, type MouseEvent } from "react";
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
import { ArrowRight, ShieldCheck } from "lucide-react";
import { T } from "@/lib/language-context";
import { WordReveal } from "@/components/WordReveal";

const EASE = [0.16, 1, 0.3, 1] as const;

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
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative -mt-20 overflow-hidden"
    >
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
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-white text-shadow-nav sm:text-6xl lg:text-7xl">
            <WordReveal text={headline} />
          </h1>
          <p className="mt-6 max-w-md text-base font-medium leading-relaxed text-white text-shadow-nav sm:text-lg">
            <WordReveal text={subheading} delay={0.15} />
          </p>
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

          {/* Mobile gets its own inline trust badge instead of losing the
              content entirely — the floating card below is absolutely
              positioned and would overlap the headline at narrow widths,
              so this sits safely in normal flow under the CTAs instead. */}
          <motion.div
            {...fadeUp(0.6)}
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white/95 p-3.5 shadow-lg backdrop-blur-md sm:hidden"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
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
          </motion.div>
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
