"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Language = "en" | "rw" | "fr" | "sw";

const LANGUAGE_KEY = "ingata_language";
const CACHE_PREFIX = "ingata_translation:";

type LanguageContextValue = {
  language: Language;
  ready: boolean;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Single source of truth for the active language — mirrors AuthProvider's
// shape so every component switches together the moment the picker changes.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Synchronizing with an external system (localStorage, unavailable
    // during SSR) on mount.
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      if (stored === "rw" || stored === "en" || stored === "fr" || stored === "sw") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguageState(stored);
      }
    } catch {
      // Inaccessible storage — default to English.
    }
    setReady(true);
  }, []);

  const setLanguage = useCallback((next: Language) => {
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      // Ignore — the switch still applies for this session.
    }
    setLanguageState(next);
  }, []);

  return <LanguageContext.Provider value={{ language, ready, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

// Module-level (not per-component) so every place that renders the same
// string — e.g. "Services" in both the desktop and mobile nav — shares one
// network request instead of firing one each, and results survive
// component remounts for the life of the tab. localStorage makes them
// survive across page loads too, so a returning visitor in Kinyarwanda
// mode doesn't re-pay for translations Groq already produced.
const memoryCache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

function cacheKey(text: string, language: Language) {
  return `${language}:${text}`;
}

async function translate(text: string, language: Language): Promise<string> {
  const key = cacheKey(text, language);

  const cached = memoryCache.get(key);
  if (cached) return cached;

  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (stored) {
      memoryCache.set(key, stored);
      return stored;
    }
  } catch {
    // Ignore — fall through to a live request.
  }

  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const request = (async () => {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: language }),
      });
      if (!response.ok) return text;

      const data = await response.json();
      const translated = typeof data.translated === "string" && data.translated ? data.translated : text;

      memoryCache.set(key, translated);
      try {
        localStorage.setItem(CACHE_PREFIX + key, translated);
      } catch {
        // Storage full/unavailable — the in-memory cache still helps this session.
      }
      return translated;
    } catch {
      // Network error, GROQ_API_KEY not configured yet, etc. — keep the
      // original text rather than showing a broken UI.
      return text;
    } finally {
      pending.delete(key);
    }
  })();

  pending.set(key, request);
  return request;
}

// Renders `text` as-is while the active language is English (the site's
// real content language), and swaps in the Groq-translated version once it
// resolves otherwise — the original stays visible in the meantime, so
// nothing flashes blank or breaks if translation is slow or unconfigured.
// Wraps useTranslated as a component instead of a hook call, so text
// inside a .map() (e.g. nav links built from a dynamic array) can be
// translated without violating the Rules of Hooks — each <T> instance
// calls the hook itself exactly once, rather than the parent calling it
// once per loop iteration.
export function T({ text }: { text: string }) {
  return useTranslated(text);
}

export function useTranslated(text: string): string {
  const { language, ready } = useLanguage();
  const [translated, setTranslated] = useState(text);
  const requestId = useRef(0);

  useEffect(() => {
    if (!ready || language === "en" || !text) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTranslated(text);
      return;
    }

    const id = ++requestId.current;
    const cached = memoryCache.get(cacheKey(text, language));
    if (cached) {
      setTranslated(cached);
      return;
    }

    setTranslated(text);
    translate(text, language).then((result) => {
      if (requestId.current === id) {
        setTranslated(result);
      }
    });
  }, [text, language, ready]);

  return translated;
}
