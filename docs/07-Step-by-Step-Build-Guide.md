# 07 — Step-by-Step Build Guide (for Antigravity + Claude)

## How to work (the loop)
1. Open a **new Antigravity chat** for each phase.
2. First message: *"Read AGENTS.md and docs/00-Decisions-Log.md. Then read docs/<the doc for this phase>. Do Phase N from docs/07 only. Run `npm run check` at the end and update docs/00."*
3. Review the diff. Run the app. Do the phase's checks.
4. `git add -A && git commit -m "phase N: <name>"`. Only then start the next phase.
5. Stuck three times on the same error? Stop and bring it to Claude with: error text + file + what you tried.

## Smoke test (5 minutes, run after every phase)
- [ ] `npm run check` passes
- [ ] `/login` works (email or Google)
- [ ] `/discover` opens, a card shows, Like (→ key) and Skip (← key) work
- [ ] Refresh: liked homes are still liked
- [ ] No red errors in the browser console

---
## Phase 0 — Safety net (you, ~20 min, no AI needed)
- [ ] `node -v` shows 24.12 or higher (else install Node 24 LTS)
- [ ] `git status` clean? commit or stash. Create branch: `git checkout -b upgrade/v2`
- [ ] Copy the pack into the repo: `AGENTS.md`, `GEMINI.md`, `docs/`, `.env.example`, `firestore.rules`
- [ ] Add the lines from `.gitignore.additions` to `.gitignore`
- [ ] Check for leaked secrets: `git log --all --oneline -- service-account.json .env.local`
- [ ] Create the NEW Firebase project (doc 08) and fill `.env.local`
**Done when:** branch exists, docs are in the repo, `.env.local` exists.

## Phase 1a — Audit (read-only, no changes)
Goal: know exactly what is broken before touching anything. The agent reports; it changes no files.
Done when: you have the audit report (versions, package differences, files using removed packages, real problems in lib/firebase.ts, lib/ai.ts, hooks/useAuth.tsx, store, config; first build error; ordered fix plan).

