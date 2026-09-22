"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CapsuleMotif } from "./CapsuleMotif";

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

  // Scroll-linked parallax: the motif drifts down slightly slower than the
  // page scrolls past the hero, giving it a sense of depth.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const motifScrollY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 100]);

  // Mouse-parallax: the motif leans gently toward the cursor.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const motifX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.5 });
  const motifTiltY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.5 });

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(((event.clientX - rect.left) / rect.width - 0.5) * 28);
    mouseY.set(((event.clientY - rect.top) / rect.height - 0.5) * 28);
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
      className="relative -mt-20 overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800"
    >
      <div className="pointer-events-none absolute inset-y-0 -right-24 flex items-center sm:-right-10 md:right-0">
        <motion.div style={{ y: motifScrollY }}>
          <motion.div style={{ x: motifX, y: motifTiltY }}>
            <CapsuleMotif className="h-[620px] w-[620px] opacity-90" />
          </motion.div>
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-40">
        <div className="max-w-3xl">
          <motion.h1
            {...fadeUp(0.05)}
            className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-white drop-shadow-sm sm:text-6xl lg:text-7xl"
          >
            {headline}
          </motion.h1>
          <motion.p
            {...fadeUp(0.17)}
            className="mt-6 max-w-md text-base font-medium leading-relaxed text-white drop-shadow-sm sm:text-lg"
          >
            {subheading}
          </motion.p>
          <motion.div {...fadeUp(0.29)} className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/prescription-refill"
              className="group inline-flex items-center gap-2 rounded-md bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-teal-950 transition-colors duration-200 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              Refill a prescription
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/services"
              className="text-sm font-semibold text-white drop-shadow-sm transition-colors duration-200"
            >
              Browse services
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
