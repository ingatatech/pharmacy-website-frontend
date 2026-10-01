import { apiFetch } from "@/lib/api";
import type { Article, Category, Faq, PharmacyLocation, Product, Service, SiteSetting, Testimonial } from "@/types";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { AboutSection } from "@/components/home/AboutSection";
import { LocationsSection } from "@/components/home/LocationsSection";
import { ArticlesSection } from "@/components/home/ArticlesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
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

// Products are only needed to fill in counts and example names for the range
// teaser, which is driven by the category list. 200 is the API's maximum page
// size, so the counts stay exact up to that many products; past it the tiles
// would start showing partial counts and this wants a real aggregate endpoint.
const HOMEPAGE_PRODUCT_LIMIT = 200;

export default async function HomePage() {
  const [settings, services, categories, products, locations, articles, testimonials, faqs] =
    await Promise.all([
      safeFetch<SiteSetting | null>("/api/site-settings", null),
      safeFetch<Service[]>("/api/services", []),
      // Only product ranges belong in the teaser. "service" categories drive
      // the services section instead.
      safeFetch<Category[]>("/api/categories?type=product", []),
      safeFetch<Product[]>(`/api/products?limit=${HOMEPAGE_PRODUCT_LIMIT}`, []),
      safeFetch<PharmacyLocation[]>("/api/locations", []),
      safeFetch<Article[]>("/api/articles", []),
      safeFetch<Testimonial[]>("/api/testimonials", []),
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
        <ProductsSection categories={categories} products={products} />
      </Reveal>
      <Reveal>
        <ProcessSection />
      </Reveal>
      <Reveal>
        <AboutSection
          aboutUs={settings?.aboutUs || DEFAULT_ABOUT}
          coreValues={settings?.coreValues ?? []}
          whyChooseUs={settings?.whyChooseUs || DEFAULT_WHY_CHOOSE_US}
          branchCount={locations.length}
          serviceCount={services.length}
        />
      </Reveal>
      <Reveal>
        <LocationsSection locations={locations} services={services} />
      </Reveal>
      <Reveal>
        <ArticlesSection articles={articles} />
      </Reveal>
      <Reveal>
        <TestimonialsSection testimonials={testimonials} />
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
