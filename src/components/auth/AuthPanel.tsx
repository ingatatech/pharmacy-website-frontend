"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { homeForRole } from "@/lib/admin-access";
import { LogIn, UserPlus } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { T } from "@/lib/language-context";
import type { AuthUser } from "@/types";

const COPY = {
  login: {
    icon: LogIn,
    eyebrow: "Welcome back",
    title: "Log in to your account",
    subtitle: "Track refill requests and manage your details.",
    switchPrompt: "Don't have an account?",
    switchCta: "Sign up",
  },
  register: {
    icon: UserPlus,
    eyebrow: "Get started",
    title: "Create your account",
    subtitle: "Save your details for faster refill requests.",
    switchPrompt: "Already have an account?",
    switchCta: "Log in",
  },
} as const;

// Shared between the standalone /login page and AuthModal so the two
// never drift apart. Manages its own mode so each mount starts fresh on
// "login" — which is what we want when the modal remounts on open.
export function AuthPanel({
  onSuccess,
  next = "/",
}: {
  onSuccess?: (user: AuthUser) => void;
  next?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const copy = COPY[mode];

  function handleSuccess(user: AuthUser) {
    if (onSuccess) {
      onSuccess(user);
      return;
    }
    // Staff land in their own area, regardless of where the login form was
    // reached from — a customer-facing `next` (e.g. back to
    // /prescription-refill) would be meaningless for them. A pharmacist's area
    // is /pharmacist, not /admin, and the two are disjoint, so `next` is only
    // honoured when it actually points inside the role's own area.
    const home = homeForRole(user.role);
    if (home) {
      router.push(next.startsWith(home) ? next : home);
    } else {
      router.push(next);
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
        <copy.icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <span className="mt-5 block text-sm font-medium text-teal-600">
        <T text={copy.eyebrow} />
      </span>
      <h2 className="mt-1 font-display text-2xl font-semibold text-slate-900">
        <T text={copy.title} />
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
        <T text={copy.subtitle} />
      </p>

      <div className="mt-7">
        <AuthForm mode={mode} onSuccess={handleSuccess} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        <T text={copy.switchPrompt} />{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="font-semibold text-teal-700 transition-colors duration-200 hover:text-teal-800"
        >
          <T text={copy.switchCta} />
        </button>
      </p>
    </div>
  );
}
