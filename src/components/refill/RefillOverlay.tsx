"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslated } from "@/lib/language-context";

const EASE = [0.16, 1, 0.3, 1] as const;

// Exact same popup pattern as AuthModal (fixed inset-0, centered floating
// card over a blurred backdrop, p-4 outer margin, max-h-[90vh] with its own
// scroll) — the rest of the site, header included, stays visible through
// the dim/blur exactly the way it does behind the login/signup modal. Only
// difference is a wider max-w, since the refill form has more fields.
// Wraps the /prescription-refill page's content, which stays a real,
// linkable route even though it now presents as a popup.
export function RefillOverlay({ children }: { children: ReactNode }) {
  const router = useRouter();
  const closeLabel = useTranslated("Close");

  function handleClose() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label={closeLabel}
          className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </motion.div>
    </div>
  );
}
