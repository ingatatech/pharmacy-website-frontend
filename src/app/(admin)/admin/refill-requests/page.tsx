"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { RefillRequest, RefillRequestStatus } from "@/types";

const STATUSES: RefillRequestStatus[] = ["submitted", "under_review", "approved", "completed", "rejected"];
const PAGE_SIZE = 15;

export default function AdminRefillRequestsPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [requests, setRequests] = useState<RefillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RefillRequestStatus | "all">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    apiFetch<RefillRequest[]>("/api/prescription-refill/admin/all", {}, token)
      .then(setRequests)
      .catch(() => showToast("error", "Failed to load refill requests."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleStatusChange(id: string, status: RefillRequestStatus) {
    if (!token) return;
    const previous = requests;
    setRequests((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await apiFetch(`/api/prescription-refill/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      showToast("success", "Status updated.");
    } catch (error) {
      setRequests(previous);
      showToast("error", error instanceof ApiError ? error.message : "Failed to update status.");
    }
  }

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const columns: Column<RefillRequest>[] = [
    { header: "Name", cell: (r) => <span className="font-medium text-slate-900">{r.fullName}</span> },
    { header: "Phone", cell: (r) => r.phoneNumber },
    { header: "Medication", cell: (r) => r.medicationName || <span className="text-slate-400">—</span> },
    { header: "Branch", cell: (r) => r.preferredBranch || <span className="text-slate-400">—</span> },
    {
      header: "Submitted",
      cell: (r) => new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      header: "Status",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status} set="refill" />
          <select
            value={r.status}
            onChange={(e) => handleStatusChange(r.id, e.target.value as RefillRequestStatus)}
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
      <h1 className="font-display text-2xl font-semibold text-slate-900">Refill requests</h1>
      <p className="mt-1 text-sm text-slate-500">Prescription refill requests submitted through the public site.</p>

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
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No refill requests here."
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
