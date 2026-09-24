import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CapsuleMotif } from "./home/CapsuleMotif";

// The interior-page equivalent of the homepage Hero: a compact breadcrumb
// banner instead of the full-bleed dark hero, since only the homepage has
// a dark image directly behind the header for the nav to float over (so
// the "image" variant here sits below a solid nav bar rather than under a
// transparent one — a plain, common pattern, not a seamless hero repeat).
// The "image" variant uses the uploaded page-bg photo with a dark teal
// scrim over it for text legibility — the same duotone-photo treatment
// qtglobal.rw uses on its own inner-page banners.
export function PageHeader({
  eyebrow,
  title,
  description,
  variant = "light",
  image = "/images/page-bg.jpg",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  variant?: "light" | "image";
  image?: string;
}) {
  const dark = variant === "image";

  return (
    <section className={`relative overflow-hidden border-b ${dark ? "border-teal-950" : "border-slate-200 bg-slate-50"}`}>
      {dark ? (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/95 via-teal-900/90 to-teal-800/80" />
        </>
      ) : (
        <div className="pointer-events-none absolute -right-20 top-1/2 hidden -translate-y-1/2 opacity-[0.06] md:block">
          <CapsuleMotif className="h-72 w-72" />
        </div>
      )}

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <nav
          aria-label="Breadcrumb"
          className={`flex min-w-0 items-center gap-2 text-sm ${dark ? "text-white/60" : "text-slate-500"}`}
        >
          <Link
            href="/"
            className={`shrink-0 transition-colors duration-200 ${dark ? "hover:text-white" : "hover:text-slate-900"}`}
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className={`min-w-0 truncate ${dark ? "text-white" : "text-slate-900"}`}>{title}</span>
        </nav>

        {eyebrow && (
          <span className={`mt-6 block text-sm font-medium ${dark ? "text-emerald-400" : "text-teal-600"}`}>
            {eyebrow}
          </span>
        )}
        <h1
          className={`mt-2 font-display text-4xl font-medium sm:text-5xl ${dark ? "text-white" : "text-slate-900"}`}
        >
          {title}
        </h1>
        {description && (
          <p className={`mt-4 max-w-2xl text-base leading-relaxed ${dark ? "text-white/70" : "text-slate-600"}`}>
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
