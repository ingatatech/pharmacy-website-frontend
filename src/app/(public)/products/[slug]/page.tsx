import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError, resolveUploadUrl } from "@/lib/api";
import type { Product } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/lib/language-context";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/api/products/${slug}`, { next: { revalidate: 120 } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return {};
  }
  return {
    title: product.metaTitle || `${product.name} | Ingata Pharmacy`,
    description: product.metaDescription || product.generalUse || undefined,
  };
}

const DETAIL_SECTIONS: { key: keyof Product; label: string }[] = [
  { key: "generalDescription", label: "Overview" },
  { key: "generalUse", label: "What it's used for" },
  { key: "dosageInformation", label: "Dosage" },
  { key: "precautions", label: "Precautions" },
  { key: "storageInformation", label: "Storage" },
];

const SPEC_ROWS: { key: keyof Product; label: string }[] = [
  { key: "brandName", label: "Brand" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "activeIngredient", label: "Active ingredient" },
  { key: "formStrength", label: "Form & strength" },
];

function statusLabel(status: Product["availabilityStatus"]) {
  if (status === "in_stock") return { label: "In stock", dot: "bg-emerald-500" };
  if (status === "out_of_stock") return { label: "Out of stock", dot: "bg-slate-300" };
  return { label: "Check availability with your branch", dot: "bg-amber-400" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const status = statusLabel(product.availabilityStatus);
  const specs = SPEC_ROWS.filter(({ key }) => product[key]);

  return (
    <>
      <PageHeader
        eyebrow={product.category?.name || "Product"}
        title={product.name}
        variant="pattern"
        image="/images/product-hero-bg.jpg"
      />

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-24">
          <div>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image
                src={product.imageUrl ? resolveUploadUrl(product.imageUrl) : "/images/bg.png"}
                alt=""
                fill
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-contain p-10"
              />
              {product.requiresPrescription && (
                <span className="absolute left-4 top-4 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  <T text="Prescription required" />
                </span>
              )}
            </div>

            {specs.length > 0 && (
              <dl className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {specs.map(({ key, label }) => (
                  <div key={key} className="flex justify-between gap-4 px-5 py-3 text-sm">
                    <dt className="text-slate-500">
                      <T text={label} />
                    </dt>
                    <dd className="text-right font-medium text-slate-900">{String(product[key])}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-6 flex items-center gap-1.5 text-sm text-slate-500">
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              <T text={status.label} />
            </div>
          </div>

          <div>
            {product.brandName && (
              <span className="text-sm font-medium uppercase tracking-wide text-slate-400">
                {product.brandName}
              </span>
            )}

            <div className="mt-8 space-y-10">
              {DETAIL_SECTIONS.map(({ key, label }) => {
                const value = product[key];
                if (!value || typeof value !== "string") return null;
                return (
                  <div key={key}>
                    <h2 className="font-display text-xl font-semibold text-slate-900">
                      <T text={label} />
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                      <T text={value} />
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
              >
                <T text="Ask about this product" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900"
              >
                ← <T text="Back to products" />
              </Link>
            </div>

            <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
              <T text="Product information is provided for general informational purposes. Product availability, packaging, formulations, indications, precautions and other information may change. Please consult a pharmacist or qualified healthcare professional for advice appropriate to your individual circumstances." />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
