import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import type { Article, Product, Service } from "@/types";

async function safeFetch<T>(path: string): Promise<T[]> {
  try {
    return await apiFetch<T[]>(path, { next: { revalidate: 3600 } });
  } catch {
    return [];
  }
}

const STATIC_ROUTES = [
  "",
  "/about",
  "/services",
  "/products",
  "/articles",
  "/faqs",
  "/locations",
  "/prescription-refill",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
  "/medical-disclaimer",
  "/pharmacy-terms",
  "/complaints",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, products, articles] = await Promise.all([
    safeFetch<Service>("/api/services"),
    safeFetch<Product>("/api/products"),
    safeFetch<Article>("/api/articles"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${SITE_URL}/services/${service.slug}`,
    lastModified: new Date(service.updatedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...serviceEntries, ...productEntries, ...articleEntries];
}
