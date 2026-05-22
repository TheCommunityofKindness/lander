# Community of Kindness — Product Requirements

## Original Problem Statement
Build a landing page for the **Community of Kindness** based on Freya Cheffers'
community work with rough sleepers in the Fremantle / Walyalup area (the regular
Friday Lunchies), with the intention to formalise and expand. Connect to Freya's
Facebook and a GoFundMe campaign. Theme: pink flamingos, but **polished and classy**.

**Iteration 2 (Dec 2025)** — User added the *Aionic Mirror Person Card System*:
an admin/volunteer login that opens a consent-gated CRM for managing Person
Cards for rough sleepers, following a strict four-layer topological data
pipeline (L0 Analogue Substrate → L3 Mythic Bridge) with a two-tier card model
(Public + Private), trust levels, revocable consent, and data minimization.

## User Personas
- **Donor / community member** — landing page conversion (Facebook, GoFundMe).
- **Volunteer** — landing-page signup + operator access to the Volunteer Hub.
- **Admin (Freya)** — full CRM, can edit any card's private layer.
- **Rough sleeper / participant** — represented by aliases in Public Layer;
  consent is the absolute boundary.

## Core Principles (operator protocol — enforced in code)
- Care without consent = control. Structure with consent = support.
- Consent must be captured during a "stability window" (sober, clear-headed).
- Layer 2+ (Aionic Mirror Person Card) requires explicit public-card consent.
- Aliases over real names. Patterns over IDs. No surveillance vectors.
- Revoking consent clears the Public Layer but retains the alias for
  re-engagement recognition.

## Implementation Snapshot
### Frontend (React + Tailwind, routed)
- `/`        — landing page (hero, acknowledgement, about Freya, Friday Lunchies
  bento, impact, gallery, get-involved, footer newsletter).
- `/login`   — operator sign-in (Bearer-token auth via localStorage).
- `/crm`     — protected Volunteer Hub: principles strip, stats, search,
  trust-level filter, card list, multi-step NewCardDialog (consent gate →
  identity → public layer → private layer), CardDetail with reveal-private
  toggle, save, and revoke flow.

### Backend (FastAPI + Motor / MongoDB)
- Public: `/api/health`, `/api/subscribe`, `/api/volunteers`.
- Auth:   `/api/auth/login`, `/api/auth/me` (JWT 12-hr access tokens).
- CRM (operator-only):
  `POST /api/cards`, `GET /api/cards`, `GET /api/cards/{id}`,
  `PATCH /api/cards/{id}`, `POST /api/cards/{id}/revoke`.
- Consent gate enforced server-side: stability_confirmed + notes_consent
  required for any card; public_card_consent required for layer >= 2.
- RBAC: volunteers may edit public layer of any card and private layer of own
  cards; admins may edit private layer of any card.

### Seeded users (from `/app/backend/.env`)
- `freya@communityofkindness.org` / `kindness2026` — admin
- `volunteer@communityofkindness.org` / `walyalup2026` — volunteer

### Integrations
- Facebook: `https://www.facebook.com/share/1BJFTp15q6/` (live).
- GoFundMe: `https://gofund.me/842568097` (live).

## Tested
- Iteration 1 — backend 14/14, frontend 95% (landing flows).
- Iteration 2 — backend 22/22, frontend 100% on critical flows
  (auth, consent gate, CRUD, RBAC, revoke).

## Prioritised Backlog
**P0** — none (MVP + Volunteer Hub complete).

**P1**
- Auto-export of Person Cards for admin (CSV with hashed identifiers).
- Real photos from Friday Lunchies to replace stock imagery.
- Real impact numbers (current values are approximate placeholders).

**P2**
- Layer 3 ("Mythic-Technical Bridge") — trustless challenge-progress store
  decoupled from any operator identity.
- Offline-capable mobile PWA so operators can update cards from the street
  without high-bandwidth requirements.
- Email transactional confirmations (Resend) for newsletter + volunteer signups.
- Rate-limit / brute-force protection on `/api/auth/login`.
- CMS hookup for Freya to edit landing copy.

## Next Action Items
1. Replace stock photos with real Friday Lunchies imagery.
2. Confirm real impact numbers and update the landing stats.
3. Decide whether the public should be able to claim aliases / view their own
   Public Layer (a future participant-facing portal — Layer 3 direction).
