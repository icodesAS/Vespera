# AGENTS.md — Vespera (read this first, every chat)

**These rules apply to every AI agent and model working on this codebase (Kiro with Claude or Gemini, Antigravity, Devin, others).**

**IMPORTANT CONTEXT:** Backend services (Firebase project, Gemini API) still use "PropSwipe" identifiers. Only GitHub repo, docs, and public-facing content use "Vespera". Code identifiers will be renamed in Phase 3a.

Vespera is an AI-guided home discovery app for renters in India. You swipe through homes, and the AI explains, ranks and compares them for you. The product name is Vespera ("Evening light. Exceptional homes."). Technical identifiers remain unchanged until the code rename phase.

We are UPGRADING an existing app. We are not rewriting it. Never break login, the database, or the API routes.

## Who you are working for
The owner is a **student** (beginner to intermediate; English is not their first language). So:
- Explain what you did in **simple, plain English**. Short sentences. No unexplained jargon.
  If you must use a technical word, add one line saying what it means, with a small example.
- Before a big change, say in 3-5 lines what you are about to do and why.
- After a change, say how the owner can **see it working** (a URL, a click path, or a command).
- Never make the owner guess. If something is unclear, ask ONE clear question.

## Where the full context lives (load only what the task needs)
| If the task is about...                      | Read                                  |
|----------------------------------------------|---------------------------------------|
| why we chose something                       | docs/00-Decisions-Log.md              |
| what the product is, pages, features         | docs/01-Project-Overview.md           |
| packages, versions, Next.js 16 rules         | docs/02-Tech-Stack-and-Versions.md    |
| Firebase, database, security rules, env vars | docs/03-Firebase-and-Data.md          |
| look and feel, animation, 3D                 | docs/04-UI-UX-and-3D-Design.md        |
| Gemini, AI routes, copilot chat              | docs/05-AI-Architecture.md            |
| what to build next, step by step             | docs/06-Build-Phases-and-Prompts.md   |
| an error, a risk, "why is it broken"         | docs/07-Risks-Debugging-and-Fixes.md  |
| README, screenshots, GIFs, portfolio write-up| docs/08-README-and-Portfolio-Plan.md  |

Work on **one phase at a time** from docs/06. Do not start the next phase until the gate passes.

## The 12 golden rules (breaking one = stop and tell the owner)
1. **Exact versions only.** `package.json` has no `^` or `~`. Never run `npm update`,
   `npm audit fix --force`, `npm install <pkg>@latest`, `--force` or `--legacy-peer-deps`.
   These hide version clashes and break the app. The locked set is in docs/02.
2. **Adding a package?** Stop and ask first. Then run
   `npm install <pkg>@<exact> --save-exact --dry-run`. If it prints `ERESOLVE`, do NOT install.
3. **React stays below 19.4** while `@react-three/fiber` is 9.8.x (its range is `react >=19 <19.4`).
   **ESLint stays 9.x**, **TypeScript stays 5.9.x**, **Firebase 13.x needs Node ≥24.12**. See docs/02.
4. **This is Next.js 16, not the Next.js you remember.** Before writing Next code, read the
   matching guide in `node_modules/next/dist/docs/`. Key changes: `params` and `searchParams`
   are Promises (`await` them); there is no `next lint`; Turbopack is the default; the App Router
   (`app/`) is the only router we use. Do not use `middleware.ts` for auth. Auth guard = client hook + token check inside API routes (see docs/03).
5. **Secrets:** only `NEXT_PUBLIC_FIREBASE_*` may reach the browser. `GEMINI_API_KEY` is
   server-only. Never print, log or commit a key. Never create or commit `service-account.json`.
6. **Database changes are additive only.** Add optional fields; never rename, delete or
   re-type existing fields or collections. Every document has `schemaVersion`. Validate every
   read and write with Zod (docs/03). Never put "test mode" rules in Firestore.
7. **Never trust AI output.** Every AI answer is parsed and checked with Zod, ids are checked
   against real ids, and every AI feature has a local fallback so the UI never shows a dead end.
8. **Browser-only code stays in the browser.** Three.js, Leaflet, `window`, `localStorage`
   and the Firebase client SDK live in files that start with `"use client"`. Load heavy ones
   with `next/dynamic` and `{ ssr: false }`, and only inside a Client Component.
9. **The swipe deck is normal DOM cards (no WebGL inside the deck).** WebGL is allowed only
   where docs/04 says (landing hero + optional ambient background on calm pages), always
   lazy-loaded, with a fallback. Motion follows the tiers in docs/04.
10. **Stay in your phase.** Do not refactor, rename or "clean up" files outside the current task.
11. **The gate must pass** before you say "done": `npm run check`
    (= typecheck + lint + build). Paste the result.
12. **Stuck three times on the same error? Stop.** Create `docs/_stuck/<date>-<topic>.md` with:
    the exact error, the file(s), what you tried, and the versions in play. Tell the owner to
    take that file to Claude. Do not keep guessing, and never "fix" by upgrading packages.

## Working rules (from the owner)
- Write quality code, not long code. If something can be 200 lines instead of 400 with the same clarity and accuracy, write 200. No filler, no redundant wrappers.
- Professional tone everywhere: no emojis in README, LICENSE, GitHub text or documentation prose. Checkboxes and plain words are fine.
- Never claim in README or docs something that is not built.
- Before marking any task done, run it yourself (start the dev server, run the build/test). Never write code and assume it works.
- If there is an error, fix it and run again before reporting back.
- Never guess a library's function names or options. Check the installed version in package.json and the types in node_modules, or open the official docs, if unsure.
- Keep changes scoped to what was asked. Do not refactor unrelated files unless told to.
- If the same error continues after **three** tries, stop and report only the error and details (file, what you tried).

