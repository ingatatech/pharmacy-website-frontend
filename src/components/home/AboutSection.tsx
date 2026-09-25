"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { coreValueIcon } from "@/lib/core-value-icon";
import { StatNumber } from "@/components/home/StatNumber";
import { T } from "@/lib/language-context";

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
    <section className="bg-teal-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[7fr_3fr] md:items-start">
          <div>
            <span className="block text-center text-sm font-medium text-teal-600">
              <T text="About us" />
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
              <T text="Pharmacy care you can rely on" />
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-600">
              <T text={aboutUs} />
            </p>

            {/* Small, contained quote + stats — sits under the copy instead
                of its own full-bleed band, sized down to match this column's
                width rather than the whole page. */}
            <div className="mt-8 max-w-md rounded-2xl bg-teal-900 p-5 sm:p-6">
              <div className="flex items-start gap-2">
                <Quote className="mt-0.5 h-4 w-4 shrink-0 fill-white/20 text-white/20" strokeWidth={0} aria-hidden />
                <p className="text-sm italic leading-snug text-white">
                  <T text={whyChooseUs} />
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-white/10 pt-4 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-display text-base font-bold text-white">
                      {typeof stat.value === "string" ? <T text={stat.value} /> : stat.value}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-snug text-white/55">
                      <T text={stat.label} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
      </div>
    </section>
  );
}
