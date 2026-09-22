"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, PackageCheck, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Send your request",
    description: "Share your prescription details online or by phone — no account needed.",
  },
  {
    icon: ShieldCheck,
    title: "A pharmacist reviews it",
    description: "A licensed pharmacist checks dosage, interactions and availability before approval.",
  },
  {
    icon: PackageCheck,
    title: "Pick up or get it delivered",
    description: "Collect at your nearest branch or arrange delivery, whichever is easier.",
  },
];

const AUTOPLAY_MS = 4500;

// Featured-pricing-card layout: three cards side by side, bottom-aligned,
// and the active one is simply taller — with more padding, an inverted
// dark-teal fill (the same "sweep to teal-800" treatment the service cards
// use on hover) and an eyebrow tag — so it visibly stands in front without
// stacking behind or overlapping its neighbors.
export function ProcessCards() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => {
      setActive((current) => (current + 1) % STEPS.length);
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active, paused]);

  return (
    <div className="mt-14">
      <div
        className="grid items-end gap-5 sm:grid-cols-3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {STEPS.map((step, index) => {
          const isActive = index === active;

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => setActive(index)}
              aria-current={isActive ? "step" : undefined}
              className={`flex flex-col items-center rounded-2xl border text-center transition-[background-color,border-color,box-shadow,padding] duration-500 ease-out ${
                isActive
                  ? "cursor-default border-teal-900 bg-teal-900 px-8 py-12 shadow-xl"
                  : "cursor-pointer border-slate-200 bg-white px-6 py-8 shadow-sm hover:border-teal-200 hover:shadow-md"
              }`}
            >
              {isActive && (
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                  Current step
                </span>
              )}

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-500 ${
                  isActive ? "bg-white/10 text-white" : "bg-slate-100 text-ink"
                }`}
              >
                <step.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>

              <h3
                className={`mt-5 font-display text-lg font-semibold transition-colors duration-500 ${
                  isActive ? "text-xl text-white" : "text-slate-900"
                }`}
              >
                {step.title}
              </h3>

              <p
                className={`mt-1 font-display text-sm transition-colors duration-500 ${
                  isActive ? "text-white/60" : "text-slate-400"
                }`}
              >
                Step {index + 1} of {STEPS.length}
              </p>

              <div
                className={`mt-6 h-px w-full transition-colors duration-500 ${
                  isActive ? "bg-white/15" : "bg-slate-100"
                }`}
              />

              {isActive && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-6 text-sm leading-relaxed text-white/80"
                >
                  {step.description}
                </motion.p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2.5">
        {STEPS.map((step, index) => (
          <button
            key={step.title}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show step ${index + 1}: ${step.title}`}
            aria-current={index === active ? "step" : undefined}
            className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${
              index === active ? "w-8 bg-teal-700" : "w-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
