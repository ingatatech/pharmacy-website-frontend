"use client";

import { Globe } from "lucide-react";
import { useLanguage, type Language } from "@/lib/language-context";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "rw", label: "Kinyarwanda" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
];

// Desktop: hover-reveals-a-white-panel dropdown, same mechanic as the
// Services/Blog nav dropdowns and UserMenu.
export function LanguageSwitcher({ solid }: { solid: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button
        type="button"
        className={`flex items-center gap-1.5 rounded-full py-1.5 pl-2.5 pr-3 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          solid ? "text-slate-600 hover:text-slate-900" : "text-white text-shadow-nav"
        }`}
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" strokeWidth={1.75} />
        {language.toUpperCase()}
      </button>

      <div className="invisible absolute right-0 top-full z-50 w-44 pt-3 opacity-0 transition-[opacity,visibility] duration-200 ease-out group-hover:visible group-hover:opacity-100">
        <div className="-translate-y-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-out group-hover:translate-y-0">
          <ul className="divide-y divide-slate-100">
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  aria-current={language === lang.code ? "true" : undefined}
                  className={`block w-full px-4 py-3 text-left text-sm transition-colors duration-200 hover:bg-slate-50 hover:text-teal-800 ${
                    language === lang.code ? "font-semibold text-teal-800" : "text-slate-700"
                  }`}
                >
                  {lang.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Mobile: hover dropdowns don't work on touch, so this is a plain inline
// two-button toggle instead, matching the mobile menu's other controls.
export function MobileLanguageSwitcher({ solid }: { solid: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2.5">
      <Globe className={`h-4 w-4 ${solid ? "text-slate-500" : "text-white/70"}`} strokeWidth={1.75} />
      <div className={`flex overflow-hidden rounded-full border ${solid ? "border-slate-300" : "border-white/30"}`}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            aria-current={language === lang.code ? "true" : undefined}
            className={`px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
              language === lang.code
                ? "bg-teal-700 text-white"
                : solid
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-white hover:bg-white/10"
            }`}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
