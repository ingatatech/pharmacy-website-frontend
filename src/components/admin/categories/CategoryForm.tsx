"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { SlugField } from "@/components/admin/SlugField";
import type { Category, CategoryType } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";

export function CategoryForm({ category }: { category?: Category }) {
  const { token } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [type, setType] = useState<CategoryType>(category?.type || "service");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);

    try {
      if (category) {
        await apiFetch(`/api/categories/${category.id}`, { method: "PATCH", body: JSON.stringify({ name, slug, type }) }, token);
        showToast("success", "Category updated.");
      } else {
        await apiFetch("/api/categories", { method: "POST", body: JSON.stringify({ name, slug, type }) }, token);
        showToast("success", "Category created.");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <SlugField value={slug} onChange={setSlug} sourceValue={name} />

      <div>
        <span className={labelClass}>Applies to</span>
        <div className="mt-1.5 flex gap-4">
          {(["service", "product"] as const).map((option) => (
            <label key={option} className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="type"
                checked={type === option}
                onChange={() => setType(option)}
                className="h-4 w-4 border-slate-300 text-teal-700 focus:ring-teal-600"
              />
              {option === "service" ? "Services" : "Products"}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : category ? "Save changes" : "Create category"}
        </button>
      </div>
    </form>
  );
}
