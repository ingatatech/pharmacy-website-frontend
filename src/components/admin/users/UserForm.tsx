"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import type { User, UserRole } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "pharmacist_reviewer", label: "Pharmacist Reviewer" },
  { value: "customer", label: "Customer" },
];

export function UserForm({ user }: { user?: User }) {
  const { token, user: currentUser } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role || "customer");
  const [saving, setSaving] = useState(false);

  const isSelf = user?.id === currentUser?.id;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);

    try {
      if (user) {
        const payload: Record<string, string> = { fullName, email, role };
        if (password) payload.password = password;
        await apiFetch(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        showToast("success", "User updated.");
      } else {
        await apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify({ fullName, email, password, role }) }, token);
        showToast("success", "User created.");
      }
      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full name
        </label>
        <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} className={`mt-1.5 ${inputClass}`} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`mt-1.5 ${inputClass}`} />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          {user ? "New password" : "Password"} {user && <span className="text-slate-400">(optional)</span>}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!user}
          minLength={8}
          placeholder={user ? "Leave blank to keep current password" : undefined}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="role" className={labelClass}>
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={isSelf}
          className={`mt-1.5 ${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {isSelf && <p className="mt-1 text-xs text-slate-400">You can&apos;t change your own role.</p>}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : user ? "Save changes" : "Create user"}
        </button>
      </div>
    </form>
  );
}
