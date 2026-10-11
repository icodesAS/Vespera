# 02 — Tech Stack and Locked Versions

**Plain-English summary:** Every package has an **exact** version number (no `^`). These exact
numbers were installed together and tested on 11 Oct 2026, so they do not fight each other. Think of it like
a recipe: if you swap one ingredient for a newer one, the dish can fail. **Do not upgrade anything unless the owner says so.**
The ready-to-copy files are in `docs/assets/baseline/`.

## 1. Runtime
| Tool | Version | Note |
|------|---------|------|
| Node.js | **22.x** (LTS) | `.nvmrc` says `22`. Windows: install from nodejs.org or use `nvm-windows` (`nvm install 22`, `nvm use 22`) |
| npm | 10.x (comes with Node 22) | `.npmrc` forces exact saves and strict Node check |

## 2. Locked packages (copy of `docs/assets/baseline/package.json`)

**Dependencies**
| Package | Exact version | Used for | Browser or server |
|---------|---------------|----------|-------------------|
| next | **16.3.8** | framework (App Router, Turbopack) | both |
| react, react-dom | **19.2.8** | UI | both |
| firebase | **12.19.0** | Auth + Firestore (modular SDK) | **browser only** |
| firebase-admin | **14.4.0** | verify login tokens on AI routes | **server only** |
| @google/genai | **2.23.0** | Gemini API | **server only** |
| zod | **4.6.5** | schemas / validation / AI JSON schemas | both |
| zustand | **5.0.15** | small global stores | browser |
| motion | **13.4.0** | animation, drag (`import … from "motion/react"`) | browser |
| three | **0.186.0** | 3D engine | browser |
| @react-three/fiber | **9.7.0** | React renderer for three | browser |
| @react-three/drei | **10.7.8** | 3D helpers (Float, Points, useTexture…) | browser |
| lenis | **1.3.26** | smooth scrolling | browser |
| leaflet | **1.9.4** | maps | browser |
| react-leaflet | **5.0.0** | React wrapper for Leaflet | browser |
| lucide-react | **1.47.0** | icons | browser |
| sonner | **2.0.8** | toasts | browser |
| clsx | **2.1.1**, tailwind-merge **3.7.0** | class name helper `cn()` | both |
| server-only | **0.0.1** | makes the build fail if server code is imported in the browser | server |

**Dev dependencies**
`typescript 5.9.3` · `eslint 9.39.5` · `eslint-config-next 16.3.8` · `tailwindcss 4.3.3` ·
`@tailwindcss/postcss 4.3.3` · `postcss 8.5.28` · `@types/node 22.20.4` · `@types/react 19.2.18` ·
`@types/react-dom 19.2.7` · `@types/three 0.186.0` · `@types/leaflet 1.9.22`

## 3. The five "locks" (and why)
| Lock | Why | Tested result |
|------|-----|---------------|
| **React < 19.3** while R3F is 9.7.x | R3F 9.7.x declares `react >=19 <19.3` | React 19.3.0 + R3F 9.7.0 → **npm ERESOLVE error** |
| **ESLint 9.x** | ESLint 10 breaks `eslint-plugin-react` inside `eslint-config-next` | ESLint 10.12 → crash at lint time |
| **TypeScript 5.9.x** | official Next 16 starter uses `^5` | TS 6/7 not proven with this toolchain |
| **Firebase 12.x** | 13.0.0 is a brand-new major (7 Oct 2026) | not tested on purpose |
| **Next ≥ 16.3.8** | 16.0.0–16.3.7 have a critical advisory | 16.3.8 passes audit for Next |

**Upgrading React and R3F together later (only if the owner asks):** R3F 9.8.x allows `react <19.4`, so
React 19.3.x + R3F 9.8.x + drei 10.7.9 is the next safe pair. Do it in a scratch branch, run `npm run check`, test the landing page in a real browser.

## 4. `npm audit` will show warnings. Read this before panicking
- After install, `npm audit` shows **4 "high"** items about `@grpc/grpc-js` inside `firebase`. That library is only used
  by Firebase's **Node.js** build. We only use the Firebase client in the **browser** (where it is not used). So the risk is low.
- The suggested fix is `npm audit fix --force`. **NEVER run it**: it downgrades Firebase to 9.x and breaks the whole app.
- Re-check when a newer *12.x* Firebase release changes its dependency. Record the check in doc 00.
- Next.js itself must show **no** Next advisory. If it does, read doc 07 before doing anything.

