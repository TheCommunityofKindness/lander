import { IMAGES } from "@/lib/constants";

const quotes = [
  {
    text: "I came for the food. I stayed because someone remembered my name.",
    author: "A Friday regular",
  },
  {
    text: "It's the only place in Freo where I don't feel like a problem to be solved.",
    author: "Anonymous guest",
  },
  {
    text: "Freya doesn't run a charity. She runs a long, generous lunch — and we're all invited.",
    author: "Volunteer, six months in",
  },
];

export default function Gallery() {
  return (
    <section
      data-testid="gallery-section"
      className="py-24 md:py-32 bg-stone/40 relative"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-12 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="overline text-flamingo-600 mb-5">Voices · Faces</p>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-plum leading-[1.05] tracking-tight">
              In the words of
              <span className="italic text-flamingo-600"> the table.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {/* Large photo */}
          <div className="md:col-span-7 md:row-span-2 relative aspect-[4/5] md:aspect-auto rounded-3xl overflow-hidden">
            <img
              src={IMAGES.foodGathering}
              alt="Friends sharing food outdoors with music"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum/50 to-transparent" />
            <p className="absolute bottom-8 left-8 right-8 font-serif-display text-2xl md:text-3xl italic text-white leading-tight">
              {quotes[0].text}
              <span className="block mt-3 text-sm not-italic font-sans tracking-wide text-flamingo-100">
                — {quotes[0].author}
              </span>
            </p>
          </div>

          {/* Two quote cards */}
          <div className="md:col-span-5 card-soft p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-flamingo-50 to-white">
            <p className="font-serif-display text-2xl md:text-3xl italic text-plum leading-snug">
              "{quotes[1].text}"
            </p>
            <p className="mt-5 text-sm text-softink tracking-wide">
              — {quotes[1].author}
            </p>
          </div>

          <div className="md:col-span-5 relative aspect-[4/3] rounded-3xl overflow-hidden">
            <img
              src={IMAGES.fremantleSunset}
              alt="South Fremantle coastal sunset"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-plum/30 to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 font-serif-display text-xl italic text-white">
              Walyalup sunsets — our weekly backdrop.
            </p>
          </div>
        </div>

        <div className="mt-10 max-w-3xl mx-auto text-center">
          <p className="font-serif-display text-3xl md:text-4xl italic text-plum leading-snug">
            "{quotes[2].text}"
          </p>
          <p className="mt-4 text-sm text-softink tracking-wide">— {quotes[2].author}</p>
        </div>
      </div>
    </section>
  );
}
