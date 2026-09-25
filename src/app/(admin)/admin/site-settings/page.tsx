"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { TagsInput } from "@/components/admin/TagsInput";
import type { SiteSetting } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";
const textareaClass = `${inputClass} min-h-[6rem]`;

type FormState = {
  pharmacyName: string;
  aboutUs: string;
  mission: string;
  vision: string;
  companyHistory: string;
  coreValues: string[];
  whyChooseUs: string;
  heroHeadline: string;
  heroSubheading: string;
  phone: string;
  email: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  xUrl: string;
  whatsappUrl: string;
  youtubeUrl: string;
  announcementMessage: string;
  announcementActive: boolean;
};

function toFormState(settings: SiteSetting | null): FormState {
  return {
    pharmacyName: settings?.pharmacyName || "",
    aboutUs: settings?.aboutUs || "",
    mission: settings?.mission || "",
    vision: settings?.vision || "",
    companyHistory: settings?.companyHistory || "",
    coreValues: settings?.coreValues || [],
    whyChooseUs: settings?.whyChooseUs || "",
    heroHeadline: settings?.heroHeadline || "",
    heroSubheading: settings?.heroSubheading || "",
    phone: settings?.phone || "",
    email: settings?.email || "",
    address: settings?.address || "",
    facebookUrl: settings?.facebookUrl || "",
    instagramUrl: settings?.instagramUrl || "",
    linkedinUrl: settings?.linkedinUrl || "",
    xUrl: settings?.xUrl || "",
    whatsappUrl: settings?.whatsappUrl || "",
    youtubeUrl: settings?.youtubeUrl || "",
    announcementMessage: settings?.announcementMessage || "",
    announcementActive: settings?.announcementActive ?? false,
  };
}

export default function AdminSiteSettingsPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [form, setForm] = useState<FormState>(toFormState(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<SiteSetting>("/api/site-settings")
      .then((settings) => setForm(toFormState(settings?.id ? settings : null)))
      .catch(() => showToast("error", "Failed to load site settings."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);

    const rawFields: Array<keyof FormState> = ["coreValues", "announcementActive"];
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        rawFields.includes(key as keyof FormState) ? value : value || null,
      ])
    );

    try {
      await apiFetch("/api/site-settings", { method: "PATCH", body: JSON.stringify(payload) }, token);
      showToast("success", "Site settings updated.");
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Site settings</h1>
      <p className="mt-1 text-sm text-slate-500">Content shown across the homepage, footer and contact pages.</p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6">
        <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <h2 className="font-display text-base font-semibold text-slate-900 sm:col-span-2">General</h2>
          <div>
            <label htmlFor="pharmacyName" className={labelClass}>
              Pharmacy name
            </label>
            <input id="pharmacyName" type="text" value={form.pharmacyName} onChange={(e) => set("pharmacyName", e.target.value)} className={`mt-1.5 ${inputClass}`} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={`mt-1.5 ${inputClass}`} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={`mt-1.5 ${inputClass}`} />
          </div>
          <div>
            <label htmlFor="address" className={labelClass}>
              Address
            </label>
            <input id="address" type="text" value={form.address} onChange={(e) => set("address", e.target.value)} className={`mt-1.5 ${inputClass}`} />
          </div>
        </div>

        <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="font-display text-base font-semibold text-slate-900">Site-wide announcement</h2>
            <p className="mt-1 text-sm text-slate-500">
              A dismissible banner shown at the top of every public page — for holiday hours, a temporary closure or
              an urgent notice. Turning it off doesn&apos;t erase the message, so you can toggle the same notice back
              on later.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="announcementMessage" className={labelClass}>
              Message
            </label>
            <textarea
              id="announcementMessage"
              value={form.announcementMessage}
              onChange={(e) => set("announcementMessage", e.target.value)}
              rows={2}
              maxLength={500}
              className={`mt-1.5 ${textareaClass}`}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.announcementActive}
              onChange={(e) => set("announcementActive", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            Show this announcement on the site
          </label>
        </div>

        <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <h2 className="font-display text-base font-semibold text-slate-900 sm:col-span-2">Homepage hero</h2>
          <div className="sm:col-span-2">
            <label htmlFor="heroHeadline" className={labelClass}>
              Headline
            </label>
            <input id="heroHeadline" type="text" value={form.heroHeadline} onChange={(e) => set("heroHeadline", e.target.value)} className={`mt-1.5 ${inputClass}`} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="heroSubheading" className={labelClass}>
              Subheading
            </label>
            <textarea id="heroSubheading" value={form.heroSubheading} onChange={(e) => set("heroSubheading", e.target.value)} rows={2} className={`mt-1.5 ${textareaClass}`} />
          </div>
        </div>

        <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <h2 className="font-display text-base font-semibold text-slate-900 sm:col-span-2">About</h2>
          <div className="sm:col-span-2">
            <label htmlFor="aboutUs" className={labelClass}>
              About us
            </label>
            <textarea id="aboutUs" value={form.aboutUs} onChange={(e) => set("aboutUs", e.target.value)} rows={3} className={`mt-1.5 ${textareaClass}`} />
          </div>
          <div>
            <label htmlFor="mission" className={labelClass}>
              Mission
            </label>
            <textarea id="mission" value={form.mission} onChange={(e) => set("mission", e.target.value)} rows={2} className={`mt-1.5 ${textareaClass}`} />
          </div>
          <div>
            <label htmlFor="vision" className={labelClass}>
              Vision
            </label>
            <textarea id="vision" value={form.vision} onChange={(e) => set("vision", e.target.value)} rows={2} className={`mt-1.5 ${textareaClass}`} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="whyChooseUs" className={labelClass}>
              Why choose us
            </label>
            <textarea id="whyChooseUs" value={form.whyChooseUs} onChange={(e) => set("whyChooseUs", e.target.value)} rows={2} className={`mt-1.5 ${textareaClass}`} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="companyHistory" className={labelClass}>
              Company history <span className="font-normal text-slate-400">(optional — leave blank to hide this section on the About page)</span>
            </label>
            <textarea id="companyHistory" value={form.companyHistory} onChange={(e) => set("companyHistory", e.target.value)} rows={3} className={`mt-1.5 ${textareaClass}`} />
          </div>
          <div className="sm:col-span-2">
            <TagsInput label="Core values" values={form.coreValues} onChange={(values) => set("coreValues", values)} />
          </div>
        </div>

        <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <h2 className="font-display text-base font-semibold text-slate-900 sm:col-span-2">Social links</h2>
          {(
            [
              ["facebookUrl", "Facebook"],
              ["instagramUrl", "Instagram"],
              ["linkedinUrl", "LinkedIn"],
              ["xUrl", "X (Twitter)"],
              ["whatsappUrl", "WhatsApp"],
              ["youtubeUrl", "YouTube"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={key} className={labelClass}>
                {label}
              </label>
              <input id={key} type="url" value={form[key]} onChange={(e) => set(key, e.target.value)} className={`mt-1.5 ${inputClass}`} />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
