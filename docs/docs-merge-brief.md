# docs-merge-brief — merge two documentation packs into ONE final docs set

**Task type: DOCUMENTATION ONLY.** Do not change any source code, `package.json`, lockfile, configs or `.env*`.
You may edit only: `AGENTS.md`, `GEMINI.md`, and files under `docs/`. Never open `.env.local` or `service-account.json`.
Write in simple, plain English (the owner is a student; English is not their first language). Short sentences. Explain any technical word once.

## 0. Inputs
- **Base pack (use its structure):** `_incoming/propswipe-docs/` (AGENTS.md, START-HERE.md, docs/00 to 08, docs/assets/baseline/).
- **Older pack (already in the repo):** current `docs/` 00-09, `AGENTS.md`, `GEMINI.md`. Mine its unique content (section 6), then remove it after merging.
- **Truth about the project today:** the real repo. Read `package.json`, `package-lock.json` (top level only), `.env.example`, `firestore.rules`, `lib/`, `app/`, `components/`, `store/`, `hooks/`, `types/` (READ ONLY) to see what exists. If a doc disagrees with the repo, the repo wins; the doc is edited, never the repo.

## 1. Final layout (target)
```
AGENTS.md  GEMINI.md
docs/
  00-Decisions-Log.md
  01-Project-Overview.md
  02-Tech-Stack-and-Versions.md
  03-Firebase-and-Data.md
  04-UI-UX-and-3D-Design.md        (includes the motion tiers, section 5 below)
  05-AI-Architecture.md
  06-Build-Phases-and-Prompts.md   (status + merged roadmap, section 4 below)
  07-Risks-Debugging-and-Fixes.md
  08-README-and-Portfolio-Plan.md
  START-HERE.md                    (moved into docs/, rewritten, section 7)
  assets/baseline/                 (keep; fix per section 2)
  _stuck/                          (empty folder with a .gitkeep)
```
Delete the older numbered files (00-09 of the old pack) and `docs-patch-01.md` / `docs/docs-patch-01.md` if present, AFTER their unique content is merged. Delete `_incoming/` at the very end. Create `docs/CHANGELOG-merge.md` listing every file changed and why (one line each).

## 2. Version reconciliation. The installed project wins.
Phase 1 is DONE and verified (see section 3). The repo uses these versions, so docs must say the same (read the exact numbers from `package.json`; the list below is what the agent reported):
Node **24.20.0**, Next **16.4.0**, React/React-DOM **19.3.0**, Firebase **13.0.0**, firebase-admin **14.5.0**, @google/genai **2.28.0**, motion **14.1.0**.
The base pack's docs say Node 22, Next 16.3.8, React 19.2.8, Firebase 12.19.0, genai 2.23.0, motion 13.4.0, R3F 9.7.0, drei 10.7.8, three 0.186.0, lucide 1.47.0. **Replace all of those with the real values from `package.json`.** Do this in docs/00, 02, 06, 07, AGENTS.md, START-HERE and `docs/assets/baseline/*`.

