export function AboutSection({
  aboutUs,
  coreValues,
}: {
  aboutUs: string;
  coreValues: string[];
}) {
  return (
    <section className="bg-teal-50">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:items-start md:py-24">
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
    </section>
  );
}
