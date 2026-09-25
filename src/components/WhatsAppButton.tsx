"use client";

import { FaWhatsapp } from "react-icons/fa6";
import { useTranslated } from "@/lib/language-context";

// Always-visible floating chat entry point — unlike ScrollToTop (which only
// appears after scrolling and sits bottom-right), this is the primary
// contact channel for many customers here, so it's on from first paint,
// bottom-left to avoid colliding with ScrollToTop's circle.
export function WhatsAppButton({ href }: { href: string }) {
  const label = useTranslated("Chat with us on WhatsApp");

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_-4px_rgba(37,211,102,0.6)] transition-transform duration-200 hover:scale-105"
    >
      <FaWhatsapp className="h-7 w-7" />
    </a>
  );
}
