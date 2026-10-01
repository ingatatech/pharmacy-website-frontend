"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Send, XCircle } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { SlugField } from "@/components/admin/SlugField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { TagsInput } from "@/components/admin/TagsInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Article } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";

export function ArticleForm({ article, onSaved }: { article?: Article; onSaved?: (article: Article) => void }) {
  const { token, user } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [content, setContent] = useState(article?.content || "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(article?.featuredImageUrl || null);
  const [category, setCategory] = useState(article?.category || "");
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription || "");
  const [saving, setSaving] = useState(false);
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // This form is only rendered by admin-only routes, so a pharmacist_reviewer
  // can never reach it — they review from /pharmacist/articles. The role check
  // stays as a defence in depth rather than an access control.
  const isAdmin = user?.role === "admin";
  const readOnly = !isAdmin;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || readOnly) return;
    setSaving(true);

    const payload = {
      title,
      slug,
      content,
      featuredImageUrl,
      category: category || null,
      tags,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    };

    try {
      if (article) {
        const updated = await apiFetch<Article>(`/api/articles/${article.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        showToast("success", "Article updated.");
        onSaved?.(updated);
      } else {
        const created = await apiFetch<Article>("/api/articles", { method: "POST", body: JSON.stringify(payload) }, token);
        showToast("success", "Article created as a draft.");
        router.push(`/admin/articles/${created.id}`);
      }
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function runWorkflowAction(action: "submit-for-review" | "approve" | "reject" | "publish") {
    if (!article || !token) return;
    setWorkflowBusy(true);
    try {
      const updated = await apiFetch<Article>(`/api/articles/${article.id}/${action}`, { method: "POST" }, token);
      showToast("success", "Article status updated.");
      onSaved?.(updated);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Action failed.");
    } finally {
      setWorkflowBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {article && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <StatusBadge status={article.status} set="article" />
            <span className="text-xs text-slate-400">
              by {article.author?.fullName}
              {article.reviewer && ` · reviewed by ${article.reviewer.fullName}`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && article.status === "draft" && (
              <button
                type="button"
                onClick={() => runWorkflowAction("submit-for-review")}
                disabled={workflowBusy}
                className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-amber-600 disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                Submit for review
              </button>
            )}
            {isAdmin && article.status === "approved" && (
              <button
                type="button"
                onClick={() => runWorkflowAction("publish")}
                disabled={workflowBusy}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Publish
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={readOnly} className="space-y-6 disabled:opacity-70">
          <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className={labelClass}>
                Title
              </label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={`mt-1.5 ${inputClass}`} />
            </div>
            <SlugField value={slug} onChange={setSlug} sourceValue={title} />
            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <input id="category" type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={`mt-1.5 ${inputClass}`} placeholder="e.g. Health Tips" />
            </div>
            <div className="sm:col-span-2">
              <TagsInput label="Tags" values={tags} onChange={setTags} />
            </div>
            <div className="sm:col-span-2">
              <ImageUploadField label="Featured image" value={featuredImageUrl} onChange={setFeaturedImageUrl} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className={labelClass}>
                Content
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800"
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? "Hide preview" : "Preview"}
              </button>
            </div>
            {showPreview ? (
              <div className="mt-1.5 whitespace-pre-line rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                {content || <span className="text-slate-400">Nothing to preview yet.</span>}
              </div>
            ) : (
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={14}
                className={`mt-1.5 ${inputClass} font-mono`}
              />
            )}
            <p className="mt-1.5 text-xs text-slate-400">
              Plain text — line breaks are preserved as-is on the public site.
            </p>
          </div>

          <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
            <h2 className="font-display text-base font-semibold text-slate-900 sm:col-span-2">SEO</h2>
            <div>
              <label htmlFor="metaTitle" className={labelClass}>
                Meta title
              </label>
              <input id="metaTitle" type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={`mt-1.5 ${inputClass}`} />
            </div>
            <div>
              <label htmlFor="metaDescription" className={labelClass}>
                Meta description
              </label>
              <input id="metaDescription" type="text" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={`mt-1.5 ${inputClass}`} />
            </div>
          </div>
        </fieldset>

        {!readOnly && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/articles")}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : article ? "Save changes" : "Create draft"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
