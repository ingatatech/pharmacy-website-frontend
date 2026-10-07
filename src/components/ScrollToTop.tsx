"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslated } from "@/lib/language-context";

const RADIUS = 19;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** How far the page must scroll before the control fades in. */
const REVEAL_AT = 120;

export function ScrollToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const backToTopLabel = useTranslated("Back to top");

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
      // Reveal after a small scroll, not the old 480px. That threshold was
      // over a viewport and a half — the homepage is long enough to clear it
      // easily, but on inner pages you could reach the footer without ever
      // seeing the button, which is why it read as homepage-only. Capped to
      // the page's own scrollable height so short pages reveal it too.
      setVisible(docHeight > 0 && scrollTop >= Math.min(REVEAL_AT, docHeight));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // The reveal now depends on docHeight, which a resize changes without
    // firing a scroll event.
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={backToTopLabel}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_20px_-4px_rgba(4,47,46,0.4)] transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r={RADIUS} fill="none" className="stroke-teal-100" strokeWidth="2" />
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          className="stroke-emerald-500"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        />
      </svg>
      <ArrowUp className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
