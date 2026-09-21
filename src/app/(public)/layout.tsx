import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { apiFetch } from "@/lib/api";
import type { SiteSetting } from "@/types";
import type { ReactNode } from "react";

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const settings = await apiFetch<SiteSetting>("/api/site-settings", {
      next: { revalidate: 300 },
    });
    // The endpoint returns {} rather than 404 when nothing has been set yet.
    return settings?.id ? settings : null;
  } catch {
    return null;
  }
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer settings={settings} />
      <ScrollToTop />
    </>
  );
}
