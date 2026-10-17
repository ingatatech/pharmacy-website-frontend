"use client";

import { Share2 } from "lucide-react";
import { T } from "@/lib/language-context";

export function ShareButton({ title }: { title: string }) {
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-teal-300 hover:text-teal-700 shadow-sm"
    >
      <Share2 className="h-4 w-4" />
      <T text="Share" />
    </button>
  );
}
