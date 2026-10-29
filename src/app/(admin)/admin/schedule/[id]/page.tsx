"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ShiftForm } from "@/components/admin/schedule/ShiftForm";
import type { PharmacistShift } from "@/types";

export default function EditShiftPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [shift, setShift] = useState<PharmacistShift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<PharmacistShift[]>("/api/schedule/admin/all", {}, token ?? undefined)
      .then((shifts) => setShift(shifts.find((item) => item.id === id) || null))
      .catch(() => setShift(null))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!shift) {
    return <p className="text-sm text-slate-500">Shift not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit shift</h1>
      <div className="mt-6">
        <ShiftForm shift={shift} />
      </div>
    </div>
  );
}
