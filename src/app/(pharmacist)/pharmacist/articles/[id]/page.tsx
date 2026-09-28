"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import type { Article } from "@/types";

/**
 * Read-only article view for a reviewer.
 *
 * The admin version of this page is an editing form; this one is not. A
 * pharmacist_reviewer has no update permission on articles, so presenting edit
 * controls would only produce 403s. What they can do is read it in full and
 * sign it off, which is what the actions below do.
 */
export default function PharmacistArticleDetailPage() {
  const params = useParams<{ id: string }>();
  // Pulled into its own const so the callback below depends on the id itself.
  // Depending on `params?.id` while the compiler infers a dependency on the
  // whole `params` object is "less specific than source", which it rejects.
  const articleId = params?.id;
  const { token } = useAuth();
  const showToast = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toReject, setToReject] = useState(false);

  const load = useCallback(() => {
    if (!token || !articleId) return Promise.resolve();
    return apiFetch<Article[]>("/api/articles/admin/all", {}, token)
      .then((all) => {
        const match = all.find((a) => a.id === articleId) ?? null;
        setArticle(match);
        // Distinguishing "no such article" from "not permitted" isn't possible
        // with this endpoint — it returns the whole list — so an unknown id
        // reads the same as a real one the reviewer can't see.
        setNotFound(!match);
      })
      .catch(() => showToast("error", "Failed to load article."));
  }, [token, articleId, showToast]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function runAction(action: "approve" | "reject") {
    if (!token || !article) return;
    setBusy(true);
    try {
      await apiFetch<Article>(`/api/articles/${article.id}/${action}`, { method: "POST" }, token);
      setToReject(false);
      showToast("success", action === "approve" ? "Article approved." : "Article sent back to draft.");
      await load();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : `Failed to ${action} this article.`);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading article…</p>;

  if (notFound || !article) {
    return (
      <div>
        <Link href="/pharmacist/articles" className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-800">
          <ArrowLeft className="h-4 w-4" /> Back to articles
        </Link>
        <p className="mt-6 text-sm text-slate-500">That article doesn&apos;t exist, or isn&apos;t visible to you.</p>
      </div>
    );
  }

  const pending = article.status === "pending_review";

  return (
    <div>
      <Link href="/pharmacist/articles" className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-800">
        <ArrowLeft className="h-4 w-4" /> Back to articles
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-slate-900">{article.title}</h1>
            <StatusBadge status={article.status} set="article" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            by {article.author.fullName}
            {article.category && ` · ${article.category}`}
          </p>
        </div>

        {pending && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setToReject(true)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => void runAction("approve")}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-800 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </button>
          </div>
        )}
      </div>

      <article className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <div
          className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700"
          // The content is HTML authored by admins in a rich-text field. It is
          // sanitised on the way in (see the admin article form), and the same
          // markup is rendered on the public article page, so it is displayed
          // the same way here rather than escaped into invisibility.
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      <ConfirmDialog
        open={toReject}
        title="Send this article back to draft?"
        description={`"${article.title}" will return to draft and its author will need to revise and resubmit it.`}
        confirmLabel="Send back"
        busyLabel="Sending…"
        busy={busy}
        onConfirm={() => void runAction("reject")}
        onCancel={() => setToReject(false)}
      />
    </div>
  );
}
