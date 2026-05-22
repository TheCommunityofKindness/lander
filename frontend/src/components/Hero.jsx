import { ArrowUpRight, Facebook } from "lucide-react";
import { LINKS, IMAGES } from "@/lib/constants";

export default function Hero() {
  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden grain"
    >
      {/* Soft gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-blush via-cream to-cream pointer-events-none" />

      {/* Flamingo feather aura */}
      <div className="absolute -right-32 -top-20 w-[640px] h-[640px] rounded-full opacity-70 pointer-events-none">
        <img
          src={IMAGES.heroFeather}
          alt=""
          className="w-full h-full object-cover rounded-full blur-[2px]"
          style={{ filter: "saturate(0.9)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-cream/30 to-cream rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 scroll-fade">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-flamingo-200 bg-white/60 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-flamingo-500 animate-pulse" />
            <span className="overline text-flamingo-700">
              A grassroots movement in Walyalup
            </span>
          </div>

          <h1
            className="mt-7 font-serif-display text-[3.4rem] sm:text-[4.5rem] lg:text-[5.6rem] leading-[0.95] tracking-tight text-plum"
            data-testid="hero-headline"
          >
            Dignity,
            <span className="italic font-light text-flamingo-600"> connection</span>,
            <br />
            and a place at the table.
          </h1>

          <p className="mt-7 text-lg lg:text-xl text-softink max-w-xl leading-relaxed font-light">
            Every Friday in Fremantle, neighbours share a warm meal, a real
            conversation, and the quiet promise that no one walks alone.
            <span className="block mt-3 text-ink/80">
              Founded by Freya Cheffers — now growing into something more.
            </span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={LINKS.gofundme}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-donate-btn"
              className="btn-primary group"
            >
              Donate via GoFundMe
              <ArrowUpRight
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.75}
              />
            </a>
            <a
              href={LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-facebook-btn"
              className="btn-secondary group"
            >
              <Facebook className="w-4 h-4" strokeWidth={1.5} />
              Follow Freya on Facebook
            </a>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full border-2 border-cream bg-gradient-to-br ${
                    i % 2 ? "from-flamingo-200 to-flamingo-400" : "from-flamingo-300 to-flamingo-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-softink">
              <span className="font-medium text-ink">Hundreds of meals</span>{" "}
              shared, friendships found, lives quietly steadied.
            </p>
          </div>
        </div>

        {/* Right column - editorial flamingo card */}
        <div className="lg:col-span-5 relative hidden lg:block">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-30px_rgba(74,42,42,0.35)]">
            <img
              src={IMAGES.flamingoMotif}
              alt="Pink flamingo feather detail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <p className="overline text-flamingo-200">Our emblem</p>
              <p className="mt-2 font-serif-display text-2xl italic">
                "Stand tall. Stay soft. Show up in colour."
              </p>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-3xl bg-white border border-line shadow-xl p-5 flex flex-col justify-between rotate-[-4deg]">
            <p className="overline text-flamingo-500">Every</p>
            <p className="font-serif-display text-3xl text-plum leading-none">
              Friday
            </p>
            <p className="text-xs text-softink">Lunchies in Freo</p>
          </div>
        </div>
      </div>
    </section>
  );
}
