# 06 — Build Phases and Copy-Paste Prompts

**Plain-English summary:** We build in **11 small phases**. Each phase has a goal, a prompt you paste into an Antigravity chat,
a checklist for "done", and a note on when to ask Claude for help. One phase = one chat = one git branch.
Small steps mean that if something breaks, we know exactly which step did it.

Risk colours: 🟢 easy (Gemini in Antigravity is fine) · 🟡 medium (Gemini, then re-read the result) · 🔴 hard (use the strongest model you have, or bring it to Claude).

## 0. How to work (read once)
**Start every Antigravity chat with this** (replace N):
> Read `AGENTS.md`. Then read only the docs listed for this task. We are doing **Phase N** from `docs/06-Build-Phases-and-Prompts.md` and nothing else.
> Explain things in simple English, because I am a beginner. First tell me your plan in 5 lines. Wait for my "go" before you change files.
> When done, run `npm run check`, paste the result, and tell me how I can see the result in the browser.

**Git routine for every phase**
1. `git checkout v2-rebuild` → `git pull` → `git checkout -b phase-N-short-name`
2. Agent works, gate passes (`npm run check`).
3. You look at it in the browser (`npm run dev`). Tick the "done when" list.
4. `git add -A && git commit -m "feat: …"` → `git checkout v2-rebuild` → `git merge phase-N-short-name` → `git tag phase-N-done`.
If a phase goes wrong: `git checkout v2-rebuild` (you are back to the last good state). Nothing is lost.

**Rules for Antigravity agents**
- Only **one agent edits files at a time**. Several agents on the same files cause conflicts.
- Ask for the terminal commands to be shown to you before they run, if your Antigravity version has that setting.
- If an agent suggests upgrading a package, deleting `package-lock.json`, or using `--force`: say **no**, and take the error to Claude.

