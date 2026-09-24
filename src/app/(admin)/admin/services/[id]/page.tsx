"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ServiceForm } from "@/components/admin/services/ServiceForm";
import type { Service } from "@/types";

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<Service[]>("/api/services/admin/all", {}, token)
      .then((services) => setService(services.find((s) => s.id === id) || null))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!service) {
    return <p className="text-sm text-slate-500">Service not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit service</h1>
      <div className="mt-6">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}
