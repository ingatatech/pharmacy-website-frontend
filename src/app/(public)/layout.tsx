import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { apiFetch } from "@/lib/api";
import type { Article, Service, SiteSetting } from "@/types";
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

async function getServices(): Promise<Service[]> {
  try {
    return await apiFetch<Service[]>("/api/services", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

async function getArticles(): Promise<Article[]> {
  try {
    return await apiFetch<Article[]>("/api/articles", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [settings, services, articles] = await Promise.all([getSiteSettings(), getServices(), getArticles()]);

  return (
    <>
      <ScrollProgressBar />
      <Navbar services={services} articles={articles} />
      <main className="flex-1 pt-20">{children}</main>
      <Footer settings={settings} />
      <ScrollToTop />
    </>
  );
}
