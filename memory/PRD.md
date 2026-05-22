# Community of Kindness — Product Requirements

## Original Problem Statement
Build a landing page for the **Community of Kindness** based on Freya Cheffers'
community work with rough sleepers in the Fremantle / Walyalup area (the regular
Friday Lunchies), with the intention to formalise and expand. Connect to Freya's
Facebook and a GoFundMe campaign. Theme: pink flamingos, but **polished and classy**.

## User Personas
- **Donor / community member** — wants to understand the mission quickly, donate
  via GoFundMe, follow on Facebook, and share.
- **Volunteer** — wants to sign up easily with name + email.
- **Guest / supporter from Fremantle** — looking for context, dignity, the
  Acknowledgement of Country, and ways to help.

## Core (Static) Requirements
- Single-page editorial landing site.
- Polished pink flamingo aesthetic (no kitsch / cartoon imagery).
- Walyalup / Whadjuk Noongar Acknowledgement of Country.
- External links to Facebook and GoFundMe.
- Capture volunteer signups and newsletter subscriptions to MongoDB.
- Mobile-responsive, accessible, with `data-testid` on every interactive element.

## Implementation Snapshot — Dec 2025
- **Frontend** (React + Tailwind):
  - Cormorant Garamond + Outfit fonts.
  - Sections: Header, Hero (flamingo feather visual), Acknowledgement, About Freya,
    Friday Lunchies (bento grid of 6 principles), Impact stats, Gallery / Voices,
    How to Help (Donate / Volunteer / Share), Footer (newsletter + contact + links).
  - Sonner toast notifications.
  - Smooth scroll-anchored nav.
- **Backend** (FastAPI + Motor / MongoDB):
  - `GET  /api/health`
  - `POST /api/subscribe`  — newsletter, dedupes on lowercased email (409 on dup).
  - `GET  /api/subscribers`
  - `POST /api/volunteers` — captures name, email, optional note.
  - `GET  /api/volunteers`
- **Integrations**: Facebook URL wired
  (`https://www.facebook.com/share/1BJFTp15q6/`). GoFundMe = placeholder
  (`https://www.gofundme.com/`) — to be replaced with real campaign URL.

## Tested
- Backend pytest: 14/14 pass.
- Frontend e2e: all sections render, both forms submit & show toasts, external
  links correct (testing_agent_v3 iteration_1.json — success_rate 100% backend,
  95% frontend with only a non-blocking native-vs-custom validation note).

## Prioritised Backlog
**P0**
- Replace GoFundMe placeholder URL with the real campaign URL.
- Add real photos from the Friday Lunchies (currently using curated stock).

**P1**
- Real impact numbers (currently uses approximate placeholders 150+, 3,000+, 80+).
- Admin dashboard / export for subscribers + volunteers (CSV download).
- Email transactional confirmations when someone signs up (Resend / SendGrid).

**P2**
- Multi-page expansion: dedicated "Volunteer roles" page, "Stories" / blog,
  donation breakdown / impact reports.
- Rate-limiting / CAPTCHA on public form endpoints.
- CMS hookup so Freya can edit copy and gallery without code changes.
- Social-share preview meta (OG image with flamingo motif).

## Next Action Items
1. Swap the GoFundMe placeholder for the live campaign URL in
   `/app/frontend/src/lib/constants.js`.
2. Provide real photos of the lunches and we'll replace the stock imagery.
3. Decide on email backend (Resend?) for transactional confirmations.
