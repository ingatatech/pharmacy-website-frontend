export function WhyChooseUs({ statement }: { statement: string }) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="max-w-2xl font-display text-xl leading-snug text-slate-900 sm:text-2xl">
          {statement}
        </p>
      </div>
    </section>
  );
}
