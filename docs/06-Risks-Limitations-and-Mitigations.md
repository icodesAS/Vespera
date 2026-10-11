# 06 — Risks, Limitations and Mitigations

| # | Risk | How likely | What we do |
|---|---|---|---|
| R1 | **Localhost does not open** (old project, old packages, missing `.env.local`, old Node) | Happening now | Follow doc 08 section 1. We start from a clean pinned install + new `.env.local`. |
| R2 | **Old Firebase project is gone** | Likely | Create a new one (doc 08). Because the code reads config from env, no code change is needed. |
| R3 | **Gemini model unavailable (404)** | High for `gemini-2.5-*` on new keys | Model name in env, fallback model, and non-AI fallbacks in every route. Re-check Google's deprecations page before demos. |
| R4 | **Secrets in the repo** (`service-account.json`, `.env.local`) | Possible | Run `git log --all -- service-account.json .env.local`. If they ever appeared in history: rotate the key (create new Gemini key, delete the old service account key) and, if public repo, rewrite history or make a fresh repo. Add `.gitignore` lines from `.gitignore.additions`. |
| R5 | **Anyone logged in can write listings** (old admin page) | Certain today | Deploy `firestore.rules`; add `admins/{uid}`; hide admin link for non-admins. |
| R6 | **Strangers burn your Gemini quota** | Medium | Token check + rate limit in every AI route (D-14). Keep the key server-side. |
| R7 | **Version drift / dependency conflicts** | High with agents | Exact versions, lockfile, 4-step rule (doc 04). Never `--force`. |
| R8 | **AI agent breaks working code** | High | One phase per chat, `npm run check`, small diffs, git commit after every phase, branch `upgrade/v2`. |
| R9 | **3D is slow or crashes on some devices** | Medium | Fallbacks and limits (doc 05). 3D only on the landing page. |
| R10 | **AI returns bad/odd JSON** | High over time | JSON mode + zod validation + one retry + fallback. |
| R11 | **Copilot makes things up** (distances, noise, safety) | Medium | System prompt forbids invented facts; answers say "roughly / check the map". Google Search/Maps grounding is optional and OFF by default. |
| R12 | **Next 16 gotchas** (async `params`, no `next lint`, Turbopack) | High for agents trained on older Next | They are listed in AGENTS.md. |
| R13 | **Firestore free-tier limits** (reads per day) | Low | Load properties once per session; cache in the store; do not use live listeners for the whole collection. |
| R14 | **Old documents missing new fields** | Certain | `normalizeProperty()` + optional fields (doc 03). |
| R15 | **Google sign-in popup blocked / wrong domain** | Medium | Add `localhost` and your Vercel domain to Firebase Auth "Authorized domains". |
| R16 | **Image hosting** | Low | Keep URL paste + local seed images for now. Uploads are optional (may need a billing plan). |
| R17 | **eslint 9 shows "no longer supported"** | Certain, harmless | Ignore for now. Test eslint 10 on a separate branch later. |
| R18 | **Data privacy** (users' liked homes) | Low | Rules restrict each user to their own doc. No personal data sent to Gemini except preferences the user typed. |
| R19 | **Claims in README that are not true** | Medium | Only list features that are working in the demo. Put the rest under "Roadmap". |
| R20 | **Too much animation**: slow pages, motion sickness, agent over-building | Medium | Motion tiers + budgets (docs/05), Tier 3 fallback, ambient and hero never together, build in small phases (4a, 4b, 4c). |

## Known limitations (be honest in the README)
- Listings are demo data (20 seeded homes), not live market data.
- Distances in the copilot are estimates unless grounded.
- Rate limit is in-memory (resets when the server restarts).
- Dark theme only.

## If something breaks (triage order)
1. Read the FIRST red error, not the last.
2. `git status` -> `git diff` -> undo the last change if needed (`git restore <file>`).
3. `rm -rf .next && npm run dev`.
4. Still stuck after two tries: stop the agent, copy the exact error + file, and bring it to Claude (say "HARD SPOT").
