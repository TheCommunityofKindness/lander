import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Heart,
  LogOut,
  Plus,
  Search,
  Shield,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Layers,
  Gauge,
} from "lucide-react";
import { formatApiErrorDetail } from "@/context/AuthContext";
import { TRUST_LEVELS, LAYER_LABELS } from "@/lib/crmConstants";
import NewCardDialog from "@/components/crm/NewCardDialog";
import CardDetail from "@/components/crm/CardDetail";
import KPIEditor from "@/components/crm/KPIEditor";

export default function CRM() {
  const { user, logout, authedAxios } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [trustFilter, setTrustFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [showKPI, setShowKPI] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchCards = async () => {
    try {
      const { data } = await authedAxios().get("/cards");
      setCards(data);
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Failed to load cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Signed out. Thank you for showing up.");
    navigate("/");
  };

  const filtered = cards.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchesQ =
      !q ||
      c.alias.toLowerCase().includes(q) ||
      (c.public?.location_patterns || "").toLowerCase().includes(q) ||
      (c.private?.real_name || "").toLowerCase().includes(q);
    const matchesTrust = trustFilter === "all" || c.private?.trust_level === trustFilter;
    return matchesQ && matchesTrust;
  });

  const stats = {
    total: cards.length,
    layer2plus: cards.filter((c) => c.layer >= 2).length,
    anchored: cards.filter((c) => c.private?.trust_level === "anchored").length,
    revoked: cards.filter((c) => c.consent?.revoked_at).length,
  };

  return (
    <main className="min-h-screen bg-cream" data-testid="crm-page">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-cream/85 border-b border-line">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-flamingo-100 flex items-center justify-center">
              <Heart className="w-4 h-4 text-flamingo-600 fill-flamingo-500" strokeWidth={1.5} />
            </span>
            <div className="leading-none">
              <p className="font-serif-display text-xl text-plum">Volunteer Hub</p>
              <p className="overline text-flamingo-500 mt-0.5">Aionic Mirror · Layer 2</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-flamingo-600" strokeWidth={1.5} />
              <span className="text-softink">
                {user?.name} ·{" "}
                <span className="text-flamingo-700 font-medium capitalize">{user?.role}</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              data-testid="crm-logout-btn"
              className="inline-flex items-center gap-2 text-sm text-softink hover:text-flamingo-600 transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        {/* Principles strip */}
        <section
          data-testid="crm-principles"
          className="rounded-3xl bg-white border border-line p-6 md:p-8 mb-10 grid md:grid-cols-3 gap-6"
        >
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-flamingo-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <p className="overline text-flamingo-700">Consent is the boundary</p>
              <p className="text-sm text-softink mt-1 font-light leading-relaxed">
                Care without consent = control. Structure with consent = support.
                Only act inside a participant's stability window.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Layers className="w-5 h-5 text-flamingo-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <p className="overline text-flamingo-700">Minimum viable data</p>
              <p className="text-sm text-softink mt-1 font-light leading-relaxed">
                Aliases over names. Patterns over IDs. No surveillance vectors,
                no demographic harvesting.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-flamingo-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
            <div>
              <p className="overline text-flamingo-700">Armor, not handouts</p>
              <p className="text-sm text-softink mt-1 font-light leading-relaxed">
                Goods are functional armor that grants trajectory. Stabilise.
                Empower. Refuse to reinforce helplessness.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line/70 rounded-3xl overflow-hidden border border-line/70 mb-10">
          {[
            { label: "People held", value: stats.total, icon: Users },
            { label: "Cards (L2+)", value: stats.layer2plus, icon: Layers },
            { label: "Anchored trust", value: stats.anchored, icon: Heart },
            { label: "Consent revoked", value: stats.revoked, icon: AlertCircle },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-cream px-6 py-7 flex items-start justify-between">
                <div>
                  <p className="overline text-flamingo-600">{s.label}</p>
                  <p className="font-serif-display text-4xl md:text-5xl text-plum mt-2 leading-none">
                    {s.value}
                  </p>
                </div>
                <Icon className="w-5 h-5 text-flamingo-500/70" strokeWidth={1.5} />
              </div>
            );
          })}
        </section>

        {/* Toolbar */}
        <section className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-7">
          <div className="flex flex-1 gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-softink/60 absolute left-4 top-1/2 -translate-y-1/2"
                strokeWidth={1.5}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="crm-search-input"
                placeholder="Search by alias, location, name…"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-line bg-white text-sm text-ink placeholder:text-softink/50 focus:outline-none focus:border-flamingo-400 transition-all"
              />
            </div>
            <select
              value={trustFilter}
              onChange={(e) => setTrustFilter(e.target.value)}
              data-testid="crm-trust-filter"
              className="px-4 py-3 rounded-full border border-line bg-white text-sm text-ink focus:outline-none focus:border-flamingo-400"
            >
              <option value="all">All trust levels</option>
              {TRUST_LEVELS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            {user?.role === "admin" && (
              <button
                onClick={() => setShowKPI(true)}
                data-testid="crm-kpi-btn"
                className="btn-secondary"
              >
                <Gauge className="w-4 h-4" strokeWidth={1.75} />
                Edit landing KPIs
              </button>
            )}
            <button
              onClick={() => setShowNew(true)}
              data-testid="crm-new-card-btn"
              className="btn-primary"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              New Person Card
            </button>
          </div>
        </section>

        {/* List */}
        <section>
          {loading ? (
            <p className="text-softink font-serif-display text-2xl italic">Loading the table…</p>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-3xl border border-dashed border-line p-12 text-center"
              data-testid="crm-empty-state"
            >
              <p className="font-serif-display text-2xl text-plum italic">
                No cards yet — and that's okay.
              </p>
              <p className="text-softink mt-3 max-w-md mx-auto font-light">
                Layer 0 is real work too. Add a card only when the participant
                consents during a stability window.
              </p>
            </div>
          ) : (
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((c) => {
                const trust = TRUST_LEVELS.find((t) => t.value === c.private?.trust_level) || TRUST_LEVELS[0];
                const layer = LAYER_LABELS[c.layer] || LAYER_LABELS[1];
                const revoked = !!c.consent?.revoked_at;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedId(c.id)}
                      data-testid={`crm-card-${c.alias}`}
                      className="card-soft w-full text-left p-6 flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="overline text-flamingo-500">{layer.short}</p>
                          <h3 className="font-serif-display text-2xl text-plum leading-tight mt-1.5">
                            {c.alias}
                          </h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[0.65rem] font-medium tracking-wider uppercase ${trust.color}`}
                        >
                          {trust.label}
                        </span>
                      </div>

                      {c.public?.location_patterns && (
                        <p className="text-sm text-softink leading-relaxed line-clamp-2">
                          {c.public.location_patterns}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {(c.public?.needs || []).slice(0, 3).map((n) => (
                          <span
                            key={n}
                            className="text-[0.7rem] px-2.5 py-1 rounded-full bg-flamingo-50 text-flamingo-700 border border-flamingo-100"
                          >
                            {n}
                          </span>
                        ))}
                        {(c.public?.needs || []).length > 3 && (
                          <span className="text-[0.7rem] px-2.5 py-1 rounded-full bg-stone text-softink">
                            +{c.public.needs.length - 3}
                          </span>
                        )}
                      </div>

                      {revoked && (
                        <p className="text-xs text-flamingo-700 flex items-center gap-2 mt-auto pt-2 border-t border-line/60">
                          <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                          Consent revoked — alias only
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {showNew && (
        <NewCardDialog
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            fetchCards();
          }}
        />
      )}

      {showKPI && <KPIEditor onClose={() => setShowKPI(false)} />}

      {selectedId && (
        <CardDetail
          cardId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={fetchCards}
        />
      )}
    </main>
  );
}
