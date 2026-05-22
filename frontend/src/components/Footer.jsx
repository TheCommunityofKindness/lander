import { useState } from "react";
import { Facebook, Mail, MapPin, ArrowRight, ArrowUpRight, Gem, Network } from "lucide-react";
import { LINKS } from "@/lib/constants";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/subscribe`, { email: trimmed });
      toast.success("You're on the list — kindness, in your inbox.");
      setEmail("");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string" && detail.toLowerCase().includes("already")) {
        toast.success("You're already with us. Thank you.");
        setEmail("");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      data-testid="footer"
      className="relative bg-plum text-flamingo-50 pt-24 pb-10 overflow-hidden"
    >
      {/* Soft flamingo aura */}
      <div className="absolute -top-32 -left-40 w-[500px] h-[500px] rounded-full bg-flamingo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-40 w-[600px] h-[600px] rounded-full bg-flamingo-400/15 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-flamingo-100/15">
          {/* Newsletter */}
          <div className="lg:col-span-7">
            <p className="overline text-flamingo-300 mb-5">
              Stay close to the table
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-flamingo-50 leading-[1.05] tracking-tight">
              Get updates,
              <span className="italic text-flamingo-300"> gently.</span>
            </h2>
            <p className="mt-6 text-base md:text-lg text-flamingo-100/80 max-w-xl font-light leading-relaxed">
              A few times a year — never more — we share news, stories, and
              ways you can help when it matters most.
            </p>

            <form
              onSubmit={handleSubscribe}
              data-testid="newsletter-form"
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="newsletter-email-input"
                className="flex-1 px-5 py-3.5 rounded-full bg-white/5 border border-flamingo-100/20 text-flamingo-50 placeholder:text-flamingo-100/40 focus:outline-none focus:border-flamingo-300 focus:bg-white/10 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                data-testid="newsletter-submit-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-flamingo-300 text-plum px-7 py-3.5 text-sm font-medium tracking-wide transition-all hover:bg-flamingo-200 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? "Joining..." : "Join"}
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </form>
          </div>

          {/* Contact / Links */}
          <div className="lg:col-span-5 grid sm:grid-cols-2 gap-10 lg:pl-8">
            <div>
              <p className="overline text-flamingo-300 mb-5">Find us</p>
              <ul className="space-y-3 text-sm text-flamingo-100/85">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 text-flamingo-300 flex-shrink-0" strokeWidth={1.5} />
                  Walyalup · Fremantle, Western Australia
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-1 text-flamingo-300 flex-shrink-0" strokeWidth={1.5} />
                  <a
                    href="mailto:hello@communityofkindness.org"
                    className="hover:text-flamingo-200 transition-colors"
                  >
                    hello@communityofkindness.org
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Facebook className="w-4 h-4 mt-1 text-flamingo-300 flex-shrink-0" strokeWidth={1.5} />
                  <a
                    href={LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="footer-facebook-link"
                    className="hover:text-flamingo-200 transition-colors"
                  >
                    Freya on Facebook
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="overline text-flamingo-300 mb-5">Quick links</p>
              <ul className="space-y-3 text-sm">
                {[
                  { href: "#about", label: "Our story" },
                  { href: "#lunchies", label: "Friday Lunchies" },
                  { href: "#impact", label: "Impact" },
                  { href: "#help", label: "Get involved" },
                  { href: LINKS.gofundme, label: "Donate", external: true },
                ].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-flamingo-100/85 hover:text-flamingo-200 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Network strip */}
        <div className="py-10 border-b border-flamingo-100/15" data-testid="network-strip">
          <p className="overline text-flamingo-300 mb-5">Part of the network</p>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href={LINKS.diamondSoulCentre}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-diamond-soul-link"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-flamingo-100/15 bg-white/[0.03] hover:bg-white/[0.06] hover:border-flamingo-300/40 transition-all hover:-translate-y-0.5"
            >
              <span className="w-11 h-11 rounded-2xl bg-flamingo-300/15 flex items-center justify-center flex-shrink-0">
                <Gem className="w-5 h-5 text-flamingo-200" strokeWidth={1.5} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-serif-display text-xl text-flamingo-50 leading-tight">
                    Diamond Soul Centre
                  </span>
                  <ArrowUpRight
                    className="w-3.5 h-3.5 text-flamingo-200/80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.75}
                  />
                </span>
                <span className="block text-xs text-flamingo-100/70 mt-1 leading-relaxed">
                  Inner-work & somatic practice — the still point upstream of the
                  table.
                </span>
              </span>
            </a>

            <a
              href={LINKS.omnistruxTriad}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-omnistrux-link"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-flamingo-100/15 bg-white/[0.03] hover:bg-white/[0.06] hover:border-flamingo-300/40 transition-all hover:-translate-y-0.5"
            >
              <span className="w-11 h-11 rounded-2xl bg-flamingo-300/15 flex items-center justify-center flex-shrink-0">
                <Network className="w-5 h-5 text-flamingo-200" strokeWidth={1.5} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-serif-display text-xl text-flamingo-50 leading-tight">
                    Omnistrux Triad
                  </span>
                  <ArrowUpRight
                    className="w-3.5 h-3.5 text-flamingo-200/80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.75}
                  />
                </span>
                <span className="block text-xs text-flamingo-100/70 mt-1 leading-relaxed">
                  The systemic platform — three-layer architecture for trust-based
                  community work.
                </span>
              </span>
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-serif-display text-2xl italic text-flamingo-100 leading-tight">
            Community of Kindness · est. with one Friday lunch.
          </p>
          <p className="text-xs text-flamingo-100/50 tracking-wide">
            © {new Date().getFullYear()} Community of Kindness. Made with care
            on Whadjuk Noongar country.
          </p>
        </div>
      </div>
    </footer>
  );
}
