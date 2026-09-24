"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { UserForm } from "@/components/admin/users/UserForm";
import type { User } from "@/types";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<User[]>("/api/admin/users", {}, token)
      .then((users) => setUser(users.find((u) => u.id === id) || null))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!user) {
    return <p className="text-sm text-slate-500">User not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit user</h1>
      <div className="mt-6">
        <UserForm user={user} />
      </div>
    </div>
  );
}
