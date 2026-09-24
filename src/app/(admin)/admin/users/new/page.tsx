import { UserForm } from "@/components/admin/users/UserForm";

export default function NewUserPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">New user</h1>
      <div className="mt-6">
        <UserForm />
      </div>
    </div>
  );
}
