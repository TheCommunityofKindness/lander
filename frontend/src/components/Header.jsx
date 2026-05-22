import { Facebook, Heart, ShieldCheck } from "lucide-react";
import { LINKS } from "@/lib/constants";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#lunchies", label: "Friday Lunchies" },
    { href: "#impact", label: "Impact" },
    { href: "#help", label: "Get Involved" },
  ];

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-cream/75 border-b border-line/70 shadow-[0_1px_30px_-12px_rgba(74,42,42,0.12)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <a
          href="#top"
          data-testid="logo-link"
          className="flex items-center gap-2.5 group"
        >
          <span className="relative w-9 h-9 rounded-full bg-flamingo-100 flex items-center justify-center transition-transform group-hover:rotate-[8deg]">
            <Heart
              className="w-4 h-4 text-flamingo-600 fill-flamingo-500"
              strokeWidth={1.5}
            />
          </span>
          <div className="leading-none">
            <span className="block font-serif-display text-xl text-plum tracking-tight">
              Community of Kindness
            </span>
            <span className="block overline text-flamingo-500 mt-0.5">
              Walyalup · Fremantle
            </span>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm text-softink hover:text-flamingo-600 transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            aria-label="Volunteer Hub login"
            data-testid="header-volunteer-hub-link"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-softink hover:text-flamingo-600 transition-colors px-3 py-2 rounded-full border border-line/70 hover:border-flamingo-300"
          >
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
            Volunteer Hub
          </Link>
          <a
            href={LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on Facebook"
            data-testid="header-facebook-icon"
            className="w-10 h-10 rounded-full border border-line/80 flex items-center justify-center text-softink hover:text-flamingo-600 hover:border-flamingo-300 transition-all hover:-translate-y-0.5"
          >
            <Facebook className="w-4 h-4" strokeWidth={1.5} />
          </a>
          <a
            href={LINKS.gofundme}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="header-donate-btn"
            className="btn-primary !py-3 !px-6 text-xs sm:text-sm"
          >
            Donate
          </a>
        </div>
      </div>
    </header>
  );
}
