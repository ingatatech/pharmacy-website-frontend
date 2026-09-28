"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Inbox,
  MessageSquare,
  UserCircle,
  XCircle,
} from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { excerpt, timeAgo } from "@/lib/text";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { KpiCard } from "@/components/admin/charts/KpiCard";
import { StatusDonutChart } from "@/components/admin/charts/StatusDonutChart";
import { NoBranchNotice } from "@/components/pharmacist/NoBranchNotice";
import type { Article, ContactInquiry, RefillRequest } from "@/types";

const ARTICLE_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  pending_review: "#f59e0b",
  approved: "#0d9488",
  published: "#10b981",
};

const STATUS_ORDER = ["draft", "pending_review", "approved", "published"] as const;

const YOUR_REVIEWS_LIMIT = 5;

// The pharmacist's landing page. Two data sources, both scoped to them:
// GET /api/articles/admin/all for the review queue (the only article endpoint
// the backend grants a pharmacist_reviewer besides approve/reject), and the
// /api/pharmacist/* endpoints for the branch's refill requests and enquiries.
//
// The review queue is the point of the screen: rather than sending a reviewer
// to a filtered table and making them click through to a detail page per
// article, pending items are listed oldest-first with approve/reject inline.
// Approval is a one-click action here (as it is on the detail page); rejection
// is behind a confirm dialog, since it silently knocks the article back to
// draft and the author has to resubmit it.
export function PharmacistDashboard() {
  const { token, user } = useAuth();
  const showToast = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toReject, setToReject] = useState<Article | null>(null);
  // Branch-scoped operational data. Separate state from `articles` because it
  // comes from different, independently-failing endpoints — a branch fetch
  // error shouldn't blank out the review queue, and vice versa.
  const [branchCounts, setBranchCounts] = useState<{
    refills: RefillRequest[];
    inquiries: ContactInquiry[];
  }>({ refills: [], inquiries: [] });

  const branch = user?.location?.branchName;

  // Re-reads the article list after a workflow action. The initial load below
  // deliberately inlines its own fetch chain instead of calling this, because
  // routing the setState through a function makes react-hooks/set-state-in-effect
  // fire on the effect body.
  async function refresh() {
    if (!token) return;
    try {
      setArticles(await apiFetch<Article[]>("/api/articles/admin/all", {}, token));
    } catch {
      showToast("error", "Failed to load articles.");
    }
  }

  useEffect(() => {
    if (!token) return;
    apiFetch<Article[]>("/api/articles/admin/all", {}, token)
      .then(setArticles)
      .catch(() => showToast("error", "Failed to load articles."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Both lists are already filtered to this pharmacist's branch by the
  // backend, so no client-side branch filtering is needed (or wanted) here.
  useEffect(() => {
    if (!token) return;

    Promise.all([
      apiFetch<RefillRequest[]>("/api/pharmacist/refills?limit=100", {}, token).catch(() => [] as RefillRequest[]),
      apiFetch<ContactInquiry[]>("/api/pharmacist/inquiries?limit=100", {}, token).catch(() => [] as ContactInquiry[]),
    ]).then(([refills, inquiries]) => {
      setBranchCounts({ refills, inquiries });
    });
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
      // Deliberately a refetch rather than splicing the response into the array:
      // articleService.approve and .reject return the bare row without the
      // nested author/reviewer relations this list renders, so using that
      // response directly would leave those fields undefined.
      await refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : `Failed to ${action} this article.`);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading review queue…</p>;
  }

  const pending = articles
    .filter((a) => a.status === "pending_review")
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  const approved = articles.filter((a) => a.status === "approved");
  const published = articles.filter((a) => a.status === "published");
  // Kept uncapped for the KPI count; only the rendered list is truncated.
  const reviewedByMe = articles
    .filter((a) => a.reviewer?.id === user?.id)
    .sort((a, b) => new Date(b.lastReviewedAt || b.updatedAt).getTime() - new Date(a.lastReviewedAt || a.updatedAt).getTime());
  const myReviews = reviewedByMe.slice(0, YOUR_REVIEWS_LIMIT);

  const statusBreakdown = STATUS_ORDER.map((status) => ({
    label: status.replace(/_/g, " "),
    value: articles.filter((a) => a.status === status).length,
    color: ARTICLE_COLORS[status],
  }));

  // Branch-scoped counts. Fetched separately from the articles above because
  // they come from the /api/pharmacist/* endpoints, which the backend filters
  // to this pharmacist's own branch.
  const openRefills = branchCounts.refills.filter((r) => r.status === "submitted" || r.status === "under_review").length;
  const openInquiries = branchCounts.inquiries.filter((i) => i.status === "new" || i.status === "in_progress").length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Review queue</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user?.fullName?.split(" ")[0]}. Medical content is published only after you sign off on it.
          </p>
        </div>
        <Link
          href="/pharmacist/articles"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          <FileText className="h-4 w-4" />
          All articles
        </Link>
      </div>

      {!branch && <NoBranchNotice />}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={ClipboardCheck}
          label="Awaiting your review"
          value={pending.length}
          hint={pending.length === 0 ? "all caught up" : "oldest first"}
        />
        <KpiCard icon={CheckCircle2} label="Approved" value={approved.length} hint="waiting to be published" />
        <KpiCard icon={FileText} label="Published" value={published.length} hint={`${articles.length} total`} />
        <KpiCard icon={UserCircle} label="Reviewed by you" value={reviewedByMe.length} hint="approved and signed off" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-2">
        <Link
          href="/pharmacist/refills"
          className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-150 hover:border-teal-300"
        >
          <div className="flex items-center gap-2 text-slate-500">
            <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-xs font-medium uppercase tracking-wide">Branch refill requests</span>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-900">{openRefills}</p>
          <p className="text-xs text-slate-500">awaiting a decision{branch ? ` at ${branch}` : ""}</p>
        </Link>
        <Link
          href="/pharmacist/inquiries"
          className="rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-150 hover:border-teal-300"
        >
          <div className="flex items-center gap-2 text-slate-500">
            <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-xs font-medium uppercase tracking-wide">Branch enquiries</span>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-900">{openInquiries}</p>
          <p className="text-xs text-slate-500">still open{branch ? ` at ${branch}` : ""}</p>
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900">Awaiting review</h2>
            <p className="mt-0.5 text-xs text-slate-500">Oldest submissions first.</p>
          </div>
          {pending.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
              {pending.length} pending
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <Inbox className="h-7 w-7 text-slate-300" strokeWidth={1.75} />
            <p className="text-sm font-medium text-slate-700">Nothing waiting for review</p>
            <p className="max-w-sm text-xs text-slate-500">
              New submissions will appear here as soon as an admin sends them for review.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pending.map((article) => {
              const busy = busyId === article.id;
              return (
                <li key={article.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/pharmacist/articles/${article.id}`}
                          className="font-medium text-slate-900 hover:text-teal-700"
                        >
                          {article.title}
                        </Link>
                        <StatusBadge status={article.status} set="article" />
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {excerpt(article.content, 220)}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        by {article.author.fullName}
                        {article.category && ` · ${article.category}`}
                        {` · waiting ${timeAgo(article.updatedAt)}`}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/pharmacist/articles/${article.id}`}
                        className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
                      >
                        Read
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToReject(article)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:opacity-60"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => void runAction(article, "approve")}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-teal-800 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-display text-sm font-semibold text-slate-900">Your recent reviews</h2>
            <Link href="/pharmacist/articles" className="text-xs font-medium text-teal-700 hover:text-teal-800">
              View all
            </Link>
          </div>
          {myReviews.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">
              You haven&apos;t approved an article yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {myReviews.map((article) => (
                <li key={article.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <Link
                    href={`/pharmacist/articles/${article.id}`}
                    className="min-w-0 truncate text-sm font-medium text-slate-900 hover:text-teal-700"
                  >
                    {article.title}
                  </Link>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={article.status} set="article" />
                    <span className="text-xs text-slate-400">
                      {article.lastReviewedAt ? timeAgo(article.lastReviewedAt) : "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <StatusDonutChart title="Articles by status" data={statusBreakdown} />
      </div>

      <ConfirmDialog
        open={!!toReject}
        title="Send this article back to draft?"
        description={
          toReject
            ? `"${toReject.title}" will return to draft and its author will need to revise and resubmit it. Your decision is recorded as the last review date.`
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
