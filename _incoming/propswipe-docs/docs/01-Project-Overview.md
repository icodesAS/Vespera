# 01 — Project Overview, Features and Pages

**Plain-English summary:** PropSwipe helps a person find a rental home in India by *swiping*,
like a dating app. v1 (first-year practice project) did the swiping and a little AI. v2 turns it into a
professional portfolio piece: a stunning 3D landing page, a smarter swipe deck that learns your taste,
proper home-detail pages, filters, a first-time questionnaire, and an AI chat helper.

## 1. Who is this for?
- **Primary audience (the real reason it exists):** recruiters, interviewers and hackathon judges who
  open the link for 60 seconds. They must be impressed fast, without signing up.
- **In-story user:** a renter in Pune, Bengaluru, Mumbai, Hyderabad, Gurugram, etc. with a monthly budget (₹20k–₹50k).

## 2. The 60-second demo (design everything to make this smooth)
1. Land on `/` → dramatic 3D skyline, one clear button: **Start swiping**.
2. Click **Try as guest** (no sign-up) → quick 5-question preference quiz (skippable).
3. `/discover` → swipe 3-4 homes. A small toast says "AI is learning your taste…" and the next cards re-order.
4. Tap **Explain with AI** on a card → score ring + pros/cons in plain language.
5. Open a home → detail page with photo gallery, map, rent calculator and **Ask the AI copilot**.
6. Open **Shortlist** → pick 2-3 homes → **AI compare** gives a ranked recommendation.

## 3. Feature list (MoSCoW = Must / Should / Could / Won't)

| # | Feature | v1 status | v2 target | Priority |
|---|---------|-----------|-----------|----------|
| F1 | Swipe deck (drag, buttons, arrow keys) | works (if it ran) | rebuild with stack of 3 cards, undo, haptics | Must |
| F2 | Auth: Email, Google | existed | + **Guest (anonymous)** | Must |
| F3 | Likes saved per user in Firestore | existed | debounced, safe `arrayUnion` writes | Must |
| F4 | AI natural-language search | existed | structured output + local filter first | Must |
| F5 | AI "Explain with AI" | hard-coded preferences | uses the user's **real saved preferences**, score ring | Must |
| F6 | AI **re-rank** (`/api/ai/rerank`) | built, never called | auto-run after every 5 swipes | Must |
| F7 | AI **shortlist summary** (`/api/ai/summary`) | built, never called | "AI compare" on shortlist | Must |
| F8 | **Onboarding quiz** (budget, cities, BHK, pets, workplace, priorities) | none | stored in `users/{uid}.preferences` | Must |
| F9 | **Property detail page** `/property/[id]` | none | gallery, facts, map, calculator, similar homes | Must |
| F10 | **Filters** (city, rent slider, BHK, furnishing, pets) | none | pill bar on discover + explore | Must |
| F11 | **3D landing page** | none | "Neon Skyline" hero, scroll story | Must |
| F12 | **AI Copilot chat** (per home) | none | grounded chat, nearby-places facts computed in code | Should |
| F13 | Explore grid with map toggle | infinite list | grid + map view | Should |
| F14 | Admin panel (add/edit homes, seed demo data) | basic | protected by `admins/<uid>`, edit + delete | Should |
| F15 | Image upload | paste URL only | Cloudinary free tier (late) | Could |
| F16 | Light theme, sound effects | none | after v2.0 | Could |
| F17 | Payments, real landlord chat, real listings | none | never | Won't |

## 4. Pages (routes)

| Route | Who can open | What it shows |
|-------|--------------|---------------|
| `/` | everyone | 3D landing, story sections, CTA |
| `/login` | everyone | Sign in / Register / Google / **Try as guest** |
| `/onboarding` | signed in | 5-step preference quiz (can skip) |
| `/discover` | signed in | filter pills, AI search bar, swipe deck |
| `/explore` | signed in | grid + map of all homes, filters, load-more |
| `/property/[id]` | signed in | detail page (see §5) |
| `/shortlist` | signed in | liked homes, remove, **AI compare** |
| `/admin` | admins only | add/edit/delete homes, "Seed demo data" button |
| `/api/ai/*` | signed in (token) | search, explain, rerank, summary, chat |
| `not-found`, `error` | everyone | friendly 404 and error screens |

Rule: pages that need login show a spinner while Firebase checks, then redirect to `/login`.
(Firebase login state lives in the browser, so use a client `RequireAuth` wrapper, not `proxy.ts`.)

## 5. Detail page (`/property/[id]`) contents
- Image gallery (swipeable, keyboard arrows, full-screen view)
- Key facts: rent, deposit, BHK, bathrooms, area, furnishing, type, pet-friendly, available from
- Amenity chips and "Nearby" list (metro, IT park, school, hospital, with distances)
- Map (Leaflet + OpenStreetMap, one marker)
- **Rent helper:** "Can I afford this?" Input monthly income → shows rent-to-income % with a simple green/amber/red note
  (rule of thumb: under 30–35% is comfortable). Also a "total move-in cost" line = rent + deposit.
- **AI box:** "Why this suits you" (reuses Explain) + **Ask the copilot** chat
- Like / Skip buttons, Share button (copies link)
- "Similar homes" (same city, close rent) — computed in code, not by AI

## 6. Preference quiz (onboarding) fields
Budget range (slider, ₹10k–₹80k) · up to 3 cities · BHK choices · furnishing choices · pets (yes/no) ·
workplace/college text (e.g. "EON IT Park, Pune") · top 3 priorities (budget, space, commute, safety, quiet, greenery, nightlife) ·
optional note (max 300 chars). Saved as `users/{uid}.preferences` and `onboardingComplete: true`.
Skipping sets safe defaults so the AI still works.

## 7. Filters (client-side, instant, no AI)
City (multi), rent min/max slider, BHK (multi), furnishing (multi), pet-friendly toggle. Filters change the deck order
and the explore grid immediately. AI search *adds* ranking on top; it never replaces filtering.

## 8. Non-goals (do not build)
Payments, user-to-user messaging, real listing scraping, email notifications, mobile apps, multi-language UI,
anything needing a paid service.

## 9. What "portfolio-grade" means here (acceptance bar)
- Looks premium on a phone and a laptop; consistent spacing, type, colour, motion
- Works with **zero setup for a visitor** (guest login) and never shows a blank screen (graceful fallbacks)
- No console errors; Lighthouse (non-3D pages) ≥ 90 desktop / ≥ 80 mobile; landing ≥ 70 mobile
- Clean README with live demo link, GIFs, diagrams (doc 08)
- Honest "AI" story: every AI feature has a fallback, validation and limits (doc 05)

## 10. Seed data note
The 20 seed homes in v1 are **fictional demo data** (Pune, Bengaluru, Hyderabad, Mumbai, Gurugram, Delhi, Noida, Kolkata,
Ahmedabad, Chandigarh, Jaipur, Nagpur, Kochi; rent ₹21,000–₹45,000). In v2 each gets extra fields (locality, coordinates
that are *approximate*, amenities, nearby places, furnishing, type, pets, several images). The README must say the data is
for demonstration only.
