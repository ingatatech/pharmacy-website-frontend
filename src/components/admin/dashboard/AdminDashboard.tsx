"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ClipboardList,
  FileText,
  ListChecks,
  MapPin,
  MessageSquare,
  Package,
  Pill,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { timeAgo } from "@/lib/text";
import { KpiCard } from "@/components/admin/charts/KpiCard";
import { StatusBarChart } from "@/components/admin/charts/StatusBarChart";
import { StatusDonutChart } from "@/components/admin/charts/StatusDonutChart";
import { TrendChart } from "@/components/admin/charts/TrendChart";
import type {
  AuditLog,
  Article,
  ContactInquiry,
  Faq,
  PharmacyLocation,
  Product,
  RefillRequest,
  Service,
  User,
} from "@/types";

const ARTICLE_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  pending_review: "#f59e0b",
  approved: "#0d9488",
  published: "#10b981",
};

const REFILL_COLORS: Record<string, string> = {
  submitted: "#94a3b8",
  under_review: "#f59e0b",
  approved: "#0d9488",
  completed: "#10b981",
  rejected: "#ef4444",
};

const CONTACT_COLORS: Record<string, string> = {
  new: "#94a3b8",
  in_progress: "#f59e0b",
  resolved: "#10b981",
};

const AVAILABILITY_COLORS: Record<string, string> = {
  in_stock: "#10b981",
  out_of_stock: "#ef4444",
  unknown: "#94a3b8",
};

function countBy<T, K extends string>(rows: T[], key: (row: T) => K, order: K[]): { label: string; value: number }[] {
  const counts = new Map<K, number>();
  for (const row of rows) {
    const k = key(row);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return order.map((k) => ({ label: k.replace(/_/g, " "), value: counts.get(k) || 0 }));
}

const TREND_DAYS = 14;

function dailyCounts(rows: { createdAt: string }[]): { date: string; value: number }[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: string[] = [];
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
    days.push(key);
    buckets.set(key, 0);
  }

  for (const row of rows) {
    const key = new Date(row.createdAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
  }

  return days.map((date) => ({ date, value: buckets.get(date) || 0 }));
}

const ACTION_LABELS: Record<string, string> = {
  GET: "viewed",
  POST: "created",
  PATCH: "updated",
  DELETE: "deleted",
};

// The full admin dashboard: inventory counts, submission trends, and the audit
// trail. Split out of the /admin page so that page can pick between this and
// ReviewDashboard by role — a pharmacist_reviewer is only allowed to call the
// article endpoints, so none of the requests below would succeed for them.
export function AdminDashboard() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [locations, setLocations] = useState<PharmacyLocation[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [refills, setRefills] = useState<RefillRequest[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      apiFetch<Service[]>("/api/services/admin/all", {}, token).catch(() => []),
      apiFetch<Product[]>("/api/products/admin/all", {}, token).catch(() => []),
      apiFetch<Article[]>("/api/articles/admin/all", {}, token).catch(() => []),
      apiFetch<PharmacyLocation[]>("/api/locations/admin/all", {}, token).catch(() => []),
      apiFetch<Faq[]>("/api/faqs/admin/all", {}, token).catch(() => []),
      apiFetch<RefillRequest[]>("/api/prescription-refill/admin/all", {}, token).catch(() => []),
      apiFetch<ContactInquiry[]>("/api/contact/admin/all", {}, token).catch(() => []),
      apiFetch<User[]>("/api/admin/users", {}, token).catch(() => []),
      apiFetch<AuditLog[]>("/api/audit-logs?limit=10", {}, token).catch(() => []),
    ]).then(([services, products, articles, locations, faqs, refills, inquiries, users, activity]) => {
      setServices(services);
      setProducts(products);
      setArticles(articles);
      setLocations(locations);
      setFaqs(faqs);
      setRefills(refills);
      setInquiries(inquiries);
      setUsers(users);
      setActivity(activity);
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading dashboard…</p>;
  }

  const newInquiries = inquiries.filter((i) => i.status === "new").length;
  const pendingRefills = refills.filter((r) => r.status === "submitted" || r.status === "under_review").length;
  const publishedArticles = articles.filter((a) => a.status === "published").length;
  const activeLocations = locations.filter((l) => l.isActive).length;
  const staffUsers = users.filter((u) => u.role === "admin" || u.role === "pharmacist_reviewer").length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.fullName?.split(" ")[0]}.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard icon={Pill} label="Services" value={services.length} />
        <KpiCard icon={Package} label="Products" value={products.length} />
        <KpiCard icon={FileText} label="Articles" value={`${publishedArticles}/${articles.length}`} hint="published / total" />
        <KpiCard icon={MapPin} label="Locations" value={`${activeLocations}/${locations.length}`} hint="active / total" />
        <KpiCard icon={ListChecks} label="FAQs" value={faqs.length} />
        <KpiCard icon={MessageSquare} label="New inquiries" value={newInquiries} />
        <KpiCard icon={ClipboardList} label="Pending refills" value={pendingRefills} />
        <KpiCard icon={Users} label="Staff users" value={staffUsers} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TrendChart
          title="Submissions, last 14 days"
          series={[
            { label: "Refill requests", color: "#0d9488", points: dailyCounts(refills) },
            { label: "Contact inquiries", color: "#CE9A4A", points: dailyCounts(inquiries) },
          ]}
        />
        <StatusDonutChart
          title="Articles by status"
          data={countBy(articles, (a) => a.status, ["draft", "pending_review", "approved", "published"]).map((d) => ({
            ...d,
            color: ARTICLE_COLORS[d.label.replace(/ /g, "_")],
          }))}
        />
        <StatusBarChart
          title="Refill requests by status"
          data={countBy(refills, (r) => r.status, ["submitted", "under_review", "approved", "completed", "rejected"]).map(
            (d) => ({ ...d, color: REFILL_COLORS[d.label.replace(/ /g, "_")] })
          )}
        />
        <StatusBarChart
          title="Contact inquiries by status"
          data={countBy(inquiries, (i) => i.status, ["new", "in_progress", "resolved"]).map((d) => ({
            ...d,
            color: CONTACT_COLORS[d.label.replace(/ /g, "_")],
          }))}
        />
        <StatusBarChart
          title="Products by availability"
          data={countBy(products, (p) => p.availabilityStatus, ["in_stock", "out_of_stock", "unknown"]).map((d) => ({
            ...d,
            color: AVAILABILITY_COLORS[d.label.replace(/ /g, "_")],
          }))}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-slate-900">Recent activity</h3>
          <Link href="/admin/audit-log" className="flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800">
            <Archive className="h-3.5 w-3.5" />
            View all
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {activity.length === 0 && <li className="py-4 text-sm text-slate-400">No activity recorded yet.</li>}
          {activity.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0 truncate text-slate-600">
                <span className="font-medium text-slate-900">{entry.actor?.fullName || "System"}</span>{" "}
                {ACTION_LABELS[entry.method] || entry.method.toLowerCase()}{" "}
                <span className="font-mono text-xs text-slate-400">{entry.path}</span>
              </span>
              <span className="shrink-0 text-xs text-slate-400">{timeAgo(entry.createdAt)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
