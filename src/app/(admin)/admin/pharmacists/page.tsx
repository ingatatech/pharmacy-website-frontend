"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Pencil, Stethoscope, Trash2 } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { User } from "@/types";

type Filter = "all" | "pharmacists" | "customers";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All users" },
  { value: "pharmacists", label: "Pharmacists" },
  { value: "customers", label: "Regular users" },
];

const PHARMACIST_ROLE = "pharmacist_reviewer";

/**
 * Where an admin turns a registered user into a pharmacist.
 *
 * The list is deliberately everyone, not just existing pharmacists: the whole
 * point of this screen is finding the person who signed up and hasn't been
 * given portal access yet. Filtering is client-side on one fetch so switching
 * views is instant and the counts stay consistent.
 *
 * Accounts are created through normal self-registration, never from here — see
 * PharmacistForm for why.
 */
export default function AdminPharmacistsPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<User[]>("/api/admin/users", {}, token)
      .then(setUsers)
      .catch(() => showToast("error", "Failed to load accounts."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/users/${toDelete.id}`, { method: "DELETE" }, token);
      setUsers((current) => current.filter((u) => u.id !== toDelete.id));
      showToast("success", "Pharmacist deleted.");
      setToDelete(null);
    } catch (error) {
      // The backend returns 409 when the pharmacist has reviewed articles or has
      // audit history — those foreign keys protect the record rather than
      // orphaning it — so surface the server's message rather than a generic one.
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete pharmacist.");
    } finally {
      setDeleting(false);
    }
  }

  const counts = {
    all: users.filter((u) => u.role !== "admin").length,
    pharmacists: users.filter((u) => u.role === PHARMACIST_ROLE).length,
    customers: users.filter((u) => u.role === "customer").length,
  };

  const visible = users.filter((u) => {
    if (filter === "pharmacists") return u.role === PHARMACIST_ROLE;
    if (filter === "customers") return u.role === "customer";
    return u.role !== "admin"; // admins are managed in /admin/users
  });

  const columns: Column<User>[] = [
    {
      header: "Name",
      cell: (u) => (
        <div>
          <span className="font-medium text-slate-900">{u.fullName}</span>
          {u.role === "customer" && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              No portal access
            </span>
          )}
        </div>
      ),
    },
    { header: "Email", cell: (u) => u.email },
    {
      header: "Branch",
      cell: (u) =>
        u.location ? (
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
            {u.location.branchName}
          </span>
        ) : u.role === PHARMACIST_ROLE ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">Unassigned</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      header: "",
      className: "text-right",
      cell: (u) => {
        // Admins live in /admin/users; there's nothing to promote here.
        if (u.role === "admin") return <span className="text-xs text-slate-400">Admin</span>;

        return (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/pharmacists/${u.id}`}
              className={
                u.role === PHARMACIST_ROLE
                  ? "flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
                  : "inline-flex h-8 items-center gap-1.5 rounded-md bg-teal-50 px-2.5 text-xs font-semibold text-teal-800 transition-colors duration-150 hover:bg-teal-100"
              }
              aria-label={u.role === PHARMACIST_ROLE ? `Edit ${u.fullName}` : `Make ${u.fullName} a pharmacist`}
            >
              {u.role === PHARMACIST_ROLE ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <>
                  <Stethoscope className="h-3.5 w-3.5" />
                  Make pharmacist
                </>
              )}
            </Link>

            {u.role === PHARMACIST_ROLE && (
              <button
                type="button"
                onClick={() => setToDelete(u)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete ${u.fullName}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Pharmacists</h1>
        <p className="mt-1 text-sm text-slate-500">
          Everyone here signed up like any other visitor. Give a person the pharmacist role to unlock their own
          portal at /pharmacist, scoped to the branch you assign.
        </p>
      </div>

      <div className="mt-5 flex gap-1 rounded-lg bg-slate-100 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
              filter === f.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs text-slate-400">{counts[f.value]}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={visible}
          rowKey={(u) => u.id}
          loading={loading}
          emptyMessage={
            filter === "customers"
              ? "No regular users have signed up yet."
              : filter === "pharmacists"
                ? "No pharmacist accounts yet — pick someone from All users to promote."
                : "No accounts yet."
          }
        />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete pharmacist account?"
        description={
          toDelete
            ? `"${toDelete.fullName}" will lose access to their portal immediately. This fails if they have reviewed articles or audit history — revert them to a regular user instead, which keeps the account.`
            : ""
        }
        busyLabel="Deleting…"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