## Version Policy
- **Exact version numbers live ONLY in `package.json` (truth) and `docs/02-Tech-Stack-and-Versions.md` (a copy).**
- Everywhere else (README, other docs, comments) write "see package.json" instead of repeating specific versions.
- Gemini model names live ONLY in `.env.example`, `.env.local`, and `docs/05-AI-Architecture.md`.
- Version ranges and minimums (like "Node 24.12 or newer", "React below 19.4") may be stated as rules.

## Stack (exact versions in docs/02 and package.json)
Node 24.12+ • Next.js 16.4.0 (App Router) • React 19.3.0 • TypeScript 5.9.3 • Tailwind CSS 4.3.3 (CSS-first, no tailwind.config)
• motion 14.1.0 (import from `"motion/react"`, NOT framer-motion) • Zustand 5.0.15 • Firebase 13.0.0 (Auth + Firestore)
• firebase-admin 14.5.0 (server only) • @google/genai 2.28.0 • three 0.186.1 + @react-three/fiber 9.8.1 + drei 10.7.9 + postprocessing 3.2.0
• zod 4.6.5 • Leaflet 1.9.4 + react-leaflet 5.0.0 • sonner 2.0.8 • lenis 1.3.26 • lucide-react 1.55.0

## Next.js 16 gotchas (these cause most breakages)
- In pages/layouts, `params` and `searchParams` are Promises. Use `const { id } = await params;` (async component) or `use(params)` in client components.
- `next lint` no longer exists. Use `npm run lint` (runs `eslint .`).
- Dev and build use Turbopack by default. If a strange bundler error appears, try `next dev --webpack` and report it.
- Files that use hooks, browser APIs, motion or three.js need `"use client"` on the first line.
- three.js / react-three components: load with `next/dynamic` and `{ ssr: false }`.
- Route handlers live in `app/api/**/route.ts` and export `POST`/`GET` functions. Add `export const runtime = "nodejs";` to any route that uses firebase-admin.

## Commands
- `npm install`  install (exact versions, Node 24 via .nvmrc)
- `npm run dev`   start locally (http://localhost:3000)
- `npm run check` typecheck + lint + build. MUST pass before you say a task is done.
- Fix errors in your own changes. Do not hide errors with `any`, `@ts-ignore` or by turning off lint rules.

## Folder map (target)
```
app/                 pages + API routes (App Router)
  (marketing)/       landing page "/"
  (app)/             discover, explore, property/[id], shortlist, onboarding
  api/ai/            explain-property, search, rerank, summary, chat
components/          ui/ landing/ discover/ property/ ai/ three/
lib/                 firebase.ts, ai.ts, auth-server.ts, env.ts, utils.ts
schemas/             Zod schemas: property, user, ai
store/               Zustand stores
hooks/               useAuth.tsx
types/               property.ts
data/                properties.ts, landmarks.ts
public/images/       local photos
docs/                this documentation
```

Existing files keep their paths: `lib/firebase.ts`, `lib/ai.ts`, `store/usePropertyStore.ts`, `hooks/useAuth.tsx`, `types/property.ts`, `data/properties.ts`. New server helpers are flat in `lib/`.

## Wrong-package blacklist (your training data may suggest these. Do NOT use.)
`@google/generative-ai` (old Gemini SDK) · `@google-cloud/vertexai` (retired path) ·
`firebase/compat/*` or `firebase.auth()` style · importing from `"framer-motion"` (use
`"motion/react"`) · `tailwind.config.js` or `@tailwind base;` (Tailwind v4 uses
`@import "tailwindcss";` and `@theme`) · `next/router` (use `next/navigation`) ·
`getServerSideProps` / `pages/` · Zod v3 habits (we use Zod 4; use `z.toJSONSchema`) ·
`axios` / `node-fetch` (use built-in `fetch`) · `gemini-2.5-*` model names (limited to older users only; new keys get 404).

## Code style
- TypeScript strict. No `any`. Shared types in `types/`. Validate all external data (Firestore reads, AI output, request bodies) with Zod.
- Small components (under about 200 lines). One job per file. Name files after what they export.
- Tailwind classes + CSS variables from `app/globals.css`. No inline hex colors in components; use the design tokens (docs/04).
- Accessibility: buttons are `<button>`, images have alt text, every swipe action has a keyboard shortcut and a visible button, respect `prefers-reduced-motion`.
- Comments explain WHY, not WHAT. Keep user-facing text simple and friendly.
- Animation: use `motion/react`, CSS and the shared components from docs/04. Do not add animation libraries. Always respect `prefers-reduced-motion`.

## Definition of done (every task)
- [ ] `npm run check` passes with zero errors
- [ ] App opens at localhost:3000 and login + swipe + like still work (manual check)
- [ ] No new secrets, no console errors on the pages you touched
- [ ] docs/00-Decisions-Log.md updated (what changed, any assumption, any new package)
- [ ] You listed the files you changed and how to test them

## When to ask the human to bring in Claude
Stop and say "HARD SPOT" with the exact error and file if: Firebase security rules are denying valid requests, an ID-token/admin-SDK error
persists after three tries, hydration or WebGL context errors you cannot fix in three tries, streaming (copilot) breaks,
or a dependency conflict appears. Do not loop endlessly.
