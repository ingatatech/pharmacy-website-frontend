"use client";

import { motion } from "framer-motion";
import {
  Accessibility,
  Award,
  Building2,
  HandHeart,
  Handshake,
  HeartHandshake,
  HeartPulse,
  Package,
  Quote,
  Scale,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { StatNumber } from "@/components/home/StatNumber";
import { T } from "@/lib/language-context";

// Keyword match against whatever the admin has typed into SiteSetting's
// core-values list — same approach as ServiceCard's serviceIcon, since
// these are free-text values, not a fixed enum.
function coreValueIcon(value: string) {
  const text = value.toLowerCase();
  if (text.includes("integrity")) return Scale;
  if (text.includes("professional")) return Award;
  if (text.includes("customer") || text.includes("care")) return HeartHandshake;
  if (text.includes("safe")) return ShieldCheck;
  if (text.includes("accessib")) return Accessibility;
  if (text.includes("responsib")) return HandHeart;
  if (text.includes("trust")) return Handshake;
  if (text.includes("excellen")) return Trophy;
  return Sparkles;
}

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
  const stats = [
    {
      icon: Building2,
      value: <StatNumber value={branchCount} />,
      label: branchCount === 1 ? "Branch across Kigali" : "Branches across Kigali",
    },
    {
      icon: HeartPulse,
      value: <StatNumber value={serviceCount} />,
      label: "Pharmacy services offered",
      featured: true,
    },
    {
      icon: ShieldCheck,
      value: "Licensed",
      label: "Pharmacists on every shift",
    },
    {
      icon: Package,
      value: "Genuine",
      label: "Medication, sourced & verified",
    },
  ];

  return (
    <>
      <section className="bg-teal-50 pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-start">
            <div>
              <span className="block text-center font-display text-2xl font-semibold text-ink sm:text-3xl">
                <T text="About us" />
              </span>
              <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
                <T text="Pharmacy care you can rely on" />
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
                <T text={aboutUs} />
              </p>
            </div>

            {coreValues.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-600">
                  <T text="What guides us" />
                </h3>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {coreValues.map((value, index) => {
                    const Icon = coreValueIcon(value);
                    return (
                      <li
                        key={value}
                        className="flex items-center gap-2.5 rounded-full border border-teal-200 bg-white py-2 pl-2 pr-4 font-display text-base text-slate-900"
                      >
                        <motion.span
                          initial={{ scale: 0, rotate: -90, opacity: 0 }}
                          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ type: "spring", stiffness: 300, damping: 18, delay: index * 0.08 }}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold"
                        >
                          <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                        </motion.span>
                        <T text={value} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Real trust statement (from SiteSetting.whyChooseUs), styled as a
              pull-quote instead of a separate full-width section — reads as
              the natural payoff line after the copy and core values above. */}
          <div className="mt-12 flex items-start gap-4 border-t border-teal-100 pt-10 sm:mt-16 sm:gap-5 sm:pt-12">
            <Quote className="h-7 w-7 shrink-0 fill-teal-200 text-teal-200 sm:h-8 sm:w-8" strokeWidth={0} aria-hidden />
            <p className="max-w-3xl font-display text-xl font-medium italic leading-snug text-teal-900 sm:text-2xl">
              <T text={whyChooseUs} />
            </p>
          </div>
        </div>
      </section>

      {/* Pulls up into this section's own bottom padding (always present,
          always this exact amount — safe regardless of data) so the card
          floats above the seam. Deliberately NOT a symmetric -my- pull
          into the section below too: which section renders next depends on
          whether locations/articles/FAQs have any data, and a couple of
          those can be empty (or all of them, before the DB has content),
          in which case a bottom pull would land in whatever section
          happens to be next and eat into ITS padding by an amount sized
          for a different neighbor — visible as the card overlapping
          straight into that section with no gap. A fixed bottom margin
          instead guarantees consistent spacing no matter what follows. */}
      <div className="relative z-10 mx-auto -mt-10 mb-16 max-w-6xl px-4 sm:-mt-14 sm:mb-24 sm:px-6">
        <div className="grid grid-cols-2 gap-3 bg-teal-800 p-7 sm:grid-cols-4 sm:gap-5 sm:p-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`flex flex-col gap-3 rounded-2xl p-4 transition-colors duration-300 sm:flex-row sm:items-center sm:gap-4 sm:p-5 ${
                stat.featured ? "bg-white/10" : "bg-white/5"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white sm:h-12 sm:w-12">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl font-bold text-white sm:text-3xl">
                  {typeof stat.value === "string" ? <T text={stat.value} /> : stat.value}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-white/60 sm:text-sm">
                  <T text={stat.label} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
