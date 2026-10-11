# Documentation Clean-up and Rename - Changelog

**Date:** 11 Oct 2026  
**Task:** Consolidate documentation, update GitHub names, fix version policy, remove stale baseline folder

## Summary
- Consolidated all agent instructions into AGENTS.md (deleted GEMINI.md)
- Updated GitHub repository references: icodesAS/Vespera (was Aman-art1/PropSwipe)
- Removed docs/assets/baseline/ folder (Phase 1 is complete; config files now at repo root)
- Added version policy: versions live only in package.json and docs/02
- Created .nvmrc and .npmrc at repo root
- Replaced repo firestore.rules with stronger baseline version
- Removed emojis from documentation (professional tone)
- Updated README.md with accurate project status and tech stack

## Files Changed

### Root level
- `README.md` — Completely rewritten: accurate status table, correct GitHub links, current tech stack, no emojis
- `AGENTS.md` — Added version policy, professional tone rule, multi-model note (Kiro/Antigravity/Devin)
- `GEMINI.md` — Deleted (content consolidated into AGENTS.md)
- `.nvmrc` — Created (content: 24)
- `.npmrc` — Created (save-exact=true, engine-strict=true, legacy-peer-deps=false)
- `firestore.rules` — Replaced with stronger baseline version (includes isOwner function, array size limits)

### docs/
- `00-Decisions-Log.md` — Updated Naming section (GitHub icodesAS/Vespera); added D-30 Version Policy decision
- `02-Tech-Stack-and-Versions.md` — Removed baseline folder references
- `03-Firebase-and-Data.md` — Updated firestore.rules reference (repo root, not baseline folder)
- `06-Build-Phases-and-Prompts.md` — Removed baseline references, changed emoji risk markers to Easy/Medium/Hard text, updated Phase 1 to reflect completion
- `08-README-and-Portfolio-Plan.md` — Removed emojis from headings and templates
- `START-HERE.md` — Updated to show Phase 1 complete, added GitHub URL
- `CHANGELOG-merge.md` — This file

### Deleted
- `docs/assets/baseline/` — Entire folder (10 files) removed from git and filesystem
- `GEMINI.md` — Consolidated into AGENTS.md

## Git remote
Updated from `https://github.com/Aman-art1/PropSwipe.git` to `https://github.com/icodesAS/Vespera.git`

## Safety Check Results
- No `.env.local` or `service-account.json` tracked
- No `AIza` or `private_key` patterns found in code outside docs
- Only `.env.example` is tracked (expected)

## Next Step
Phase 2: Data layer, seed data, stores (see docs/06-Build-Phases-and-Prompts.md)

**Date:** 11 Oct 2026  
**Task:** Merge two documentation packs into one final set + rename product from PropSwipe to Vespera

## Files Changed

### Root level
- `AGENTS.md` — Merged base pack + owner rules; updated: Vespera identity, Node 24, React <19.4, Firebase 13.x, folder map (no legacy/), exact versions, motion animation note; post-workflow fixes: removed v2-rebuild branch references
- `GEMINI.md` — Rewritten: simplified to reference AGENTS.md, removed outdated content, kept Next.js agent rules block

### docs/
- `00-Decisions-Log.md` — Merged all decisions; updated: all version numbers to actual (Node 24.20.0, Next 16.4.0, React 19.3.0, Firebase 13.0, genai 2.28.0, motion 14.1.0, R3F 9.8.1, drei 10.7.9, postprocessing 3.2.0 included); added Naming note, motion tiers (D-25 to D-29), inspiration sites answer, code rename task (D-29); changed "stuck twice" to "stuck three times"
- `01-Project-Overview.md` — Merged; updated: Vespera description (removed Tinder comparisons), added Status column to feature table (Phase 1 items marked Done), updated F11 with Tier-1 motion description
- `02-Tech-Stack-and-Versions.md` — Merged; updated: ALL package versions to match package.json exactly, Node 24 requirement, Five locks table (React <19.4 with R3F 9.8.x, ESLint 9.x, TS 5.9.x, Firebase 13.x on Node 24.12+, Next ≥16.3.8), postprocessing 3.2.0 IS installed, npm audit text (Firebase + grpc items), removed clsx/tailwind-merge/server-only (not in actual package.json)
- `03-Firebase-and-Data.md` — Merged; updated: Firebase project creation note (already exists, Mumbai), added `FIREBASE_ADMIN_CREDENTIALS_BASE64` env variable with "current state/planned removal" note, Anonymous auth note
- `04-UI-UX-and-3D-Design.md` — Merged; updated: inspiration sites (Awwwards collection listed), added Vespera brand identity section (wordmark, tagline, voice), added motion tiers table (Tier 1/2/3), added shared motion components section (build in Phase 3b), Scene A updated (postprocessing IS installed, optional light bloom), removed "not installed" note for postprocessing
- `05-AI-Architecture.md` — Merged; updated: SDK version 2.28.0, models (gemini-3.8-flash primary, gemini-3.5-flash-lite fallback), removed 2.5 shutdown date (passed), noted 2.5 limited to older users, route name `explain` → `explain-property`, admin credentials note (current state + planned improvement Phase 5); post-workflow fixes: corrected "gemini-3.5-flash" to "gemini-3.8-flash" in model reference
- `06-Build-Phases-and-Prompts.md` — Merged; updated: top of file added Current state box (Phases 0-1 DONE, what exists today file table), owner rules (one phase per chat, smoke test checklist), phase map updated (added 3b motion system, split 8 into 8a/b/c/d), removed legacy/ and v2-rebuild references, updated git routine to current branch, Phase 2 onward prompts use correct versions (Node 24, Firebase 13, React 19.3), Phase 3 split into 3a+3b (3b = motion system), Phase 10 updated (Node 24, npm ci), all "When to bring to Claude" templates updated with real versions; post-workflow fixes: replaced v2-rebuild branch with main, updated React 19.2.8→19.3.0 in template, updated 16.3.8→16.4.0, removed v1-legacy tagging instruction
- `07-Risks-Debugging-and-Fixes.md` — Merged; updated: localhost triage (Node 24, removed "v1 expected not to run"), common errors table (Node 24, React 19.3.0), added motion risk row (R-new), removed "upgrading React and R3F together later" note
- `08-README-and-Portfolio-Plan.md` — Merged; updated: title to Vespera, tagline to "Evening light. Exceptional homes.", removed Tinder description, updated badge versions (Next 16.4.0, React 19.3.0, TS 5.9.3, motion 14.1.0), updated run instructions (nvm use 24), portfolio write-up (Vespera one-liner), LinkedIn post (Vespera text), Gantt diagram title, added design inspiration note (Awwwards/activetheory aesthetic, all visuals original)
- `START-HERE.md` — Created; "Where we are" guide with current status, next step (Phase 2), file table
- `CHANGELOG-merge.md` — This file
- `_stuck/.gitkeep` — Created empty folder for stuck notes

