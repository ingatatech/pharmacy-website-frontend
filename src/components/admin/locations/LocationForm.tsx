"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { OpeningHoursEditor } from "@/components/admin/OpeningHoursEditor";
import { SlugField } from "@/components/admin/SlugField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { PharmacyLocation, Service, WeeklyOpeningHours } from "@/types";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";
const labelClass = "block text-sm font-medium text-slate-700";

export function LocationForm({ location }: { location?: PharmacyLocation }) {
  const { token } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const [branchName, setBranchName] = useState(location?.branchName || "");
  const [slug, setSlug] = useState(location?.slug || "");
  const [description, setDescription] = useState(location?.description || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(location?.photoUrl ?? null);
  const [address, setAddress] = useState(location?.address || "");
  const [telephone, setTelephone] = useState(location?.telephone || "");
  const [latitude, setLatitude] = useState(location?.latitude != null ? String(location.latitude) : "");
  const [longitude, setLongitude] = useState(location?.longitude != null ? String(location.longitude) : "");
  const [openingHours, setOpeningHours] = useState<WeeklyOpeningHours>(location?.openingHours || {});
  const [availableServices, setAvailableServices] = useState<string[]>(location?.availableServices || []);
  const [isActive, setIsActive] = useState(location?.isActive ?? true);
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Service[]>("/api/services")
      .then(setServices)
      .catch(() => {});
  }, []);

  function toggleService(slug: string) {
    setAvailableServices((current) => (current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);

    const payload = {
      branchName,
      slug,
      description: description || null,
      photoUrl,
      address,
      telephone: telephone || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      openingHours,
      availableServices,
      isActive,
    };

    try {
      if (location) {
        await apiFetch(`/api/locations/${location.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        showToast("success", "Location updated.");
      } else {
        await apiFetch("/api/locations", { method: "POST", body: JSON.stringify(payload) }, token);
        showToast("success", "Location created.");
      }
      router.push("/admin/locations");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <label htmlFor="branchName" className={labelClass}>
            Branch name
          </label>
          <input id="branchName" type="text" value={branchName} onChange={(e) => setBranchName(e.target.value)} required className={`mt-1.5 ${inputClass}`} />
        </div>
        <SlugField value={slug} onChange={setSlug} sourceValue={branchName} />
        <div>
          <label htmlFor="telephone" className={labelClass}>
            Telephone
          </label>
          <input id="telephone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className={`mt-1.5 ${inputClass}`} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>
            Branch description <span className="text-slate-400">(optional — shown on this branch&apos;s own page)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`mt-1.5 ${inputClass} min-h-[5rem]`}
          />
        </div>
        <div className="sm:col-span-2">
          <ImageUploadField label="Branch photo (optional)" value={photoUrl} onChange={setPhotoUrl} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address" className={labelClass}>
            Address
          </label>
          <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className={`mt-1.5 ${inputClass}`} />
        </div>
        <div>
          <label htmlFor="latitude" className={labelClass}>
            Latitude
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g. -1.9441"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="longitude" className={labelClass}>
            Longitude
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g. 30.0619"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            Active branch
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <span className={labelClass}>Available services</span>
        {services.length === 0 ? (
          <p className="mt-1.5 text-sm text-slate-400">No services created yet.</p>
        ) : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {services.map((service) => (
              <label key={service.id} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={availableServices.includes(service.slug)}
                  onChange={() => toggleService(service.slug)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                />
                {service.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/locations")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : location ? "Save changes" : "Create location"}
        </button>
      </div>
    </form>
  );
}
