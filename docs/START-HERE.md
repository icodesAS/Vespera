# START HERE — Where we are

**Last updated: 11 Oct 2026**

Vespera is an AI-guided home discovery app for renters in India. You swipe through homes, and the AI explains, ranks and compares them for you. Tagline: "Evening light. Exceptional homes."

GitHub: https://github.com/icodesAS/Vespera

## What is already done
Phase 1 is complete and verified. Here is what works right now:

1. ✅ Node 24.20.0 installed
2. ✅ All packages installed at exact pinned versions (see `package.json`)
3. ✅ Firebase project created (Mumbai), Auth enabled (Email + Google)
4. ✅ Firestore running (Mumbai, production rules published)
5. ✅ `lib/firebase.ts`, `lib/ai.ts`, `hooks/useAuth.tsx` all working
6. ✅ Login, registration, card deck, like/save verified
7. ✅ Gemini AI explain-property verified (`gemini-3.8-flash`)
8. ✅ `npm run check` passes: 0 errors

**Two things only you can do:**
1. Firebase console → Authentication → Sign-in method → check **Anonymous** is enabled (guest login needs it).
2. After Phase 10 deploy: Firebase console → Authentication → Settings → Authorized domains → add your Vercel URL.

## What is next: Phase 2

Paste this into a new Antigravity (Kiro) chat:

> Read `AGENTS.md`. Then read `docs/00-Decisions-Log.md` and `docs/03-Firebase-and-Data.md`. We are doing Phase 2 from `docs/06-Build-Phases-and-Prompts.md` and nothing else. Explain things in simple English — I am a beginner. First tell me your plan in 5 lines. Wait for my "go" before you change files. When done, run `npm run check`, paste the result, and tell me how I can see the result in the browser.

## File table

| If the task is about... | Read |
|--------------------------|------|
| why we chose something | `docs/00-Decisions-Log.md` |
| what the product is, pages, features | `docs/01-Project-Overview.md` |
| packages, versions, Next.js 16 rules | `docs/02-Tech-Stack-and-Versions.md` |
| Firebase, database, security rules, env vars | `docs/03-Firebase-and-Data.md` |
| look and feel, animation, 3D | `docs/04-UI-UX-and-3D-Design.md` |
| Gemini, AI routes, copilot chat | `docs/05-AI-Architecture.md` |
| what to build next, step by step | `docs/06-Build-Phases-and-Prompts.md` |
| an error, a risk, "why is it broken" | `docs/07-Risks-Debugging-and-Fixes.md` |
| README, screenshots, GIFs, portfolio write-up | `docs/08-README-and-Portfolio-Plan.md` |
