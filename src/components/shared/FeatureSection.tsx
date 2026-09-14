const features = [
  {
    number: "01",
    title: "Play together",
    description:
      "Create a private room and invite the people you actually want to play with.",
  },
  {
    number: "02",
    title: "Watch every move",
    description:
      "Friends who aren't playing can stay in the room and watch matches live.",
  },
  {
    number: "03",
    title: "Get better",
    description:
      "Use AI-powered analysis to understand your games instead of just seeing numbers.",
  },
];

export default function FeatureSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 pb-32 lg:px-10">
      <div className="mb-12 max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/30">
          Built around people
        </p>

        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Chess is better
          <br />
          when shared.
        </h2>
      </div>

      <div className="grid border-y border-white/10 md:grid-cols-3 md:divide-x md:divide-white/10">
        {features.map((feature) => (
          <article key={feature.number} className="py-8 md:px-8">
            <span className="text-xs text-white/25">
              {feature.number}
            </span>

            <h3 className="mt-10 text-xl font-medium">
              {feature.title}
            </h3>

            <p className="mt-3 max-w-sm text-sm leading-6 text-white/40">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
