const stats = [
  { value: "150+", label: "Fridays served", sub: "and counting" },
  { value: "3,000+", label: "Meals shared", sub: "table to table" },
  { value: "80+", label: "Volunteers", sub: "across Freo" },
  { value: "1", label: "Community", sub: "growing in colour" },
];

export default function Impact() {
  return (
    <section
      id="impact"
      data-testid="impact-section"
      className="py-24 md:py-32 relative"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
          <div className="lg:col-span-7">
            <p className="overline text-flamingo-600 mb-5">By the numbers</p>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-plum leading-[1.05] tracking-tight">
              Small acts.
              <span className="italic text-flamingo-600"> Stacked.</span>
              <br />Into something that holds.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lg text-softink font-light leading-relaxed">
              We're a grassroots effort — these numbers are rough, honest, and
              entirely the work of ordinary neighbours. Help us add to them.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line/70 rounded-3xl overflow-hidden border border-line/70">
          {stats.map((s, i) => (
            <div
              key={i}
              data-testid={`stat-${i}`}
              className="bg-cream px-6 py-10 md:py-14 md:px-10 group hover:bg-white transition-colors duration-500"
            >
              <p className="font-serif-display text-5xl md:text-7xl text-plum leading-none tracking-tight group-hover:text-flamingo-600 transition-colors">
                {s.value}
              </p>
              <p className="mt-4 text-ink font-medium text-base">{s.label}</p>
              <p className="text-sm text-softink mt-1 font-light">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
