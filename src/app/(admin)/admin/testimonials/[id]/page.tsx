"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { TestimonialForm } from "@/components/admin/testimonials/TestimonialForm";
import type { Testimonial } from "@/types";

export default function EditTestimonialPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<Testimonial[]>("/api/testimonials/admin/all", {}, token)
      .then((testimonials) => setTestimonial(testimonials.find((t) => t.id === id) || null))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!testimonial) {
    return <p className="text-sm text-slate-500">Testimonial not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit testimonial</h1>
      <div className="mt-6">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </div>
  );
}
