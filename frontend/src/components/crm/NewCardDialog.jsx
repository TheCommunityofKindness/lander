import { useState } from "react";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import { toast } from "sonner";
import { X, ShieldCheck, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { TRUST_LEVELS, NEED_OPTIONS, SKILL_OPTIONS, LAYER_LABELS } from "@/lib/crmConstants";

export default function NewCardDialog({ onClose, onCreated }) {
  const { authedAxios } = useAuth();
  const [step, setStep] = useState(0); // 0 consent gate, 1 identity, 2 public, 3 private
  const [submitting, setSubmitting] = useState(false);

  // Consent
  const [stabilityConfirmed, setStabilityConfirmed] = useState(false);
  const [notesConsent, setNotesConsent] = useState(false);
  const [publicCardConsent, setPublicCardConsent] = useState(false);

  // Identity
  const [alias, setAlias] = useState("");
  const [layer, setLayer] = useState(1);

  // Public
  const [locationPatterns, setLocationPatterns] = useState("");
  const [needs, setNeeds] = useState([]);
  const [skills, setSkills] = useState([]);
  const [payForward, setPayForward] = useState("");

  // Private
  const [realName, setRealName] = useState("");
  const [trustLevel, setTrustLevel] = useState("threshold");
  const [stabilityWindows, setStabilityWindows] = useState("");
  const [riskPatterns, setRiskPatterns] = useState("");

  const toggleArr = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const canProceedFromConsent = stabilityConfirmed && notesConsent;
  const canSubmit =
    canProceedFromConsent && alias.trim().length > 0 && (layer < 2 || publicCardConsent);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await authedAxios().post("/cards", {
        alias: alias.trim(),
        layer,
        consent: {
          stability_confirmed: stabilityConfirmed,
          notes_consent: notesConsent,
          public_card_consent: publicCardConsent,
        },
        public: {
          location_patterns: locationPatterns.trim() || null,
          needs,
          skills,
          pay_forward: payForward.trim() || null,
        },
        private: {
          real_name: realName.trim() || null,
          trust_level: trustLevel,
          stability_windows: stabilityWindows.trim() || null,
          risk_patterns: riskPatterns.trim() || null,
        },
      });
      toast.success(`Card opened for ${alias}.`);
      onCreated();
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Failed to create card.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ["Consent Gate", "Identity", "Public Layer", "Private Layer"];

  return (
    <div
      className="fixed inset-0 z-50 bg-plum/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      data-testid="new-card-dialog"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full md:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-line px-6 md:px-8 py-5 flex items-center justify-between">
          <div>
            <p className="overline text-flamingo-500">{steps[step]}</p>
            <h2 className="font-serif-display text-2xl text-plum mt-1">
              Open a Person Card
            </h2>
          </div>
          <button
            onClick={onClose}
            data-testid="new-card-close"
            className="w-9 h-9 rounded-full border border-line hover:border-flamingo-300 flex items-center justify-center text-softink hover:text-flamingo-600 transition-all"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 md:px-8 pt-5 flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i <= step ? "bg-flamingo-500" : "bg-line"
              }`}
            />
          ))}
        </div>

        <div className="px-6 md:px-8 py-6 md:py-8">
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex gap-3 p-5 rounded-2xl bg-flamingo-50 border border-flamingo-100">
                <ShieldCheck className="w-5 h-5 text-flamingo-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-sm text-flamingo-900 leading-relaxed">
                  Consent gates everything. Before opening this card, confirm
                  the conditions below have been met in person, with the
                  participant clear-headed and unhurried.
                </p>
              </div>
              <Toggle
                checked={stabilityConfirmed}
                onChange={setStabilityConfirmed}
                testId="consent-stability"
                label="Stability window confirmed"
                hint="Participant is sober, clear-headed, and not in crisis."
              />
              <Toggle
                checked={notesConsent}
                onChange={setNotesConsent}
                testId="consent-notes"
                label="Consent for minimal notes (Layer 1)"
                hint="Participant agrees to temporary, revocable note-keeping."
              />
              <Toggle
                checked={publicCardConsent}
                onChange={setPublicCardConsent}
                testId="consent-public"
                label="Consent for public Person Card (Layer 2)"
                hint="Optional. Required only if you intend to record needs, skills, or pay-forward."
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <Field label="Alias" required testId="card-alias-input">
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="The name they want to be known by"
                  data-testid="card-alias-input"
                  className="input-base"
                  maxLength={80}
                />
              </Field>
              <Field label="Topological layer">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((l) => {
                    const disabled = l >= 2 && !publicCardConsent;
                    return (
                      <button
                        key={l}
                        type="button"
                        disabled={disabled}
                        onClick={() => setLayer(l)}
                        data-testid={`card-layer-${l}`}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          layer === l
                            ? "border-flamingo-500 bg-flamingo-50 text-flamingo-800"
                            : "border-line bg-white text-softink hover:border-flamingo-300"
                        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <span className="block text-[0.65rem] uppercase tracking-wider">
                          L{l}
                        </span>
                        <span className="block mt-0.5">{LAYER_LABELS[l].name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-softink mt-2">
                  Layer 2+ requires the public-card consent toggle in step 1.
                </p>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {!publicCardConsent ? (
                <p className="text-softink italic font-serif-display text-lg">
                  Public layer is skipped — public-card consent was not granted.
                  Move on to the private layer.
                </p>
              ) : (
                <>
                  <Field label="Location patterns" hint="Where they tend to be — kept loose, never tracked.">
                    <textarea
                      value={locationPatterns}
                      onChange={(e) => setLocationPatterns(e.target.value)}
                      placeholder="e.g. Around the Walyalup library on weekday mornings."
                      rows={2}
                      data-testid="card-location-input"
                      className="input-base resize-none"
                      maxLength={500}
                    />
                  </Field>
                  <Field label="Needs">
                    <Chips
                      options={NEED_OPTIONS}
                      selected={needs}
                      onToggle={(v) => toggleArr(needs, setNeeds, v)}
                      testIdPrefix="card-need"
                    />
                  </Field>
                  <Field label="Skills they offer">
                    <Chips
                      options={SKILL_OPTIONS}
                      selected={skills}
                      onToggle={(v) => toggleArr(skills, setSkills, v)}
                      testIdPrefix="card-skill"
                    />
                  </Field>
                  <Field label="Pay-forward contribution" hint="How they want to give back when they can.">
                    <input
                      type="text"
                      value={payForward}
                      onChange={(e) => setPayForward(e.target.value)}
                      placeholder="e.g. Helps set up tables on Fridays."
                      data-testid="card-payforward-input"
                      className="input-base"
                      maxLength={500}
                    />
                  </Field>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex gap-3 p-5 rounded-2xl bg-stone border border-line">
                <ShieldCheck className="w-5 h-5 text-flamingo-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-sm text-softink leading-relaxed">
                  Operator-only. Never shown to the participant. Use
                  non-judgmental language only. Skip any field you don't yet
                  have permission or context for.
                </p>
              </div>
              <Field label="Real name (only if explicitly shared)">
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="Leave empty if not given"
                  data-testid="card-realname-input"
                  className="input-base"
                  maxLength={200}
                />
              </Field>
              <Field label="Trust level">
                <div className="grid sm:grid-cols-2 gap-2">
                  {TRUST_LEVELS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTrustLevel(t.value)}
                      data-testid={`card-trust-${t.value}`}
                      className={`text-left px-4 py-3 rounded-xl border transition-all ${
                        trustLevel === t.value
                          ? "border-flamingo-500 bg-flamingo-50"
                          : "border-line bg-white hover:border-flamingo-300"
                      }`}
                    >
                      <span className="font-medium text-sm text-ink">{t.label}</span>
                      <span className="block text-xs text-softink mt-0.5">{t.description}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Stability windows" hint="When are they typically clear-headed and able to consent?">
                <input
                  type="text"
                  value={stabilityWindows}
                  onChange={(e) => setStabilityWindows(e.target.value)}
                  placeholder="e.g. Weekday mornings."
                  data-testid="card-stability-input"
                  className="input-base"
                  maxLength={500}
                />
              </Field>
              <Field label="Risk patterns" hint="Non-judgmental. Patterns we should respect — not labels.">
                <textarea
                  value={riskPatterns}
                  onChange={(e) => setRiskPatterns(e.target.value)}
                  placeholder="e.g. Tends to disengage if approached in groups."
                  rows={3}
                  data-testid="card-risk-input"
                  className="input-base resize-none"
                  maxLength={1000}
                />
              </Field>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-cream/95 backdrop-blur-sm border-t border-line px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              data-testid="card-prev-btn"
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn-secondary"
              data-testid="card-cancel-btn"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !canProceedFromConsent}
              data-testid="card-next-btn"
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              data-testid="card-submit-btn"
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Opening…" : "Open the card"}
              <Check className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, hint, testId }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      data-testid={testId}
      className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
        checked
          ? "border-flamingo-500 bg-flamingo-50"
          : "border-line bg-white hover:border-flamingo-300"
      }`}
    >
      <span
        className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          checked ? "border-flamingo-500 bg-flamingo-500" : "border-line bg-white"
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </span>
      <span>
        <span className="block font-medium text-ink text-sm">{label}</span>
        {hint && <span className="block text-xs text-softink mt-1 leading-relaxed">{hint}</span>}
      </span>
    </button>
  );
}

function Field({ label, hint, children, required }) {
  return (
    <div>
      <label className="overline text-softink block mb-2">
        {label} {required && <span className="text-flamingo-600 normal-case tracking-normal">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-softink mt-1.5 font-light">{hint}</p>}
    </div>
  );
}

function Chips({ options, selected, onToggle, testIdPrefix }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSel = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            data-testid={`${testIdPrefix}-${opt.toLowerCase().replace(/\s/g, "-")}`}
            className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
              isSel
                ? "border-flamingo-500 bg-flamingo-500 text-white"
                : "border-line bg-white text-softink hover:border-flamingo-400"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
