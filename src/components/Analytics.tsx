"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { COOKIE_CONSENT_EVENT, type CookieConsent } from "@/components/CookieConsentBanner";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function readStoredConsent(): CookieConsent | null {
  try {
    const value = localStorage.getItem("ingata_cookie_consent");
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

// Loads GA4 only once both conditions are true: a measurement ID is
// actually configured (NEXT_PUBLIC_GA_MEASUREMENT_ID is unset until the
// pharmacy provides a real property), and the visitor has accepted
// analytics cookies via CookieConsentBanner. Reacts live to a consent
// change instead of requiring a reload.
export function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsented(readStoredConsent() === "accepted");

    function onConsentChange(event: Event) {
      setConsented((event as CustomEvent<CookieConsent>).detail === "accepted");
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, []);

  if (!GA_MEASUREMENT_ID || !consented) {
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