## 5. Next.js 16 rules agents often get wrong
1. **Read the bundled docs first:** `node_modules/next/dist/docs/` (they ship with the package and match the exact version). Also `node_modules/next/AGENTS.md`.
2. `params` / `searchParams` are Promises:
   ```tsx
   export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
   }
   ```
3. `middleware.ts` is now **`proxy.ts`** (we do not need it; auth is checked in the browser).
4. There is **no `next lint`**. We run `eslint .` (`npm run lint`).
5. **Turbopack** is the default bundler. Do not add webpack-only settings.
6. Server Components cannot use hooks or browser APIs. Add `"use client"` at the top of any file that uses `useState`, `useEffect`, `window`, Three.js, Leaflet, Motion, Zustand or the Firebase client SDK.
7. `dynamic(() => import(...), { ssr: false })` is allowed **only inside a Client Component**. (Tested: pattern `ClientShell` → `dynamic(Scene)` works.)
8. Only variables starting with `NEXT_PUBLIC_` reach the browser. Restart `npm run dev` after editing `.env.local`.
9. Remote images need `images.remotePatterns` in `next.config.ts`. Local `/public/images/*.jpg` work as is.
10. Create the Gemini client **lazily inside a function** (not at file top level). Top-level creation prints "API key should be set" during `next build` when the key is missing (seen in testing).

## 6. Tailwind CSS v4 rules
- No `tailwind.config.js`. Styles start with `@import "tailwindcss";` in `app/globals.css`. Design tokens go in `@theme { … }` (doc 04).
- PostCSS plugin is `@tailwindcss/postcss` (already in `postcss.config.mjs`).
- Some utilities were renamed in v4 (e.g. `shadow-sm`→`shadow-xs`, `rounded-sm`→`rounded-xs`, `outline-none`→`outline-hidden`). When unsure, check the Tailwind v4 docs, not memory.

## 7. Other library rules
- **Motion:** `import { motion, AnimatePresence, useScroll, useTransform } from "motion/react"`.
- **R3F:** `<Canvas>` and everything using `useFrame`/`useThree` must be in a client file. Never call `setState` every frame; use refs.
- **Leaflet:** `import "leaflet/dist/leaflet.css"` once; the map container needs a fixed height; the default marker icon breaks in bundlers, so use `L.divIcon` (CSS dot) instead; load with `dynamic({ ssr:false })`. Keep OpenStreetMap attribution visible.
- **Zod 4:** `z.record(keySchema, valueSchema)` needs both args; error text uses `{ error: "…" }`; JSON Schema for the AI via `z.toJSONSchema(schema)`.
- **Gemini SDK (`@google/genai` 2.x):** typings confirmed to contain `systemInstruction`, `responseSchema`, `responseJsonSchema`, `thinkingConfig`, `abortSignal`, `generateContentStream`, `models.list`. When unsure, **open `node_modules/@google/genai/dist/genai.d.ts`**, do not guess.
- **Firebase:** modular imports only (`import { getAuth } from "firebase/auth"`).

## 8. Tool configuration files (already tested)
`tsconfig.json`, `eslint.config.mjs` (flat config using `eslint-config-next/core-web-vitals` + `/typescript`), `postcss.config.mjs`,
`next.config.ts` are copies of the official Next 16 starter. Leave them alone unless a phase says otherwise.

## 9. Adding a new package (the safe routine)
1. Ask the owner. Say what it does and why we need it.
2. `npm install name@x.y.z --save-exact --dry-run`. Any `ERESOLVE` → stop.
3. Check the package's release date: avoid versions newer than ~3 weeks unless they fix a security issue.
4. Install for real, run `npm run check`, run the app, commit `package.json` + `package-lock.json` together.
5. Add a row to the table in this file and to doc 00.

Candidates **not installed yet** (test first): `@react-three/postprocessing` (bloom glow), Cloudinary uploader, Vitest, Playwright, `@vercel/analytics`.

## 10. Glossary (plain English)
- **Dependency:** another person's code that our app uses.
- **Peer dependency:** a rule like "I only work with React 19.0 to 19.2". If your React is outside the range, npm complains (ERESOLVE).
- **Lockfile (`package-lock.json`):** the exact list of everything installed, so a second computer gets the same thing.
- **Server vs browser:** server code runs on Vercel's computers (safe for secrets). Browser code runs on the visitor's phone (anyone can read it).
- **SSR:** the server builds the page's HTML first. 3D libraries need a real browser, so we turn SSR off for them (`ssr: false`).
- **App Router:** Next.js's folder-based page system (`app/…/page.tsx`).
- **Zod:** a library that checks "is this data the right shape?" and gives us the TypeScript type for free.