Required corrections (all verified on 11 Oct 2026):
1. **Node:** use **24.12 or newer**. Reason: `firebase` 13.x needs Node >= 24.12 (Firebase 12.x needs only Node >= 20). Set `.nvmrc` text in baseline to `24`. Vercel project Node version must be 24.x. Keep `.npmrc` (`save-exact=true`, `engine-strict=true`); with Node 24 it is fine.
2. **React lock:** replace "React < 19.3 while R3F 9.7.x" with: "React stays below 19.4 while `@react-three/fiber` is 9.8.x (its range is `>=19 <19.4`)". Remove the claim that React 19.3 fails; it only failed with R3F 9.7.0. The installed pair (React 19.3.0 + R3F 9.8.1 + drei 10.7.9) installed with zero conflicts and built in a real `next build` test.
3. **Firebase:** record D-08 as: "Firebase 13.0.0 chosen because Phase 1 verified Auth + Firestore on it. Note: it is a new major version. Fallback if it ever misbehaves: Firebase 12.19.0 (also works on Node 22). Change only on a scratch branch."
4. **Next advisory:** keep "Next must be >= 16.3.8"; installed 16.4.0 satisfies it.
5. **Postprocessing:** `@react-three/postprocessing` 3.2.0 IS installed (the base pack says "not installed"). Allowed only for a light bloom on the landing hero, desktop and good devices only, behind the Tier-3 fallbacks. Verified: it builds with the pinned set. Update doc 02 section 9 and doc 04.
6. **Gemini models:** keep `GEMINI_MODEL=gemini-3.8-flash`, `GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite` (the agent verified a real Gemini call works). Rewrite D-10's reasoning to match Google's deprecations page (updated 9 Oct 2026): `gemini-3.8-flash` has no shutdown date announced; `gemini-3.7-flash` is auto-routed to 3.8; `gemini-3.5-flash` is auto-routed to `gemini-3.6-flash`; `gemini-3.5-flash-lite` has no shutdown date; `gemini-2.5-*` is limited to users who already used it. Say that listed shutdown dates are the "earliest possible" dates. Remove the claim that 3.6/3.7/3.8 are "short-term". Keep the rule "model names live in env, never in code" and the `curl` model-list check.
7. **npm audit:** doc 02 section 4 must say: `npm audit` reports high items from (a) `firebase` -> `@grpc/grpc-js` and (b) a dev-tool chain (`eslint-config-next` -> `braces`). The suggested "fix" downgrades Firebase to 9.x and breaks the app: NEVER run `npm audit fix --force`. Use `npm audit --omit=dev` at release and report in plain English. Next itself must show no advisory.
8. **Admin SDK credentials:** the repo currently has `FIREBASE_ADMIN_CREDENTIALS_BASE64` in `.env.local` (Phase 1). Document this as the CURRENT state. Keep the base pack's idea as a planned improvement: in Phase 5, test whether `firebase-admin` can verify login tokens with only the project id (no secret). If it works and no server code needs to read Firestore, remove the credential variable and the key. Never commit a key; delete downloaded key files.
9. **Route names:** the repo's existing AI routes are `explain-property`, `search`, `rerank`, `summary`. Keep these paths (do NOT rename). The base pack's `explain` becomes `explain-property`. Only `chat` is new.
10. **Remove "legacy/" and "v2-rebuild":** we upgraded in place. Delete every instruction about moving code to `legacy/`, excluding it from tsconfig/eslint, and "clean rebuild" (D-01). Replace D-01 with: "Upgrade in place, because the old code was recoverable (Phase 1 fixed it). Tag the commit before the upgrade as `v1-legacy` if it can be found (`git log`)". Use branches `phase-N-name` created from the current working branch; merge after each phase; tag `phase-N-done`.
11. **Zod/other pins:** copy every other exact version from `package.json`.

## 3. Phase status to record (doc 06 top, "Current state")
- **Phase 0 (rescue/audit): DONE** (secrets checked, config tidied, docs added).
- **Phase 1 (foundation): DONE, in place.** Evidence from the agent's report: dependencies replaced by the pinned set; `framer-motion` imports migrated to `motion/react`; new Firebase project created (Mumbai, rules published, Email + Google enabled, admin key encoded to base64 in `.env.local`); an API-key typo fixed; `lib/ai.ts` simplified to `@google/genai` with `gemini-3.8-flash`; safe `extractText` helper added to all four AI routes; login, registration, deck, like and Gemini explain verified; `npm run check` passes with 0 errors.
- Before marking anything else as done, inspect the repo (read only) and add a short table "What exists in code today" (files that exist vs the target folder map in AGENTS.md). Mark clearly anything not found as TODO. Also record: Anonymous sign-in enabled? Unknown, so ask the owner to check the Firebase console (Authentication -> Sign-in method) and add it if missing.

## 4. Merged roadmap (rewrite doc 06 phase map and prompts accordingly)
Keep the base pack's prompt style: "start every chat" message, git routine, risk colours, "done when" lists, "ask Claude" notes. Phases 0-1 are done; renumber nothing before 2.

| Phase | Name | Notes |
|---|---|---|
| 2 | Data layer, seed data, stores | Base pack Phase 2. Zod schemas, `normalizeProperty`, `getProperties()` with seed fallback, `schemaVersion`, 20 v2 seed homes, `landmarks.ts` + `geo.ts`, stores. Adopt the base pack's stronger `firestore.rules` (size limits, uid check) and have the owner re-publish it. Also add `lib/env.ts` friendly "setup needed" panel if not already present. |
| 3a | Design system, app shell, login | Base pack Phase 3 + **Guest login (anonymous)**. |
| 3b | **Motion system (Tier 2)** | From section 5: shared motion components. Must come before pages get polished. |
| 4 | Discover v2 + filters | Base pack Phase 4 + Tier 2 motion. Filters saved in the URL. No WebGL. |
| 5a/5b/5c | AI layer | Base pack Phase 5 whole (generateJson, scoreProperty fallback, token check, rate limit, smoke script, wiring). Use route names from item 9. |
| 6 | Onboarding + Explore | Base pack Phase 6. |
| 7a/7b/7c | Detail page, map, rent helper, shortlist, copilot | Base pack Phase 7. `params` is a Promise. Copilot grounded by landmarks. |
| 8a | Landing in 2D first | Base pack 8a. |
| 8b | Landing 3D hero | Skyline + particles (base pack) with cursor parallax; optional light bloom (item 5); all fallbacks. |
| 8c | Landing Tier-1 extras | Loader, scroll-driven scene, split-text reveals, magnetic buttons, custom cursor, marquee, Lenis (landing + detail page only). One feature per commit. |
| 8d | Measure | Base pack 8c: CPU 4x slowdown, 360x800, Lighthouse, `docs/perf-notes.md`. |
| 9 | Admin, polish, performance, accessibility | Base pack Phase 9. |
| 10 | Deploy, README, media, launch | Base pack Phase 10 (Node 24 on Vercel, `npm ci`). |

