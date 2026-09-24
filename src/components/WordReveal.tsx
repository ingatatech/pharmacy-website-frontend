"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslated } from "@/lib/language-context";

const EASE = [0.16, 1, 0.3, 1] as const;

// A drop-in replacement for <T text="..."/> on section headings: resolves
// translation the same way, then splits the result into words and reveals
// them one at a time (masked slide-up + fade) as the heading scrolls into
// view, instead of the whole line appearing at once. Triggered once via
// IntersectionObserver — same "reveal on first scroll into view" contract
// as Reveal.tsx, just scoped to a single heading's words rather than a
// whole section. Deliberately only used on headings, not paragraphs or
// cards — see Reveal.tsx's note against cascading fade-in-up everywhere.
export function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const resolved = useTranslated(text);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const words = resolved.split(" ");

  return (
    <span ref={containerRef} className={className}>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span key={index} className="inline-block overflow-hidden pb-[0.15em] pr-[0.02em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "100%", opacity: 0 }}
              animate={visible ? { y: "0%", opacity: 1 } : undefined}
              transition={{ duration: 0.6, ease: EASE, delay: index * 0.05 }}
            >
              {word}
              {index < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </span>
      <span className="sr-only">{resolved}</span>
    </span>
  );
}
