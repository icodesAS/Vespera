# AGENTS.md — PropSwipe v2 (read this first, every chat)

PropSwipe is a "Tinder for rentals" app for India: swipe right to shortlist a home,
swipe left to skip, with Gemini AI helping to search, rank, compare and chat.
It is a **portfolio project**. It must look great, run reliably and never break.

## Who you are working for
The owner is a **second-year student with only basic coding knowledge** and English is not
their first language. So:
- Explain what you did in **simple, plain English**. Short sentences. No unexplained jargon.
  If you must use a technical word, add one line saying what it means, with a small example.
- Before a big change, say in 3-5 lines what you are about to do and why.
- After a change, say how the owner can **see it working** (a URL, a click path, or a command).
- Never make the owner guess. If something is unclear, ask ONE clear question.

## Where the full context lives (load only what the task needs)
| If the task is about...                         | Read                                  |
|--------------------------------------------------|----------------------------------------|
| why we chose something                           | @docs/00-Decisions-Log.md              |
| what the product is, pages, features             | @docs/01-Project-Overview.md           |
| packages, versions, Next.js 16 rules             | @docs/02-Tech-Stack-and-Versions.md    |
| Firebase, database, security rules, env vars     | @docs/03-Firebase-and-Data.md          |
| look and feel, animation, 3D                     | @docs/04-UI-UX-and-3D-Design.md        |
| Gemini, AI routes, copilot chat                  | @docs/05-AI-Architecture.md            |
| what to build next, step by step                 | @docs/06-Build-Phases-and-Prompts.md   |
| an error, a risk, "why is it broken"             | @docs/07-Risks-Debugging-and-Fixes.md  |
| README, screenshots, GIFs, portfolio write-up    | @docs/08-README-and-Portfolio-Plan.md  |

Work on **one phase at a time** from doc 06. Do not start the next phase until the gate passes.

## The 12 golden rules (breaking one = stop and tell the owner)
1. **Exact versions only.** `package.json` has no `^` or `~`. Never run `npm update`,
   `npm audit fix --force`, `npm install <pkg>@latest`, `--force` or `--legacy-peer-deps`.
   These hide version clashes and break the app. The locked set is in doc 02.
2. **Adding a package?** Stop and ask first. Then run
   `npm install <pkg>@<exact> --save-exact --dry-run`. If it prints `ERESOLVE`, do NOT install.
3. **React stays on 19.2.x** while `@react-three/fiber` is 9.7.x (its rule is `react <19.3`).
   **ESLint stays 9.x**, **TypeScript stays 5.9.x**, **Firebase stays 12.x**. See doc 02.
4. **This is Next.js 16, not the Next.js you remember.** Before writing Next code, read the
   matching guide in `node_modules/next/dist/docs/`. Key changes: `params` and `searchParams`
   are Promises (`await` them); `middleware.ts` is now `proxy.ts`; there is no `next lint`;
   Turbopack is the default; the App Router (`app/`) is the only router we use.
5. **Secrets:** only `NEXT_PUBLIC_FIREBASE_*` may reach the browser. `GEMINI_API_KEY` is
   server-only. Never print, log or commit a key. Never create or commit `service-account.json`.
6. **Database changes are additive only.** Add optional fields; never rename, delete or
   re-type existing fields or collections. Every document has `schemaVersion`. Validate every
   read and write with Zod (doc 03). Never put "test mode" rules in Firestore.
7. **Never trust AI output.** Every AI answer is parsed and checked with Zod, ids are checked
   against real ids, and every AI feature has a local fallback so the UI never shows a dead end.
8. **Browser-only code stays in the browser.** Three.js, Leaflet, `window`, `localStorage`
   and the Firebase client SDK live in files that start with `"use client"`. Load heavy ones
   with `next/dynamic` and `{ ssr: false }`, and only inside a Client Component.
9. **Stay in your phase.** Do not refactor, rename or "clean up" files outside the current task.
10. **The gate must pass** before you say "done": `npm run check`
    (= typecheck + lint + build). Paste the result.
11. **Small commits.** One logical change per commit, message like `feat(discover): add undo`.
    Never commit to `main`; work on a branch named for the phase.
12. **Stuck twice on the same error? Stop.** Create `docs/_stuck/<date>-<topic>.md` with:
    the exact error, the file(s), what you tried, and the versions in play. Tell the owner to
    take that file to Claude. Do not keep guessing, and never "fix" by upgrading packages.

## Commands
```
npm install        # install (exact versions, Node 22 via .nvmrc)
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript check
npm run lint       # ESLint (flat config)
npm run build      # production build
npm run check      # typecheck + lint + build  <- the gate
```

## Folder map (target)
```
app/                 pages + API routes (App Router)
  (marketing)/       landing page "/"
  (app)/             discover, explore, property/[id], shortlist, onboarding
  api/ai/            search, explain, rerank, summary, chat
components/          ui/ landing/ discover/ property/ ai/ three/
lib/                 firebase.ts, firestore/, ai/, auth-server.ts, env.ts, utils.ts
schemas/             Zod schemas: property, user, ai
store/               Zustand stores
data/                seed-properties.ts, landmarks.ts
public/images/       local photos
legacy/              the OLD v1 code. Read-only reference. Never import from it.
docs/                this documentation
```

## Wrong-package blacklist (your training data may suggest these. Do NOT use.)
`@google/generative-ai` (old Gemini SDK) · `@google-cloud/vertexai` (retired path) ·
`firebase/compat/*` or `firebase.auth()` style · importing from `"framer-motion"` (use
`"motion/react"`) · `tailwind.config.js` or `@tailwind base;` (Tailwind v4 uses
`@import "tailwindcss";` and `@theme`) · `next/router` (use `next/navigation`) ·
`getServerSideProps` / `pages/` · Zod v3 habits (we use Zod 4; use `z.toJSONSchema`) ·
`axios` / `node-fetch` (use built-in `fetch`) · `gemini-2.5-*` model names (being shut down).

## Definition of done (every task)
- [ ] Works on a 360x800 phone screen AND a laptop screen
- [ ] No red errors in the browser console or terminal
- [ ] `npm run check` passes
- [ ] Loading, empty and error states exist
- [ ] Keyboard works (Tab, Enter, arrow keys where it makes sense)
- [ ] You explained the result to the owner in plain English
