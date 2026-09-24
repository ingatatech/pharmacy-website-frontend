"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, MessageSquare, Pill, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { initials, roleLabel } from "@/lib/text";
import type { ContactInquiry, RefillRequest } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/lib/language-context";

const REFILL_STATUS_STYLES: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-700",
  under_review: "bg-amber-100 text-amber-800",
  approved: "bg-teal-100 text-teal-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

const CONTACT_STATUS_STYLES: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status, styles }: { status: string; styles: Record<string, string> }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      <T text={formatStatus(status)} />
    </span>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const [refills, setRefills] = useState<RefillRequest[] | null>(null);
  const [inquiries, setInquiries] = useState<ContactInquiry[] | null>(null);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/");
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (!token) return;
    apiFetch<RefillRequest[]>("/api/prescription-refill/mine", {}, token)
      .then(setRefills)
      .catch(() => setRefills([]));
    apiFetch<ContactInquiry[]>("/api/contact/mine", {}, token)
      .then(setInquiries)
      .catch(() => setInquiries([]));
  }, [token]);

  if (!ready || !user) {
    return null;
  }

  const createdAt = new Date(user.createdAt);
  const memberSince = Number.isNaN(createdAt.getTime())
    ? null
    : createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <>
      <PageHeader eyebrow="Your account" title="Profile" />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-700 font-display text-xl font-semibold text-white">
                  {initials(user.fullName)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-semibold text-slate-900 sm:text-2xl">
                    {user.fullName}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <Link
                href="/account/settings"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900"
              >
                <Settings className="h-4 w-4" strokeWidth={1.75} />
                <T text="Edit profile" />
              </Link>
            </div>

            <dl className="mt-8 divide-y divide-slate-100 border-t border-slate-100">
              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Mail className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
                  <T text="Email" />
                </dt>
                <dd className="truncate text-sm font-medium text-slate-900">{user.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="flex items-center gap-2.5 text-sm text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
                  <T text="Account type" />
                </dt>
                <dd className="text-sm font-medium text-slate-900">
                  <T text={roleLabel(user.role)} />
                </dd>
              </div>
              {memberSince && (
                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-sm text-slate-500">
                    <T text="Member since" />
                  </dt>
                  <dd className="text-sm font-medium text-slate-900">{memberSince}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Quick stats — real counts from the same requests fetched below. */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="font-display text-2xl font-semibold text-slate-900">
                {refills === null ? "—" : refills.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                <T text="Refill requests" />
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="font-display text-2xl font-semibold text-slate-900">
                {inquiries === null ? "—" : inquiries.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                <T text="Messages sent" />
              </p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
                <Pill className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                <T text="Prescription refill requests" />
              </h3>
              <Link href="/prescription-refill" className="text-sm font-medium text-teal-700 hover:text-teal-800">
                <T text="New request" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {refills === null && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
                  <T text="Loading…" />
                </div>
              )}
              {refills !== null && refills.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  <T text="You haven't submitted any refill requests yet." />
                </div>
              )}
              {refills?.map((refill) => (
                <div
                  key={refill.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      <T text={refill.medicationName || "General refill request"} />
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(refill.createdAt)}
                      {refill.preferredBranch && <> · {refill.preferredBranch}</>}
                      {refill.prescriptionReference && (
                        <>
                          {" "}
                          · <T text="Ref" />: {refill.prescriptionReference}
                        </>
                      )}
                    </p>
                  </div>
                  <StatusBadge status={refill.status} styles={REFILL_STATUS_STYLES} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
                <MessageSquare className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                <T text="Messages" />
              </h3>
              <Link href="/contact" className="text-sm font-medium text-teal-700 hover:text-teal-800">
                <T text="New message" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {inquiries === null && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
                  <T text="Loading…" />
                </div>
              )}
              {inquiries !== null && inquiries.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  <T text="You haven't sent us a message yet." />
                </div>
              )}
              {inquiries?.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      <T text={inquiry.subject || "General inquiry"} />
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {formatDate(inquiry.createdAt)} · {inquiry.message}
                    </p>
                  </div>
                  <StatusBadge status={inquiry.status} styles={CONTACT_STATUS_STYLES} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
