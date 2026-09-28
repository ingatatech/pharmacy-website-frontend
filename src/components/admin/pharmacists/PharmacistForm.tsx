"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { PharmacyLocation, User } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";

const PHARMACIST_ROLE = "pharmacist_reviewer";

/**
 * Manages the access of an account that already exists.
 *
 * There is deliberately no "create pharmacist" form here. People sign themselves
 * up like any other visitor; an admin then promotes the account from this
 * screen. That keeps one obvious path into the role and means a pharmacist
 * always has a real, verified account rather than one the admin had to invent
 * an email and password for.
 *
 * Name and email are read-only: the account keeps whatever the person set at
 * signup, and an admin shouldn't be able to quietly rewrite someone's identity.
 * The two things an admin legitimately changes here are the role and the
 * branch, plus a password reset if the person can't get in.
 */
export function PharmacistForm({ user }: { user: User }) {
  const { token } = useAuth();
  const router = useRouter();
  const showToast = useToast();

  const isPharmacist = user.role === PHARMACIST_ROLE;
  const isAdmin = user.role === "admin";

  const [locationId, setLocationId] = useState(user.locationId ?? "");
  const [password, setPassword] = useState("");
  const [locations, setLocations] = useState<PharmacyLocation[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDemote, setConfirmDemote] = useState(false);
  const [demoting, setDemoting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<PharmacyLocation[]>("/api/locations/admin/all", {}, token)
      .then(setLocations)
      .catch(() => showToast("error", "Failed to load branches."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Only ever offer a branch for an account that is a pharmacist — a branch is
  // meaningless for anyone else, and the backend drops it in that case anyway.
  // Once promoted, the picker appears, which is why this is a plain guard
  // rather than something baked into the fetched list.
  const showBranchPicker = isPharmacist;

  async function sendRoleAndBranch(role: string) {
    if (!token) return;
    const branch = locationId.trim() ? locationId.trim() : null;
    const payload: Record<string, string | null> = { role, locationId: branch };
    if (password) payload.password = password;

    await apiFetch(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);

    try {
      // Whether they're already a pharmacist (a branch change) or a regular user
      // (the promotion itself), the resulting role is the same — this is the one
      // screen where an admin turns a normal account into a pharmacist.
      await sendRoleAndBranch(PHARMACIST_ROLE);
      showToast("success", isPharmacist ? "Pharmacist updated." : `${user.fullName} is now a pharmacist.`);
      setPassword("");
      router.push("/admin/pharmacists");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDemote() {
    setDemoting(true);
    try {
      // The backend clears locationId for any non-pharmacist role, so the
      // branch assignment is released here rather than left dangling.
      await sendRoleAndBranch("customer");
      showToast("success", `${user.fullName} is now a regular user.`);
      setConfirmDemote(false);
      router.push("/admin/pharmacists");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setDemoting(false);
    }
  }

  if (isAdmin) {
    return (
      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Administrator account</h2>
        <p className="mt-2 text-sm text-slate-600">
          This account has the admin role, which already reaches every part of the site. Branches and pharmacist
          accounts are managed by an admin on the Pharmacists page.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div className="rounded-md bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            {isPharmacist ? "Currently a pharmacist." : "Currently a regular user — no portal access."}
          </p>
        </div>

        {showBranchPicker && (
          <div>
            <label htmlFor="locationId" className={labelClass}>
              Branch
            </label>
            <select
              id="locationId"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            >
              <option value="">No branch assigned</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.branchName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Their portal shows only this branch&apos;s refill requests and enquiries. Changes take effect on their
              next request — no re-login needed. They can review articles either way, since articles aren&apos;t
              branch-specific.
            </p>
          </div>
        )}

        {!isPharmacist && (
          <p className="rounded-md bg-teal-50 p-3 text-sm text-teal-900">
            Saving will make <span className="font-semibold">{user.fullName}</span> a pharmacist and give them their
            own portal at <span className="font-semibold">/pharmacist</span>. They can leave a branch unassigned and
            still review articles.
          </p>
        )}

        <div>
          <label htmlFor="password" className={labelClass}>
            Reset password <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            placeholder="Leave blank to keep their current password"
            className={`mt-1.5 ${inputClass}`}
          />
          <p className="mt-1 text-xs text-slate-400">
            Only needed if they can&apos;t get in. Share it with them directly.
          </p>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
          {isPharmacist ? (
            <button
              type="button"
              onClick={() => setConfirmDemote(true)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
              Revert to regular user
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/admin/pharmacists")}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={saving || demoting}
            className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : isPharmacist ? "Save changes" : "Make pharmacist"}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDemote}
        title="Revert to a regular user?"
        description={
          isPharmacist
            ? `"${user.fullName}" will lose access to /pharmacist immediately and be unassigned from ${
                user.location?.branchName ?? "their branch"
              }. Their account and login keep working, and you can promote them again at any time.`
            : ""
        }
        busyLabel="Reverting…"
        busy={demoting}
        onConfirm={handleDemote}
        onCancel={() => setConfirmDemote(false)}
      />
    </>
  );
}
