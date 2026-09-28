"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { homeForRole } from "@/lib/admin-access";
import { PharmacistShell } from "@/components/pharmacist/PharmacistShell";
import { ToastProvider } from "@/components/admin/Toast";

// The pharmacist's own area, entirely separate from /admin. Enforced here as
// well as in src/proxy.ts for the same reason the admin layout repeats its
// check: the proxy trusts a client-written hint cookie, this re-reads the
// real session from localStorage.
export default function PharmacistLayout({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/pharmacist")}`);
      return;
    }

    // Reviewer-only. An admin manages branches from /admin/locations instead,
    // so they are sent to their own dashboard rather than in here.
    if (user.role !== "pharmacist_reviewer") {
      router.replace(homeForRole(user.role) ?? "/");
    }
  }, [ready, user, pathname, router]);

  if (!ready || !user || user.role !== "pharmacist_reviewer") {
    return null;
  }

  return (
    <ToastProvider>
      <PharmacistShell>{children}</PharmacistShell>
    </ToastProvider>
  );
}
