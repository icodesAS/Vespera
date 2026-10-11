# START HERE — how to use these files

This folder is the "brain" for your PropSwipe rebuild. Antigravity's AI agents read it so they all know the same plan,
the same rules and the same exact package versions. Follow these 7 steps once.

1. **Install Node 22.** In a terminal, `node -v` must show `v22.something`.
   (Windows: download "22 LTS" from nodejs.org, or use `nvm-windows`.)
2. **Open your PropSwipe repo in Antigravity.** In the terminal, run `git status`. It should say "nothing to commit".
3. **Copy into the repo root:**
   - `AGENTS.md`  (Antigravity reads this file automatically in every chat)
   - the whole `docs/` folder (including `docs/assets/baseline/`)
4. **Make a safety tag and a working branch** (so the old code can never be lost):
   ```
   git tag v1-legacy
   git checkout -b v2-rebuild
   git add -A
   git commit -m "docs: add project docs"
   ```
5. **Open `docs/06-Build-Phases-and-Prompts.md`** and start at **Phase 0**. Paste the "start every chat" message, then the Phase 0 prompt.
6. **One phase per chat. One branch per phase.** Do not skip ahead. After each phase, look at the result in the browser before merging.
7. **If an agent gets stuck twice,** ask it to write a file in `docs/_stuck/`, then bring that file to Claude.

## The files
| File | What it is |
|------|------------|
| `AGENTS.md` | Short rules every agent sees. Keep it small (Antigravity limits rule files to about 12,000 characters). |
| `docs/00-Decisions-Log.md` | Every big choice and why (great for interviews). |
| `docs/01-Project-Overview.md` | Product, features, pages, what "portfolio-grade" means. |
| `docs/02-Tech-Stack-and-Versions.md` | The exact locked versions and the rules that keep them from clashing. |
| `docs/03-Firebase-and-Data.md` | New Firebase project, database shape, security rules, safe habits. |
| `docs/04-UI-UX-and-3D-Design.md` | Look and feel, 3D landing page, performance limits, accessibility. |
| `docs/05-AI-Architecture.md` | How Gemini is used safely: routes, rerank, summary, copilot, fallbacks. |
| `docs/06-Build-Phases-and-Prompts.md` | The 11 phases with copy-paste prompts. |
| `docs/07-Risks-Debugging-and-Fixes.md` | Why localhost may not open, common errors, what to do. |
| `docs/08-README-and-Portfolio-Plan.md` | The beautiful README: skeleton, diagrams, GIF plan, LinkedIn post. |
| `docs/assets/baseline/` | Tested config files: `package.json` (exact versions), `.nvmrc`, `.npmrc`, `.gitignore`, `.env.example`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`, `firestore.rules`. |

## What was tested, and what was not
**Tested on 11 Oct 2026** (Node 22.22, npm 10.9): all packages install together with no version conflict; TypeScript, ESLint and `next build` pass;
the built app serves pages; the AI route rejects requests without a login token.
**Not tested** (no browser or keys available): real 3D rendering, live Firebase calls, live Gemini calls. Phases 1, 5 and 8 check these with you.

## Two things only you can do
- Create the new Firebase project and the Gemini API key (steps in `docs/03-Firebase-and-Data.md` §1). Never paste keys into chats or commit them.
- Create the `admins/<your uid>` document by hand in the Firebase console so you become the admin.
