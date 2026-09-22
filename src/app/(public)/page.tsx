import { apiFetch } from "@/lib/api";
import type { Article, Faq, PharmacyLocation, Service, SiteSetting } from "@/types";
import { Hero } from "@/components/home/Hero";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { AboutSection } from "@/components/home/AboutSection";
import { LocationsSection } from "@/components/home/LocationsSection";
import { ArticlesSection } from "@/components/home/ArticlesSection";
import { FaqSection } from "@/components/home/FaqSection";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Reveal } from "@/components/Reveal";

const DEFAULT_HEADLINE = "Your trusted partner in health and wellness";
const DEFAULT_SUBHEADING =
  "Prescription refills, medication counseling and everyday care from licensed pharmacists.";
const DEFAULT_ABOUT =
  "We're a customer-focused pharmacy committed to trusted pharmaceutical products, professional service and reliable health information for the communities we serve.";
const DEFAULT_WHY_CHOOSE_US =
  "Every prescription is checked by a licensed pharmacist, and every branch keeps real stock on the shelf.";

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiFetch<T>(path, { next: { revalidate: 120 } });
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [settings, services, locations, articles, faqs] = await Promise.all([
    safeFetch<SiteSetting | null>("/api/site-settings", null),
    safeFetch<Service[]>("/api/services", []),
    safeFetch<PharmacyLocation[]>("/api/locations", []),
    safeFetch<Article[]>("/api/articles", []),
    safeFetch<Faq[]>("/api/faqs", []),
  ]);

  return (
    <>
      <Hero
        headline={settings?.heroHeadline || DEFAULT_HEADLINE}
        subheading={settings?.heroSubheading || DEFAULT_SUBHEADING}
      />
      <Reveal>
        <ServicesSection services={services} />
      </Reveal>
      <Reveal>
        <WhyChooseUs statement={settings?.whyChooseUs || DEFAULT_WHY_CHOOSE_US} />
      </Reveal>
      <Reveal>
        <ProcessSection />
      </Reveal>
      <Reveal>
        <AboutSection
          aboutUs={settings?.aboutUs || DEFAULT_ABOUT}
          coreValues={settings?.coreValues ?? []}
          branchCount={locations.length}
        />
      </Reveal>
      <Reveal>
        <LocationsSection locations={locations} />
      </Reveal>
      <Reveal>
        <ArticlesSection articles={articles} />
      </Reveal>
      <Reveal>
        <FaqSection faqs={faqs} />
      </Reveal>
      <Reveal>
        <ClosingCta />
      </Reveal>
    </>
  );
}
