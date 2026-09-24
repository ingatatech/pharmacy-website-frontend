"use client";

import { useEffect, useState } from "react";
import { apiFetchPaginated } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { DataTable, type Column } from "@/components/admin/DataTable";
import type { AuditLog } from "@/types";

const PAGE_SIZE = 25;

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-slate-100 text-slate-700",
  POST: "bg-emerald-100 text-emerald-800",
  PATCH: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-700",
};

export default function AdminAuditLogPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    apiFetchPaginated<AuditLog[]>(`/api/audit-logs?page=${page}&limit=${PAGE_SIZE}`, {}, token)
      .then(({ data, total }) => {
        setEntries(data);
        setTotal(total);
      })
      .finally(() => setLoading(false));
  }, [token, page]);

  const columns: Column<AuditLog>[] = [
    {
      header: "Method",
      cell: (e) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${METHOD_STYLES[e.method] || "bg-slate-100 text-slate-700"}`}>
          {e.method}
        </span>
      ),
    },
    { header: "Path", cell: (e) => <span className="font-mono text-xs text-slate-600">{e.path}</span> },
    {
      header: "Status",
      cell: (e) => (
        <span className={e.statusCode >= 400 ? "font-medium text-red-600" : "text-slate-600"}>{e.statusCode}</span>
      ),
    },
    { header: "Actor", cell: (e) => e.actor?.fullName || <span className="text-slate-400">Anonymous</span> },
    {
      header: "When",
      cell: (e) => new Date(e.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Audit log</h1>
      <p className="mt-1 text-sm text-slate-500">Every write request made through the API.</p>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={entries}
          rowKey={(e) => e.id}
          loading={loading}
          emptyMessage="No activity recorded yet."
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
