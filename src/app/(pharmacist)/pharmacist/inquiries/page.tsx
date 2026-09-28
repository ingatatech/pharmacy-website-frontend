"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { NoBranchNotice } from "@/components/pharmacist/NoBranchNotice";
import { timeAgo } from "@/lib/text";
import type { ContactInquiry } from "@/types";

const STATUSES: ContactInquiry["status"][] = ["new", "in_progress", "resolved"];

/**
 * Enquiries for this pharmacist's branch only, via
 * GET /api/pharmacist/inquiries — filtered server-side by the caller's
 * locationId, exactly like the refills list.
 */
export default function PharmacistInquiriesPage() {
  const { token, user } = useAuth();
  const showToast = useToast();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return Promise.resolve();
    return apiFetch<ContactInquiry[]>("/api/pharmacist/inquiries?limit=100", {}, token)
      .then(setInquiries)
      .catch(() => showToast("error", "Failed to load enquiries."));
  }, [token, showToast]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function setStatus(inquiry: ContactInquiry, status: ContactInquiry["status"]) {
    if (!token) return;
    setBusyId(inquiry.id);
    try {
      await apiFetch<ContactInquiry>(`/api/pharmacist/inquiries/${inquiry.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, token);
      showToast("success", `Marked as ${status.replace(/_/g, " ")}.`);
      await load();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to update this enquiry.");
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<ContactInquiry>[] = [
    { header: "From", cell: (i) => <span className="font-medium text-slate-900">{i.fullName}</span> },
    { header: "Subject", cell: (i) => <div><p className="text-slate-800">{i.subject ?? "—"}</p><p className="line-clamp-2 text-xs text-slate-500">{i.message}</p></div> },
    { header: "Contact", cell: (i) => <div><p>{i.phoneNumber}</p>{i.email && <p className="text-xs text-slate-400">{i.email}</p>}</div> },
    { header: "Received", cell: (i) => timeAgo(i.createdAt) },
    { header: "Status", cell: (i) => <StatusBadge status={i.status} set="contact" /> },
    {
      header: "",
      className: "text-right",
      cell: (i) => (
        <select
          value={i.status}
          disabled={busyId === i.id}
          onChange={(e) => void setStatus(i, e.target.value as ContactInquiry["status"])}
          aria-label={`Update status for enquiry from ${i.fullName}`}
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
      <h1 className="font-display text-2xl font-semibold text-slate-900">Enquiries</h1>
      <p className="mt-1 text-sm text-slate-500">Messages received for your branch.</p>

      {!user?.locationId && <NoBranchNotice />}

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={inquiries}
          rowKey={(i) => i.id}
          loading={loading}
          emptyMessage="No enquiries for your branch."
        />
      </div>
    </div>
  );
}
