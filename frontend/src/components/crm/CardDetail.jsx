import { useEffect, useState } from "react";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import { toast } from "sonner";
import { X, ShieldOff, Save, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { TRUST_LEVELS, LAYER_LABELS } from "@/lib/crmConstants";

export default function CardDetail({ cardId, onClose, onUpdated }) {
  const { authedAxios, user } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);

  const [publicLayer, setPublicLayer] = useState({});
  const [privateLayer, setPrivateLayer] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await authedAxios().get(`/cards/${cardId}`);
        if (cancelled) return;
        setCard(data);
        setPublicLayer(data.public || {});
        setPrivateLayer(data.private || {});
      } catch (err) {
        toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Failed to load card.");
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authedAxios().patch(`/cards/${cardId}`, {
        public: publicLayer,
        private: privateLayer,
      });
      setCard(data);
      toast.success("Card updated.");
      onUpdated();
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm("Revoke consent for this card? Public layer will be cleared and consent timestamps recorded.")) {
      return;
    }
    setSaving(true);
    try {
      const { data } = await authedAxios().post(`/cards/${cardId}/revoke`);
      setCard(data);
      setPublicLayer(data.public);
      toast.success("Consent revoked. Public layer cleared.");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Revoke failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-plum/40 backdrop-blur-sm flex items-center justify-center">
        <p className="text-flamingo-100 font-serif-display text-3xl italic animate-pulse">…</p>
      </div>
    );
  }
  if (!card) return null;

  const trust = TRUST_LEVELS.find((t) => t.value === card.private?.trust_level) || TRUST_LEVELS[0];
  const layer = LAYER_LABELS[card.layer] || LAYER_LABELS[1];
  const revoked = !!card.consent?.revoked_at;
  const canEditPrivate = user?.role === "admin" || card.created_by === user?.email;

  return (
    <div
      className="fixed inset-0 z-50 bg-plum/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      data-testid="card-detail"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full md:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-line px-6 md:px-8 py-5 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="overline text-flamingo-500">{layer.short}</p>
              <span
                className={`px-3 py-1 rounded-full text-[0.65rem] font-medium tracking-wider uppercase ${trust.color}`}
              >
                {trust.label}
              </span>
              {revoked && (
                <span className="px-3 py-1 rounded-full text-[0.65rem] font-medium tracking-wider uppercase bg-flamingo-100 text-flamingo-800">
                  Consent revoked
                </span>
              )}
            </div>
            <h2 className="font-serif-display text-3xl md:text-4xl text-plum mt-2">
              {card.alias}
            </h2>
            <p className="text-xs text-softink mt-1">
              Opened {new Date(card.created_at).toLocaleDateString()} by {card.created_by}
            </p>
          </div>
          <button
            onClick={onClose}
            data-testid="card-detail-close"
            className="w-9 h-9 rounded-full border border-line hover:border-flamingo-300 flex items-center justify-center text-softink hover:text-flamingo-600 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-6 md:px-8 py-6 md:py-8 space-y-8">
          {/* Public Layer */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-2xl text-plum">Public Layer</h3>
              <span className="text-xs text-softink">Participant-editable</span>
            </div>
            {revoked && (
              <p className="text-sm text-flamingo-700 mb-4 italic">
                Consent has been revoked. Public layer is preserved as empty;
                only the alias remains for re-engagement recognition.
              </p>
            )}
            <div className="grid gap-4">
              <DetailField label="Location patterns">
                <textarea
                  value={publicLayer.location_patterns || ""}
                  onChange={(e) => setPublicLayer({ ...publicLayer, location_patterns: e.target.value })}
                  rows={2}
                  className="input-base resize-none"
                  data-testid="detail-location-input"
                  disabled={revoked}
                  maxLength={500}
                />
              </DetailField>
              <DetailField label="Needs (comma-separated)">
                <input
                  type="text"
                  value={(publicLayer.needs || []).join(", ")}
                  onChange={(e) =>
                    setPublicLayer({
                      ...publicLayer,
                      needs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  data-testid="detail-needs-input"
                  disabled={revoked}
                  className="input-base"
                />
              </DetailField>
              <DetailField label="Skills (comma-separated)">
                <input
                  type="text"
                  value={(publicLayer.skills || []).join(", ")}
                  onChange={(e) =>
                    setPublicLayer({
                      ...publicLayer,
                      skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  data-testid="detail-skills-input"
                  disabled={revoked}
                  className="input-base"
                />
              </DetailField>
              <DetailField label="Pay-forward contribution">
                <input
                  type="text"
                  value={publicLayer.pay_forward || ""}
                  onChange={(e) => setPublicLayer({ ...publicLayer, pay_forward: e.target.value })}
                  data-testid="detail-payforward-input"
                  disabled={revoked}
                  className="input-base"
                  maxLength={500}
                />
              </DetailField>
            </div>
          </section>

          {/* Private Layer (gated) */}
          <section className="rounded-3xl bg-stone/60 border border-line p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-flamingo-600" strokeWidth={1.5} />
                <h3 className="font-serif-display text-2xl text-plum">Private Layer</h3>
              </div>
              <button
                onClick={() => setShowPrivate(!showPrivate)}
                data-testid="toggle-private-btn"
                className="text-xs inline-flex items-center gap-1.5 text-softink hover:text-flamingo-600 transition-colors"
              >
                {showPrivate ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> Reveal
                  </>
                )}
              </button>
            </div>
            {!showPrivate ? (
              <p className="text-sm text-softink italic font-serif-display text-lg">
                Operator-only. Reveal when you're alone and acting with intention.
              </p>
            ) : (
              <div className="grid gap-4">
                <DetailField label="Real name">
                  <input
                    type="text"
                    value={privateLayer.real_name || ""}
                    onChange={(e) => setPrivateLayer({ ...privateLayer, real_name: e.target.value })}
                    data-testid="detail-realname-input"
                    disabled={!canEditPrivate}
                    className="input-base"
                    maxLength={200}
                  />
                </DetailField>
                <DetailField label="Trust level">
                  <select
                    value={privateLayer.trust_level || "trace"}
                    onChange={(e) => setPrivateLayer({ ...privateLayer, trust_level: e.target.value })}
                    data-testid="detail-trust-select"
                    disabled={!canEditPrivate}
                    className="input-base"
                  >
                    {TRUST_LEVELS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label} — {t.description}
                      </option>
                    ))}
                  </select>
                </DetailField>
                <DetailField label="Stability windows">
                  <input
                    type="text"
                    value={privateLayer.stability_windows || ""}
                    onChange={(e) => setPrivateLayer({ ...privateLayer, stability_windows: e.target.value })}
                    data-testid="detail-stability-input"
                    disabled={!canEditPrivate}
                    className="input-base"
                    maxLength={500}
                  />
                </DetailField>
                <DetailField label="Risk patterns (non-judgmental)">
                  <textarea
                    value={privateLayer.risk_patterns || ""}
                    onChange={(e) => setPrivateLayer({ ...privateLayer, risk_patterns: e.target.value })}
                    rows={3}
                    data-testid="detail-risk-input"
                    disabled={!canEditPrivate}
                    className="input-base resize-none"
                    maxLength={1000}
                  />
                </DetailField>
                {!canEditPrivate && (
                  <p className="text-xs text-softink italic">
                    Only the originating operator (or admin) may edit the private layer.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-cream/95 backdrop-blur-sm border-t border-line px-6 md:px-8 py-4 flex items-center justify-between gap-3">
          <button
            onClick={handleRevoke}
            disabled={saving || revoked}
            data-testid="revoke-consent-btn"
            className="btn-secondary !text-flamingo-700 hover:!border-flamingo-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShieldOff className="w-4 h-4" strokeWidth={1.5} />
            {revoked ? "Already revoked" : "Revoke consent"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || revoked}
            data-testid="save-card-btn"
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" strokeWidth={1.75} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, children }) {
  return (
    <div>
      <label className="overline text-softink block mb-2">{label}</label>
      {children}
    </div>
  );
}
