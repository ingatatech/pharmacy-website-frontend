"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { SlugField } from "@/components/admin/SlugField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Category, Product, ProductAvailabilityStatus } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";
const textareaClass = `${inputClass} min-h-[6rem]`;

type FormState = {
  name: string;
  slug: string;
  brandName: string;
  categoryId: string;
  generalDescription: string;
  generalUse: string;
  precautions: string;
  storageInformation: string;
  activeIngredient: string;
  formStrength: string;
  manufacturer: string;
  dosageInformation: string;
  requiresPrescription: boolean;
  availabilityStatus: ProductAvailabilityStatus;
  imageUrl: string | null;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
};

function toFormState(product?: Product): FormState {
  return {
    name: product?.name || "",
    slug: product?.slug || "",
    brandName: product?.brandName || "",
    categoryId: product?.category?.id || "",
    generalDescription: product?.generalDescription || "",
    generalUse: product?.generalUse || "",
    precautions: product?.precautions || "",
    storageInformation: product?.storageInformation || "",
    activeIngredient: product?.activeIngredient || "",
    formStrength: product?.formStrength || "",
    manufacturer: product?.manufacturer || "",
    dosageInformation: product?.dosageInformation || "",
    requiresPrescription: product?.requiresPrescription ?? false,
    availabilityStatus: product?.availabilityStatus || "unknown",
    imageUrl: product?.imageUrl || null,
    metaTitle: product?.metaTitle || "",
    metaDescription: product?.metaDescription || "",
    isPublished: product?.isPublished ?? true,
  };
}

export function ProductForm({ product }: { product?: Product }) {
  const { token } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const [form, setForm] = useState<FormState>(toFormState(product));
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Category[]>("/api/categories?type=product")
      .then(setCategories)
      .catch(() => {});
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      brandName: form.brandName || null,
      categoryId: form.categoryId || null,
      generalDescription: form.generalDescription || null,
      generalUse: form.generalUse || null,
      precautions: form.precautions || null,
      storageInformation: form.storageInformation || null,
      activeIngredient: form.activeIngredient || null,
      formStrength: form.formStrength || null,
      manufacturer: form.manufacturer || null,
      dosageInformation: form.dosageInformation || null,
      requiresPrescription: form.requiresPrescription,
      availabilityStatus: form.availabilityStatus,
      imageUrl: form.imageUrl,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
      isPublished: form.isPublished,
    };

    try {
      if (product) {
        await apiFetch(`/api/products/${product.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        showToast("success", "Product updated.");
      } else {
        await apiFetch("/api/products", { method: "POST", body: JSON.stringify(payload) }, token);
        showToast("success", "Product created.");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input id="name" type="text" value={form.name} onChange={(e) => set("name", e.target.value)} required className={`mt-1.5 ${inputClass}`} />
        </div>
        <SlugField value={form.slug} onChange={(value) => set("slug", value)} sourceValue={form.name} />

        <div>
          <label htmlFor="brandName" className={labelClass}>
            Brand name
          </label>
          <input
            id="brandName"
            type="text"
            value={form.brandName}
            onChange={(e) => set("brandName", e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Category
          </label>
          <select id="categoryId" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={`mt-1.5 ${inputClass}`}>
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <ImageUploadField label="Image" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
        </div>

        <div>
          <label htmlFor="availabilityStatus" className={labelClass}>
            Availability
          </label>
          <select
            id="availabilityStatus"
            value={form.availabilityStatus}
            onChange={(e) => set("availabilityStatus", e.target.value as ProductAvailabilityStatus)}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="in_stock">In stock</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="flex flex-col justify-end gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.requiresPrescription}
              onChange={(e) => set("requiresPrescription", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            Requires prescription
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => set("isPublished", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            Published
          </label>
        </div>
      </div>

      <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <h2 className="font-display text-base font-semibold text-slate-900 sm:col-span-2">Specifications</h2>
        <div>
          <label htmlFor="activeIngredient" className={labelClass}>
            Active ingredient
          </label>
          <input
            id="activeIngredient"
            type="text"
            value={form.activeIngredient}
            onChange={(e) => set("activeIngredient", e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="formStrength" className={labelClass}>
            Form &amp; strength
          </label>
          <input
            id="formStrength"
            type="text"
            value={form.formStrength}
            onChange={(e) => set("formStrength", e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="manufacturer" className={labelClass}>
            Manufacturer
          </label>
          <input
            id="manufacturer"
            type="text"
            value={form.manufacturer}
            onChange={(e) => set("manufacturer", e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        {(
          [
            ["generalDescription", "Overview"],
            ["generalUse", "What it's used for"],
            ["dosageInformation", "Dosage"],
            ["precautions", "Precautions"],
            ["storageInformation", "Storage"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="sm:col-span-2">
            <label htmlFor={key} className={labelClass}>
              {label}
            </label>
            <textarea id={key} value={form[key]} onChange={(e) => set(key, e.target.value)} rows={2} className={`mt-1.5 ${textareaClass}`} />
          </div>
        ))}
      </div>

      <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <h2 className="font-display text-base font-semibold text-slate-900 sm:col-span-2">SEO</h2>
        <div>
          <label htmlFor="metaTitle" className={labelClass}>
            Meta title
          </label>
          <input id="metaTitle" type="text" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={`mt-1.5 ${inputClass}`} />
        </div>
        <div>
          <label htmlFor="metaDescription" className={labelClass}>
            Meta description
          </label>
          <input
            id="metaDescription"
            type="text"
            value={form.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