## Phase 1b — Clean foundation (fix)
Goal: the app opens on localhost again with pinned versions.
- Commit everything first. Then delete node_modules, .next and package-lock.json.
- Replace the dependencies in package.json with those in package.pinned.json (keep the repo's name; scripts from the pinned file). `npm install`. Then delete package.pinned.json.
- Replace `framer-motion` imports with `motion/react`.
- Remove `@google-cloud/vertexai` usage; simplify lib/ai.ts to API-key only, model from process.env.GEMINI_MODEL (fallback GEMINI_FALLBACK_MODEL).
- Remove the obsolete env names from .env.local (GOOGLE_GENAI_USE_VERTEXAI, GOOGLE_API_KEY, GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GOOGLE_APPLICATION_CREDENTIALS, NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID). Do not print values.
- Make lib/firebase.ts read the six NEXT_PUBLIC_FIREBASE_* vars and show a friendly error screen instead of crashing when one is missing.
- Fix eslint config so `npm run lint` works (`eslint .`). Use the fix plan from Phase 1a.
Paste to Gemini: "Do Phase 1b of docs/07 using the audit report above. Do not change UI or features. Goal: npm run dev opens http://localhost:3000 with no errors and npm run check passes. Report each file you changed."
Done when: smoke test passes (AI may still fail until the new keys are filled).

## Phase 2 — Database and auth hardening
- [ ] Deploy `firestore.rules` (Firebase console -> Firestore -> Rules -> paste -> Publish).
- [ ] Create `admins/<your uid>` by hand.
- [ ] Add `types/user.ts`, update `types/property.ts` (doc 03), add `lib/normalize-property.ts` (zod) and use it for every Firestore read.
- [ ] Store: add `skippedIds` persistence + `undoLast`. Keep `persistToFirestore()`.
- [ ] Admin page: only visible/usable for admins; add "Import seed homes" button (same IDs, safe to click twice).
- [ ] Add `lib/firebase-admin.ts`, `lib/api-auth.ts`.
**Done when:** a non-admin account cannot write properties (try it); seed import twice creates no duplicates; liked homes persist.
**Claude hard spots:** security rules, admin SDK credentials, base64 key.

## Phase 3 — AI backbone (existing endpoints, safe and personal)
- [ ] `lib/ai-json.ts`, `lib/ai-prompts.ts`, `lib/ai-fallbacks.ts`, `types/ai.ts` (zod schemas from doc 03 section 5).
- [ ] Upgrade `explain-property` (uses real preferences) and `search` (returns filters + ids). Each route: `requireUser` -> `generateJSON` -> fallback.
- [ ] Client helper `hooks/useAiFetch.ts` that attaches the ID token.
**Done when:** with a valid key, both features work; with a wrong key, the UI still shows fallback results (test it on purpose).
**Claude hard spots:** exact `@google/genai` config names, JSON-mode quirks.

## Phase 4a — Tokens and base components
- Tokens in globals.css (docs/05). Base components: GlassCard, Button, Chip, Skeleton, Badge, Header, PageShell.
- Move the old app/page.tsx to app/discover/page.tsx. Update links and the login redirect.
Done when: /discover looks the same but uses the new tokens; smoke test passes.

## Phase 4b — Motion system (Tier 2 everywhere)
- Build the shared components listed in docs/05: Ambient, PageWipe + TransitionLink, app/template.tsx, Cursor, SplitReveal, MagneticButton, Tilt, CountUp.
- Mount Ambient in the root layout for all routes except "/". Apply Tier 2 motion to /discover, /login, /onboarding, /admin.
- Tier 3 fallback must work: test with the OS "reduce motion" setting on and a narrow window.
Done when: route changes show the wipe, ambient runs at a steady 30 fps, nothing blocks swipe dragging, Tier 3 shows no WebGL.
Claude hard spots: shader errors, hydration warnings, wipe + router timing, cursor on touch devices.

## Phase 4c — Landing page (Tier 1)
- Loader, hero scene (lazy + error boundary + fallback), scroll-driven section changes, SplitReveal headlines, marquee, Lenis (landing only). Follow docs/05 landing structure and performance rules.
- Do the hero scene first with only the particles and shader, get it smooth, then add the glass cards, then bloom. Commit after each.
Done when: landing is smooth on a laptop, text appears before 3D, Tier 3 fallback works, /discover is unaffected.
Claude hard spots: transmission material cost, texture loading, scroll-to-scene syncing, WebGL context loss.

## Phase 5 — Discover: filters + onboarding (U3 + U5a)
- [ ] `useFilterStore`, `lib/filters.ts`, `FilterBar`, URL sync.
- [ ] `/onboarding` quiz -> `users/{uid}.preferences`. First login without `onboardingComplete` goes there; "Skip" allowed.
- [ ] Restyle deck with glass look. Keep behavior identical.
**Done when:** shareable filter URLs work; preferences survive refresh; swipe still works with filters on. Tier 2 motion applied (stagger reveals, hover glow, CountUp on rent).

## Phase 6 — Detail pages (U4)
- [ ] `app/property/[id]/page.tsx` (await params!), `getPropertyById`, gallery, facts, amenity badges, Leaflet map (client-only, import Leaflet CSS inside the client component).
- [ ] Card click opens detail page; "Explain with AI" sheet reuses the upgraded route.
**Done when:** direct link to `/property/3` works after login; a legacy listing without new fields renders cleanly; wrong ID shows a friendly 404. Tier 2 motion applied (stagger reveals, hover glow, CountUp on rent).
**Claude hard spots:** Leaflet default marker icons in Next, `generateMetadata`.

## Phase 7 — Wire rerank + compare + copilot
- [ ] Rerank after every 5 swipes (rules in doc 02 F6).
- [ ] "Compare with AI" in the Liked panel (F7).
- [ ] `/api/ai/copilot` streaming + `CopilotDrawer` (F8).
**Done when:** all three work with AI on, and degrade gracefully with AI off.
**Claude hard spots:** streaming responses in a route handler + reading the stream in the browser; preventing deck "jumping" during rerank.

## Phase 8 — Polish and quality
- [ ] Skeleton loaders, empty/error states, toasts, favicon, OG image, page titles.
- [ ] Compress images; use `next/image`.
- [ ] Lighthouse run (desktop + mobile). Fix the top 3 issues.
- [ ] Keyboard + screen-reader pass on `/discover`.
**Done when:** doc 01 success checklist is green.

## Phase 9 — Deploy
- [ ] Push to GitHub. Import in Vercel. Add ALL env vars from `.env.example` (the secret server ones too, not only the `NEXT_PUBLIC_` ones). Node version 24.x in Vercel settings.
- [ ] Add the Vercel domain to Firebase Auth -> Authorized domains.
- [ ] Test sign-in + AI on the live URL.

## Phase 10 — README + portfolio (doc 09)
Do this last, with real screenshots and GIFs from the live app.

---
## Copy-paste prompt templates

**Start of any phase**
> Read AGENTS.md and docs/00-Decisions-Log.md, then docs/<N>. Task: Phase <X> from docs/07. Follow the golden rules. Make small edits. When finished run `npm run check`, fix errors, update docs/00 section D, and list changed files + how I can test.

**Bug report to Gemini**
> Bug: <what you did> -> <what happened>. Error: <paste the first red error>. File: <path>. Fix the root cause with the smallest change. Do not upgrade packages. Run `npm run check`.

**Bring to Claude (hard spot)**
> HARD SPOT in PropSwipe. Context: Next 16.4, React 19.3, Firebase 13, @google/genai 2.28 (see AGENTS.md). Phase: <N>. Problem: <one sentence>. Exact error: <paste>. Relevant file(s): <paste code>. Already tried: <list>.

**Review request to Claude (after each big phase)**
> Review this diff for security problems, Firestore-rule gaps, Next 16 mistakes, and anything that could break existing data. Be strict. <paste diff or files>
