import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import { Heart, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/crm";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await login(email.trim().toLowerCase(), password);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}.`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      data-testid="login-page"
      className="min-h-screen bg-cream grain relative overflow-hidden flex items-center justify-center px-6 py-12"
    >
      {/* Soft flamingo aura */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-flamingo-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-flamingo-100/50 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          data-testid="login-back-home"
          className="inline-flex items-center gap-2 text-sm text-softink hover:text-flamingo-600 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-7">
          <span className="w-12 h-12 rounded-full bg-flamingo-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-flamingo-600 fill-flamingo-500" strokeWidth={1.5} />
          </span>
          <div>
            <p className="overline text-flamingo-500">Volunteer Hub</p>
            <h1 className="font-serif-display text-3xl text-plum leading-none mt-1">
              Sign in
            </h1>
          </div>
        </div>

        <p className="text-softink leading-relaxed font-light mb-8">
          For operators and volunteers of the Community of Kindness. Care without
          consent equates to control — please open the dashboard only when you
          intend to act with respect for the people behind the cards.
        </p>

        <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-4">
          <div>
            <label className="overline text-softink block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="login-email-input"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-softink/40 focus:outline-none focus:border-flamingo-400 transition-all text-sm"
              placeholder="you@communityofkindness.org"
            />
          </div>
          <div>
            <label className="overline text-softink block mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="login-password-input"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-softink/40 focus:outline-none focus:border-flamingo-400 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            data-testid="login-submit-btn"
            className="btn-primary w-full justify-center mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Signing in..." : "Enter the Hub"}
          </button>
        </form>

        <div className="mt-8 p-5 rounded-2xl border border-line bg-white/60 backdrop-blur-sm flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-flamingo-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-xs text-softink leading-relaxed">
            All data is captured under the consent protocol of the Aionic Mirror
            — minimal, time-aware, revocable. No surveillance vectors.
          </p>
        </div>
      </div>
    </main>
  );
}
