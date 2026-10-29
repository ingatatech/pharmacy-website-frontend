"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import type { PharmacistShift, PharmacyLocation, TeamMember } from "@/types";

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";

export function ShiftForm({ shift }: { shift?: PharmacistShift }) {
  const { token } = useAuth();
  const router = useRouter();
  const showToast = useToast();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [locations, setLocations] = useState<PharmacyLocation[]>([]);
  const [teamMemberId, setTeamMemberId] = useState(shift?.teamMemberId || "");
  const [locationId, setLocationId] = useState(shift?.locationId || "");
  const [dayOfWeek, setDayOfWeek] = useState(shift?.dayOfWeek ?? 1);
  const [startTime, setStartTime] = useState(shift?.startTime || "08:00");
  const [endTime, setEndTime] = useState(shift?.endTime || "17:00");
  const [note, setNote] = useState(shift?.note || "");
  const [isActive, setIsActive] = useState(shift?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<TeamMember[]>("/api/team/admin/all", {}, token ?? undefined).then(setTeamMembers).catch(() => {});
    apiFetch<PharmacyLocation[]>("/api/locations").then(setLocations).catch(() => {});
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    if (startTime >= endTime) {
      showToast("error", "End time must be after start time.");
      return;
    }

    setSaving(true);

    const payload = {
      teamMemberId,
      locationId,
      dayOfWeek,
      startTime,
      endTime,
      note: note.trim() ? note.trim() : null,
      isActive,
    };

    try {
      if (shift) {
        await apiFetch(`/api/schedule/${shift.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        showToast("success", "Shift updated.");
      } else {
        await apiFetch("/api/schedule", { method: "POST", body: JSON.stringify(payload) }, token);
        showToast("success", "Shift created.");
      }
      router.push("/admin/schedule");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="teamMemberId" className={labelClass}>
            Pharmacist / team member
          </label>
          <select
            id="teamMemberId"
            value={teamMemberId}
            onChange={(e) => setTeamMemberId(e.target.value)}
            required
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="">Select a team member</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
                {member.isPublished ? "" : " (unpublished)"}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Unpublished members never appear on the public schedule.
          </p>
        </div>

        <div>
          <label htmlFor="locationId" className={labelClass}>
            Branch
          </label>
          <select
            id="locationId"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="">Select a branch</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.branchName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="dayOfWeek" className={labelClass}>
            Day
          </label>
          <select
            id="dayOfWeek"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className={`mt-1.5 ${inputClass}`}
          >
            {DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="startTime" className={labelClass}>
            Start
          </label>
          <input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="endTime" className={labelClass}>
            End
          </label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="note" className={labelClass}>
          Note <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Morning shift, vaccination desk"
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
        />
        Active on the public schedule
      </label>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => router.push("/admin/schedule")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : shift ? "Save changes" : "Create shift"}
        </button>
      </div>
    </form>
  );
}
