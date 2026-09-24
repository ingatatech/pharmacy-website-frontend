import { CategoryForm } from "@/components/admin/categories/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">New category</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
