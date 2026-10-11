# 00 — Decisions Log

**Plain-English summary:** This file lists every big choice we made, *why*, and what we
rejected. If an agent wants to change one of these, it must ask the owner first and add a new
row here. Dates are when the decision was made (all checked on **11 Oct 2026**).

## Naming
- Product name: **Vespera** (tagline: "Evening light. Exceptional homes.")
- GitHub: user **icodesAS**, repository **Vespera** (https://github.com/icodesAS/Vespera)
- **Backend services still use "PropSwipe" identifiers:** Firebase project id, Gemini API project name, package.json "name" field
- **Only changed for GitHub/docs:** Repository name, folder name, documentation content, README
- Technical identifiers will be renamed in Phase 3a code rename task.

## How the version choices were verified (so nothing clashes)
On 11 Oct 2026 the exact set in docs/02 was installed together on **Node 24.20.0 / npm 10.9**, with these results:
- `npm install`: **no ERESOLVE** (npm's "these packages cannot live together" error)
- `tsc --noEmit`: pass · `eslint .`: pass · `next build`: pass (Turbopack)
- Built app served `/` and `/property/42` with HTTP 200; the AI route returned 401 without a login token

**Verified** (Phase 1): real WebGL rendering, live Firebase calls (Auth + Firestore + rules), live Gemini calls (`gemini-3.8-flash`), login, registration, swipe deck, like/save, AI explain. `npm run check` passes with 0 errors.

## Decision table

| ID | Decision | Why | Rejected alternatives |
|----|----------|-----|-----------------------|
| D-01 | **Upgrade in place**, because the old code was recoverable (Phase 1 fixed it). Tag the commit before the upgrade as `v1-legacy` if it can be found (`git log`). Use branches `phase-N-name` created from the current working branch; merge after each phase; tag `phase-N-done`. | The old app was fixable. Patching broken code step by step shows progress. | Clean rebuild (too much rework) |
| D-02 | **Keep the same GitHub repo** (`Aman-art1/PropSwipe`), work on current branch. | Keeps history: shows growth from year 1 to now. | New repo |
| D-03 | **Node 24.12 or newer** (`.nvmrc` = `24`, `engine-strict=true`). | `firebase` 13.x needs Node >= 24.12 (Firebase 12.x also needs Node >= 24.12). Next 16 needs >= 20.9. Windows: install from nodejs.org; `.npmrc` keeps `save-exact=true` and `engine-strict=true`. Vercel project Node version must be 24.x. | Node 20 (too old for Firebase 13), Node 22 (works, but 24 LTS is better) |
| D-04 | **Next.js 16.4.0** (exact). | 16.0.0–16.3.7 have a **critical** security advisory (found by `npm audit`). 16.3.8 was the first patched; 16.4.0 is installed and verified. | 16.3.5 (vulnerable), older 16.3.8 (also OK but 16.4.0 is newer stable) |
| D-05 | **React 19.3.0**, not 19.4+. | `@react-three/fiber` 9.8.x allows `react >=19 <19.4`. The installed pair React 19.3.0 + R3F 9.8.1 + drei 10.7.9 installed with zero ERESOLVE conflicts and passed `next build`. Do not upgrade React to 19.4 until R3F supports it. | React 19.4+ (breaks R3F 9.8.x) |
| D-06 | **TypeScript 5.9.3.** | The official Next 16 starter uses `^5`. TS 6/7 exist but the Next/ESLint toolchain is not proven on them. | TS 6.x / 7.x |
| D-07 | **ESLint 9.39.0, not 10.** | Tested: ESLint 10 installs with peer warnings, then **crashes** `eslint-plugin-react` at lint time. (npm shows "ESLint 9 no longer supported", it is a warning; it still works.) | ESLint 10 |
| D-08 | **Firebase 13.0.0** chosen because Phase 1 verified Auth + Firestore on it. It is a new major version. Fallback if it ever misbehaves: Firebase 12.19.0 (also works on Node 24). Only change on a scratch branch. Note: `firebase-admin` 14.5.0 is installed and working. | 13.0.0 verified in Phase 1; Auth + Firestore both work | Firebase 12.x (also works, but 13 is current) |
| D-09 | **`@google/genai` 2.28.0**, Gemini **Developer API with an API key**. Drop `@google-cloud/vertexai`, Vertex mode, `service-account.json`. | One simple server-only key. Vertex's path ("Agent Platform") is being retired for 2.5 models; service-account files are a leak risk. | Vertex AI, `@google/generative-ai` (old SDK) |
| D-10 | **Model name lives in env:** `GEMINI_MODEL=gemini-3.8-flash`, fallback `GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite`. Both verified working (11 Oct 2026). `gemini-3.8-flash` has no shutdown date announced. `gemini-3.7-flash` is auto-routed to 3.8. `gemini-3.5-flash` is auto-routed to `gemini-3.6-flash`. `gemini-3.5-flash-lite` has no shutdown date. `gemini-2.5-*` is limited to users who already used it (new keys get 404). Shutdown dates listed by Google are the earliest possible dates, not guaranteed dates. Never hard-code a model name in code — model names live only in env vars. | Stable, verified; env-based so easy to change | Hard-coding model names; newest 3.8 is stable |
| D-11 | **`motion` 14.1.0**, import from `"motion/react"`. | `framer-motion` was renamed. All imports migrated in Phase 1. | `framer-motion` |
| D-12 | **3D: `three` 0.186.1 + `@react-three/fiber` 9.8.1 + `@react-three/drei` 10.7.9 + `@react-three/postprocessing` 3.2.0**. Postprocessing IS installed and verified working with the pinned set. Allowed only for a light bloom on the landing hero (desktop, good devices) behind Tier-3 fallbacks. Never on /discover. | Standard, React-friendly. Postprocessing tested and works. Glow via emissive colours + optional light bloom. | Raw three.js, Spline embeds |
| D-13 | **3D only on the landing page.** Swipe deck, explore and detail pages use CSS 3D only for cards, not WebGL. | Cheap phones struggle with WebGL. Swiping must always feel instant. | 3D everywhere |
| D-14 | **Dark theme only for v2.0.** Light theme = later "Could" item. | One look done perfectly beats two done halfway; 3D scenes are dark. | Dark/light toggle now |
| D-15 | **Maps: Leaflet 1.9.4 + react-leaflet 5.0.0 + OpenStreetMap tiles.** | No API key, free. Needs attribution. | Google Maps (key + billing) |
| D-16 | **Zod 4.6.5** for every schema and for AI JSON schemas (`z.toJSONSchema`). | One source of truth for types, validation and AI output shapes. | Hand-written types |
| D-17 | **Guest login (Firebase Anonymous Auth) + Email + Google.** | Recruiters can try the app in one click without signing up. | Login wall |
| D-18 | **Admin = a document `admins/<uid>` created by hand** in the Firebase console. | The app can never promote anyone to admin. | Hard-coded UID, custom claims (needs admin credentials) |
| D-19 | **Admin SDK credentials:** `FIREBASE_ADMIN_CREDENTIALS_BASE64` is in `.env.local` (Phase 1 current state). Planned improvement in Phase 5: test whether `firebase-admin` can verify login tokens with only the project id (no secret). If it works and no server code needs to read Firestore, remove the credential variable and the key. Never commit a key; delete downloaded key files. | CURRENT state. May be improved later. | Service-account JSON in env (less secure) |
| D-20 | **AI routes require a Firebase login token** + soft rate limit. | Stops strangers from burning the Gemini quota. | Open routes |
| D-21 | **Images: local `/public/images` for seed + paste-a-URL in admin.** Image upload (Cloudinary free tier) only in a late phase. Do not use Firebase Storage unless the owner confirms the free plan allows it. | Storage rules for new projects have changed before; avoid a surprise bill. | Firebase Storage by default |
| D-22 | **No test framework in v2.0.** Gate = typecheck + lint + build + manual checklist. Add Vitest/Playwright later, one at a time, with `--dry-run`. | Every extra package is extra version risk. | Vitest + Playwright now |
| D-23 | **Hosting: Vercel (free Hobby plan).** | Best Next.js support. Add the Vercel domain to Firebase "Authorized domains". | Firebase App Hosting, self-hosting |
| D-24 | **Exact pins + committed `package-lock.json` + `npm ci` on Vercel.** | Same versions every time, for every person and agent. | Caret ranges (`^`) |
| D-25 | **Motion tiers**: Tier 1 Cinematic (landing `/` only) = loader, hero WebGL, scroll-driven camera, split-text, magnetic buttons, custom cursor, city marquee, Lenis. Tier 2 Light (all other pages) = calm 2D ambient background (CSS gradient blobs + faint grain), page enter fade+12px rise via `app/template.tsx`, overlay wipe via TransitionLink, staggered reveals, glass hover glow + small tilt, animated rent numbers, Lenis only on `/property/[id]`. Tier 3 Minimal (reduced motion, width<768px, ≤4 CPU cores, no WebGL, WebGL error) = no WebGL, CSS gradient, fades only. `/discover` never uses WebGL or Lenis (fights drag). | Award-site feel where it matters, speed and reliability everywhere else | |
| D-26 | **Shared motion components** (build in Phase 3b): `AmbientBackground` (CSS), `PageWipe` + `TransitionLink`, `app/template.tsx`, `Cursor`, `SplitReveal`, `MagneticButton`, `Tilt`, `CountUp`, `Marquee`, `Loader`. Optional stretch (AFTER Phase 8, only if asked): a single WebGL shader ambient background on calm pages (login, onboarding, property, shortlist). Never on `/discover`. Never at the same time as the hero canvas. 30 fps cap, DPR 1, CSS fallback. | Built once, used everywhere; consistent motion system | |
| D-27 | **No new animation libraries** (no GSAP). Tools in use: `motion/react` (`useScroll`, `useTransform`, `useSpring`), `lenis/react`, drei, `@react-three/postprocessing`. Adding a new animation library needs the 4-step safe-install routine in docs/02. | Zero new version risk | GSAP, other animation libs |
| D-28 | **Animate only transform and opacity** in the DOM. Respect `prefers-reduced-motion` everywhere. | Performance and accessibility | Animating layout properties |
| D-29 | **Code rename** (Phase 3a task): Rename in code: package.json name, app metadata title and OG text, logo/wordmark, README title, favicon. Rename the GitHub repo (GitHub redirects the old link), the Vercel project, and the Firebase display name (the project id cannot change). | Product name is Vespera; technical paths stay for now | |
| D-30 | **Version Policy**: Exact version numbers live ONLY in `package.json` (truth) and `docs/02-Tech-Stack-and-Versions.md` (copy). Everywhere else write "see package.json". Model names live ONLY in `.env.example`, `.env.local` and `docs/05-AI-Architecture.md`. Ranges and minimums (Node 24.12+, React <19.4) may be stated as rules. | Single source of truth prevents version drift in docs | Hard-coding versions everywhere |

## Open questions for the owner (answer when you can; agents must not guess)
**Inspiration sites:** Awwwards three.js collection: Collective Pixels (Complica Studio), Teatika, Developer Office, Atmos Gallery (KauStudio), Snowflake. We copy the FEEL (mood, depth, motion) only — never code, text or assets.

## Change log
| Date | Change | By |
|------|--------|----|
| 2026-10-11 | Initial decisions D-01 … D-29 | Merge + owner |
| 2026-10-11 | Docs merge + Vespera rename | Documentation agent |


## Work log (agents append here, newest at the bottom)
Format: `YYYY-MM-DD | phase | what changed | files | assumptions / new packages`

- 2026-10-11 | planning | docs pack created, versions verified | docs/*, AGENTS.md | none
- 2026-10-11 | phase 1b | clean foundation: updated to Node 24.20.0, installed pinned dependencies, migrated framer-motion to motion/react, simplified lib/ai.ts to Gemini API key only, hardened lib/firebase.ts & useAuth.tsx, fixed lint & build, npm run check passed | package.json, lib/ai.ts, lib/firebase.ts, hooks/useAuth.tsx, store/usePropertyStore.ts, components/*, app/*, next.config.ts | none
- 2026-10-11 | phase 1b | firebase setup: resolved client-side API key typo, verified Firebase Auth login/register, Firestore liking & user doc creation, Gemini AI assessment (gemini-3.8-flash), npm run check passed | .env.local, .gitignore, docs/00-Decisions-Log.md | none
- 2026-10-11 | docs | documentation merge and Vespera rename: merged base pack with current pack into final docs set (00-08, START-HERE.md, assets/baseline/, _stuck/); renamed product PropSwipe→Vespera throughout; updated ALL versions to match package.json (Node 24, Next 16.4.0, React 19.3.0, Firebase 13, motion 14.1.0, R3F 9.8.1, postprocessing 3.2.0); added motion tiers, brand identity, Phase 1 status; removed old numbered docs, _incoming/, merge brief | AGENTS.md, GEMINI.md, docs/* | none
