"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Testimonial } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const { token } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const [customerName, setCustomerName] = useState(testimonial?.customerName || "");
  const [customerCategory, setCustomerCategory] = useState(testimonial?.customerCategory || "");
  const [starRating, setStarRating] = useState(testimonial?.starRating ?? 5);
  const [testimonialText, setTestimonialText] = useState(testimonial?.testimonialText || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(testimonial?.photoUrl ?? null);
  const [displayOrder, setDisplayOrder] = useState(testimonial?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState(testimonial?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);

    const payload = {
      customerName,
      customerCategory: customerCategory || null,
      starRating,
      testimonialText,
      photoUrl,
      displayOrder,
      isPublished,
    };

    try {
      if (testimonial) {
        await apiFetch(`/api/testimonials/${testimonial.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        showToast("success", "Testimonial updated.");
      } else {
        await apiFetch("/api/testimonials", { method: "POST", body: JSON.stringify(payload) }, token);
        showToast("success", "Testimonial created.");
      }
      router.push("/admin/testimonials");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        Only enter a quote a customer actually gave you and approved for publishing here. New testimonials save as
        unpublished by default — double-check with the customer before switching one live.
      </div>

      <div>
        <label htmlFor="customerName" className={labelClass}>
          Customer name
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          placeholder="e.g. Jane U."
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="customerCategory" className={labelClass}>
          Customer category <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="customerCategory"
          type="text"
          value={customerCategory}
          onChange={(e) => setCustomerCategory(e.target.value)}
          placeholder="e.g. Chronic-care customer"
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="starRating" className={labelClass}>
          Star rating
        </label>
        <select
          id="starRating"
          value={starRating}
          onChange={(e) => setStarRating(Number(e.target.value))}
          className={`mt-1.5 w-36 ${inputClass}`}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} {value === 1 ? "star" : "stars"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="testimonialText" className={labelClass}>
          Testimonial
        </label>
        <textarea
          id="testimonialText"
          value={testimonialText}
          onChange={(e) => setTestimonialText(e.target.value)}
          required
          rows={4}
          className={`mt-1.5 ${inputClass} min-h-[6rem]`}
        />
      </div>

      <ImageUploadField label="Photo (optional, only with the customer's permission)" value={photoUrl} onChange={setPhotoUrl} />

      <div className="flex items-center gap-6">
        <div>
          <label htmlFor="displayOrder" className={labelClass}>
            Display order
          </label>
          <input
            id="displayOrder"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className={`mt-1.5 w-24 ${inputClass}`}
          />
        </div>
        <label className="mt-6 inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
          />
          Published
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => router.push("/admin/testimonials")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : testimonial ? "Save changes" : "Create testimonial"}
        </button>
      </div>
    </form>
  );
}
