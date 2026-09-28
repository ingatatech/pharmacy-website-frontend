import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Pill } from "lucide-react";
import { CapsuleMotif } from "./home/CapsuleMotif";
import { T } from "@/lib/language-context";

// The interior-page equivalent of the homepage Hero: a compact breadcrumb
// banner instead of the full-bleed dark hero, since only the homepage has
// a dark image directly behind the header for the nav to float over (so
// the "image" variant here sits below a solid nav bar rather than under a
// transparent one — a plain, common pattern, not a seamless hero repeat).
// The "image" variant uses the uploaded page-bg photo with a dark teal
// scrim over it for text legibility — the same duotone-photo treatment
// qtglobal.rw uses on its own inner-page banners.
// The "pattern" variant reuses the homepage Hero's own photo + light teal
// wash (not the heavier near-opaque scrim the "image" variant uses), plus
// scattered CapsuleMotif shapes — used for every /products/[slug] page so
// each product gets a hero that matches the homepage's palette and stays
// consistent regardless of whether that product has a real photo yet,
// rather than repeating one generic stock image in the content itself (or
// a packaging shot that wasn't shot to fill a wide banner).
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
  variant?: "light" | "image" | "pattern";
  image?: string;
}) {
  const dark = variant === "image" || variant === "pattern";
  // The "pattern" wash is much lighter than "image"'s near-opaque scrim
  // (matching the homepage Hero's own lighter treatment), so its text needs
  // the same shadow Hero uses to stay legible over the photo underneath.
  const shadow = variant === "pattern" ? "text-shadow-nav" : "";

  return (
    <section className={`relative overflow-hidden border-b ${dark ? "border-teal-950" : "border-slate-200 bg-slate-50"}`}>
      {variant === "image" && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/95 via-teal-900/90 to-teal-800/80" />
        </>
      )}
      {variant === "pattern" && (
        <>
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-110 object-cover blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/55 via-teal-800/40 to-teal-700/25" />
          <CapsuleMotif
            tone="white"
            className="pointer-events-none absolute -right-16 -top-28 h-[26rem] w-[26rem] rotate-12 opacity-[0.14]"
          />
          <CapsuleMotif
            tone="white"
            className="pointer-events-none absolute -bottom-40 left-1/4 hidden h-96 w-96 -rotate-12 opacity-[0.1] sm:block"
          />
          <CapsuleMotif
            tone="white"
            className="pointer-events-none absolute right-1/4 top-1/2 hidden h-64 w-64 -translate-y-1/2 rotate-45 opacity-[0.08] lg:block"
          />
        </>
      )}
      {variant === "light" && (
        <div className="pointer-events-none absolute -right-20 top-1/2 hidden -translate-y-1/2 opacity-[0.06] md:block">
          <CapsuleMotif className="h-72 w-72" />
        </div>
      )}

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <nav
          aria-label="Breadcrumb"
          className={`flex min-w-0 items-center gap-2 text-sm ${dark ? "text-white/60" : "text-slate-500"} ${shadow}`}
        >
          <Link
            href="/"
            className={`shrink-0 transition-colors duration-200 ${dark ? "hover:text-white" : "hover:text-slate-900"}`}
          >
            <T text="Home" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className={`min-w-0 truncate ${dark ? "text-white" : "text-slate-900"}`}>
            <T text={title} />
          </span>
        </nav>

        {eyebrow && (
          <div className={`mt-6 flex items-center gap-2.5 ${shadow}`}>
            {variant === "pattern" && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-emerald-300 ring-1 ring-white/25 backdrop-blur-sm">
                <Pill className="h-4 w-4" strokeWidth={2} />
              </span>
            )}
            <span className={`text-sm font-medium ${dark ? "text-emerald-400" : "text-teal-600"}`}>
              <T text={eyebrow} />
            </span>
          </div>
        )}
        <h1
          className={`mt-2 font-display text-4xl font-medium sm:text-5xl ${dark ? "text-white" : "text-slate-900"} ${shadow}`}
        >
          <T text={title} />
        </h1>
        {variant === "pattern" && <span aria-hidden className="mt-4 block h-1 w-14 rounded-full bg-gold" />}
        {description && (
          <p className={`mt-4 max-w-2xl text-base leading-relaxed ${dark ? "text-white/70" : "text-slate-600"} ${shadow}`}>
            <T text={description} />
          </p>
        )}
      </div>
    </section>
  );
}