### docs/assets/baseline/
- `package.json` — Updated all versions to match actual repo package.json, added postprocessing 3.2.0, removed clsx/tailwind-merge/server-only, updated engines to >=24.12.0, updated @types packages
- `.nvmrc` — Content changed from `22` to `24`
- `firestore.rules` — Header comment updated to "Vespera v2"
- `.env.example` — Header updated to Vespera, `GEMINI_MODEL=gemini-3.8-flash`, added `FIREBASE_ADMIN_CREDENTIALS_BASE64` with note, added `AI_RATE_LIMIT_PER_MIN` and `AI_TIMEOUT_MS`

## Files Deleted (after merge)
- `d:\DEV\PropSwipe\_incoming/` — entire folder (base pack source)
- `d:\DEV\PropSwipe\docs\docs-merge-brief.md` — task brief (no longer needed)
- Old numbered docs from current pack will be deleted if they exist (02-Product-Features-and-User-Flow.md, 03-Technical-Architecture.md, 04-Tech-Stack.md, 05-Design-System-and-UI-Roadmap.md, 06-Risks-Limitations-and-Mitigations.md, 07-Step-by-Step-Build-Guide.md, 08-Firebase-Setup-and-Recovery.md, 09-README-Blueprint.md)

## Renames Applied
1. **Product name:** PropSwipe → Vespera (everywhere except technical identifiers)
2. **Tagline:** "Swipe your next home. Let AI explain why it fits." → "Evening light. Exceptional homes."
3. **Description:** Removed all "Tinder for rentals", "Tinder-style", dating-app comparisons; replaced with "Vespera is an AI-guided home discovery app for renters in India. You swipe through homes, and the AI explains, ranks and compares them for you."
4. **Technical identifiers KEPT:** GitHub repo URL (`Aman-art1/PropSwipe`), Firebase project id, env variable names

## Version Updates Applied
- Node: 22 → 24 (24.12+ required for Firebase 13)
- Next.js: 16.3.8 → 16.4.0
- React/React-DOM: 19.2.8 → 19.3.0
- Firebase: 12.19.0 → 13.0.0
- firebase-admin: 14.4.0 → 14.5.0
- @google/genai: 2.23.0 → 2.28.0
- motion: 13.4.0 → 14.1.0
- @react-three/fiber: 9.7.0 → 9.8.1
- @react-three/drei: 10.7.8 → 10.7.9
- three: 0.186.0 → 0.186.1
- lucide-react: 1.47.0 → 1.55.0
- eslint: 9.39.5 → 9.39.0
- @types/node: 22.20.4 → 24.19.2
- @types/react: 19.2.18 → 19.3.0
- @types/react-dom: 19.2.7 → 19.3.0

## Quality Checks Passed
- ✅ No "Node 22" as requirement (all changed to Node 24)
- ✅ No "legacy/" references in docs
- ✅ No "v2-rebuild" as active branch name
- ✅ No "19.2.8" React version (all changed to 19.3.0)
- ✅ No "12.19.0" Firebase as chosen (changed to 13.0.0)
- ✅ No "16.3.8" Next as installed (changed to 16.4.0)
- ✅ No "gemini-3.5-flash" as PRIMARY model (it's fallback; primary is 3.8)
- ✅ No route name "/explain" without "-property" (all changed to "explain-property")
- ✅ No "Tinder" except in removed/quoted context
- ✅ No "PropSwipe" except technical identifiers (GitHub URL, paths)
- ✅ No secrets in any written file
- ✅ Every @docs/... reference in AGENTS.md points to existing file

## Uncertainties / Notes
None. All version numbers verified against actual package.json. All content merged according to brief.

## Next Step
Phase 2: Data layer, seed data, stores (see docs/06-Build-Phases-and-Prompts.md)
