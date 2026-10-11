# 04 — Tech Stack (exact, tested versions)

Verified 11 Oct 2026: installs with **0 peer conflicts**; a real `next build` passed with these.
The ready file is `package.pinned.json` in the pack root. Copy it over `package.json` (keep your own `name` if you like).

## Runtime
| Thing | Version | Note |
|---|---|---|
| Node.js | **>= 24.12.0** | Firebase needs it. Check with `node -v`. Use nvm / nvm-windows or the installer from nodejs.org. |
| npm | 10+ (bundled) | Only npm. Commit `package-lock.json`. |

## Packages
| Package | Version | Why |
|---|---|---|
| next | 16.4.0 | App Router, route handlers |
| react / react-dom | 19.3.0 | **Do not go to 19.4+** (react-three-fiber 9.8.1 allows `>=19 <19.4`) |
| typescript | 5.9.3 | Stay on 5.9.x. 7.x is new/untested here |
| tailwindcss + @tailwindcss/postcss | 4.3.3 | CSS-first config |
| motion | 14.1.0 | Animations and drag. `import { motion } from "motion/react"` |
| zustand | 5.0.15 | Small global state |
| firebase | 13.0.0 | Auth + Firestore in the browser |
| firebase-admin | 14.5.0 | Server only: verify login tokens, read listings on the server |
| @google/genai | 2.28.0 | The only Gemini SDK |
| zod | 4.6.5 | Validate AI answers, request bodies, Firestore data |
| three | 0.186.1 | 3D engine |
| @react-three/fiber | 9.8.1 | React wrapper for three |
| @react-three/drei | 10.7.9 | Ready 3D helpers (Float, MeshTransmissionMaterial…) |
| @react-three/postprocessing | 3.2.0 | Glow/bloom effects |
| lenis | 1.3.26 | Smooth scrolling (landing only) |
| leaflet + react-leaflet | 1.9.4 + 5.0.0 | Free maps |
| sonner | 2.0.8 | Toasts |
| lucide-react | 1.55.0 | Icons |
| eslint + eslint-config-next | 9.39.0 + 16.4.0 | Lint (a "no longer supported" notice for 9.x is only a warning; do not jump to 10 without testing) |
| @types/* | see package file | `@types/three` must match the three minor (0.186) |

## Removed from the old project
`framer-motion` (replaced by `motion`), `@google-cloud/vertexai` (not needed), `service-account.json` (delete + rotate), `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (analytics not used).

## Environment variables
See `.env.example`. Rules:
- Names starting with `NEXT_PUBLIC_` are visible to everyone in the browser. Only Firebase web config goes there.
- `GEMINI_API_KEY` and `FIREBASE_ADMIN_CREDENTIALS_BASE64` are secret and server-only. Never import them in a `"use client"` file.
- After editing `.env.local`, **restart** `npm run dev`.

## Gemini models (check before each big milestone)
Official page: ai.google.dev/gemini-api/docs/deprecations (updated 9 Oct 2026 when we checked).
- New projects should use **gemini-3.8-flash** (main) or **gemini-3.5-flash-lite** (cheap/fast).
- `gemini-2.5-flash` still exists but access is limited to people who used it before; some forum posts report 404s. Avoid.
- Models are read from env, so changing one is a one-line fix.

## How to add a package safely (the 4-step rule)
1. `npm view <pkg> version peerDependencies engines`
2. `npm install <pkg>@<exact-version> --dry-run` (read the output; any ERESOLVE = stop)
3. Install for real, then `npm run check`
4. Add a line to docs/00 (section D) and this table.

## Upgrading later
Do it on its own branch, one package family at a time (e.g. all of three/fiber/drei together), then `npm run check` and the smoke test. Never upgrade during feature work.
