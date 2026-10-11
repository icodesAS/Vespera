# 04 — UI/UX and 3D Design Roadmap

**Plain-English summary:** The look we are building is **"Dark Glass + Neon Skyline"**: a near-black background,
frosted-glass cards, glowing violet/blue/pink accents, floating particles, and a 3D night city on the landing page.
The 3D is used **only on the landing page**. The swipe screens stay light and fast, because a swipe app that lags feels broken.

## 1. What your inspiration is
Your inspiration is the Awwwards three.js collection, especially: Collective Pixels (Complica Studio), Teatika, Developer Office, Atmos Gallery (KauStudio), Snowflake. Also activetheory.net. We copy the FEEL (dark, glowing, depth, motion, premium) only — never code, text or assets. All visuals are original (copyright).

## 1.5. Vespera brand identity
- **Wordmark:** "Vespera" in Space Grotesk, lowercase or title case, with a soft pink-to-violet gradient and a small glowing dot — like a lit window at dusk.
- **Landing hero line:** "Evening light. Exceptional homes."
- **Voice:** calm, warm, premium. Never salesy, never pushy. Like a thoughtful friend who knows the city.
- **Colour mood:** deep navy/black background, soft violet/pink accents, glowing particles. Premium, not loud.

## 2. Design tokens (put in `app/globals.css` under `@theme`)
```css
@import "tailwindcss";

@theme {
  --color-bg-0: #05060a;          /* page background */
  --color-bg-1: #0b0d14;          /* sections */
  --color-surface: rgb(255 255 255 / 0.06);   /* glass fill */
  --color-border: rgb(255 255 255 / 0.12);
  --color-text: #edeef3;
  --color-muted: #9aa0b4;         /* check contrast >= 4.5:1 on bg-0 */
  --color-violet: #7c5cff;
  --color-cyan: #29d3ff;
  --color-pink: #ff4fd8;
  --color-amber: #ffb547;
  --color-like: #2de08a;
  --color-skip: #ff5c7a;
  --font-display: var(--font-space-grotesk);
  --font-sans: var(--font-geist-sans);
  --radius-card: 1.5rem;
}
:root { color-scheme: dark; }
body { background: var(--color-bg-0); color: var(--color-text); }
```
- **Fonts** via `next/font/google`: *Space Grotesk* (headings), *Geist* (body, already in v1). Set `display: "swap"`.
- **Glass card recipe:** `bg-surface backdrop-blur-xl border border-border rounded-[--radius-card] shadow-[0_8px_40px_rgb(124_92_255/0.15)]`.
- **Glow:** `box-shadow` with accent colours at low opacity, plus a faint radial gradient behind hero text. Never pure white text on pure bright glow.
- **Grain overlay:** one 200px PNG noise at 4% opacity (fixed, `pointer-events-none`) gives a premium feel. Optional.
- Spacing scale: multiples of 4px. Max content width 1200px. Mobile-first.

## 3. Motion principles
- Use `motion` springs for interactive things (cards, buttons): `type: "spring", stiffness: 300, damping: 30`.
- Use easing for page transitions: 250–400 ms. Nothing longer than 600 ms except the hero intro.
- **Respect `prefers-reduced-motion`:** turn off parallax, particles and auto-animations; keep simple fades.
- Every animation must have a purpose: show state change, guide the eye, or add delight once. No constant spinning things on content pages.

## 3.5 Motion tiers
| Tier | Where | Gets |
|------|-------|------|
| 1 Cinematic | `/` landing only | Loader (max 2.5 s, skippable, once per session) · hero WebGL (Neon Skyline + cursor-reactive particles, optional light bloom via `@react-three/postprocessing` 3.2.0) · scroll-driven camera/scene · split-text line reveals · magnetic buttons · custom cursor (fine pointer only) · city marquee · Lenis smooth scroll |
| 2 Light | all other pages (`/login`, `/onboarding`, `/discover`, `/explore`, `/property/[id]`, `/shortlist`, `/admin`) | Calm 2D ambient background (CSS gradient blobs + faint grain) · page enter: fade + 12px rise via `app/template.tsx` · overlay wipe between routes via a `TransitionLink` (NOT `AnimatePresence` exit across routes) · staggered card/list reveals · glass hover glow + small tilt · animated rent numbers (CountUp) · Lenis only on `/property/[id]` |
| 3 Minimal | reduced motion, width < 768 px, ≤ 4 CPU cores, no WebGL, WebGL error | No WebGL, CSS gradient, fades only |

