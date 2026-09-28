"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Phone, Save, Users } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { NoBranchNotice } from "@/components/pharmacist/NoBranchNotice";
import type { PharmacyLocation, TeamMember } from "@/types";

type OpeningHours = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
};

const DAYS: Array<keyof OpeningHours> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * The pharmacist's own branch: view, edit the operational details, and see the
 * team roster for that branch.
 *
 * Every fetch goes to /api/pharmacist/branch*, which resolves the branch from
 * the caller's own account — so there is no branch selector and no way to view
 * or edit a different branch from here. slug, isActive and availableServices
 * are intentionally not editable: the backend's updateOwnBranchSchema rejects
 * them (400), and the form doesn't offer them.
 */
export default function PharmacistBranchPage() {
  const { token, user } = useAuth();
  const showToast = useToast();

  const [branch, setBranch] = useState<PharmacyLocation | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    branchName: "",
    address: "",
    telephone: "",
    description: "",
    hours: {} as OpeningHours,
  });

  const load = useCallback(() => {
    if (!token) return Promise.resolve();

    return apiFetch<{ branch: PharmacyLocation | null }>("/api/pharmacist/branch", {}, token)
      .then(async ({ branch: b }) => {
        setBranch(b);
        if (b) {
          setForm({
            branchName: b.branchName,
            address: b.address,
            telephone: b.telephone ?? "",
            description: b.description ?? "",
            hours: (b.openingHours as OpeningHours | null) ?? {},
          });
        }
        const teamRes = await apiFetch<{ team: TeamMember[] }>("/api/pharmacist/branch/team", {}, token).catch(
          () => ({ team: [] as TeamMember[] })
        );
        setTeam(teamRes.team);
      })
      .catch(() => showToast("error", "Failed to load your branch."));
  }, [token, showToast]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      // Only the editable fields are sent. openingHours is replaced wholesale,
      // so days the pharmacist blanked are omitted entirely: the backend
      // validates each day with min(1) and would reject the whole request on an
      // empty string. Omitting the key is what clears that day.
      const hours = Object.fromEntries(
        Object.entries(form.hours)
          .map(([day, value]) => [day, (value ?? "").trim()])
          .filter(([, value]) => value !== "")
      ) as OpeningHours;

      const updated = await apiFetch<PharmacyLocation>(
        "/api/pharmacist/branch",
        {
          method: "PATCH",
          body: JSON.stringify({
            branchName: form.branchName,
            address: form.address,
            telephone: form.telephone.trim() ? form.telephone.trim() : null,
            description: form.description.trim() ? form.description.trim() : null,
            openingHours: hours,
          }),
        },
        token
      );
      setBranch(updated);
      showToast("success", "Branch details updated.");
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to save your branch details.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading your branch…</p>;

  if (!branch) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">My Branch</h1>
        <NoBranchNotice />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">My Branch</h1>
      <p className="mt-1 text-sm text-slate-500">
        You manage the public-facing details for {branch.branchName}.
      </p>

      <form onSubmit={save} className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <label htmlFor="branchName" className="block text-sm font-medium text-slate-700">
              Branch name
            </label>
            <input
              id="branchName"
              required
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
              Address
            </label>
            <input
              id="address"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-slate-700">
              Telephone
            </label>
            <input
              id="telephone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              About this branch
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700">Opening hours</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {DAYS.map((day) => (
                <label key={day} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-24 shrink-0 capitalize">{day}</span>
                  <input
                    value={form.hours[day] ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, hours: { ...form.hours, [day]: e.target.value } })
                    }
                    placeholder="e.g. 9:00 – 18:00"
                    aria-label={`${day} opening hours`}
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-800 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save branch details"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-sm font-semibold text-slate-900">Branch</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
                <dd>{branch.address}</dd>
              </div>
              {branch.telephone && (
                <div className="flex items-start gap-2 text-slate-600">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
                  <dd>{branch.telephone}</dd>
                </div>
              )}
            </dl>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
              Page slug <span className="font-mono">/{branch.slug}</span> is managed by an administrator.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900">
              <Users className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
              Team at this branch
            </h2>
            {team.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No team members assigned to this branch.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {team.map((member) => (
                  <li key={member.id}>
                    <p className="text-sm font-medium text-slate-900">{member.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {member.role}
                      {member.credentials && ` · ${member.credentials}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
