"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Plus } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { timeAgo } from "@/lib/text";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import type { Article } from "@/types";

const STATUS_FILTERS = ["all", "pending_review", "approved", "published", "draft"] as const;

/**
 * The pharmacist's review queue: sign-off (approve/reject) on the ones awaiting
 * review, plus publishing once an article is approved.
 *
 * Deliberately not the full admin Articles screen — the authoring controls live
 * on the separate write-up screens — but publishing is part of this role: the
 * backend lets a pharmacist_reviewer publish anything they (or another
 * pharmacist) have already approved.
 */
export default function PharmacistArticlesPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toReject, setToReject] = useState<Article | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Article[]>("/api/articles/admin/all", {}, token)
      .then(setArticles)
      .catch(() => showToast("error", "Failed to load articles."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function runAction(article: Article, action: "approve" | "reject" | "publish") {
    if (!token) return;
    setBusyId(article.id);
    try {
      await apiFetch<Article>(`/api/articles/${article.id}/${action}`, { method: "POST" }, token);
      setToReject(null);
      const messages = {
        // Approving is NOT publishing: the article still needs a publish step,
        // which is exactly why this queue offers both buttons.
        approve: `Approved "${article.title}" — it is ready to publish.`,
        reject: `Sent "${article.title}" back to draft.`,
        publish: `"${article.title}" is now live on the public site.`,
      } as const;
      showToast("success", messages[action]);
      // Refetch rather than splicing: a rejection sends the article back to
      // draft and reordering (publish sorts by publishedAt) would otherwise
      // need manual handling here.
      setArticles(await apiFetch<Article[]>("/api/articles/admin/all", {}, token));
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : `Failed to ${action} this article.`);
    } finally {
      setBusyId(null);
    }
  }

  const visible = filter === "all" ? articles : articles.filter((a) => a.status === filter);

  const columns: Column<Article>[] = [
    {
      header: "Title",
      cell: (a) => (
        <Link href={`/pharmacist/articles/${a.id}`} className="font-medium text-slate-900 hover:text-teal-700">
          {a.title}
        </Link>
      ),
    },
    { header: "Author", cell: (a) => a.author.fullName },
    { header: "Status", cell: (a) => <StatusBadge status={a.status} set="article" /> },
    { header: "Updated", cell: (a) => timeAgo(a.updatedAt) },
    {
      header: "",
      className: "text-right",
      // Matches the backend: approve/reject accept only pending_review, publish
      // takes anything that is not live yet, and a live article just links out.
      cell: (a) => {
        if (a.status === "published") {
          return (
            <div className="flex justify-end">
              <Link
                href={`/articles/${a.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                View live
              </Link>
            </div>
          );
        }

        // Review decisions stay on pending_review; every other live-able state
        // gets a Publish button, matching the backend, which lets either staff
        // role publish from any status.
        if (a.status === "pending_review") {
          return (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setToReject(a)}
                disabled={busyId === a.id}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-300 px-2.5 text-xs font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => void runAction(a, "approve")}
                disabled={busyId === a.id}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-teal-700 px-2.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-teal-800 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </button>
            </div>
          );
        }

        return (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void runAction(a, "publish")}
              disabled={busyId === a.id}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {busyId === a.id ? "Publishing…" : "Publish"}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Articles</h1>
          <p className="mt-1 text-sm text-slate-500">Medical content awaiting your sign-off before publication.</p>
        </div>
        <Link
          href="/pharmacist/articles/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New article
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-150 ${
              filter === status
                ? "bg-teal-700 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={visible}
          rowKey={(a) => a.id}
          loading={loading}
          emptyMessage="No articles match this filter."
        />
      </div>

      <ConfirmDialog
        open={!!toReject}
        title="Send this article back to draft?"
        description={
          toReject
            ? `"${toReject.title}" will return to draft and its author will need to revise and resubmit it.`
            : ""
        }
        confirmLabel="Send back"
        busyLabel="Sending…"
        busy={busyId === toReject?.id}
        onConfirm={() => toReject && void runAction(toReject, "reject")}
        onCancel={() => setToReject(null)}
      />
    </div>
  );
}
