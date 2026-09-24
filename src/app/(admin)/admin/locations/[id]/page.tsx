"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { LocationForm } from "@/components/admin/locations/LocationForm";
import type { PharmacyLocation } from "@/types";

export default function EditLocationPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [location, setLocation] = useState<PharmacyLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<PharmacyLocation[]>("/api/locations/admin/all", {}, token)
      .then((locations) => setLocation(locations.find((l) => l.id === id) || null))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!location) {
    return <p className="text-sm text-slate-500">Location not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit location</h1>
      <div className="mt-6">
        <LocationForm location={location} />
      </div>
    </div>
  );
}
