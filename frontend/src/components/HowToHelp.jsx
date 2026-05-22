import { HandHeart, HeartHandshake, Share2, ArrowUpRight } from "lucide-react";
import { LINKS } from "@/lib/constants";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HowToHelp() {
  const [vName, setVName] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vNote, setVNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleVolunteer = async (e) => {
    e.preventDefault();
    if (!vName.trim() || !vEmail.trim()) {
      toast.error("Please share your name and email.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/volunteers`, {
        name: vName.trim(),
        email: vEmail.trim(),
        note: vNote.trim() || null,
      });
      toast.success("Thank you — we'll be in touch warmly.");
      setVName("");
      setVEmail("");
      setVNote("");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Community of Kindness — Walyalup",
      text: "Friday Lunchies in Fremantle. Dignity, connection, and a place at the table.",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied — pass it on with love.");
      }
    } catch (e) {
      // user cancelled
    }
  };

  return (
    <section
      id="help"
      data-testid="help-section"
      className="py-24 md:py-32 relative"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <p className="overline text-flamingo-600 mb-5">Get involved</p>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-plum leading-[1.05] tracking-tight">
            Three ways to
            <span className="italic text-flamingo-600"> show up.</span>
          </h2>
          <p className="mt-6 text-lg text-softink font-light leading-relaxed">
            Big or small, every contribution helps the table stretch further.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Donate */}
          <article className="card-soft p-8 md:p-10 flex flex-col bg-gradient-to-br from-flamingo-50/60 to-white">
            <div className="w-12 h-12 rounded-2xl bg-flamingo-500 flex items-center justify-center mb-6">
              <HandHeart className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif-display text-3xl text-plum leading-tight">
              Donate
            </h3>
            <p className="mt-3 text-softink leading-relaxed font-light flex-1">
              Fund a Friday. Every dollar buys ingredients, fuel for deliveries,
              and the steady hum of consistency.
            </p>
            <a
              href={LINKS.gofundme}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="help-donate-btn"
              className="btn-primary mt-7 group self-start"
            >
              Give via GoFundMe
              <ArrowUpRight
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.75}
              />
            </a>
          </article>

          {/* Volunteer form */}
          <article className="card-soft p-8 md:p-10 flex flex-col md:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-flamingo-100 flex items-center justify-center mb-6">
              <HeartHandshake
                className="w-5 h-5 text-flamingo-600"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="font-serif-display text-3xl text-plum leading-tight">
              Volunteer
            </h3>
            <p className="mt-3 text-softink leading-relaxed font-light">
              Cook, serve, set the table, drive a kilo of sandwiches across town
              — leave your details and we'll be in touch.
            </p>
            <form
              onSubmit={handleVolunteer}
              data-testid="volunteer-form"
              className="mt-6 space-y-3 flex flex-col"
            >
              <input
                type="text"
                placeholder="Your name"
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                data-testid="volunteer-name-input"
                className="w-full px-4 py-3 rounded-xl border border-line bg-cream/50 text-ink placeholder:text-softink/60 focus:outline-none focus:border-flamingo-400 focus:bg-white transition-all text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={vEmail}
                onChange={(e) => setVEmail(e.target.value)}
                data-testid="volunteer-email-input"
                className="w-full px-4 py-3 rounded-xl border border-line bg-cream/50 text-ink placeholder:text-softink/60 focus:outline-none focus:border-flamingo-400 focus:bg-white transition-all text-sm"
              />
              <textarea
                placeholder="How would you like to help? (optional)"
                value={vNote}
                onChange={(e) => setVNote(e.target.value)}
                rows={2}
                data-testid="volunteer-note-input"
                className="w-full px-4 py-3 rounded-xl border border-line bg-cream/50 text-ink placeholder:text-softink/60 focus:outline-none focus:border-flamingo-400 focus:bg-white transition-all text-sm resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                data-testid="volunteer-submit-btn"
                className="btn-primary self-start mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Sign me up"}
              </button>
            </form>
          </article>

          {/* Share */}
          <article className="card-soft p-8 md:p-10 flex flex-col bg-gradient-to-br from-flamingo-50/60 to-white">
            <div className="w-12 h-12 rounded-2xl bg-flamingo-100 flex items-center justify-center mb-6">
              <Share2 className="w-5 h-5 text-flamingo-600" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif-display text-3xl text-plum leading-tight">
              Share
            </h3>
            <p className="mt-3 text-softink leading-relaxed font-light flex-1">
              Word of mouth keeps grassroots work alive. Follow Freya's updates
              on Facebook and pass our table on.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="help-facebook-btn"
                className="btn-secondary"
              >
                Open Facebook
              </a>
              <button
                onClick={handleShare}
                data-testid="help-share-btn"
                className="btn-secondary"
              >
                Share link
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
