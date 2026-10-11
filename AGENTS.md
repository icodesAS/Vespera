# AGENTS.md — PropSwipe (read this first, every chat)

PropSwipe is an AI-powered rental discovery platform for Indian cities: swipe right to shortlist, swipe left to skip,
with Gemini AI for search, explanations, ranking and a chat copilot. We are UPGRADING an existing app.
We are not rewriting it. Never break login, the database, or the API routes.

## Read order (do this at the start of every new chat)
1. This file.
2. `docs/00-Decisions-Log.md` (locked decisions, exact versions, what has been done).
3. The one doc for your task (see "Which doc for which task").
Do not read every doc every time. Do not start coding before you have read 00.

## Which doc for which task
- What are we building / for whom?      -> docs/01-Project-Overview.md
- Screens, flows, filters, onboarding   -> docs/02-Product-Features-and-User-Flow.md
- Folders, database, API, AI design     -> docs/03-Technical-Architecture.md
- Packages, versions, env variables     -> docs/04-Tech-Stack.md
- Look and feel, 3D, motion             -> docs/05-Design-System-and-UI-Roadmap.md
- Something broke / risk question       -> docs/06-Risks-Limitations-and-Mitigations.md
- What phase are we on, what next       -> docs/07-Step-by-Step-Build-Guide.md
- Firebase setup, localhost not opening -> docs/08-Firebase-Setup-and-Recovery.md
- README, screenshots, GIFs             -> docs/09-README-Blueprint.md

## Golden rules (these protect the project)
1. ONE phase per chat. Finish it, run `npm run check`, then stop and report.
2. Database changes are ADDITIVE only. Never rename or delete an existing Firestore field or collection.
   Old documents must still load. New fields are optional in TypeScript.
3. Versions are pinned (exact numbers, no ^ or ~). Do NOT upgrade, add or remove a package unless the
   task says so. If you truly need a new package: run `npm view <pkg> version peerDependencies engines`,
   then `npm install <pkg>@<exact> --dry-run`, then record it in docs/00 and docs/04. Never run `npm audit fix --force`.
4. Never use `npm install` with `--force` or `--legacy-peer-deps`. A peer-dependency error is a real problem: stop and report it.
5. Never put secrets in code or commit them. Secrets live in `.env.local` (git-ignored). `service-account.json` must not exist in the repo.
6. All Gemini calls happen on the server (`app/api/**`), never in the browser. The API key is never sent to the client.
7. Every AI route must (a) check the Firebase login token, (b) validate the AI answer with zod, (c) have a non-AI fallback so the UI never shows a blank error.
8. The swipe deck is normal DOM cards (no WebGL inside the deck). WebGL is allowed only where docs/05 says (landing hero + one shared ambient background), always lazy-loaded, with a fallback. Motion follows the tiers in docs/05.
9. Do not delete or rewrite files you were not asked to touch. Small, focused edits. No "cleanup" refactors.
10. If something is unclear, make the safest assumption, write it in docs/00, and continue. If a step would risk data loss, stop and ask.

## Working rules (from the owner — always follow)
- Write quality code, not long code. If something can be 200 lines instead of 400 with the same clarity and accuracy, write 200. No filler, no redundant wrappers.
- Before marking any task done, run it yourself (start the dev server, run the build/test). Never write code and assume it works.
- If there is an error, fix it and run again before reporting back.
- Never guess a library's function names or options. Check the installed version in package.json and the types in node_modules, or open the official docs, if unsure.
- Keep changes scoped to what was asked. Do not refactor unrelated files unless told to.
- If the same error continues after three repeated tries, stop and report only the error and details (file, what you tried).

## Stack (exact versions in docs/04 and package.json)
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
- Do not use `middleware.ts` for auth. Auth guard = client hook + token check inside API routes (see docs/03).

## Commands
- `npm run dev`   start locally (http://localhost:3000)
- `npm run check` typecheck + lint + build. MUST pass before you say a task is done.
- Fix errors in your own changes. Do not hide errors with `any`, `@ts-ignore` or by turning off lint rules.

## Folder map (keep paths stable)
app/ (pages + api) • components/ (ui, deck, property, filters, ai, three, layout) • hooks/ • store/ • lib/ • data/ • types/ • docs/
Existing files keep their paths: `lib/firebase.ts`, `lib/ai.ts`, `store/usePropertyStore.ts`, `hooks/useAuth.tsx`, `types/property.ts`, `data/properties.ts`.
New server helpers are flat in `lib/` (see docs/03 section 4).

## Code style
- TypeScript strict. No `any`. Shared types in `types/`. Validate all external data (Firestore reads, AI output, request bodies) with zod.
- Small components (under about 200 lines). One job per file. Name files after what they export.
- Tailwind classes + CSS variables from `app/globals.css`. No inline hex colors in components; use the design tokens (docs/05).
- Accessibility: buttons are `<button>`, images have alt text, every swipe action has a keyboard shortcut and a visible button, respect `prefers-reduced-motion`.
- Comments explain WHY, not WHAT. Keep user-facing text simple and friendly.
- Animation: use `motion/react`, CSS and the shared components from docs/05. Do not add animation libraries. Always respect `prefers-reduced-motion`.

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
# GEMINI.md
Follow everything in `AGENTS.md` at the repo root. It is the single source of truth for rules.
At the start of each chat, read `AGENTS.md` and `docs/00-Decisions-Log.md`, then only the doc that matches your task.
Work on one phase from `docs/07-Step-by-Step-Build-Guide.md` per chat. Run `npm run check` before finishing.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
