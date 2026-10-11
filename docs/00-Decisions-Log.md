# 00 — Decisions Log (the "memory" of this project)

**Every agent chat: read this first. Every agent chat: add a line at the bottom before you finish.**
Last verified against the npm registry and Google's docs: **11 Oct 2026**.

## A. Locked decisions (do not change without a new entry that says why)

| # | Decision | Why (plain English) |
|---|---|---|
| D-01 | Upgrade the existing repo on a new branch `upgrade/v2`. No rewrite from scratch. | Keeps history and what already works. Easy to undo. |
| D-02 | Node **24.12 or newer** (LTS). npm only. Commit `package-lock.json`. | Firebase 13 needs Node 24.12+. One package manager = no lockfile fights. |
| D-03 | All versions **pinned exactly** (see doc 04). No `^`. | Stops "it worked yesterday" breakages. We tested this exact set installs with zero conflicts and builds. |
| D-04 | Next.js 16.4.0 + React **19.3.0**. Do not move React to 19.4+ yet. | react-three-fiber 9.8.1 only accepts React 19.0–19.3. |
| D-05 | TypeScript **5.9.3**, not 7.x. | 7.x is brand new and not tested with this tooling. |
| D-06 | Animation package is **`motion`** (`import { motion } from "motion/react"`). Remove `framer-motion`. | Same library, current name. Never install both. |
| D-07 | 3D = three 0.186.1 + @react-three/fiber 9.8.1 + drei 10.7.9 + postprocessing 3.2.0. Only on landing hero and (optionally) detail page. Lazy-loaded, with fallback. | Gives the "3D website" look from the inspiration video without risking the core app. |
| D-08 | Swipe deck stays normal DOM cards. | Reliable on phones, easy to test. |
| D-09 | AI = **only `@google/genai` 2.28.0 with a Gemini API key**. Remove `@google-cloud/vertexai` and the Vertex mode. Delete `service-account.json` from the repo. | One simple path. Fewer secrets. The old Vertex package is not needed. |
| D-10 | Model name comes from env: `GEMINI_MODEL=gemini-3.8-flash`, fallback `GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite`. **Never hard-code a model name in code.** | Google retires models often. `gemini-2.5-flash` (used by the old app) is now only available to older users, and new keys may get a 404. |
| D-11 | New Firebase project. Firestore region `asia-south1` (Mumbai). Auth: Email/Password + Google. | Old project is lost. Mumbai = fast for India. |
| D-12 | Firestore changes are **additive only**. Existing collections `users`, `properties` and their fields stay. New fields are optional. | Nothing old can break. |
| D-13 | Security rules from `firestore.rules`: users touch only their own doc; only admins edit properties. Admins are listed by hand in `admins/{uid}`. | The old admin page let any logged-in user write. |
| D-14 | AI API routes verify the Firebase login token (firebase-admin) and have a simple per-user rate limit. | Stops strangers from burning your Gemini quota. |
| D-15 | Styling: Tailwind 4 CSS-first. Tokens in `app/globals.css` under `@theme`. **Dark theme only** for v1. | One theme = half the testing. Dark suits the 3D style. |
| D-16 | Routes: `/` landing (3D hero), `/discover` swipe app, `/property/[id]`, `/onboarding`, `/login`, `/admin`. | Clear structure. Old `app/page.tsx` moves to `app/discover/page.tsx`. |
| D-17 | Maps = Leaflet + OpenStreetMap tiles (no API key). | Free, no billing risk. |
| D-18 | Hosting: Vercel. Add its domain to Firebase Auth "Authorized domains". | Simplest for Next.js. |
| D-19 | Image uploads (Firebase Storage/Cloudinary) are **optional, last**. Admin keeps "paste image URL" for now. | Storage may need a billing plan. Not worth the risk early. |
| D-20 | Three motion tiers (docs/05): **Tier 1** landing = rich/cinematic, **Tier 2** all other pages = light and calm, **Tier 3** = reduced-motion / phones / weak devices = fades only. | Award-site feel where it matters, speed and safety everywhere else. |
| D-21 | One shared **ambient background** (single full-screen shader, 30 fps cap, DPR 1, CSS fallback) in the root layout on every route except `/`. The landing page has its own hero scene. **Never two WebGL canvases at once.** | Gives continuity between pages without heavy 3D on every screen. |
| D-22 | Page transitions use an **overlay wipe** started by a `TransitionLink` (then `router.push`). Enter animations go in `app/template.tsx`. We do NOT rely on `AnimatePresence` exit animations across routes. | Exit animations between App Router pages are unreliable. |
| D-23 | No new animation libraries (no GSAP). Tools: `motion/react` (`useScroll`, `useTransform`, `useSpring`), `lenis/react`, drei (`shaderMaterial`, `useProgress`, `PerformanceMonitor`), postprocessing. All verified present in the pinned versions. | Zero new version risk. |
| D-24 | Owner's working rules live in AGENTS.md "Working rules". | Same rules for every chat. |
| D-25 | Lenis smooth scroll only on `/` and `/property/[id]`, never on `/discover` (it fights drag gestures). | Avoids swipe bugs. |

## B. Things we checked (so you do not have to re-check)
- `npm install` of the pinned set: **0 conflicts** (peer rules checked).
- A real `next build` with Next 16.4 + Tailwind 4.3 + R3F + drei + postprocessing + motion + Zustand: **passed**.
- `@google/genai` 2.x still has `ai.models.generateContent`, `generateContentStream`, `ai.chats`.
- Firebase 13 has `initializeApp`, `signInWithPopup`, `GoogleAuthProvider`, `getFirestore`, `onSnapshot`, `arrayUnion`.
- Firebase 12.x ALSO needs Node 24.12+, so there is no benefit in downgrading.

## C. Open questions (answer when they appear)
- Does `gemini-3.8-flash` work on the user's free key? If not, set `GEMINI_MODEL=gemini-3.5-flash-lite`.
- Do we want Google Search grounding in the copilot? Default: **off**.

## D. Work log (agents append here, newest at the bottom)
Format: `YYYY-MM-DD | phase | what changed | files | assumptions / new packages`

- 2026-10-11 | planning | docs pack created, versions verified | docs/*, AGENTS.md | none
- 2026-10-11 | docs | applied docs-patch-01 (motion tiers, working rules, phase split) | AGENTS.md, docs/00, 05, 06, 07 | none
