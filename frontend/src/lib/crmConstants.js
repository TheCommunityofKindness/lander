export const TRUST_LEVELS = [
  {
    value: "trace",
    label: "Trace",
    description: "Seen but no contact yet. Layer 0 — pure presence.",
    color: "bg-stone text-softink",
  },
  {
    value: "threshold",
    label: "Threshold",
    description: "First conversations. Notes only with explicit consent.",
    color: "bg-flamingo-100 text-flamingo-800",
  },
  {
    value: "recognised",
    label: "Recognised",
    description: "Person Card opened. Ongoing trust under the Aionic Mirror.",
    color: "bg-flamingo-200 text-flamingo-900",
  },
  {
    value: "anchored",
    label: "Anchored",
    description: "Stable long-term relationship. Pay-forward active.",
    color: "bg-plum text-flamingo-100",
  },
];

export const LAYER_LABELS = {
  0: { name: "Analogue Substrate", short: "L0 · Presence" },
  1: { name: "CareX Threshold", short: "L1 · Notes" },
  2: { name: "Aionic Mirror", short: "L2 · Card" },
  3: { name: "Mythic Bridge", short: "L3 · Bridge" },
};

export const NEED_OPTIONS = [
  "Food",
  "Water",
  "Warm clothing",
  "Sleeping bag",
  "Shoes",
  "Hygiene kit",
  "Phone charge",
  "Medical referral",
  "Housing referral",
  "Mental-health support",
  "ID / paperwork help",
  "Pet care",
];

export const SKILL_OPTIONS = [
  "Cooking",
  "Music",
  "Storytelling",
  "Carpentry",
  "Gardening",
  "Art",
  "Translation",
  "First aid",
  "Mentoring",
  "Listening",
];
