# 00 — Decisions Log

**Plain-English summary:** This file lists every big choice we made, *why*, and what we
rejected. If an agent wants to change one of these, it must ask the owner first and add a new
row here. Dates are when the decision was made (all checked on **11 Oct 2026**).

## How the version choices were verified (so nothing clashes)
On 11 Oct 2026 the exact set in doc 02 was installed together on **Node 22.22 / npm 10.9**, with these results:
- `npm install`: **no ERESOLVE** (npm's "these packages cannot live together" error)
- `tsc --noEmit`: pass · `eslint .`: pass · `next build`: pass (Turbopack)
- Built app served `/` and `/property/42` with HTTP 200; the AI route returned 401 without a login token

**Not verified** (no browser or keys in the test machine): real WebGL rendering, live Firebase calls,
live Gemini calls. These are checked by the owner in Phases 1, 3 and 5 of doc 06.

## Decision table

| ID | Decision | Why | Rejected alternatives |
|----|----------|-----|-----------------------|
| D-01 | **Clean rebuild, not in-place patching.** Move old code to `legacy/`, start from a verified baseline, port features one by one. | The old app does not start. Firebase went 10→12, Gemini SDK 1→2, Framer Motion→Motion, Vertex path retired. Patching a broken base hides new bugs. | Upgrade in place (too many unknowns at once) |
| D-02 | **Keep the same GitHub repo** (`Aman-art1/PropSwipe`), work on branch `v2-rebuild`. | Keeps history: shows growth from year 1 to now. Tag old code `v1-legacy`. | New repo |
| D-03 | **Node 22 LTS** (`.nvmrc` = 22, `engine-strict=true`). | `firebase-admin` 14 needs Node ≥ 22; Next 16 needs ≥ 20.9. | Node 20 (too old for firebase-admin), Node 24+ (untested) |
| D-04 | **Next.js 16.3.8** (exact). | 16.0.0–16.3.7 have a **critical** security advisory (found by `npm audit`). 16.3.8 is the first patched version in the line we tested. | 16.3.5 (vulnerable), 16.4.0 (released 6 Oct 2026, only days old) |
| D-05 | **React 19.2.8**, not 19.3.0. | `@react-three/fiber` 9.7.x only allows `react >=19 <19.3`. Installing React 19.3.0 with it **fails with ERESOLVE** (tested). Both are >2 months old = settled. | React 19.3 + R3F 9.8.x (works on paper, only ~2.5 weeks old) |
| D-06 | **TypeScript 5.9.3.** | The official Next 16 starter uses `^5`. TS 6/7 exist but the Next/ESLint toolchain is not proven on them. | TS 6.x / 7.x |
| D-07 | **ESLint 9.39.5, not 10.** | Tested: ESLint 10 installs with peer warnings, then **crashes** `eslint-plugin-react` at lint time. (npm shows "ESLint 9 no longer supported", it is a warning; it still works.) | ESLint 10 |
| D-08 | **Firebase 12.19.0**, not 13.0.0. | 13.0.0 was published 7 Oct 2026 (a new *major* version, 4 days old). We take the last settled 12.x. | Firebase 13 |
| D-09 | **`@google/genai` 2.23.0**, Gemini **Developer API with an API key**. Drop `@google-cloud/vertexai`, Vertex mode, `service-account.json`. | One simple server-only key. Vertex's path ("Agent Platform") is being retired for 2.5 models on 20 Oct 2026; service-account files are a leak risk. | Vertex AI, `@google/generative-ai` (old SDK) |
| D-10 | **Model name lives in env:** `GEMINI_MODEL=gemini-3.5-flash`, fallback `gemini-3.5-flash-lite`. | `gemini-2.5-flash` (the old choice) is being shut down (Vertex: 20 Oct 2026) and is reported unavailable to new projects on the Developer API. Google lists 3.5 as stable with shutdown "no earlier than May 2027". 3.6/3.7/3.8 are marked short-term. | Hard-coding a model name; newest 3.8 (short-lived) |
| D-11 | **`motion` 13.4.0**, import from `"motion/react"`. | `framer-motion` was renamed to `motion`. Same API, new import path. | `framer-motion` |
| D-12 | **3D = `three` 0.186.0 + `@react-three/fiber` 9.7.0 + `@react-three/drei` 10.7.8**, plus `lenis` for smooth scroll. No postprocessing library yet. | Standard, React-friendly. Fewer packages = fewer clashes. Glow is faked with emissive colours. | Raw three.js, Spline embeds, postprocessing/bloom (maybe later, test first) |
| D-13 | **3D only on the landing page.** Swipe deck, explore and detail pages stay 2D. | Cheap phones struggle with WebGL. Swiping must always feel instant. Floating "glass cards" use CSS 3D, not WebGL. | 3D everywhere |
| D-14 | **Dark theme only for v2.0.** Light theme = later "Could" item. | One look done perfectly beats two done halfway; 3D scenes are dark. | Dark/light toggle now |
| D-15 | **Maps: Leaflet 1.9.4 + react-leaflet 5.0.0 + OpenStreetMap tiles.** | No API key, free. Needs attribution. | Google Maps (key + billing) |
| D-16 | **Zod 4.6.5** for every schema and for AI JSON schemas (`z.toJSONSchema`). | One source of truth for types, validation and AI output shapes. | Hand-written types |
| D-17 | **Guest login (Firebase Anonymous Auth) + Email + Google.** | Recruiters can try the app in one click without signing up. | Login wall |
| D-18 | **Admin = a document `admins/<uid>` created by hand** in the Firebase console. | The app can never promote anyone to admin. | Hard-coded UID, custom claims (needs admin credentials) |
| D-19 | **No service account.** `firebase-admin` is started with only the project id, just to verify login tokens on AI routes. Seeding the database is done from the Admin page, as the admin user. | Nothing secret to leak. (Token check with project-id-only is standard; verify in Phase 5.) | Service-account JSON in env |
| D-20 | **AI routes require a Firebase login token** + soft rate limit. | Stops strangers from burning the Gemini quota. | Open routes |
| D-21 | **Images: local `/public/images` for seed + paste-a-URL in admin.** Image upload (Cloudinary free tier) only in a late phase. Do not use Firebase Storage unless the owner confirms the free plan allows it. | Storage rules for new projects have changed before; avoid a surprise bill. | Firebase Storage by default |
| D-22 | **No test framework in v2.0.** Gate = typecheck + lint + build + manual checklist. Add Vitest/Playwright later, one at a time, with `--dry-run`. | Every extra package is extra version risk. | Vitest + Playwright now |
| D-23 | **Hosting: Vercel (free Hobby plan).** | Best Next.js support. Add the Vercel domain to Firebase "Authorized domains". | Firebase App Hosting, self-hosting |
| D-24 | **Exact pins + committed `package-lock.json` + `npm ci` on Vercel.** | Same versions every time, for every person and agent. | Caret ranges (`^`) |

## Open questions for the owner (answer when you can; agents must not guess)
1. Which 3D websites in your video do you like most? (Send names/links if you know them. The video was a low-quality phone recording, so only the general style was readable.)
2. Public or private GitHub repo? (Public is better for a portfolio. Secrets are never committed either way.)
3. Do you want a custom domain later? (Check the GitHub Student Developer Pack page for current offers.)
4. Keep the name "PropSwipe"? (Assumed yes.)

## Change log
| Date | Change | By |
|------|--------|----|
| 2026-10-11 | Initial decisions D-01 … D-24 | Claude + owner |
