"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
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
 * The pharmacist's read-only view of every article, with approve/reject on the
 * ones awaiting review.
 *
 * Deliberately not the admin Articles screen with buttons hidden: the backend
 * only lets a pharmacist_reviewer call list-all plus approve/reject, so the
 * edit/create/publish controls would all 403. Read plus sign-off is the whole
 * of what this role can do.
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

  async function runAction(article: Article, action: "approve" | "reject") {
    if (!token) return;
    setBusyId(article.id);
    try {
      await apiFetch<Article>(`/api/articles/${article.id}/${action}`, { method: "POST" }, token);
      setToReject(null);
      showToast(
        "success",
        action === "approve" ? `Approved "${article.title}".` : `Sent "${article.title}" back to draft.`
      );
      // Refetch rather than splicing: the approve/reject responses omit the
      // nested author/reviewer relations this table renders.
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
      // Only pending_review items get the inline actions, matching the
      // backend: both endpoints reject anything else with 400.
      cell: (a) =>
        a.status === "pending_review" ? (
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
        ) : (
          <span className="text-xs text-slate-300">—</span>
        ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Articles</h1>
          <p className="mt-1 text-sm text-slate-500">Medical content awaiting your sign-off before publication.</p>
        </div>
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
