"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

const labelClass = "block text-sm font-medium text-slate-700";

type AuthResponse = {
  token: string;
  user: { id: string; email: string; fullName: string; role: string };
};

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const fullName = String(form.get("fullName") || "").trim();

    try {
      const payload = mode === "login" ? { email, password } : { fullName, email, password };
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const result = await apiFetch<AuthResponse>(path, { method: "POST", body: JSON.stringify(payload) });

      localStorage.setItem("ingata_token", result.token);
      localStorage.setItem("ingata_user", JSON.stringify(result.user));
      router.push("/");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <div className="flex rounded-md bg-slate-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-sm py-2 transition-colors duration-200 ${
            mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-sm py-2 transition-colors duration-200 ${
            mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {mode === "register" && (
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full name
            </label>
            <input id="fullName" name="fullName" type="text" required minLength={2} className={`mt-1.5 ${inputClass}`} />
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={`mt-1.5 ${inputClass}`} />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
            className={`mt-1.5 ${inputClass}`}
          />
          {mode === "register" && <p className="mt-1.5 text-xs text-slate-400">At least 8 characters.</p>}
        </div>

        {status === "error" && errorMessage && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center rounded-md bg-teal-800 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
