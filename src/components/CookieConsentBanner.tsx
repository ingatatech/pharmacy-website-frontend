"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "@/lib/language-context";

export const COOKIE_CONSENT_KEY = "ingata_cookie_consent";
export const COOKIE_CONSENT_EVENT = "ingata:cookie-consent-changed";

export type CookieConsent = "accepted" | "declined";

function readConsent(): CookieConsent | null {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

// Analytics.tsx listens for this to know whether it's allowed to load
// gtag.js — kept as a plain window event rather than React context so a
// decision made here takes effect immediately without a page reload.
export function setCookieConsent(value: CookieConsent) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // Private browsing / blocked storage — the choice just won't persist
    // across visits, which is a reasonable degradation, not an error.
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Deciding whether to show the banner depends on localStorage, which
    // isn't available during SSR — this is exactly the "sync with an
    // external system on mount" case an effect exists for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(readConsent() === null);
  }, []);

  function choose(value: CookieConsent) {
    setCookieConsent(value);
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm leading-relaxed text-slate-600">
          <T text="We use essential cookies to run this site, and — only if you allow it — analytics cookies to understand how it's used. See our" />{" "}
          <Link href="/privacy-policy" className="font-medium text-teal-700 hover:text-teal-800">
            <T text="Privacy Policy" />
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
          >
            <T text="Decline" />
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
          >
            <T text="Accept" />
          </button>
        </div>
      </div>
    </div>
  );
}
