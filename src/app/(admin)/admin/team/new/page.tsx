import { TeamForm } from "@/components/admin/team/TeamForm";

export default function NewTeamMemberPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">New team member</h1>
      <div className="mt-6">
        <TeamForm />
      </div>
    </div>
  );
}
