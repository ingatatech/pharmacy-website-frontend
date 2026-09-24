"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import type { AuthUser } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { T, useTranslated } from "@/lib/language-context";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

const labelClass = "block text-sm font-medium text-slate-700";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, token, ready, updateUser } = useAuth();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const passwordPlaceholder = useTranslated("Leave blank to keep your current password");

  useEffect(() => {
    if (ready && !user) {
      router.replace("/");
    }
  }, [ready, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setStatus("submitting");
    setErrorMessage(null);

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const payload: Record<string, string> = { fullName, email };
    if (password) payload.password = password;

    try {
      const updated = await apiFetch<AuthUser>("/api/auth/me", { method: "PATCH", body: JSON.stringify(payload) }, token);
      updateUser(updated);
      event.currentTarget.reset();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  }

  if (!ready || !user) {
    return null;
  }

  return (
    <>
      <PageHeader eyebrow="Your account" title="Settings" description="Update your name, email or password." />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 md:py-24">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-8 sm:p-10"
          >
            <div>
              <label htmlFor="fullName" className={labelClass}>
                <T text="Full name" />
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                minLength={2}
                defaultValue={user.fullName}
                className={`mt-1.5 ${inputClass}`}
              />
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
                defaultValue={user.email}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>

            <div className="border-t border-slate-100 pt-5">
              <label htmlFor="password" className={labelClass}>
                <T text="New password" /> <span className="text-slate-400">(<T text="optional" />)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                placeholder={passwordPlaceholder}
                className={`mt-1.5 ${inputClass}`}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                <T text="At least 8 characters." />
              </p>
            </div>

            {status === "success" && (
              <p className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <T text="Your changes have been saved." />
              </p>
            )}

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
              <T text={status === "submitting" ? "Saving…" : "Save changes"} />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
