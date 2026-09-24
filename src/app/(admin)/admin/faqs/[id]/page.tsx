"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { FaqForm } from "@/components/admin/faqs/FaqForm";
import type { Faq } from "@/types";

export default function EditFaqPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [faq, setFaq] = useState<Faq | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<Faq[]>("/api/faqs/admin/all", {}, token)
      .then((faqs) => setFaq(faqs.find((f) => f.id === id) || null))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!faq) {
    return <p className="text-sm text-slate-500">FAQ not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit FAQ</h1>
      <div className="mt-6">
        <FaqForm faq={faq} />
      </div>
    </div>
  );
}
