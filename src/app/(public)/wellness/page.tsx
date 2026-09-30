import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Article, Service } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ServiceCard } from "@/components/services/ServiceCard";
import { T } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Wellness | Ingata Pharmacy",
  description:
    "Preventive health, screening, vaccination and travel health guidance from the Ingata Pharmacy team.",
};

const REVALIDATE = { next: { revalidate: 120 } };

// Category names are free-text on both models (Prisma stores them as VarChar,
// not a relation), so these are matched by name rather than by id. If a
// category is renamed in the admin, update the constant here too.
const WELLNESS_SERVICE_CATEGORY = "Wellness Services";
const WELLNESS_ARTICLE_CATEGORY = "Health Tips";

async function getServices(): Promise<Service[]> {
  try {
    return await apiFetch<Service[]>("/api/services", REVALIDATE);
  } catch {
    return [];
  }
}

async function getArticles(): Promise<Article[]> {
  try {
    return await apiFetch<Article[]>("/api/articles", REVALIDATE);
  } catch {
    return [];
  }
}

export default async function WellnessPage() {
  const [services, articles] = await Promise.all([getServices(), getArticles()]);

  const wellnessServices = services.filter(
    (service) => service.category?.name === WELLNESS_SERVICE_CATEGORY,
  );
  const wellnessArticles = articles
    .filter(
      (article) => article.status === "published" && article.category === WELLNESS_ARTICLE_CATEGORY,
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime(),
    );

  return (
    <>
      <PageHeader
        eyebrow="Wellness"
        title="Look after more than your prescriptions"
        description="Preventive screening, vaccinations, day-to-day health guidance and travel advice from the pharmacists at every Ingata branch."
        variant="image"
      />

      {wellnessServices.length > 0 && (
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <span className="text-sm font-medium text-teal-600">
              <T text="What we offer" />
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
              <T text="Wellness services" />
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {wellnessServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      )}

      {wellnessArticles.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-sm font-medium text-teal-600">
                  <T text="From the pharmacy desk" />
                </span>
                <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
                  <T text="Wellness articles" />
                </h2>
              </div>
              <Link
                href="/articles"
                className="rounded-sm text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <T text="View all articles" />
              </Link>
            </div>
            <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2">
              {wellnessArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {wellnessServices.length === 0 && wellnessArticles.length === 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
            <h2 className="font-display text-2xl font-medium text-slate-900">
              <T text="Wellness content is on the way" />
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              <T text="Guides and services are still being prepared. Please check back shortly." />
            </p>
          </div>
        </section>
      )}
    </>
  );
}
