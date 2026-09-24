import { ServiceForm } from "@/components/admin/services/ServiceForm";

export default function NewServicePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">New service</h1>
      <div className="mt-6">
        <ServiceForm />
      </div>
    </div>
  );
}
