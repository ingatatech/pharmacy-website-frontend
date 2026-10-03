"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import { coreValueIcon } from "@/lib/core-value-icon";
import { StatNumber } from "@/components/home/StatNumber";
import { T } from "@/lib/language-context";

const HOMEPAGE_CORE_VALUE_LIMIT = 4;

// One compact light band with the proof stacked into a single contained teal
// card. All the content the old two-part version carried is still here —
// quote, four stats, core values — but kept inside the section's own width
// rather than a full-bleed dark band, which was what made the previous
// version feel oversized.
//
// The gradient into bg-sage is deliberate: the next section down
// (LocationsSection) is bg-sage, so fading into it stops this reading as
// yet another hard pale edge in a page that is mostly pale tints.
export function AboutSection({
  aboutUs,
  coreValues,
  whyChooseUs,
  branchCount,
  serviceCount,
}: {
  aboutUs: string;
  coreValues: string[];
  whyChooseUs: string;
  branchCount: number;
  serviceCount: number;
}) {
  // With no values configured the right column collapses and the stats get
  // the full card width back, rather than sitting 2x2 in half a card.
  const hasValues = coreValues.length > 0;

  // The full list belongs to /about, which renders every value in a roomy
  // grid. The homepage card only has a narrow column to work with, so it
  // shows a representative few and links across — otherwise the list grows
  // the section with every value an admin adds.
  const visibleValues = coreValues.slice(0, HOMEPAGE_CORE_VALUE_LIMIT);
  const hiddenValueCount = coreValues.length - visibleValues.length;

  const stats = [
    {
      value: <StatNumber value={branchCount} />,
      label: branchCount === 1 ? "Branch across Kigali" : "Branches across Kigali",
    },
    {
      value: <StatNumber value={serviceCount} />,
      label: "Pharmacy services offered",
    },
    {
      value: "Licensed",
      label: "Pharmacists on every shift",
    },
    {
      value: "Genuine",
      label: "Medication, sourced & verified",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-teal-50 to-sage py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-5 md:gap-12">
          <div className="md:col-span-2">
            <span className="text-sm font-medium text-teal-600">
              <T text="About us" />
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
              <T text="Pharmacy care you can rely on" />
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              <T text={aboutUs} />
            </p>
            <Link
              href="/about"
              className="group mt-6 inline-flex items-center gap-2 rounded-sm text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <T text="Our story" />
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Primary is 3:2, inset is 3:4. The inset overlaps inside the
              primary's bottom-left corner rather than hanging off the
              section edge, so the collage can't collide with the card
              below. alt is empty to match the other brand photography on
              the site (Hero, LocationCard) — the copy beside it carries
              the meaning. */}
          <div className="relative md:col-span-3">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-white/60">
              <Image
                src="/images/about-primary.jpg"
                alt=""
                fill
                sizes="(min-width: 768px) 58vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-5 left-5 w-28 overflow-hidden rounded-2xl shadow-lg ring-4 ring-white sm:w-36">
              <div className="relative aspect-[3/4] bg-white/60">
                <Image
                  src="/images/about-inset.jpg"
                  alt=""
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Proof splits into two columns: the quote and stats read as one
            "why trust us" argument, the values list answers "what guides
            us" beside it. Stacked, the three blocks each got their own
            divider and read as three unrelated strips. */}
        <div className="mt-10 rounded-2xl bg-teal-900 p-6 sm:p-7">
          <div className={`grid gap-7 ${hasValues ? "sm:grid-cols-2 sm:gap-0" : ""}`}>
            <div className={hasValues ? "sm:pr-7" : ""}>
              <div className="flex items-start gap-2.5">
                <Quote className="mt-0.5 h-4 w-4 shrink-0 fill-white/20 text-white/20" strokeWidth={0} aria-hidden />
                <p className="font-display text-base italic leading-snug text-white sm:text-lg">
                  <T text={whyChooseUs} />
                </p>
              </div>

              <div
                className={`mt-5 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-white/10 pt-5 ${hasValues ? "" : "sm:grid-cols-4"}`}
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-display text-lg font-bold text-white">
                      {typeof stat.value === "string" ? <T text={stat.value} /> : stat.value}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/55">
                      <T text={stat.label} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {hasValues && (
              <div className="border-t border-white/10 pt-6 sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                  <T text="What guides us" />
                </p>
<ul className="mt-4 flex flex-col gap-3.5">
                  {visibleValues.map((value, index) => {
                    const Icon = coreValueIcon(value);
                    return (
                      <li key={value} className="flex items-center gap-2.5">
                        {/* Spring pop per disc, once, on scroll. Narrower scope
                            than the section-wide cascade Reveal warns about —
                          a few small icons with a fast stagger. */}
                        <motion.span
                          initial={{ scale: 0, rotate: -90, opacity: 0 }}
                          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ type: "spring", stiffness: 300, damping: 18, delay: index * 0.08 }}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold"
                        >
                          <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                        </motion.span>
                        <span className="font-display text-sm text-white">
                          <T text={value} />
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {hiddenValueCount > 0 && (
                  <Link
                    href="/about"
                    className="group mt-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-emerald-300 transition-colors duration-200 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    <T text={`See all ${coreValues.length} values`} />
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}