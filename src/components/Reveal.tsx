"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// One fade + rise per section as it enters the viewport, triggered once.
// Deliberately not used per-card — see the frontend-design note against
// cascading fade-in-up on every element.
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Starts false to match the server-rendered markup exactly. Reading
  // matchMedia() in the initializer made the first client render disagree
  // with the SSR HTML whenever the visitor has "reduce motion" switched on
  // (server: false, client: true), which React reports as a hydration
  // mismatch it cannot patch. That check was redundant anyway — the
  // prefers-reduced-motion block in globals.css already forces .reveal
  // visible with no transition, so the reduced-motion case is handled in
  // CSS where it needs no hydration at all.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
