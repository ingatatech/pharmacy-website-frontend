"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { ContactInquiry, ContactInquiryStatus } from "@/types";

const STATUSES: ContactInquiryStatus[] = ["new", "in_progress", "resolved"];
const PAGE_SIZE = 15;

export default function AdminContactInquiriesPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ContactInquiryStatus | "all">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    apiFetch<ContactInquiry[]>("/api/contact/admin/all", {}, token)
      .then(setInquiries)
      .catch(() => showToast("error", "Failed to load contact inquiries."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleStatusChange(id: string, status: ContactInquiryStatus) {
    if (!token) return;
    const previous = inquiries;
    setInquiries((current) => current.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await apiFetch(`/api/contact/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      showToast("success", "Status updated.");
    } catch (error) {
      setInquiries(previous);
      showToast("error", error instanceof ApiError ? error.message : "Failed to update status.");
    }
  }

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const columns: Column<ContactInquiry>[] = [
    { header: "Name", cell: (i) => <span className="font-medium text-slate-900">{i.fullName}</span> },
    { header: "Email", cell: (i) => i.email },
    { header: "Subject", cell: (i) => i.subject || <span className="text-slate-400">—</span> },
    { header: "Message", className: "max-w-xs", cell: (i) => <span className="line-clamp-2 text-slate-600">{i.message}</span> },
    {
      header: "Submitted",
      cell: (i) => new Date(i.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      header: "Status",
      cell: (i) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={i.status} set="contact" />
          <select
            value={i.status}
            onChange={(e) => handleStatusChange(i.id, e.target.value as ContactInquiryStatus)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Contact inquiries</h1>
      <p className="mt-1 text-sm text-slate-500">Messages submitted through the public contact form.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors duration-150 ${
              filter === s ? "bg-teal-800 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={paged}
          rowKey={(i) => i.id}
          loading={loading}
          emptyMessage="No contact inquiries here."
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
