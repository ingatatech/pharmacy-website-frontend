"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard";
import type { PharmacistShift, ScheduleBranchRef } from "@/types";

type RosterResponse = {
  branch: ScheduleBranchRef | null;
  shifts: PharmacistShift[];
};

export default function PharmacistSchedulePage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [data, setData] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<RosterResponse>("/api/pharmacist/schedule", {}, token ?? undefined)
      .then(setData)
      .catch((error) =>
        showToast(
          "error",
          error instanceof ApiError ? error.message : "Failed to load the branch schedule.",
        ),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!data?.branch) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-slate-300" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-slate-600">
          Your account is not assigned to a branch, so there is no roster to show.
        </p>
        <Link
          href="/pharmacist/branch"
          className="mt-4 inline-flex text-sm font-semibold text-teal-800 hover:text-teal-900"
        >
          View my branch details
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Branch schedule</h1>
      <p className="mt-1 text-sm text-slate-500">
        This week&apos;s roster for {data.branch.branchName}, maintained by an administrator.
      </p>

      <div className="mt-6">
        <ScheduleBoard
          shifts={data.shifts}
          locations={[data.branch]}
          showFilter={false}
          showBranchHeading={false}
        />
      </div>
    </div>
  );
}
