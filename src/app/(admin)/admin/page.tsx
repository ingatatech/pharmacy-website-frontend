import { AdminDashboard } from "@/components/admin/dashboard/AdminDashboard";

// Admin-only. A pharmacist_reviewer has their own area at /pharmacist and the
// admin layout sends them there, so this no longer branches on role.
// No "use client" needed: AdminDashboard is itself a client component.
export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
