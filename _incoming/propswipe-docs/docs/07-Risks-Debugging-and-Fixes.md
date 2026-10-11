# 07 — Risks, Debugging and Fixes

**Plain-English summary:** Things that can go wrong, how we prevent them, and what to do when they happen anyway.
Use this file when you see a red error. Find the error text in §3. If it is not there, follow §2, then use the "stuck" routine
(AGENTS.md rule 12) and take the notes to Claude.

## 1. Risk register
| # | Risk | How likely | Prevention | If it happens |
|---|------|-----------|------------|---------------|
| R1 | **Version clash** after someone runs `npm update` or installs "latest" | High (agents love to do this) | exact pins, `.npmrc save-exact`, rule 1–3 in AGENTS.md, committed lockfile | `git checkout -- package.json package-lock.json` then `npm ci` |
| R2 | **Gemini model shut down** (2.5 models already ending) | Certain over time | model names in env, fallback model, local fallback | change `GEMINI_MODEL` in `.env.local` and Vercel; re-run `scripts/ai-smoke.mjs` |
| R3 | **Firestore "test mode" expires** (~30 days) and the app suddenly gets "permission denied" | Medium (classic) | we publish real rules on day 1 (doc 03) | re-publish `firestore.rules`; never use test mode |
| R4 | **Secret leaked** (key in git, screenshot, chat) | Medium | `.gitignore`, `server-only`, never log keys, no service account | doc 07 §4 |
| R5 | **Free quota burned** (Firebase reads/writes, Gemini requests) | Medium | batched writes, no `onSnapshot`, rate limit, fallbacks | check usage dashboards; lower limits |
| R6 | **3D too heavy** for cheap phones | High | landing-only, budgets, fallbacks, PerformanceMonitor | lower particles/DPR; show poster by default on weak devices |
| R7 | **Hydration / SSR errors** from browser-only code | High | `"use client"` + `dynamic ssr:false` rules | doc 07 §3 |
| R8 | **AI hallucination** (invented facts) | Medium | grounding, schema, "I don't have that detail" rule | tighten prompt; add fact to `facts` |
| R9 | **Agent edits the wrong files / big refactors** | Medium | one phase per chat, branch per phase, small commits | `git restore .` or checkout last good tag |
| R10 | **Database shape changes break old data** | Low now (new DB) | additive-only rule, `normalizeProperty`, `schemaVersion` | restore from seed JSON backup |
| R11 | **Dependency security advisories** | Medium | check `npm audit --omit=dev`; patch Next promptly | doc 02 §4 (never `audit fix --force`) |
| R12 | **Unlicensed assets** (images, 3D models, fonts) | Medium | only own/CC0/licensed; list in `docs/credits.md` | replace asset |
| R13 | **Map tiles blocked / rate-limited** (OpenStreetMap) | Low | low traffic, attribution, fallback text address | swap tile provider later |
| R14 | **Owner stuck, no one to ask** | High for beginners | `_stuck` notes, plain-English rule, this doc | bring notes to Claude |

## 2. "Localhost is not opening": triage in order
Run each step; stop at the first one that explains it. Copy the **first** red line of any error.

1. **Wrong Node:** `node -v` must start with `v22`. Fix: `nvm use 22` (or install Node 22), then delete `node_modules` and run `npm install`.
2. **Not installed / partial install:** `npm install`. If it prints `ERESOLVE`, do **not** use `--force`: see §3.
3. **Port busy:** error mentions `EADDRINUSE`/port 3000 → `npm run dev -- -p 3001` and open `http://localhost:3001`.
4. **Env missing:** is there a `.env.local` with all five `NEXT_PUBLIC_FIREBASE_*` values? Restart `npm run dev` after editing it. (v1 crashed at import when these were missing or the old project was deleted; v2 shows a "Setup needed" panel instead.)
5. **Firebase project gone/wrong:** browser console shows `auth/invalid-api-key`, `auth/configuration-not-found`, or network errors to `*.firebaseapp.com`. → create the new project (doc 03 §1) and update `.env.local`.
6. **A provider is not enabled:** `auth/operation-not-allowed` → Firebase console → Authentication → Sign-in method → enable Email, Google, **Anonymous**.
7. **Blank page, no error in terminal:** open browser DevTools → **Console** tab; copy the first red message.
8. **Build-only failure:** run `npm run build` and read the first error (it often shows a TypeScript or import problem that `dev` hides).
9. **Old v1 code:** v1 used packages that no longer match (Firebase 10, Vertex AI, Framer Motion). It is **expected** not to run. That is why v2 is a clean rebuild (doc 00 D-01).

