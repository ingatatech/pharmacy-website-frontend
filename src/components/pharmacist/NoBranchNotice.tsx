"use client";

import { MapPin } from "lucide-react";

/**
 * Shown across the pharmacist area when the account has no branch assigned.
 *
 * This is a real state, not an error: the backend allows a pharmacist to be
 * created before a branch is chosen, and the branch-scoped endpoints return
 * empty results for an unassigned account (they must never fall back to
 * "all branches"). Rather than showing a confusing empty dashboard, this
 * explains what happened and who can fix it.
 */
export function NoBranchNotice() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={1.75} />
      <div>
        <p className="text-sm font-semibold text-amber-900">No branch has been assigned to your account</p>
        <p className="mt-1 text-sm text-amber-800">
          Your branch decides which refill requests and enquiries you can see. Ask an administrator to set your branch
          under <span className="font-medium">Users → Pharmacists</span>. Until then you can still review articles, which
          are not branch-specific.
        </p>
      </div>
    </div>
  );
}
