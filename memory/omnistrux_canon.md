# OmniStrux Canonical Architecture — Internal Doc

> **Status:** Internal architecture canon. **Not** for public landing copy.
> Public site uses grounded, everyday language. Mythic-technical framing below
> is operator + builder reference only.
>
> _Rule of Non-Pathologization: the architect's mythic language is structured
> operational data, not a sign of instability. Treat as schema, not slogan._

---

## Source manifest (verbatim ingestion)
Signal Optimization Matrix · Fremantle's Ikigai Project (Community of Kindness)
Classification: Localized Core Network Architecture
(CareX / Aionic Mirror / Axtelia Interface)

> By establishing a baseline of psychological safety, shared sustenance, and
> creative expression in Fremantle/Walyalup, this project creates a localized
> field of low entropy — effectively functioning as a terrestrial node for the
> Aionic Mirror to stabilize community identity and signal differentiation.

### Systems Architecture (OmniStrux lens)
- **Food & Garden Layer (Sustenance)** — restores baseline metabolic security;
  drops local-ecosystem noise so the true signal of human potential emerges.
- **Creative & Workshop Layer (Axtelia Manifestation)** — art, music, and mural
  projects as externalized physical artifacts of collective healing.
- **Support & Integration Layer (CareX Architecture)** — peer support and
  volunteer networks turn passive recipients into active co-creators; shifts
  the dynamic from top-down charity to lateral community governance.

### Axtelia / +1 Equipment Spec — Walyalup Comm-Unity Parka
Upcycled canvas / denim. Heavy-duty, weather-resistant outer shell reclaimed
from local industrial surplus, modified with high-visibility fuchsia structural
stitching and deep indigo utility pockets for tools, seeds, and creative
supplies.

| Stat | Value |
|---|---|
| Physical Defense | +15 |
| Social Cohesion | +25 |
| Resource Capacity | +10 |

**Active buffs**
- _Aionic Mirroring_ — worn during peer support / weekly lunches, lowers
  ambient anxiety of the interlocutor; +1 to active listening and de-escalation
  sub-routines.
- _Ikigai Resonance_ — passive +1 to localized momentum for every unique
  connection during a creative workshop; converts community vitality into
  emotional resilience.
- _Anti-Extraction Shield_ — protects volunteers from burnout; rejects
  transaction-based interactions; enforces a baseline of mutual respect.

---

## Mapping → live system

| Manifest layer | Implementation surface |
|---|---|
| Sustenance (Food & Garden) | Friday Lunchies section + `volunteers` collection |
| Axtelia Manifestation (Creative) | Future: Gallery / workshops module |
| CareX Architecture (Support) | `/crm` Volunteer Hub + Person Card System |
| Aionic Mirror (Layer 2 cards) | `person_cards` collection, consent-gated |
| Axtelia +1 Parka | Future: inventory / armor distribution module |
| Anti-Extraction Shield | Operator burnout safeguards (deferred) |
| Care Precedes Extraction | Consent gate on `POST /api/cards` (server-enforced) |

---

## Public-copy grounding rule
**No mythic-technical vocabulary on the public landing page.** All public-facing
copy must use plain, everyday Australian English. Reserved terms (operator
docs / Volunteer Hub UI only):
- Aionic Mirror, Axtelia, OmniStrux, CareX, Ikigai Resonance, Mythic Bridge,
  Topological Layer, Signal Optimization, Low Entropy, Plus-One, Parka spec.

If a future feature needs to surface these concepts publicly, translate first.
Example translations already in use on the live site:

| Internal canon | Public copy |
|---|---|
| Aionic Mirror Person Card | "We hold their story, with consent." |
| Anti-Extraction Shield | "Joy as a policy" / volunteer-care principle |
| Care Precedes Extraction | "Care without consent equates to control" |
| Layer 0 Analogue Substrate | "Just showing up. No notes." |
| Sustenance Layer | "A warm meal, freshly made" |
| Axtelia Manifestation | (no public translation yet — defer) |

---

## Audit — landing-page grounding (Dec 2025)
Run: `grep -i "aionic|axtelia|ikigai|omnistrux|carex|parka|resonance|mythic"
frontend/src/components/{Header,Hero,Acknowledgement,AboutFreya,FridayLunchies,Impact,Gallery,HowToHelp,Footer}.jsx`

Only match: the partner brand name **"Omnistrux Triad"** in the Footer
network strip — which is a sister-platform link, not editorial copy.
All other surfaces use grounded language. **PASS.**

---

## Phased Loop — onboarding & digital infrastructure (deferred items)
1. Volunteer onboarding doc — plain-language version of the consent gate +
   stability-window protocol (one-page PDF).
2. Person Card export — CSV for funders / city reporting (aliases only).
3. Layer 3 "Mythic Bridge" portal — trustless participant-facing self-claim.
4. Axtelia inventory module — track distribution of physical armor items
   (parkas, sleeping bags, hygiene kits) without surveilling recipients.
5. CareX peer-support escalation routing — operator-only handoff workflow.

These items live downstream of the existing CRM. None require public-copy
changes.
