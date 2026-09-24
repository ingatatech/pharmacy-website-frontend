import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Log In | Ingata Pharmacy",
  description: "Log in or create an account to track your prescription refills and inquiries.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <PageHeader eyebrow="Your account" title="Log in" />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6 md:py-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <AuthPanel next={next} />
          </div>
        </div>
      </section>
    </>
  );
}