Rules:
- `/discover` never uses WebGL and never uses Lenis (Lenis fights swipe drag gestures).
- Animate only `transform` and `opacity` in the DOM.
- Respect `prefers-reduced-motion` everywhere.
- Never two WebGL canvases at once.

## 3.6 Shared motion components (build in Phase 3b)
These components are built once in Phase 3b and used across all pages:
- `AmbientBackground` — full-screen CSS gradient blobs + grain (Tier 2). No WebGL.
- `PageWipe` + `TransitionLink` — overlay wipe between routes.
- `app/template.tsx` — page enter animation (fade + 12px rise).
- `Cursor` — custom cursor for desktop fine-pointer devices only.
- `SplitReveal` — split-text line reveals (Tier 1 landing only).
- `MagneticButton` — magnetic hover effect (Tier 1 landing only).
- `Tilt` — subtle card tilt on hover (Tier 2).
- `CountUp` — animated number count-up for rent values (Tier 2).
- `Marquee` — scrolling city name marquee (Tier 1 landing only).
- `Loader` — full-screen loader (max 2.5 s, skippable, once per session, landing only).

Optional stretch (AFTER Phase 8, only if asked): a single WebGL shader ambient background on calm pages (login, onboarding, property, shortlist). Never on `/discover`. Never at the same time as the hero canvas. 30 fps cap, DPR 1, CSS fallback.

## 4. Page-by-page design brief

### `/` Landing ("Neon Skyline") — the only 3D page
| Section | What the visitor sees | Tech |
|---------|----------------------|------|
| Hero | Night city of glowing boxes, drifting particles, headline "Swipe your next home." Two buttons: **Start swiping**, **Try as guest** | R3F `<Canvas>` behind DOM text |
| Story 1 "Swipe" | Floating glass property cards in a fan (CSS 3D tilt, real photos) with a little drag-me hint | CSS 3D + `motion` `useScroll` |
| Story 2 "AI learns you" | A glass panel types an example AI explanation, score ring fills | `motion`, no WebGL |
| Story 3 "Decide" | Map pin + compare table slide in | `motion` |
| Final CTA | Big button + small footer (GitHub link, built-with row) | plain |

**Scene A, Neon Skyline (R3F):**
- ~300 box "buildings" as one `InstancedMesh` (1 draw call), heights random, dark material with emissive coloured strips; `fog` for depth.
- Particle field with drei `<Points>`: **8,000 on desktop, 2,000 on mobile**, slow upward drift, additive blending, violet/cyan/pink.
- Camera "dolly": scroll progress (0→1 from Lenis/`useScroll`) moves the camera forward and slightly up through the city. Mouse movement adds tiny parallax (desktop only).
- Optional light bloom via `@react-three/postprocessing` 3.2.0 (already installed). Desktop + good devices only, behind Tier-3 fallbacks. See docs/02 for the version.
- A gradient + static poster image (`public/hero-poster.webp`) sits under the canvas and is shown while it loads and as the fallback.

**Performance budget (landing):**
| Item | Limit |
|------|-------|
| Draw calls | ≤ 100 |
| Pixel ratio | `dpr={[1, 1.5]}` (never 2+) |
| Textures | ≤ 1024 px, WebP/AVIF, ≤ 6 total |
| 3D code downloaded | lazy-loaded after first paint (`dynamic`, `ssr:false`) |
| Frame rate | 60 fps desktop, ≥ 30 fps mid phone; use drei `<PerformanceMonitor>` to lower DPR/particles automatically |
| Pause rules | stop rendering when the tab is hidden or the hero is scrolled out of view (`IntersectionObserver` + `frameloop="never"`/`"demand"`) |

**Fallbacks (must exist):** show the poster + CSS gradient instead of WebGL when any is true:
`prefers-reduced-motion`, WebGL not available, `navigator.hardwareConcurrency <= 4` on a narrow screen, `navigator.deviceMemory <= 4` (where supported), or the canvas throws (error boundary). The page must still look good and every button must work.

### `/login`
Glass card centred over the same dark gradient (2D blobs, no WebGL). Tabs: Sign in · Register. Buttons: Continue with Google, **Try as guest**. Friendly inline errors ("That password is too short").

### `/onboarding`
Full-screen steps, one question each, big tap targets, progress dots, **Skip** always visible. Slider for budget (₹ with Indian grouping, `toLocaleString("en-IN")`). Chips for cities/BHK/furnishing/priorities.

