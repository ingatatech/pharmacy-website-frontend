import { Building2, Package, ShieldCheck, Truck } from "lucide-react";

const STATS = [
  { icon: Building2, title: "branch", detail: "Across Kigali" },
  { icon: ShieldCheck, title: "Licensed pharmacists", detail: "On every shift" },
  { icon: Package, title: "Genuine medication", detail: "Sourced and verified" },
  { icon: Truck, title: "Fast refills", detail: "Ready when you need them" },
];

export function AboutSection({
  aboutUs,
  coreValues,
  branchCount,
}: {
  aboutUs: string;
  coreValues: string[];
  branchCount: number;
}) {
  return (
    <section className="bg-teal-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div>
            <h2 className="font-display text-3xl font-medium text-slate-900 sm:text-4xl">
              Pharmacy care you can rely on
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">{aboutUs}</p>
          </div>

          {coreValues.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-600">What guides us</h3>
              <ul className="mt-4 flex flex-wrap gap-3">
                {coreValues.map((value) => (
                  <li
                    key={value}
                    className="rounded-full border border-teal-200 bg-white px-4 py-2 font-display text-base text-slate-900"
                  >
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-teal-200 pt-12 sm:grid-cols-4">
          {STATS.map((stat, index) => (
            <div key={stat.title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink">
                <stat.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-slate-900">
                  {index === 0 ? `${branchCount} ${stat.title}${branchCount === 1 ? "" : "es"}` : stat.title}
                </p>
                <p className="text-sm text-slate-600">{stat.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