Add to the top of doc 06 these two owner rules (from the older pack): "One phase per chat" and "After each phase run `npm run check` AND open the app and click through the smoke test". Add a short **smoke test** list (login, /discover opens, like and skip work, refresh keeps likes, no console errors).

## 5. Motion and UI (doc 04 + doc 00)
Owner's goal: award-site quality (Awwwards three.js collection, activetheory.net): rich animation on the home page, lighter animation on other pages. Inspiration seen in the owner's screenshot of the Awwwards three.js list: Collective Pixels (Complica Studio), Teatika, Developer Office, Atmos Gallery (KauStudio), Snowflake. Answer open question 1 in doc 00 with this list. We copy the FEEL (mood, depth, motion) only, never code, text or assets.

Add this table to doc 04 and keep the rest of doc 04 (tokens, Neon Skyline, performance budget, accessibility):

| Tier | Where | Gets |
|---|---|---|
| 1 Cinematic | `/` landing | Loader (max 2.5 s, skippable, once per session) - hero WebGL (Neon Skyline + cursor-reactive particles, optional light bloom) - scroll-driven camera/scene - split-text line reveals - magnetic buttons - custom cursor (fine pointer only) - city marquee - Lenis smooth scroll |
| 2 Light | `/login`, `/onboarding`, `/discover`, `/explore`, `/property/[id]`, `/shortlist`, `/admin` | Calm 2D ambient background (CSS gradient blobs + faint grain) - page enter (fade + 12px rise via `app/template.tsx`) - overlay wipe between routes via a `TransitionLink` (NOT `AnimatePresence` exit across routes) - staggered card/list reveals - glass hover glow + small tilt - animated rent numbers - Lenis only on `/property/[id]` |
| 3 Minimal | reduced motion, width < 768 px, <= 4 CPU cores, no WebGL, WebGL error | No WebGL, CSS gradient, fades only |

Decisions to add to doc 00 (new rows, continuing the numbering after the last row):
- Motion tiers as above. `/discover` never uses WebGL and never uses Lenis (it fights drag).
- Shared motion components (build in Phase 3b): `AmbientBackground` (CSS), `PageWipe` + `TransitionLink`, `app/template.tsx`, `Cursor`, `SplitReveal`, `MagneticButton`, `Tilt`, `CountUp`, `Marquee`, `Loader`.
- Optional stretch AFTER Phase 8: a single WebGL shader ambient background on calm pages only (login, onboarding, property, shortlist), never on `/discover`, never at the same time as the hero canvas, 30 fps cap, DPR 1, CSS fallback. Not part of the main plan.
- No new animation libraries (no GSAP). Tools in use: `motion/react` (`useScroll`, `useTransform`, `useSpring`), `lenis/react`, drei, `@react-three/postprocessing`. A new one needs the 4-step safe-install routine in doc 02.
- Animate only `transform` and `opacity` in the DOM. Respect `prefers-reduced-motion` everywhere.
Keep the base pack's rule: the landing page must look great with no WebGL at all (build 2D first).

## 6. Content to keep from the older pack (merge into the base pack, do not lose)
1. **Owner working rules** into AGENTS.md as a section "Working rules (from the owner)":
   - Write quality code, not long code: if 200 lines can do what 400 lines do with the same clarity and accuracy, write 200.
   - Before marking a task done, run it yourself (start the server, run build/test). Never write code and assume it works.
   - If there is an error, fix it and run it again before reporting back.
   - Never guess a library's function names or options. Check the installed version in `package.json` and the types in `node_modules`, or the official docs.
   - Keep changes scoped to what was asked. No unrelated refactors.
   - If the same error continues after **three** tries, stop and report only the error and details. Change base-pack rule 12 from "twice" to "three times" (also in START-HERE and doc 06).
