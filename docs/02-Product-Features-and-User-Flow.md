# 02 — Product Features and User Flow

## Screens (routes)
| Route | Purpose | Needs login? |
|---|---|---|
| `/` | Cinematic landing page with 3D hero. Buttons: "Start swiping", "Sign in". | No |
| `/login` | Sign in / register / Google. (Already exists. Restyle only.) | No |
| `/onboarding` | 4-step quiz to save preferences. | Yes |
| `/discover` | Swipe deck + filter bar + AI search + list below. (Today's `app/page.tsx`.) | Yes |
| `/property/[id]` | Full detail page: photos, map, facts, EMI/rent notes, AI "Explain", copilot. | Yes (view); share link works after login |
| `/admin` | Add/edit listings, import seed data. | Yes + admin |

## Main user flow
```
Landing -> Login -> (first time) Onboarding -> Discover
Discover: swipe/like/skip  -> every 5 swipes AI re-orders the remaining deck
          tap card         -> Property detail page
          "Liked" panel    -> Compare with AI (2–5 homes) -> top picks
          Copilot button   -> ask questions about the current home
```

## Feature list (with simple acceptance rules)

### F1. Onboarding quiz (saves to `users/{uid}.preferences`)
Steps: (1) cities (multi-select) (2) monthly budget (min–max slider) (3) BHK (1/2/3/4+) + furnishing (4) must-haves chips (pet friendly, parking, near metro, gym, balcony, quiet area) + one free-text line ("near EON IT Park").
- Can skip. Can edit later from a small "Preferences" button.
- Accept: refresh the page and preferences are still there.

### F2. Filters (Discover)
City chips • Rent slider • BHK chips • Furnishing • Sort (AI best match / rent low→high / newest).
- Filters are saved in the URL (`/discover?city=Pune&bhk=2&max=30000`) so links can be shared.
- Filters change the deck AND the list below. If zero results: friendly empty state with a "Clear filters" button.
- Accept: reload keeps the filters.

### F3. Swipe deck (already exists, polish)
Drag ±120px, Like/Skip buttons, ← → keys, "Undo last swipe" (new, small), stamp overlays, haptic-style spring.
- Skipped IDs are now saved too (`skippedPropertyIds`) because rerank needs them.

### F4. AI search (exists, upgrade)
User types "quiet 2BHK under 30k in Pune near metro". Server returns **filters + ranked IDs** (not only IDs). The filter bar updates to show what the AI understood ("Pune • 2 BHK • ≤ ₹30,000"), so the user can correct it.

### F5. AI explain (exists, upgrade)
Uses the user's saved preferences (no more hard-coded Pune/₹25–40k). 3–4 short bullets: budget fit, city fit, space, one honest warning. If preferences are missing, it says so and asks to complete onboarding.

### F6. Smart rerank (NEW wiring)
Trigger: after every 5 swipes (debounced, one request at a time).
Rule: never move the card currently on top; only reorder cards not yet seen. Show a quiet toast "Deck tuned to your taste".
Fallback: if AI fails, do nothing (deck stays as it is).

### F7. Shortlist compare (NEW wiring)
In the Liked panel: select 2–5 homes -> "Compare with AI" -> summary with trade-offs (price vs space vs commute) and top 2–3 picks. Button is disabled with a hint if fewer than 2 are selected.

### F8. Copilot chat (NEW)
Floating button on `/discover` and `/property/[id]`. Streams answers. Knows: current home, user preferences, last 8 messages.
Honesty rule: it must not invent facts it does not have (exact distances, noise levels). It says "I don't have exact data; roughly…" and suggests checking the map.
Suggested starter questions as chips: "Is this worth the rent?", "Can 3 friends share this?", "What should I ask the owner?".

### F9. Property detail page
Photo carousel + lightbox • facts grid (rent, beds, baths, sq ft, furnishing, deposit, available from) • amenity badges • map (Leaflet) • "Explain with AI" • Like button • Share button • back to deck.
Old listings without new fields still render (missing fields are hidden, not shown as "undefined").

### F10. Admin
Add/edit listing (with new optional fields), import 20 seed homes (idempotent: uses the same IDs, never duplicates), hide listing (status = hidden, not delete).

## Empty / error states (must exist)
- No more cards -> "You've seen everything" + Restart + Adjust filters.
- AI down -> small notice "AI is resting, showing basic results".
- Offline / Firestore error -> retry button, never a blank page.
- Not logged in -> redirect to `/login` with return path.

## Out-of-the-box nice extras (only after everything else works)
Sound on swipe (off by default) • confetti on first like • PWA install • share-as-image of shortlist.
