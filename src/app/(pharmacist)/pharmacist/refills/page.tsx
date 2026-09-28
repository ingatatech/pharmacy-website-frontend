"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { NoBranchNotice } from "@/components/pharmacist/NoBranchNotice";
import type { RefillRequest } from "@/types";

const STATUSES: RefillRequest["status"][] = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "completed",
];

/**
 * Refill requests for this pharmacist's branch only.
 *
 * The list comes from GET /api/pharmacist/refills, which the backend already
 * filters by the caller's own locationId — there is no client-side branch
 * filter here, and no way to ask for a different branch. PATCHing a request id
 * belonging to another branch returns 404 by design.
 */
export default function PharmacistRefillsPage() {
  const { token, user } = useAuth();
  const showToast = useToast();
  const [requests, setRequests] = useState<RefillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return Promise.resolve();
    return apiFetch<RefillRequest[]>("/api/pharmacist/refills?limit=100", {}, token)
      .then(setRequests)
      .catch(() => showToast("error", "Failed to load refill requests."));
  }, [token, showToast]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function setStatus(request: RefillRequest, status: RefillRequest["status"]) {
    if (!token) return;
    setBusyId(request.id);
    try {
      await apiFetch<RefillRequest>(`/api/pharmacist/refills/${request.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, token);
      showToast("success", `Marked as ${status.replace(/_/g, " ")}.`);
      await load();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to update this request.");
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<RefillRequest>[] = [
    { header: "Patient", cell: (r) => <span className="font-medium text-slate-900">{r.fullName}</span> },
    {
      header: "Medication",
      cell: (r) => (
        <div>
          <p className="text-slate-800">{r.medicationName ?? "—"}</p>
          {r.prescriptionReference && <p className="text-xs text-slate-400">Ref {r.prescriptionReference}</p>}
        </div>
      ),
    },
    { header: "Contact", cell: (r) => <div><p>{r.phoneNumber}</p>{r.email && <p className="text-xs text-slate-400">{r.email}</p>}</div> },
    { header: "Status", cell: (r) => <StatusBadge status={r.status} set="refill" /> },
    {
      header: "",
      className: "text-right",
      cell: (r) => (
        <select
          value={r.status}
          disabled={busyId === r.id}
          onChange={(e) => void setStatus(r, e.target.value as RefillRequest["status"])}
          aria-label={`Update status for ${r.fullName}`}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Refill Requests</h1>
      <p className="mt-1 text-sm text-slate-500">
        Prescription refill requests submitted for your branch.
      </p>

      {!user?.locationId && <NoBranchNotice />}

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={requests}
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No refill requests for your branch."
        />
      </div>
    </div>
  );
}