**When to bring something to Claude** (paste this):
> Context: PropSwipe v2 (Next 16.3.8, React 19.2.8, see docs/02). Phase N. 
> Goal: … 
> Error / problem (exact text): … 
> File(s) involved (paste code): … 
> What I / the agent already tried: …
(The agent's `docs/_stuck/*.md` file already contains most of this.)

## Phase map
| Phase | Name | Risk | Matches UI stage |
|-------|------|------|------------------|
| 0 | Rescue and safety audit | 🟡 | |
| 1 | Clean baseline + new Firebase | 🔴 | |
| 2 | Data layer, seed data, stores | 🟡 | |
| 3 | Design system, app shell, login | 🟢 | UI-1 |
| 4 | Discover: swipe deck v2 + filters | 🟡 | UI-3 |
| 5 | AI layer: routes, rerank, summary, explain, search | 🔴 | |
| 6 | Onboarding quiz + Explore page | 🟢 | |
| 7 | Detail page, map, rent helper, shortlist, copilot | 🟡 | UI-4 |
| 8 | 3D landing page | 🔴 | UI-2 |
| 9 | Admin, polish, performance, accessibility | 🟡 | UI-5 |
| 10 | Deploy, README, media, launch | 🟢 | |

---

## Phase 0 — Rescue and safety audit 🟡
**Goal:** Keep the old code safe as reference, check nothing secret leaked, and note why v1 would not start. **No app code changes.**

**You do first (5 min):** open the repo in Antigravity; in the terminal run `git status` (must be clean), then `git tag v1-legacy`, then `git checkout -b v2-rebuild`.
Install **Node 22** (`node -v` must say v22.x). Copy `AGENTS.md` to the repo root and the `docs/` folder into the repo; commit as `docs: add project docs`.

**Prompt:**
> Phase 0. Do NOT change app code. (1) Run `git log --all --oneline -- service-account.json .env.local .env` and `git grep -nI "private_key\|AIza" $(git rev-list --all | head -50)` and tell me in plain English whether any secret was ever committed. 
> (2) Move all old source files (`app/ components/ data/ hooks/ lib/ store/ types/ public/images`, old `package.json`, configs, `service-account.json` if present) into a folder `legacy/` using `git mv`, **except** `docs/`, `AGENTS.md`, `.git`. Keep `public/images` copies in `public/images` too (we reuse the 20 photos). Add `legacy/` to `tsconfig.json` `exclude` and to `eslint` ignores later (Phase 1). 
> (3) Do not delete `service-account.json` from git history; just report. 
> (4) Write `docs/_stuck/phase0-notes.md` listing the exact error `npm run dev` gave in the OLD code (run it in `legacy/` if possible, copy the first error only) and your guess for the cause.

**Done when:** a plain-English secret report exists · old code is under `legacy/` · repo root has only docs, AGENTS.md, public/images · you tagged `v1-legacy`.
**If a secret was committed (even once):** treat that key as stolen. In Google Cloud Console delete the service-account key / API key and make new ones later. Making the repo private does not un-leak it. See doc 07 §4. **Bring the report to Claude if unsure.**

---

## Phase 1 — Clean baseline + new Firebase 🔴
**Goal:** An empty but healthy Next 16 app with exact versions, a working Firebase connection, and safe rules.

**You do (Firebase console, doc 03 §1):** create project, enable Email/Google/Anonymous, create Firestore (Mumbai, **production mode**), publish rules from `docs/assets/baseline/firestore.rules`, register web app, create `.env.local`.

**Prompt:**
> Phase 1. Read AGENTS.md, docs/02, docs/03. 
> (1) Copy every file from `docs/assets/baseline/` into the repo root exactly as they are (`package.json`, `.npmrc`, `.nvmrc`, `.gitignore`, `.env.example`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`; `firestore.rules` stays for reference). Do NOT change any version number. Add `legacy` to `tsconfig.json` `exclude` and to the `globalIgnores` list in `eslint.config.mjs`. 
> (2) Run `npm install` (it must finish with no ERESOLVE error). If it errors, STOP and write `docs/_stuck/`. 
> (3) Create `app/layout.tsx` (dark background, Geist + Space Grotesk fonts via next/font/google, `<Toaster/>` from sonner), `app/globals.css` (tokens from docs/04 §2), `app/page.tsx` (a simple placeholder "PropSwipe v2"). 
> (4) Create `lib/env.ts` (Zod-validated env, never crashes: exports `firebaseConfigStatus`), `lib/firebase.ts` (modular SDK, browser-only, safe if config is missing), and a hidden page `app/dev/health/page.tsx` that shows 4 green/red checks: env present · Firebase initialised · Firestore can read `properties` (empty is OK) · anonymous sign-in works. 
> (5) Run `npm run check` and paste the output.

**Done when:** `npm run check` passes · `http://localhost:3000/dev/health` shows 4 green ticks · `package-lock.json` is committed · `git diff package.json` against the baseline shows **zero** changes.
**Ask Claude:** paste your Firestore rules and the Rules Playground results table (doc 03 §6) and ask "review these rules". 🔴

---

## Phase 2 — Data layer, seed data, stores 🟡
**Goal:** Safe data code and 20 good demo homes in the database.

**Prompt:**
> Phase 2. Read AGENTS.md, docs/01 §10, docs/03. 
> (1) Create `schemas/property.ts`, `schemas/user.ts` exactly as in docs/03 §3.1. 
> (2) Create `lib/firestore/normalize.ts` (`normalizeProperty`), `lib/firestore/properties.ts` (`getProperties()` with fallback to seed), `lib/firestore/users.ts` (`ensureUserDoc`, `savePreferences`, debounced `flushSwipes` using `arrayUnion/arrayRemove`). 
> (3) Create `data/seed-properties.ts` with **20 homes in the v2 shape** based on `legacy/data/properties.ts` (keep titles/cities/rents/photos; ids `prop-001`…`prop-020`; add locality, approximate lat/lng for the real locality, amenities, nearby, furnishing, propertyType, petFriendly, 3 image paths if available else reuse the single image). Validate all 20 with Zod in a script `scripts/validate-seed.mjs`. 
> (4) Create `data/landmarks.ts` (≈25 landmarks: big IT parks and metro stations in Pune, Bengaluru, Hyderabad, Mumbai, Gurugram with approximate lat/lng) and `lib/geo.ts` (Haversine). 
> (5) Create stores: `store/usePropertyStore.ts` (catalogue, deck order, current index, filters) and `store/useUserStore.ts` (profile, preferences, liked, skipped). Keep them small. 
> (6) A temporary `/dev/health` check "seed valid: 20/20".

**Done when:** seed script says 20/20 valid · app still builds · with Firestore empty, `getProperties()` returns the 20 seed homes · you can see them listed on `/dev/health`.

---

## Phase 3 — Design system, app shell, login 🟢
**Goal:** The look from docs/04, reusable parts, and working login (Email, Google, Guest).

**Prompt:**
> Phase 3. Read AGENTS.md, docs/04 §2–§6, docs/01 §4. 
> (1) Build the UI parts in docs/04 §5 (`ui/*`, `layout/Nav`, `layout/Footer`, `layout/RequireAuth`) using Tailwind v4 tokens. Mobile-first. 
> (2) Hidden page `/dev/styleguide` showing every component and states (hover, focus, disabled, loading). 
> (3) `/login` with tabs Sign in / Register, **Continue with Google**, **Try as guest** (`signInAnonymously`). Friendly error messages (map Firebase error codes to plain English). After login call `ensureUserDoc`, then redirect to `/onboarding` if `onboardingComplete` is false else `/discover`. 
> (4) `RequireAuth` shows a skeleton while Firebase checks, then redirects to `/login`. 
> (5) Add `app/not-found.tsx` and `app/error.tsx` in the same style.

**Done when:** all three login methods work · a new `users/<uid>` doc appears in Firestore · styleguide page looks consistent · nothing is clickable that does nothing.

---

## Phase 4 — Discover: swipe deck v2 + filters 🟡
**Goal:** The heart of the app, smooth and polished.

**Prompt:**
> Phase 4. Read AGENTS.md, docs/04 §4 (`/discover`) and §3, docs/03 §4. Use `motion/react`. 
> Build `/discover`: stack of 3 cards, drag with ±120 px threshold, rotation, LIKE/SKIP stamps, spring back, buttons, arrow keys, **Undo** (`Z`), `navigator.vibrate?.(10)`. Persist likes/skips with the debounced flush from Phase 2 (never one write per swipe). 
> Add `FilterBar` (city, rent range, BHK, furnishing, pets) filtering the deck instantly in the store. Add an **AI search bar UI** that is disabled with a "coming soon" tooltip (wired in Phase 5). 
> Empty state when deck ends. Keep the page 2D only: no WebGL. Use `next/image` with `sizes`.

**Done when:** feels smooth on your phone and laptop · likes survive page refresh · undo works · filters never produce a crash on 0 results (friendly empty state) · `npm run check` passes.

---

## Phase 5 — AI layer 🔴
**Goal:** All five AI routes, secure, validated, with fallbacks, wired into the UI.

**You do:** put `GEMINI_API_KEY` in `.env.local` (and later Vercel). Run the model list `curl` from docs/05 §2 and confirm `gemini-3.5-flash` exists; otherwise tell the agent the right name.

**Prompt (split into 3 chats: 5a, 5b, 5c):**
> **5a — foundation.** Read AGENTS.md, docs/05 §1–§4, §6, §10. Build `lib/ai/client.ts` (lazy), `lib/ai/generate.ts` (`generateJson` with fallback model + timeout + Zod), `lib/ai/prompts.ts`, `lib/ai/score.ts` (`scoreProperty`), `lib/auth-server.ts`, `lib/ai/rate-limit.ts`, `schemas/ai.ts`, `lib/ai/client-api.ts`. Check option names in `node_modules/@google/genai/dist/genai.d.ts`; do not guess. 
> **5b — routes.** Build `app/api/ai/search|explain|rerank|summary/route.ts` exactly per docs/05 §5. Every route: token check → Zod input → `generateJson` → id validation → fallback. Write `scripts/ai-smoke.mjs` (docs/05 §11). 
> **5c — wiring.** Enable the AI search bar; add `ExplainPanel` (score ring + pros/cons) on cards; add the auto-rerank every 5 swipes (docs/05 §7) with the toast; add `/shortlist` "AI compare" panel (the page itself is finished in Phase 7, just enable the panel for now if the page exists).

**Done when:** smoke script prints all PASS · with a wrong `GEMINI_MODEL` the UI still works (offline label) · no key or user text in logs · logged-out request gets 401 · after 5 swipes the toast appears and unseen cards reorder without moving the current card.
**Ask Claude:** paste `lib/auth-server.ts` + one route and ask for a security review; also if token verification with project-id-only fails. 🔴

---

## Phase 6 — Onboarding quiz + Explore 🟢
**Prompt:**
> Phase 6. Read AGENTS.md, docs/01 §6–§7, docs/04 §4. 
> Build `/onboarding` (5 steps, Skip always visible, progress dots, ₹ formatting with `toLocaleString("en-IN")`) saving `PreferencesSchema` + `onboardingComplete:true` via `savePreferences`. Skipping saves safe defaults. Add "Edit preferences" in the Nav menu. 
> Build `/explore`: responsive grid, List | Map toggle (the map can be a placeholder until Phase 7), same filters as discover, **Load more** button (batches of 12). 
> Make `explain`, `rerank` and `search` use the user's saved preferences (replace any hard-coded preferences).

**Done when:** new user is sent through onboarding once · preferences visible in Firestore · changing preferences changes AI explanations · explore handles 0 results.

---

## Phase 7 — Detail page, map, rent helper, shortlist, copilot 🟡
**Prompt (split 7a, 7b, 7c):**
> **7a — detail page.** Read AGENTS.md, docs/01 §5, docs/04 §4. Build `/property/[id]` (remember: `params` is a Promise). Gallery, facts grid, amenities, nearby, `MapView` (`"use client"`, loaded with `dynamic ssr:false`, `leaflet.css`, `L.divIcon` marker, visible OSM attribution), **Rent helper** (income → rent-to-income %, move-in cost), similar homes (same city, ±20% rent), sticky mobile action bar. Link from every card and from the explore map. 
> **7b — shortlist.** `/shortlist`: liked homes, remove (arrayRemove), select 2–6, **AI compare** drawer using `summary`. 
> **7c — copilot.** Read docs/05 §8. Build `chat` route and `CopilotChat` drawer (non-streaming). Compute `facts` in code (workplace distance only when a landmark matches). Starter chips. History in React state only.

**Done when:** deep-linking `/property/prop-003` works after refresh · map shows one pin · rent helper math is right (check by hand) · copilot never invents distances (ask it something it cannot know and see "I don't have that detail").
**Ask Claude:** copilot prompt review and prompt-injection tests. 🟡

---

## Phase 8 — 3D landing page 🔴
**Goal:** The "wow" page, without hurting speed.

**Prompt (split 8a, 8b, 8c):**
> **8a — 2D first.** Read AGENTS.md, docs/04 §4 (`/`). Build the landing page fully in 2D: hero text, buttons, poster image + gradient, story sections with CSS-3D floating glass property cards (`motion` `useScroll`), final CTA. It must look good with **no WebGL at all**. 
> **8b — 3D scene.** Read docs/04 §4 Scene A, §7. Build `components/three/Skyline.tsx` and `Particles.tsx` (InstancedMesh buildings, `<Points>` particles, fog, camera dolly from scroll, mouse parallax on desktop). Load via a Client wrapper with `dynamic ssr:false` **after first paint**. Add the error boundary and all fallbacks from docs/04. Use `PerformanceMonitor` to lower DPR/particle count. 
> **8c — measure.** Test with DevTools CPU 4× slowdown and at 360×800. Record Lighthouse mobile + desktop for `/`. Fix until budget in docs/04 is met. Write the numbers in `docs/perf-notes.md`.

**Done when:** landing is ≥ 70 Lighthouse mobile · poster/gradient shows if WebGL is off (test by disabling hardware acceleration or using reduced motion) · 3D pauses when scrolled away or tab hidden · no console errors · `/discover` loads **no** three.js code (check Network tab).
**Ask Claude:** any WebGL context-lost, hydration mismatch, or "window is not defined" error. 🔴 (This phase is not verified in a real browser by me, so expect to iterate.)

---

## Phase 9 — Admin, polish, performance, accessibility 🟡
**Prompt:**
> Phase 9. Read AGENTS.md, docs/03 §5, docs/04 §6, docs/07. 
> (1) `/admin`: only if `admins/<uid>` exists (else friendly "Not allowed"). Add / edit / delete homes with Zod validation; **Seed demo data** button (idempotent); "System health" panel (env present, Gemini key present, Firestore reachable). 
> (2) Skeleton loaders, empty/error states everywhere, favicon, `metadata` + OpenGraph image, `robots`. 
> (3) Accessibility pass using the doc 04 §6 checklist; fix every item. 
> (4) Lighthouse on `/login`, `/discover`, `/property/prop-001`; fix to meet doc 01 §9. 
> (5) Remove any `console.log`, unused files, and dead code. Do not remove `legacy/`.
> (6) Optional (ask me first): Cloudinary upload for admin images.

**Done when:** a non-admin cannot see admin tools (and Firestore rules also block them: try it) · the doc 01 §9 bar is met · `git grep -n "console.log"` finds nothing in `app/ components/ lib/`.

---

## Phase 10 — Deploy, README, media, launch 🟢
**Prompt:**
> Phase 10. Read AGENTS.md, docs/08. 
> (1) Prepare for Vercel: set Node 22, build command `npm run build`, install command `npm ci`. List every env var I must add in Vercel (names only). 
> (2) Follow docs/08 to write `README.md` (skeleton there), create `docs/media/` placeholders and the Mermaid diagrams. 
> (3) Add `LICENSE` (MIT) and a short `docs/credits.md` for fonts, icons, map data (OpenStreetMap), any 3D/image assets. 
> (4) Final gate: `npm run check`, then `npm audit --omit=dev` and report in plain English; do NOT run `audit fix`.

**You do:** deploy on Vercel, add env vars, add the Vercel domain to Firebase **Authorized domains**, test as a guest in a private window, record the GIFs (doc 08 §4), paste links into the README. Tag `v2.0.0`.

**Done when:** the live link works for a stranger in 60 seconds (doc 01 §2) · README renders with images and diagrams · you can explain every feature in an interview (read `docs/00` and doc 05 aloud once).
