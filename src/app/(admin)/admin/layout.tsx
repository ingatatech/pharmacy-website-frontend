"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/Toast";

const REVIEWER_HOME = "/admin/articles";

// Gates every /admin/* route: logged-out or customer accounts are sent to
// /login (preserving the intended URL), and a pharmacist_reviewer — who the
// backend only lets call article endpoints — is confined to /admin/articles
// even if they navigate to another admin URL directly.
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

    if (user.role === "customer") {
      router.replace("/");
      return;
    }

    if (user.role === "pharmacist_reviewer" && !pathname?.startsWith(REVIEWER_HOME)) {
      router.replace(REVIEWER_HOME);
    }
  }, [ready, user, pathname, router]);

  if (!ready || !user || user.role === "customer") {
    return null;
  }

  if (user.role === "pharmacist_reviewer" && !pathname?.startsWith(REVIEWER_HOME)) {
    return null;
  }

  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
