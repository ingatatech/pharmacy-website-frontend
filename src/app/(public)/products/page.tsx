import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/products/ProductCard";
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

export default async function ProductsPage() {
  const products = await getProducts();

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
          {products.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              <T text="Products will be listed here shortly. In the meantime, call your nearest branch for availability." />
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
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
