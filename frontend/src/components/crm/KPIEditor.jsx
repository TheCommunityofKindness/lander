import { useEffect, useState } from "react";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import { toast } from "sonner";
import { Save, Gauge, X } from "lucide-react";

export default function KPIEditor({ onClose }) {
  const { authedAxios } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fridays, setFridays] = useState(0);
  const [meals, setMeals] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [updatedBy, setUpdatedBy] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await authedAxios().get("/stats/admin");
        if (cancelled) return;
        setFridays(data.fridays_served);
        setMeals(data.meals_shared);
        setUpdatedAt(data.updated_at);
        setUpdatedBy(data.updated_by);
      } catch (err) {
        toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Failed to load KPIs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authedAxios().patch("/stats/admin", {
        fridays_served: Number(fridays) || 0,
        meals_shared: Number(meals) || 0,
      });
      setUpdatedAt(data.updated_at);
      setUpdatedBy(data.updated_by);
      toast.success("KPIs published to the landing page.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-plum/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      data-testid="kpi-editor"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full md:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-line px-6 md:px-8 py-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-2xl bg-flamingo-100 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-flamingo-600" strokeWidth={1.5} />
            </span>
            <div>
              <p className="overline text-flamingo-500">Live feed · admin only</p>
              <h2 className="font-serif-display text-2xl text-plum mt-1">
                Landing-page KPIs
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="kpi-close"
            className="w-9 h-9 rounded-full border border-line hover:border-flamingo-300 flex items-center justify-center text-softink hover:text-flamingo-600 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-6 md:px-8 py-6 md:py-8 space-y-6">
          <p className="text-sm text-softink leading-relaxed font-light">
            Volunteers and people-held numbers flow automatically from the Hub.
            These two stay manual so the story stays honest.
          </p>

          {loading ? (
            <p className="text-softink font-serif-display text-xl italic">Loading…</p>
          ) : (
            <>
              <div>
                <label className="overline text-softink block mb-2">
                  Fridays served
                </label>
                <input
                  type="number"
                  min="0"
                  value={fridays}
                  onChange={(e) => setFridays(e.target.value)}
                  data-testid="kpi-fridays-input"
                  className="input-base"
                />
              </div>
              <div>
                <label className="overline text-softink block mb-2">
                  Meals shared
                </label>
                <input
                  type="number"
                  min="0"
                  value={meals}
                  onChange={(e) => setMeals(e.target.value)}
                  data-testid="kpi-meals-input"
                  className="input-base"
                />
              </div>
              {updatedAt && (
                <p
                  className="text-xs text-softink"
                  data-testid="kpi-updated-meta"
                >
                  Last published {new Date(updatedAt).toLocaleString()}
                  {updatedBy ? ` by ${updatedBy}` : ""}.
                </p>
              )}
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-cream/95 backdrop-blur-sm border-t border-line px-6 md:px-8 py-4 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary" data-testid="kpi-cancel">
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            data-testid="kpi-save"
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" strokeWidth={1.75} />
            {saving ? "Publishing…" : "Publish to landing"}
          </button>
        </div>
      </div>
    </div>
  );
}
