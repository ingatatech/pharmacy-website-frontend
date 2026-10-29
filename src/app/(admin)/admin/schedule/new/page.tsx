import { ShiftForm } from "@/components/admin/schedule/ShiftForm";

export default function NewShiftPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">New shift</h1>
      <p className="mt-1 text-sm text-slate-500">
        Add one recurring weekly slot. Create a separate shift for each day a pharmacist works.
      </p>
      <div className="mt-6">
        <ShiftForm />
      </div>
    </div>
  );
}
