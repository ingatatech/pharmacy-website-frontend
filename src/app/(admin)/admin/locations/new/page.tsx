import { LocationForm } from "@/components/admin/locations/LocationForm";

export default function NewLocationPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">New location</h1>
      <div className="mt-6">
        <LocationForm />
      </div>
    </div>
  );
}
