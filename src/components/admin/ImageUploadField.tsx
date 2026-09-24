"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { ApiError, resolveUploadUrl, uploadImage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";

// Shared by every form with an image field (service/product imageUrl,
// article featuredImageUrl) — uploads to POST /api/uploads and writes the
// returned URL back into the form via `onChange`, rather than asking the
// admin to paste a URL by hand.
export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const { token } = useAuth();
  const showToast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, token);
      onChange(url);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1.5 flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
          {value ? (
            <Image src={resolveUploadUrl(value)} alt="" width={96} height={96} className="h-full w-full object-cover" unoptimized />
          ) : (
            <ImagePlus className="h-6 w-6 text-slate-300" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