## 3. Common errors → fixes
| You see | It means | Fix |
|---------|----------|-----|
| `npm error ERESOLVE unable to resolve dependency tree` | two packages disagree about a version | read which pair is named; check doc 02 §3; **never** `--force`/`--legacy-peer-deps`; restore `package.json` from git |
| `EBADENGINE` / "Unsupported engine" | wrong Node version | `nvm use 22` |
| `Firebase: Error (auth/unauthorized-domain)` | domain not allowed | Firebase → Authentication → Settings → Authorized domains → add it |
| `Firebase: Error (auth/operation-not-allowed)` | login method disabled | enable it in console (Anonymous is a separate switch) |
| `FirebaseError: Missing or insufficient permissions` | rules blocked it | are you logged in? right collection? use Rules Playground; compare with doc 03 §6 |
| `window is not defined` / `document is not defined` | browser code ran on the server | add `"use client"`; load heavy libs with `dynamic(..., { ssr:false })` inside a Client Component |
| `Hydration failed because the server rendered HTML didn't match` | server and browser made different HTML (random numbers, `Date.now()`, `window` checks) | compute such values in `useEffect`, or render them only after mount |
| `Route "/property/[id]" used params.id. params is a Promise` | Next 16 rule | `const { id } = await params;` |
| `Module not found: Can't resolve 'framer-motion'` | old import | `import { motion } from "motion/react"` |
| `Invalid hook call` | two copies of React | `npm ls react` must show one version (19.2.8); reinstall with `npm ci` |
| `Cannot find module '@/…'` | path alias | check `tsconfig.json` `paths` = `"@/*": ["./*"]`; restart dev server |
| `Invalid src prop … hostname … is not configured under images` | remote image not allowed | add to `images.remotePatterns` in `next.config.ts`, or use `/public/images` |
| `API key should be set when using the Gemini API` | client made at import time | create client lazily in `getAI()` (doc 05 §2) |
| Gemini `404 … models/… is not found` | model retired/misspelt | update `GEMINI_MODEL`; run the model-list `curl` (doc 05 §2) |
| Gemini `429 RESOURCE_EXHAUSTED` | quota/rate limit | normal; UI should show fallback; wait a minute |
| AI route returns 401 | no/expired Firebase token | call `getIdToken()` fresh before each request; user must be signed in |
| Leaflet marker 404 / invisible map | default marker icon path breaks in bundlers; no height | use `L.divIcon`; give the container a height; import `leaflet.css` |
| `THREE.WebGLRenderer: Context Lost` | GPU overloaded or tab backgrounded | lower DPR/particles; handle `webglcontextlost` → show poster |
| Landing page very slow on phone | too many particles / DPR too high | budgets in doc 04 §4; enable fallback earlier |
| `The requested module … does not provide an export named …` | wrong package version API | check the package's docs for the **exact** version in doc 02 |
| Vercel build fails: env missing | variables not added in Vercel | Vercel → Project → Settings → Environment Variables (names in `.env.example`) |
| `Failed to compile` mentions `legacy/` | old code is being compiled | `exclude: ["legacy"]` in `tsconfig.json`, ignore in ESLint |

## 4. If a secret leaks (key in git, in chat, in a screenshot)
Do these in order, calmly:
1. **Revoke first:** Gemini key → AI Studio → delete the key and create a new one. Service-account key → Google Cloud Console → IAM → Service accounts → Keys → Delete. Firebase *web* config is public by design, but if abused, restrict the API key by domain in Google Cloud → APIs & Services → Credentials.
2. Put the new key in `.env.local` and Vercel only.
3. Deleting the file from the latest commit does **not** remove it from history; the old key is already dead after step 1, which is what matters.
4. Check usage/billing dashboards for strange activity.
5. Add the pattern to `.gitignore` and run `git grep -nI "AIza\|private_key"` to confirm nothing is left.

## 5. Rollback and backups
- Every phase ends with `git tag phase-N-done`. Go back: `git checkout phase-N-done` (look around) or `git reset --hard phase-N-done` (throw away newer work; ask first).
- Undo uncommitted mess: `git restore .` (files) and `git clean -fd` (new files; careful).
- Database backup = the seed JSON in the repo + Firebase console export for user data if it ever matters.
- Before any risky step: `git commit -am "wip: before X"`.

## 6. Agent behaviour problems and what to say
| Problem | Say this |
|---------|----------|
| It wants to upgrade a package | "No. Versions are locked (docs/02). Show me the exact error instead." |
| It rewrites many files | "Stop. Only edit the files needed for Phase N. Revert the rest with git." |
| It invents an API | "Check the installed package's types/docs in node_modules for the exact version, then try again." |
| It says "done" without proof | "Run `npm run check` and paste the output." |
| It uses jargon | "Explain again in simple English with a small example." |
| It loops on the same error | "Stop. Write `docs/_stuck/<topic>.md` per AGENTS.md rule 12." |

## 7. Security checklist before going public
- [ ] `git grep -nI "AIza\|private_key\|BEGIN PRIVATE"` finds nothing
- [ ] `.env.local` is not tracked (`git ls-files | grep env` shows only `.env.example`)
- [ ] Firestore rules published and tested (doc 03 §6)
- [ ] AI routes reject calls without a token
- [ ] Gemini key has no `NEXT_PUBLIC_` prefix; browser bundle does not contain it (search the built `.next/static` for `AIza`)
- [ ] `npm audit --omit=dev` shows no **Next** advisory; remaining Firebase/grpc items understood (doc 02 §4)
- [ ] README says demo data is fictional; credits file complete
