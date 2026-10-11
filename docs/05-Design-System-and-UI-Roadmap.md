# 05 — Design System and UI Roadmap

## Inspiration (from the video you shared)
The clips show the "award-style 3D website" look: **near-black background, glowing particles, floating glass panels with colorful light bending through them, big wide-spaced headlines, neon pink / violet / blue accents, smooth scroll, things that react to the mouse.**
Use the *ideas* (mood, glass, particles, depth, motion). Do **not** copy anyone's code, images, text or branding.

## Design idea for PropSwipe: "Glass Homes in the Dark"
Homes feel like glowing glass cards floating in a night sky. Calm, premium, a little magical. Never noisy.

## Design tokens (put in `app/globals.css`)
```css
@import "tailwindcss";

@theme inline {
  --color-bg: #05060a;          /* page background */
  --color-surface: #0c0e16;     /* panels */
  --color-glass: rgb(255 255 255 / 0.06);
  --color-line: rgb(255 255 255 / 0.12);
  --color-text: #f2f4fa;
  --color-muted: #9aa3b8;
  --color-pink: #ff4d9d;        /* like / primary accent */
  --color-violet: #7c5cff;
  --color-cyan: #36d6ff;        /* skip / info accent */
  --color-ok: #3ddc97;
  --color-warn: #ffb547;
  --radius-card: 1.5rem;
  --font-display: var(--font-geist-sans), system-ui, sans-serif;
}
:root { color-scheme: dark; }
body { background: var(--color-bg); color: var(--color-text); }
.glass { background: var(--color-glass); border: 1px solid var(--color-line); backdrop-filter: blur(18px) saturate(140%); }
.text-gradient { background: linear-gradient(90deg, var(--color-pink), var(--color-violet), var(--color-cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
```
Typography: Geist (already in the project) for body; headings uppercase or tight, large (`text-5xl`–`text-8xl`), `tracking-tight` for lowercase, `tracking-[0.2em]` for small uppercase labels. Add one display font only if time allows (via `next/font/google`).

## Motion tiers (what gets what)
Quality bar: the feel of award-winning WebGL studios (Awwwards three.js list, Active Theory style): custom shader backgrounds, cursor-reactive particles, glass depth, scroll-driven scenes, cinematic page changes. We match the FEEL with our own code. We do not copy any site's code, assets or text.

| Tier | Where | What it gets |
|---|---|---|
| **1 Cinematic** | `/` landing | Intro loader • hero WebGL scene (flow shader background + cursor-reactive particles + 3 floating glass home cards with photo textures + soft bloom) • scroll-driven scene changes per section • split-text line reveals • magnetic buttons • custom cursor • city marquee • Lenis smooth scroll |
| **2 Light** | `/discover`, `/property/[id]`, `/onboarding`, `/login`, `/admin` | Shared calm ambient shader background • page enter (fade + 12px rise) • overlay wipe between routes • staggered card/list reveals • glass hover glow + small tilt • animated rent numbers • Lenis only on `/property/[id]` |
| **3 Minimal** | reduced-motion users, screens under 768px, under 4 CPU cores, no WebGL, or 3D error | No WebGL. CSS gradient background. Fades only. Same content, same layout. |

`/admin` and `/login` stay at the lowest end of Tier 2 (enter fade + ambient only).

## Shared motion components (build once in Phase 4b, reuse everywhere)
`Ambient` (full-screen shader quad) • `PageWipe` + `TransitionLink` • `app/template.tsx` (enter animation) • `Cursor` (desktop, fine pointer only) • `SplitReveal` (text lines) • `MagneticButton` • `Tilt` (glass card) • `CountUp` • `Marquee` • `Loader` (drei `useProgress`, max 2.5 s, skippable, once per session)

## Performance rules for motion
- Text and buttons paint first; WebGL fades in after.
- Ambient: 30 fps cap, DPR 1, pauses when the tab is hidden, and is unmounted on `/`.
- Use drei `PerformanceMonitor` to lower DPR automatically on slow machines.
- Landing hero scene is its own lazy chunk (`next/dynamic`, `ssr:false`) behind an error boundary.
- Animate only `transform` and `opacity` in DOM; never animate `width/height/top/left`.
- Test on a normal laptop with integrated graphics, not only your best machine.

## 3D safety rules (so it never breaks the app)
1. Load with `dynamic(() => import("@/components/three/HeroScene"), { ssr: false })`.
2. `<Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>`.
3. Show `SceneFallback` (a CSS gradient + one static image) when: `prefers-reduced-motion`, small screen (< 768px), `navigator.hardwareConcurrency < 4`, WebGL unavailable, or the scene throws (wrap in an error boundary).
4. Pause rendering when the tab is hidden: `frameloop` = `"never"` while hidden, `"always"` otherwise.
5. Max about 40 draw calls; particles as ONE `<Points>` (about 1500–3000 points); at most 3 transmission-material cards (it is expensive); bloom intensity low.
6. Dispose textures/geometries on unmount (drei and fiber do most of it; do not create objects inside render loops).
7. Never block the page: the headline and buttons render in normal HTML on top of the canvas (`position:absolute` overlay).

## Landing page structure
1. **Hero**: full-screen canvas; headline "Swipe your next home." (gradient on "next home"); sub-line "AI learns what you love. You just swipe."; buttons **Start swiping** (pink) and **See how it works**.
2. **How it works**: 3 glass steps with icons (Swipe • AI learns • Compare & decide). Fade/slide in on scroll (motion `whileInView`).
3. **Live demo strip**: a looped mini swipe-deck animation (pure CSS/motion, no AI call).
4. **AI features grid**: Explain, Rerank, Compare, Copilot (4 glass cards, hover glow).
5. **Cities**: chips for Pune, Bengaluru, Mumbai, Hyderabad, Gurugram… linking to `/discover?city=…`.
6. **Footer**: GitHub link, "Built with Next.js, Firebase, Gemini", your name.
Smooth scroll with `lenis` on `/` only.

## Component checklist (build in this order)
`GlassCard` → `Button` (variants: primary pink, ghost, danger) → `Chip` → `Slider` → `Skeleton` → `Badge` → `Header` → `PageShell`
Then page parts: `FilterBar`, `SwipeDeck` restyle, `PropertyGallery`, `PropertyMap`, `CopilotDrawer`, `CompareSheet`.

## Motion rules
- Spring, not linear: `type: "spring", stiffness: 260, damping: 26`.
- Tier 1: several wow moments, one per section. Tier 2: none, only quiet motion.
- Swipe: card tilts (rotate = x / 20), Like/Skip stamps fade in by drag distance, card flies out on release.
- Respect `prefers-reduced-motion` (no big movement, keep fades).

## Accessibility and quality bar
- Contrast: body text on dark must be readable (muted text no darker than `#9aa3b8` on `#05060a`).
- Every swipe has a button + keyboard shortcut. Focus rings visible (`focus-visible:ring-2 ring-violet`).
- Images: `next/image` with width/height, `alt` from title + city. Compress the 20 seed JPGs (aim under 250 KB each).
- Target: Lighthouse Performance 85+ and Accessibility 95+ on `/discover`; landing 75+ (3D costs some).

## Mobile first
Design for 390px wide first. Swipe deck is full-width with bottom action bar. Filters collapse into a bottom sheet. Hero 3D is replaced by the fallback on phones.

## UI roadmap (phases map to doc 07)
- **U1** tokens + base components • **U2** landing (3D) • **U3** discover restyle + filters • **U4** detail page • **U5** onboarding, copilot, compare sheets • **U6** polish: loading skeletons, empty states, toasts, favicon, OG image.
