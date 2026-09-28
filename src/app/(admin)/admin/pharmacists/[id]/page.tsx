"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { PharmacistForm } from "@/components/admin/pharmacists/PharmacistForm";
import type { User } from "@/types";

/**
 * The single place an admin changes someone's access: promote a regular user to
 * pharmacist, reassign a pharmacist's branch, reset a password, or revert
 * someone to a regular account.
 *
 * There is no "new" route any more — people register themselves, and an admin
 * picks them up from the list. This page therefore loads the full user list
 * (the API has no GET /api/admin/users/:id) and finds the account by id, which
 * works for a customer as readily as for a pharmacist.
 */
export default function ManagePharmacistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuth();
  const showToast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    apiFetch<User[]>("/api/admin/users", {}, token)
      .then((all) => setUser(all.find((u) => u.id === id) ?? null))
      .catch(() => showToast("error", "Failed to load account."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  if (!user) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Account not found</h1>
        <p className="mt-2 text-sm text-slate-500">This account no longer exists.</p>
        <Link href="/admin/pharmacists" className="mt-4 inline-block text-sm font-medium text-teal-800 hover:underline">
          Back to Pharmacists
        </Link>
      </div>
    );
  }

  const isPharmacist = user.role === "pharmacist_reviewer";

  return (
    <div>
      <Link
        href="/admin/pharmacists"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Pharmacists
      </Link>

      <h1 className="mt-3 font-display text-2xl font-semibold text-slate-900">
        {isPharmacist ? "Manage pharmacist" : "Make pharmacist"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {isPharmacist
          ? "Reassign their branch or reset their password. Branch changes take effect on their next request."
          : "This person signed up like any other visitor. Giving them the pharmacist role unlocks their own portal."}
      </p>

      <div className="mt-6">
        <PharmacistForm user={user} />
      </div>
    </div>
  );
}
