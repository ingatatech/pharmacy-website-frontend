"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { T, useTranslated } from "@/lib/language-context";

const STORAGE_KEY = "ingata_dismissed_announcement";

// Sits in normal document flow at the top of <main>, below the fixed
// navbar — not fixed/sticky itself, so it needs no layout-offset math and
// just scrolls away with the page once dismissed. Keyed by the message
// text itself (not a boolean) so editing the announcement in Site Settings
// makes it reappear for someone who already dismissed the old one.
export function AnnouncementBanner({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(true);
  const closeLabel = useTranslated("Dismiss");

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(localStorage.getItem(STORAGE_KEY) === message);
    } catch {
      setDismissed(false);
    }
  }, [message]);

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, message);
    } catch {
      // Private browsing / blocked storage — it just won't stay dismissed
      // across visits, a reasonable degradation.
    }
  }

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-amber-950">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 text-sm sm:px-6">
        <Megaphone className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        <p className="min-w-0 flex-1 font-medium leading-snug">
          <T text={message} />
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={closeLabel}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-amber-600/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
