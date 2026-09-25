import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { Analytics } from "@/components/Analytics";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { apiFetch } from "@/lib/api";
import { jsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site";
import type { Article, Service, SiteSetting } from "@/types";
import type { ReactNode } from "react";

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const settings = await apiFetch<SiteSetting>("/api/site-settings", {
      next: { revalidate: 300 },
    });
    // The endpoint returns {} rather than 404 when nothing has been set yet.
    return settings?.id ? settings : null;
  } catch {
    return null;
  }
}

async function getServices(): Promise<Service[]> {
  try {
    return await apiFetch<Service[]>("/api/services", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

async function getArticles(): Promise<Article[]> {
  try {
    return await apiFetch<Article[]>("/api/articles", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [settings, services, articles] = await Promise.all([getSiteSettings(), getServices(), getArticles()]);

  const sameAs = [
    settings?.facebookUrl,
    settings?.instagramUrl,
    settings?.linkedinUrl,
    settings?.xUrl,
    settings?.youtubeUrl,
  ].filter((url): url is string => Boolean(url));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    name: settings?.pharmacyName || "Ingata Pharmacy",
    url: SITE_URL,
    ...(settings?.phone && { telephone: settings.phone }),
    ...(settings?.email && { email: settings.email }),
    ...(settings?.address && { address: settings.address }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <ScrollProgressBar />
      <Navbar services={services} articles={articles} />
      <main className="flex-1 pt-20">
        {settings?.announcementActive && settings.announcementMessage && (
          <AnnouncementBanner message={settings.announcementMessage} />
        )}
        {children}
      </main>
      <Footer settings={settings} />
      <ScrollToTop />
      {settings?.whatsappUrl && <WhatsAppButton href={settings.whatsappUrl} />}
      <CookieConsentBanner />
      <Analytics />
    </>
  );
}