2. The `docs/_stuck/` routine stays (base pack rule 12).
3. Old doc 08 Firebase "Rules Playground" quick tests: base pack doc 03 section 6 already has a better table; keep that one.
4. Old doc 09 README tips (GIF tools, `user-attachments` MP4 trick, badges): the base pack's doc 08 already covers them. Only add any badge or tool that is missing, with the real installed version numbers.
5. Old doc 06 risk "too much animation (slow pages, motion sickness, agent over-building)": add as a new risk row in doc 07 with prevention = tiers + budgets + small phases.
6. Owner is a **student** (beginner to intermediate, English not first language). In AGENTS.md replace "second-year student with only basic coding knowledge" with that wording; do not state a study year.

## 7. Per-file edit list
- **AGENTS.md** (must stay under 12,000 characters; check with `wc -c`): base pack version + section 6 item 1 + one line under code style: "Animation: `motion/react`, CSS and the shared components in docs/04. No new animation libraries. Respect reduced motion." + corrected rule 3 locks (React < 19.4 with R3F 9.8.x; ESLint 9.x; TypeScript 5.9.x; Firebase 13.x needs Node 24.12+) + corrected folder map (no `legacy/`; keep existing paths `lib/firebase.ts`, `lib/ai.ts`, `store/usePropertyStore.ts`, `hooks/useAuth.tsx`; routes `explain-property`, `search`, `rerank`, `summary`, new `chat`). Keep its "Wrong-package blacklist" and "Definition of done". Add to the blacklist: a note that `gemini-2.5-*` is limited to older users.
- **GEMINI.md:** one short paragraph: "Follow AGENTS.md. Read AGENTS.md and docs/00 first, then only the doc for your task. One phase per chat."
- **docs/00:** rows D-01, D-03, D-04, D-05, D-08, D-10, D-11, D-12, D-13, D-19, D-24 rewritten per section 2; new rows per section 5; remove open question 1 (answered) and keep the rest; change log lines for today.
- **docs/01:** keep. Edit F11 to mention Tier-1 motion; add a "Status" column (Done / Phase N). F2 shows Guest as planned. State which features already work today (swipe, like, AI explain, login) based on repo inspection.
- **docs/02:** versions from `package.json`; corrected locks table; audit text (item 7); postprocessing (item 5); Node 24.
- **docs/03:** keep (schemas, rules, seeding, data checklist). Env table: add the CURRENT `FIREBASE_ADMIN_CREDENTIALS_BASE64` (server only) with the planned removal note (item 8). Mention the new Firebase project exists (do not write its API keys). Keep the project-id as written in `.env.example` only.
- **docs/04:** add the tier table, shared components, mood list; keep everything else.
- **docs/05:** keep; apply item 9 (route names) and item 8 (token check note).
- **docs/06:** per sections 3, 4 and 6; update every prompt that mentions Node 22, `legacy/`, `v2-rebuild`, or old versions.
- **docs/07:** keep the error table; update the localhost triage (Node 24; remove the "v1 is expected not to run" point since Phase 1 fixed it); add the motion risk row; fix version mentions (e.g. "`npm ls react` must show one version: 19.3.0").
- **docs/08:** keep; update badge versions from `package.json`; use `docs/media/`; add "Awwwards/Active-Theory-inspired" only as a design note, not a claim.
- **docs/assets/baseline/**: update `package.json`, `.nvmrc`, `firestore.rules` (keep the base pack's rules), `.env.example` (add `FIREBASE_ADMIN_CREDENTIALS_BASE64` as optional, marked "temporary"). These are reference copies only; do NOT copy them over the repo root.
- **docs/START-HERE.md:** rewrite as "Where we are": steps 1-7 are already done; show what to do next (Phase 2 prompt), the file table, and the "two things only you can do".

## 8. Quality checks before you finish
- [ ] No doc still mentions: Node 22 as required, `legacy/`, `v2-rebuild`, React 19.2.8, Firebase 12.19.0 as the chosen version, Next 16.3.8 as installed, `gemini-3.5-flash` as the main model, route name `explain`.
  (Run: `grep -rniE "node 22|legacy/|v2-rebuild|19\.2\.8|16\.3\.8|gemini-3\.5-flash[^-]|/explain\b" AGENTS.md docs` and fix every hit that is not an intentional historical note.)
- [ ] Every `@docs/...` reference in AGENTS.md points to a file that exists.
- [ ] `wc -c AGENTS.md` is under 12000.
- [ ] Every version number in docs equals the one in `package.json`.
- [ ] No secret-looking strings (`AIza`, `private_key`) in any file you wrote.
- [ ] `git status` shows changes ONLY in `AGENTS.md`, `GEMINI.md`, `docs/`, and removal of `_incoming/`.
- [ ] `docs/CHANGELOG-merge.md` written.
Final message to the owner: simple English, 10 lines max: what changed, what was removed, anything you were unsure about, and the single next step (Phase 2).
