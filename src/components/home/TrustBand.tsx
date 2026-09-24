import { Quote } from "lucide-react";
import { StatNumber } from "@/components/home/StatNumber";
import { T } from "@/lib/language-context";

// Full-bleed "trust band" — quote and stats merged into one continuous
// dark section instead of cards floating on the page. No boxes, no icons,
// no imagery — just typography scale and thin dividers doing the work, the
// Stripe/Linear-style "proof band". Shared by the homepage About section
// and the standalone About page.
export function TrustBand({
  whyChooseUs,
  branchCount,
  serviceCount,
}: {
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
    <section className="bg-teal-900 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <Quote className="mx-auto h-6 w-6 fill-white/15 text-white/15 sm:h-7 sm:w-7" strokeWidth={0} aria-hidden />
        <p className="mt-3 font-display text-lg font-medium italic leading-snug text-white sm:text-xl">
          <T text={whyChooseUs} />
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-6 sm:mt-10">
        <div className="grid grid-cols-2 divide-x divide-y divide-white/10 border-y border-white/10 sm:grid-cols-4 sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-3 py-3 text-center sm:py-1">
              <p className="font-display text-lg font-bold text-white sm:text-2xl">
                {typeof stat.value === "string" ? <T text={stat.value} /> : stat.value}
              </p>
              <p className="max-w-[9rem] text-[11px] leading-snug text-white/55 sm:text-xs">
                <T text={stat.label} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
