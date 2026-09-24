"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import type { Faq } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";

export function FaqForm({ faq }: { faq?: Faq }) {
  const { token } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const [question, setQuestion] = useState(faq?.question || "");
  const [answer, setAnswer] = useState(faq?.answer || "");
  const [displayOrder, setDisplayOrder] = useState(faq?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState(faq?.isPublished ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);

    const payload = { question, answer, displayOrder, isPublished };

    try {
      if (faq) {
        await apiFetch(`/api/faqs/${faq.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        showToast("success", "FAQ updated.");
      } else {
        await apiFetch("/api/faqs", { method: "POST", body: JSON.stringify(payload) }, token);
        showToast("success", "FAQ created.");
      }
      router.push("/admin/faqs");
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
        <label htmlFor="question" className={labelClass}>
          Question
        </label>
        <input id="question" type="text" value={question} onChange={(e) => setQuestion(e.target.value)} required className={`mt-1.5 ${inputClass}`} />
      </div>

      <div>
        <label htmlFor="answer" className={labelClass}>
          Answer
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          rows={4}
          className={`mt-1.5 ${inputClass} min-h-[6rem]`}
        />
      </div>

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
          onClick={() => router.push("/admin/faqs")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : faq ? "Save changes" : "Create FAQ"}
        </button>
      </div>
    </form>
  );
}
