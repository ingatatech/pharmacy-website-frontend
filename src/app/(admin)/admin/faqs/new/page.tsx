import { FaqForm } from "@/components/admin/faqs/FaqForm";

export default function NewFaqPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">New FAQ</h1>
      <div className="mt-6">
        <FaqForm />
      </div>
    </div>
  );
}
