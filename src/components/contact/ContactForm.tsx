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

export function ContactForm({ locations, defaultBranch }: { locations: PharmacyLocation[]; defaultBranch?: string }) {
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
      email: get("email"),
      inquiryType: get("inquiryType") || "general",
      message: get("message"),
    };
    // The backend rejects empty strings on optional fields — omit rather
    // than send "".
    const subject = get("subject");
    const preferredContactMethod = get("preferredContactMethod");
    if (subject) payload.subject = subject;
    if (preferredContactMethod) payload.preferredContactMethod = preferredContactMethod;

    // The branch select carries the branch's id; send it as locationId (what
    // the pharmacist's portal filters on) plus the branch's name as
    // preferredBranch (what the admin screens display). See the equivalent
    // comment in RefillForm.
    const chosenBranchId = get("preferredBranch");
    if (chosenBranchId) {
      payload.locationId = chosenBranchId;
      const name = locations.find((l) => l.id === chosenBranchId)?.branchName;
      if (name) payload.preferredBranch = name;
    }

    try {
      await apiFetch("/api/contact", { method: "POST", body: JSON.stringify(payload) }, token || undefined);
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
          <T text="Message received" />
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          <T text="A member of our pharmacy team will review your request and contact you using the information you provided." />
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
          <T text="Email" />
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={user?.email}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="preferredBranch" className={labelClass}>
            <T text="Preferred branch" /> <span className="text-slate-400">(<T text="optional" />)</span>
          </label>
          <select
            id="preferredBranch"
            name="preferredBranch"
            className={`mt-1.5 ${inputClass}`}
            // Option values are branch ids now (see the submit handler), so a
            // `?branch=` query value that was previously a name — and may also
            // be a slug, depending on which public page linked here — has to be
            // resolved to an id before it can be used as a default.
            defaultValue={locations.find((l) => l.id === defaultBranch || l.branchName === defaultBranch || l.slug === defaultBranch)?.id ?? ""}
          >
            <option value="">{noPreferenceLabel}</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.branchName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="preferredContactMethod" className={labelClass}>
            <T text="Preferred contact method" /> <span className="text-slate-400">(<T text="optional" />)</span>
          </label>
          <select
            id="preferredContactMethod"
            name="preferredContactMethod"
            className={`mt-1.5 ${inputClass}`}
            defaultValue=""
          >
            <option value="">{noPreferenceLabel}</option>
            <option value="Phone">
              <T text="Phone" />
            </option>
            <option value="Email">
              <T text="Email" />
            </option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="inquiryType" className={labelClass}>
          <T text="What is this about?" />
        </label>
        <select id="inquiryType" name="inquiryType" className={`mt-1.5 ${inputClass}`} defaultValue="general">
          <option value="general">
            <T text="General inquiry" />
          </option>
          <option value="health">
            <T text="Health question" />
          </option>
          <option value="product">
            <T text="Product question" />
          </option>
          <option value="service">
            <T text="Service question" />
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          <T text="Subject" /> <span className="text-slate-400">(<T text="optional" />)</span>
        </label>
        <input id="subject" name="subject" type="text" className={`mt-1.5 ${inputClass}`} />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          <T text="Message" />
        </label>
        <textarea id="message" name="message" required rows={5} className={`mt-1.5 ${inputClass}`} />
      </div>

      {status === "error" && errorMessage && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <T text={errorMessage} />
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-md bg-teal-800 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <T text={status === "submitting" ? "Sending…" : "Send message"} />
      </button>
    </form>
  );
}
