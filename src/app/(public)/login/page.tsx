import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Log In | Ingata Pharmacy",
  description: "Log in or create an account to track your prescription refills and inquiries.",
};

export default function LoginPage() {
  return (
    <>
      <PageHeader eyebrow="Your account" title="Log in" />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6 md:py-24">
          <AuthForm />
        </div>
      </section>
    </>
  );
}
