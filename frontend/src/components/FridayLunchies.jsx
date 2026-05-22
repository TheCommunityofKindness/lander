import { Utensils, Users, MapPin, Clock, HandHeart, Sparkles } from "lucide-react";

const features = [
  {
    icon: Utensils,
    title: "A warm meal, freshly made",
    body:
      "Home-style cooking served with care — never a handout, always a hand offered.",
    span: "md:col-span-5",
    accent: true,
  },
  {
    icon: Users,
    title: "A real table, real people",
    body:
      "We eat together, eye-to-eye. Volunteers and guests share the same bench.",
    span: "md:col-span-4",
  },
  {
    icon: MapPin,
    title: "In the heart of Walyalup",
    body: "Hosted in Fremantle — accessible, walkable, woven into the streets people already call home.",
    span: "md:col-span-3",
  },
  {
    icon: Clock,
    title: "Every Friday, without fail",
    body: "Consistency is care. The day on the calendar matters as much as the food on the plate.",
    span: "md:col-span-4",
  },
  {
    icon: HandHeart,
    title: "Pathways, not just plates",
    body:
      "Connecting guests with referrals to housing, health and support services across Perth.",
    span: "md:col-span-4",
  },
  {
    icon: Sparkles,
    title: "Joy as a policy",
    body: "Music, flowers, a properly set table. Beauty isn't a luxury — it's the message.",
    span: "md:col-span-4",
  },
];

export default function FridayLunchies() {
  return (
    <section
      id="lunchies"
      data-testid="lunchies-section"
      className="py-24 md:py-32 bg-blush/60 grain relative"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl">
          <p className="overline text-flamingo-600 mb-5">What we do</p>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-plum leading-[1.05] tracking-tight">
            The Friday Lunchies —
            <span className="italic text-flamingo-600"> hospitality</span> as
            quiet revolution.
          </h2>
          <p className="mt-6 text-lg text-softink font-light leading-relaxed">
            Six small principles, repeated weekly, that shape what this
            community looks like in practice.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 scroll-fade">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <article
                key={i}
                data-testid={`lunchies-card-${i}`}
                className={`${f.span} card-soft p-8 md:p-10 relative overflow-hidden ${
                  f.accent ? "bg-gradient-to-br from-flamingo-50 to-white" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-flamingo-100 flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5 text-flamingo-600" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif-display text-2xl md:text-3xl text-plum leading-tight mb-3">
                  {f.title}
                </h3>
                <p className="text-softink leading-relaxed font-light">
                  {f.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
