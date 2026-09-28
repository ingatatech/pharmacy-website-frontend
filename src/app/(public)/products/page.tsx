import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSearchBar } from "@/components/products/ProductSearchBar";
import { ClosingCta } from "@/components/home/ClosingCta";
import { T } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "Products | Ingata Pharmacy",
  description: "Medication and everyday health products available at Ingata Pharmacy.",
};

async function getProducts(): Promise<Product[]> {
  try {
    return await apiFetch<Product[]>("/api/products", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

function filterHref(params: { q?: string; category?: string }): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  const qs = search.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const products = await getProducts();

  const categoryCounts = new Map<string, { name: string; count: number }>();
  for (const product of products) {
    if (!product.category) continue;
    const existing = categoryCounts.get(product.category.slug);
    categoryCounts.set(product.category.slug, {
      name: product.category.name,
      count: (existing?.count || 0) + 1,
    });
  }

  const byCategory = category ? products.filter((product) => product.category?.slug === category) : products;

  const filtered = q
    ? byCategory.filter((product) => {
        const needle = q.toLowerCase();
        return [product.name, product.brandName, product.activeIngredient, product.generalUse, product.generalDescription]
          .filter((field): field is string => Boolean(field))
          .some((field) => field.toLowerCase().includes(needle));
      })
    : byCategory;

  return (
    <>
      <PageHeader
        eyebrow="Our catalog"
        title="Products"
        description="Genuine, quality-assured medication and everyday health products, sourced and verified at every branch."
        variant="image"
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <ProductSearchBar defaultValue={q} category={category} />

          {categoryCounts.size > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link
                href={filterHref({ q })}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  !category
                    ? "border-teal-800 bg-teal-800 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <T text="All" />
              </Link>
              {[...categoryCounts.entries()].map(([slug, { name, count }]) => {
                const active = category === slug;
                return (
                  <Link
                    key={slug}
                    href={filterHref({ q, category: slug })}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "border-teal-800 bg-teal-800 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <T text={name} /> <span className={active ? "text-teal-100" : "text-slate-400"}>({count})</span>
                  </Link>
                );
              })}
            </div>
          )}

          {(q || category) && (
            <div className="mx-auto mt-6 flex max-w-xl min-w-0 items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <span className="min-w-0 truncate">
                {q && (
                  <>
                    <T text="Results for" /> &quot;{q}&quot;
                  </>
                )}
                {q && category && " "}
                {category && (
                  <>
                    <T text="in" /> {categoryCounts.get(category)?.name}
                  </>
                )}
              </span>
              <Link
                href="/products"
                className="inline-flex shrink-0 items-center gap-1 font-medium text-teal-700 hover:text-teal-800"
              >
                <X className="h-3.5 w-3.5" />
                <T text="Clear" />
              </Link>
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="mt-10 text-center text-sm text-slate-500">
              <T
                text={
                  products.length === 0
                    ? "Products will be listed here shortly. In the meantime, call your nearest branch for availability."
                    : "No products match those filters. Try a different name, brand, ingredient or category."
                }
              />
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
