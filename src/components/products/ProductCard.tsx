import Image from "next/image";
import Link from "next/link";
import { Pill } from "lucide-react";
import type { Product } from "@/types";

function statusMeta(status: Product["availabilityStatus"]) {
  if (status === "in_stock") return { label: "In stock", dot: "bg-emerald-500" };
  if (status === "out_of_stock") return { label: "Out of stock", dot: "bg-slate-300" };
  return { label: "Check availability", dot: "bg-amber-400" };
}

// Shared between the homepage (if ever needed) and the full /products
// catalog. Deliberately plainer than ServiceCard — a retail listing reads
// better as an image-led grid than another icon-and-sweep treatment.
export function ProductCard({ product }: { product: Product }) {
  const status = statusMeta(product.availabilityStatus);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <Pill
            className="h-10 w-10 text-slate-300 transition-transform duration-500 ease-out group-hover:scale-105"
            strokeWidth={1.5}
          />
        )}
        {product.requiresPrescription && (
          <span className="absolute left-3 top-3 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
            Prescription required
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.brandName && (
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {product.brandName}
          </span>
        )}
        <h3 className="mt-1 font-display text-lg font-semibold text-slate-900">{product.name}</h3>
        {product.generalUse && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{product.generalUse}</p>
        )}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>
      </div>
    </Link>
  );
}
