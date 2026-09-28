"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { homeForRole } from "@/lib/admin-access";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/Toast";

// The role rules live in @/lib/admin-access because src/proxy.ts enforces the
// same ones before the route resolves. This client guard is not redundant: the
// proxy trusts a client-written hint cookie, whereas this re-reads the session
// that's actually in localStorage, so it is what catches a role that changed
// after the cookie was issued.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
      return;
    }

    // Admin-only. A pharmacist_reviewer belongs in their own area, so they are
    // sent to /pharmacist rather than being shown a subset of these pages.
    if (user.role !== "admin") {
      router.replace(homeForRole(user.role) ?? "/");
    }
  }, [ready, user, pathname, router]);

  if (!ready || !user || user.role !== "admin") {
    return null;
  }

  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
