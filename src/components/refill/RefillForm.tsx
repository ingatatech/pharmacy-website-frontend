"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { PharmacyLocation } from "@/types";
import { T, useTranslated } from "@/lib/language-context";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

const labelClass = "block text-sm font-medium text-slate-700";

export function RefillForm({ locations }: { locations: PharmacyLocation[] }) {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const noPreferenceLabel = useTranslated("No preference");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) || "").trim();

    const payload: Record<string, string> = {
      fullName: get("fullName"),
      phoneNumber: get("phoneNumber"),
    };
    // The backend rejects empty strings on optional fields — omit rather
    // than send "".
    for (const key of [
      "email",
      "preferredBranch",
      "prescriptionReference",
      "medicationName",
      "preferredPickupMethod",
      "additionalNotes",
    ]) {
      const value = get(key);
      if (value) payload[key] = value;
    }

    try {
      await apiFetch(
        "/api/prescription-refill",
        { method: "POST", body: JSON.stringify(payload) },
        token || undefined
      );
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" strokeWidth={1.75} />
        <h3 className="mt-4 font-display text-xl font-semibold text-slate-900">
          <T text="Request received" />
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          <T text="A pharmacist will review your refill request and reach out using the information you provided." />
        </p>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          <T text="Please note that submission of a request does not constitute prescription approval, renewal or confirmation that the requested medicine is available." />
        </p>
      </div>
    );
  }

  return (
    <form
      key={user?.id || "guest"}
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            <T text="Full name" />
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            defaultValue={user?.fullName}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className={labelClass}>
            <T text="Phone number" />
          </label>
          <input id="phoneNumber" name="phoneNumber" type="tel" required className={`mt-1.5 ${inputClass}`} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          <T text="Email" /> <span className="text-slate-400">(<T text="optional" />)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={user?.email}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="medicationName" className={labelClass}>
            <T text="Medication name" /> <span className="text-slate-400">(<T text="optional" />)</span>
          </label>
          <input id="medicationName" name="medicationName" type="text" className={`mt-1.5 ${inputClass}`} />
        </div>
        <div>
          <label htmlFor="prescriptionReference" className={labelClass}>
            <T text="Prescription reference" /> <span className="text-slate-400">(<T text="optional" />)</span>
          </label>
          <input id="prescriptionReference" name="prescriptionReference" type="text" className={`mt-1.5 ${inputClass}`} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="preferredBranch" className={labelClass}>
            <T text="Preferred branch" /> <span className="text-slate-400">(<T text="optional" />)</span>
          </label>
          <select id="preferredBranch" name="preferredBranch" className={`mt-1.5 ${inputClass}`} defaultValue="">
            <option value="">{noPreferenceLabel}</option>
            {locations.map((location) => (
              <option key={location.id} value={location.branchName}>
                {location.branchName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="preferredPickupMethod" className={labelClass}>
            <T text="Pickup method" /> <span className="text-slate-400">(<T text="optional" />)</span>
          </label>
          <select
            id="preferredPickupMethod"
            name="preferredPickupMethod"
            className={`mt-1.5 ${inputClass}`}
            defaultValue=""
          >
            <option value="">{noPreferenceLabel}</option>
            <option value="In-store pickup">
              <T text="In-store pickup" />
            </option>
            <option value="Delivery">
              <T text="Delivery" />
            </option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="additionalNotes" className={labelClass}>
          <T text="Additional notes" /> <span className="text-slate-400">(<T text="optional" />)</span>
        </label>
        <textarea id="additionalNotes" name="additionalNotes" rows={4} className={`mt-1.5 ${inputClass}`} />
      </div>

      {status === "error" && errorMessage && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <T text={errorMessage} />
        </p>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        <T text="Submitting a prescription or refill request through this website does not constitute prescription approval, renewal, dispensing or confirmation of product availability. All requests are subject to verification and review by authorized pharmacy personnel." />
      </p>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-md bg-teal-800 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <T text={status === "submitting" ? "Sending…" : "Submit request"} />
      </button>
    </form>
  );
}
