"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { SlugField } from "@/components/admin/SlugField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Category, Service } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";
const textareaClass = `${inputClass} min-h-[6rem]`;

type FormState = {
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription: string;
  imageUrl: string | null;
  keyBenefit: string;
  intendedCustomers: string;
  requirements: string;
  process: string;
  limitations: string;
  categoryId: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
};

function toFormState(service?: Service): FormState {
  return {
    name: service?.name || "",
    slug: service?.slug || "",
    shortDescription: service?.shortDescription || "",
    detailedDescription: service?.detailedDescription || "",
    imageUrl: service?.imageUrl || null,
    keyBenefit: service?.keyBenefit || "",
    intendedCustomers: service?.intendedCustomers || "",
    requirements: service?.requirements || "",
    process: service?.process || "",
    limitations: service?.limitations || "",
    categoryId: service?.category?.id || "",
    metaTitle: service?.metaTitle || "",
    metaDescription: service?.metaDescription || "",
    isPublished: service?.isPublished ?? true,
  };
}

export function ServiceForm({ service }: { service?: Service }) {
  const { token } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const [form, setForm] = useState<FormState>(toFormState(service));
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Category[]>("/api/categories?type=service")
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
      shortDescription: form.shortDescription,
      detailedDescription: form.detailedDescription || null,
      imageUrl: form.imageUrl,
      keyBenefit: form.keyBenefit || null,
      intendedCustomers: form.intendedCustomers || null,
      requirements: form.requirements || null,
      process: form.process || null,
      limitations: form.limitations || null,
      categoryId: form.categoryId || null,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
      isPublished: form.isPublished,
    };

    try {
      if (service) {
        await apiFetch(`/api/services/${service.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        showToast("success", "Service updated.");
      } else {
        await apiFetch("/api/services", { method: "POST", body: JSON.stringify(payload) }, token);
        showToast("success", "Service created.");
      }
      router.push("/admin/services");
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
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <SlugField value={form.slug} onChange={(value) => set("slug", value)} sourceValue={form.name} />

        <div className="sm:col-span-2">
          <label htmlFor="shortDescription" className={labelClass}>
            Short description
          </label>
          <textarea
            id="shortDescription"
            value={form.shortDescription}
            onChange={(event) => set("shortDescription", event.target.value)}
            required
            rows={2}
            className={`mt-1.5 ${textareaClass}`}
          />
          <p className="mt-1 text-xs text-slate-400">Shown on service cards across the site.</p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="detailedDescription" className={labelClass}>
            Detailed description
          </label>
          <textarea
            id="detailedDescription"
            value={form.detailedDescription}
            onChange={(event) => set("detailedDescription", event.target.value)}
            rows={4}
            className={`mt-1.5 ${textareaClass}`}
          />
        </div>

        <div className="sm:col-span-2">
          <ImageUploadField label="Image" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
        </div>

        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Category
          </label>
          <select
            id="categoryId"
            value={form.categoryId}
            onChange={(event) => set("categoryId", event.target.value)}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => set("isPublished", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            Published (visible on the public site)
          </label>
        </div>
      </div>

      <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <h2 className="font-display text-base font-semibold text-slate-900 sm:col-span-2">Detail page content</h2>
        {(
          [
            ["keyBenefit", "Key benefit"],
            ["intendedCustomers", "Who it's for"],
            ["requirements", "What you'll need"],
            ["process", "How it works"],
            ["limitations", "Good to know"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="sm:col-span-2">
            <label htmlFor={key} className={labelClass}>
              {label}
            </label>
            <textarea
              id={key}
              value={form[key]}
              onChange={(event) => set(key, event.target.value)}
              rows={2}
              className={`mt-1.5 ${textareaClass}`}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <h2 className="font-display text-base font-semibold text-slate-900 sm:col-span-2">SEO</h2>
        <div>
          <label htmlFor="metaTitle" className={labelClass}>
            Meta title
          </label>
          <input
            id="metaTitle"
            type="text"
            value={form.metaTitle}
            onChange={(event) => set("metaTitle", event.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="metaDescription" className={labelClass}>
            Meta description
          </label>
          <input
            id="metaDescription"
            type="text"
            value={form.metaDescription}
            onChange={(event) => set("metaDescription", event.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/services")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : service ? "Save changes" : "Create service"}
        </button>
      </div>
    </form>
  );
}
