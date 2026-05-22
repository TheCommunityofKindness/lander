import { useEffect, useState } from "react";
import axios from "axios";
import { Sparkle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatValue(n) {
  if (n == null) return "—";
  if (n >= 1000) {
    const k = (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1);
    return `${k}k+`;
  }
  if (n >= 100) return `${n}+`;
  return `${n}`;
}

function useCountUp(target, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null) return;
    if (target === 0) {
      setValue(0);
      return;
    }
    let raf;
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function StatTile({ idx, value, label, sub, loading }) {
  const animated = useCountUp(loading ? null : value);
  return (
    <div
      data-testid={`stat-${idx}`}
      className="bg-cream px-6 py-10 md:py-14 md:px-10 group hover:bg-white transition-colors duration-500"
    >
      <p
        className="font-serif-display text-5xl md:text-7xl text-plum leading-none tracking-tight group-hover:text-flamingo-600 transition-colors min-h-[1em]"
        data-testid={`stat-value-${idx}`}
      >
        {loading ? (
          <span className="inline-block w-20 h-10 md:h-14 bg-line/70 rounded-md animate-pulse" />
        ) : (
          formatValue(animated)
        )}
      </p>
      <p className="mt-4 text-ink font-medium text-base">{label}</p>
      <p className="text-sm text-softink mt-1 font-light">{sub}</p>
    </div>
  );
}

export default function Impact() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/stats/public`);
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = !stats && !error;
  const tiles = [
    {
      value: stats?.fridays_served,
      label: "Fridays served",
      sub: "and counting",
    },
    {
      value: stats?.meals_shared,
      label: "Meals shared",
      sub: "table to table",
    },
    {
      value: stats?.volunteers,
      label: "Volunteers",
      sub: "across Freo",
    },
    {
      value: stats?.people_held,
      label: "People held",
      sub: "with consent + care",
    },
  ];

  const updatedLabel = stats?.updated_at
    ? new Date(stats.updated_at).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <section
      id="impact"
      data-testid="impact-section"
      className="py-24 md:py-32 relative"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
          <div className="lg:col-span-7">
            <p className="overline text-flamingo-600 mb-5 flex items-center gap-2">
              <Sparkle className="w-3 h-3" strokeWidth={2} />
              By the numbers
              {updatedLabel && (
                <span
                  data-testid="stats-updated-at"
                  className="ml-2 normal-case tracking-normal text-[0.65rem] text-softink/70 font-normal"
                >
                  · live · last refreshed {updatedLabel}
                </span>
              )}
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-plum leading-[1.05] tracking-tight">
              Small acts.
              <span className="italic text-flamingo-600"> Stacked.</span>
              <br />
              Into something that holds.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lg text-softink font-light leading-relaxed">
              These figures stream from the Volunteer Hub — aggregate only, no
              names, no surveillance. Help us add to them.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line/70 rounded-3xl overflow-hidden border border-line/70">
          {tiles.map((t, i) => (
            <StatTile
              key={i}
              idx={i}
              value={t.value}
              label={t.label}
              sub={t.sub}
              loading={loading}
            />
          ))}
        </div>
        {error && (
          <p className="mt-4 text-xs text-softink text-center" data-testid="stats-error">
            Live numbers are catching their breath — please refresh in a moment.
          </p>
        )}
      </div>
    </section>
  );
}