### `/discover` (the heart of the app)
- Top: filter pills (City · Rent · BHK · Furnishing · Pets) + AI search bar ("quiet 2BHK under 30k near metro in Pune").
- Centre: **stack of 3 cards** (top one draggable). Drag right = like (green stamp), left = skip (red stamp); rotation follows drag; spring back if < 120 px.
- Bottom: Skip · **Undo** · Explain with AI · Like buttons (also arrow keys, `Z` = undo).
- Card: big photo, rent in large type, title, locality, chips (2 BHK · 1,050 sq ft · Semi-furnished · Pets OK), "AI match" badge once score exists.
- Mobile haptics: `navigator.vibrate?.(10)` on like/skip (safe if unsupported).
- Background: 2D animated gradient blobs only. **No WebGL here.**
- Empty state (deck finished): friendly illustration + "Restart" + "See shortlist".

### `/explore`
Grid of cards (masonry-like, 1/2/3 columns), toggle **List | Map**, same filters. Load-more button (not infinite scroll; kinder to the free quota and to accessibility).

### `/property/[id]`
Two columns on desktop (gallery + facts / sticky action card), single column on phone. Order: gallery → title/rent → facts grid → amenities → nearby → map → rent helper → AI box → similar homes. Sticky bottom bar on phone with **Like** and **Ask AI**.

### `/shortlist`
Cards with remove buttons; select 2–6 → **AI compare** opens a glass drawer with ranking, trade-offs and a "Top pick" highlight.

## 5. Component inventory (build in this order)
`ui/Button`, `ui/GlassCard`, `ui/Chip`, `ui/Slider`, `ui/Skeleton`, `ui/Toaster (sonner)` →
`layout/Nav`, `layout/Footer`, `layout/RequireAuth` →
`discover/SwipeDeck`, `discover/SwipeCard`, `discover/FilterBar`, `discover/AiSearchBar` →
`property/Gallery`, `property/FactsGrid`, `property/MapView`, `property/RentHelper`, `property/SimilarHomes` →
`ai/ExplainPanel` (score ring), `ai/ComparePanel`, `ai/CopilotChat` →
`three/Skyline` (the only R3F scene), `three/Particles`, `three/useScenePerformance` →
`landing/Hero`, `landing/FloatingCards`, `landing/StorySection`.

## 6. Accessibility and quality checklist
- Colour contrast ≥ 4.5:1 for text (glass over dark: test with browser dev tools)
- All buttons reachable with **Tab**, visible focus ring (`focus-visible:ring-2 ring-cyan`)
- Canvas has `aria-hidden="true"`; all key info is real HTML text
- Swipe also works via buttons and arrow keys; AI result areas use `aria-live="polite"`
- Images have `alt`; use `next/image` with `sizes`; lazy-load below the fold
- Touch targets ≥ 44×44 px
- Test widths: 360, 390, 768, 1280, 1920

## 7. R3F rules for agents
1. Any file with `<Canvas>`, `useFrame`, `useThree`, `three` imports starts with `"use client"` and is loaded via `dynamic(..., { ssr:false })` from a **Client** wrapper.
2. Never `setState` inside `useFrame`. Mutate refs.
3. Create geometries/materials once (`useMemo`); dispose when unmounting. Use `InstancedMesh` for repeated objects.
4. Load textures with drei `useTexture` inside `<Suspense>`.
5. Wrap the Canvas in an **error boundary** → fall back to the poster.
6. Test on a real mid-range Android phone and with Chrome DevTools CPU 4× slowdown before calling it done.
7. React Strict Mode mounts twice in dev. That is normal.
8. Do not copy GLTF/textures from other sites. Use only our own or properly licensed (CC0) assets and note them in `docs/credits.md`.

## 8. UI roadmap (matches the phases in doc 06)
| Stage | Goal | Done when |
|-------|------|-----------|
| UI-1 Foundations | tokens, fonts, Button/GlassCard/Chip/Skeleton, Nav, toasts | a style-guide page `/dev/styleguide` (hidden in prod) shows all parts |
| UI-2 Landing | poster-first hero → Skyline scene → story sections → CTA | looks great with 3D on and off; Lighthouse landing ≥ 70 mobile |
| UI-3 Discover | 3-card stack, undo, stamps, filter pills, AI search bar | smooth at 60 fps; keyboard works |
| UI-4 Detail + Shortlist | gallery, facts, map, rent helper, compare drawer | no layout shift; works on 360 px |
| UI-5 Polish | skeletons, empty/error states, 404, favicon, OG image, micro-interactions | accessibility checklist §6 all ticked |

## 9. Optional later (not in v2.0)
Light theme · sound effects (off by default) · View Transitions between pages.
