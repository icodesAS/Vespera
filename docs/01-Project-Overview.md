# 01 — Project Overview

## One sentence
**PropSwipe** helps people in India find a rental home by swiping through homes like cards, while an AI explains each home, learns what you like, and answers your questions.

## Why this project exists
- Built in 1st year as practice. Now being upgraded into a **portfolio-grade full-stack project**: real login, real database, AI, beautiful UI, strong documentation.
- Goal for recruiters/judges: "this person can build and ship a complete product", not "this is a tutorial copy".

## Who it is for
| User | What they want |
|---|---|
| Renter (main user) | Find a good home fast, without reading 50 listings. |
| Admin (you) | Add and manage listings safely. |
| Recruiter / viewer | See a polished demo in 2 minutes + a README that explains the thinking. |

## What makes it different (the story for your README)
1. **Swipe to decide**: fast, fun, works on phone and laptop (keyboard arrows too).
2. **AI that learns from swipes**: after a few swipes, the remaining homes are re-ordered for you.
3. **AI that explains**: "why is this home good or bad for ME?" using your saved preferences.
4. **Copilot chat**: ask follow-up questions about a home.
5. **Compare shortlist**: AI compares your liked homes and picks the top 2–3.
6. **3D, cinematic landing page** in the style of award-winning WebGL sites.

## Scope
**In v2 (this upgrade):** new landing, onboarding quiz, filters, property detail pages with map, rerank, shortlist summary, copilot, security rules, README.
**Out of scope for now:** payments, real-time chat between users, owner accounts, native mobile app, light theme, multi-language.

## Success checklist
- [ ] A stranger can open the live link, sign in with Google, swipe, and see AI features work in under 2 minutes.
- [ ] No secret in the repo. Security rules deployed.
- [ ] Lighthouse performance 85+ on desktop for `/discover`.
- [ ] README has GIFs, screenshots and diagrams.
- [ ] You can explain every file in your own words (important for interviews).

## Words used in this project (mini glossary)
- **Firestore**: Google's cloud database where users and homes are stored.
- **API route**: a small server function in `app/api/...` the website calls.
- **Rerank**: re-sort the homes you have not seen yet, based on what you liked.
- **Prompt**: the instruction text we send to Gemini.
- **Fallback**: a simple backup answer when the AI fails, so the app never looks broken.
