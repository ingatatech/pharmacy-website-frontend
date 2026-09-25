"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { TeamForm } from "@/components/admin/team/TeamForm";
import type { TeamMember } from "@/types";

export default function EditTeamMemberPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<TeamMember[]>("/api/team/admin/all", {}, token)
      .then((members) => setMember(members.find((m) => m.id === id) || null))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!member) {
    return <p className="text-sm text-slate-500">Team member not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit team member</h1>
      <div className="mt-6">
        <TeamForm member={member} />
      </div>
    </div>
  );
}
