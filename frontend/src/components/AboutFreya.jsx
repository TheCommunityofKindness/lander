import { IMAGES } from "@/lib/constants";
import { Quote } from "lucide-react";

export default function AboutFreya() {
  return (
    <section
      id="about"
      data-testid="about-section"
      className="py-24 md:py-32 relative"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* Image side */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-30px_rgba(74,42,42,0.3)]">
            <img
              src={IMAGES.communityLunch}
              alt="A long communal dining table set outdoors in Fremantle"
              className="w-full h-full object-cover"
              data-testid="about-image"
            />
          </div>
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-flamingo-100/80 backdrop-blur-sm border border-flamingo-200 p-6 flex items-center justify-center rotate-[6deg]">
            <p className="font-serif-display italic text-flamingo-700 text-center text-sm leading-tight">
              Founded with<br />
              <span className="text-2xl block mt-1 not-italic">love</span>
              not policy
            </p>
          </div>
        </div>

        {/* Text side */}
        <div className="lg:col-span-7">
          <p className="overline text-flamingo-600 mb-5">
            The story · Freya Cheffers
          </p>
          <h2
            className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-plum leading-[1.05] tracking-tight"
            data-testid="about-headline"
          >
            It started with one
            <span className="italic text-flamingo-600"> lunch</span>,
            <br />
            and refused to stop there.
          </h2>

          <div className="mt-8 space-y-5 text-lg text-softink leading-relaxed max-w-2xl font-light">
            <p>
              Freya Cheffers saw what many of us walk past — rough sleepers in
              the Walyalup area, treated more like scenery than people. So she
              did something quietly radical. She showed up. Week after week.
              With food, with company, with respect.
            </p>
            <p>
              From a small Friday gathering, the{" "}
              <span className="text-ink font-medium">Friday Lunchies</span>{" "}
              have grown into a reliable, dignified meeting place — where a hot
              meal is the beginning of the conversation, not the end of it.
            </p>
            <p>
              Now, we're formalising. Expanding. Bringing more hands, more
              meals, more pathways to housing, healthcare, and community. The
              kindness stays the same. The reach gets bigger.
            </p>
          </div>

          <blockquote className="mt-10 pl-6 border-l-2 border-flamingo-400 relative">
            <Quote className="absolute -left-3 -top-2 w-5 h-5 text-flamingo-400 bg-cream" strokeWidth={1.5} />
            <p className="font-serif-display text-2xl italic text-plum leading-snug">
              "Nobody chooses to be invisible. The least we can do is set an
              extra place at the table — and mean it."
            </p>
            <footer className="mt-3 text-sm text-softink not-italic">
              — Freya Cheffers, founder
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
