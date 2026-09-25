"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { PharmacyLocation, TeamMember } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";

export function TeamForm({ member }: { member?: TeamMember }) {
  const { token } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const [fullName, setFullName] = useState(member?.fullName || "");
  const [role, setRole] = useState(member?.role || "");
  const [credentials, setCredentials] = useState(member?.credentials || "");
  const [bio, setBio] = useState(member?.bio || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(member?.photoUrl ?? null);
  const [locationId, setLocationId] = useState(member?.locationId || "");
  const [displayOrder, setDisplayOrder] = useState(member?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState(member?.isPublished ?? false);
  const [locations, setLocations] = useState<PharmacyLocation[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<PharmacyLocation[]>("/api/locations")
      .then(setLocations)
      .catch(() => {});
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);

    const payload = {
      fullName,
      role,
      credentials: credentials || null,
      bio: bio || null,
      photoUrl,
      locationId: locationId || null,
      displayOrder,
      isPublished,
    };

    try {
      if (member) {
        await apiFetch(`/api/team/${member.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        showToast("success", "Team member updated.");
      } else {
        await apiFetch("/api/team", { method: "POST", body: JSON.stringify(payload) }, token);
        showToast("success", "Team member created.");
      }
      router.push("/admin/team");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        Only add real staff who&apos;ve agreed to appear on the site. New members save as unpublished by default.
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="e.g. Dr. Alice Uwase"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="role" className={labelClass}>
            Role
          </label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            placeholder="e.g. Licensed Pharmacist"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="credentials" className={labelClass}>
          Credentials <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="credentials"
          type="text"
          value={credentials}
          onChange={(e) => setCredentials(e.target.value)}
          placeholder="e.g. B.Pharm, PharmD"
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="bio" className={labelClass}>
          Bio <span className="text-slate-400">(optional)</span>
        </label>
        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={`mt-1.5 ${inputClass} min-h-[5rem]`} />
      </div>

      <ImageUploadField label="Photo (optional, only with their permission)" value={photoUrl} onChange={setPhotoUrl} />

      <div>
        <label htmlFor="locationId" className={labelClass}>
          Branch <span className="text-slate-400">(optional)</span>
        </label>
        <select id="locationId" value={locationId} onChange={(e) => setLocationId(e.target.value)} className={`mt-1.5 ${inputClass}`}>
          <option value="">Not tied to a specific branch</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.branchName}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">
          Shown on that branch&apos;s page. Leave unassigned if this person isn&apos;t tied to one branch.
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label htmlFor="displayOrder" className={labelClass}>
            Display order
          </label>
          <input
            id="displayOrder"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className={`mt-1.5 w-24 ${inputClass}`}
          />
        </div>
        <label className="mt-6 inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
          />
          Published
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => router.push("/admin/team")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : member ? "Save changes" : "Create team member"}
        </button>
      </div>
    </form>
  );
}
