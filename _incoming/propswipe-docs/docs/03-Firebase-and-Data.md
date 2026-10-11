# 03 — Firebase, Database and Data Safety

**Plain-English summary:** The old Firebase project is probably gone, so we create a **new, empty** one. That is good news:
there is no old data to break. This file explains how to create the project (click by click), what the
database looks like, the security rules that protect it, and the habits that keep it from breaking.

## 1. Create the new Firebase project (owner does this by hand, about 15 minutes)
1. Open <https://console.firebase.google.com> with your Google account. (If you can still see the old PropSwipe project there, deleted
   Google projects are usually recoverable only for about 30 days, so after 8 months make a new one.)
2. **Add project** → name it `propswipe-v2` → turn **Google Analytics OFF** (not needed) → Create.
3. **Build → Authentication → Get started.** Enable three providers: **Email/Password**, **Google**, **Anonymous** (this is the guest login).
4. **Build → Firestore Database → Create database.** Choose **Production mode** (NOT test mode). Pick a region close to India:
   **asia-south1 (Mumbai)**. The region cannot be changed later.
5. **Firestore → Rules** tab → paste the contents of `docs/assets/baseline/firestore.rules` → **Publish**.
   Test with the **Rules Playground** (see §6).
6. **Project settings (gear) → General → Your apps → Web (`</>`)** → register app `propswipe-web` (no hosting) → copy the config values.
7. Copy `.env.example` to `.env.local` and fill the five `NEXT_PUBLIC_FIREBASE_*` values. Add `GEMINI_API_KEY` from <https://aistudio.google.com/apikey>.
8. **Authentication → Settings → Authorized domains:** `localhost` is there already. After deploying, add your Vercel domain (e.g. `propswipe.vercel.app`).
9. First time you sign in to the app, copy your **UID** from Authentication → Users. In Firestore, **create** collection `admins`, document id = **your UID**, one field `note: "owner"`. That makes you the admin (see doc 00 D-18).

Never commit `.env.local`. Never create `service-account.json`.

## 2. Env variables → who can see them
| Variable | Browser sees it? | Where used |
|----------|------------------|------------|
| `NEXT_PUBLIC_FIREBASE_*` (5 values) | yes (public by design; safety comes from rules) | `lib/firebase.ts` |
| `GEMINI_API_KEY` | **no** | `lib/ai/client.ts` only |
| `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` | no | `lib/ai/client.ts` |
| `AI_RATE_LIMIT_PER_MIN`, `AI_TIMEOUT_MS` | no | AI routes |

Removed from v1: `GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_APPLICATION_CREDENTIALS`, duplicate `GOOGLE_API_KEY`/`GEMINI_API_KEY`, measurement id.

**`lib/env.ts` (build this in Phase 1):** parse env with Zod. If a Firebase value is missing, the app must show a friendly
"Setup needed: add your Firebase keys to .env.local" panel, **not crash**. (A crash at import time is the most likely reason v1 shows a blank page.)

## 3. Collections (v2 schema)
```
properties/{propertyId}     public read, admin write        (the catalogue of homes)
users/{uid}                 owner only                      (profile, preferences, likes)
admins/{uid}                created by hand in the console  (who is an admin)
```
**Additive-only rule:** you may *add optional fields*. You may never rename, remove or change the type of an existing field.
If a big change is unavoidable: add a new field, write both for a while, then migrate, and ask the owner first.

### 3.1 Zod schemas (put in `schemas/property.ts` and `schemas/user.ts`)
```ts
import { z } from "zod";

export const FurnishingSchema = z.enum(["unfurnished", "semi-furnished", "furnished"]);
export const PropertyTypeSchema = z.enum(["apartment", "villa", "studio", "independent-house", "pg"]);

export const NearbySchema = z.object({
  kind: z.enum(["metro", "it-park", "school", "hospital", "market"]),
  name: z.string().max(80),
  distanceKm: z.number().min(0).max(50),
});

export const PropertySchema = z.object({
  id: z.string(),                         // e.g. "prop-001" (seed) or "prop-<timestamp>"
  schemaVersion: z.literal(2),
  title: z.string().min(3).max(120),
  city: z.string(),
  locality: z.string(),
  address: z.string().max(200),
  rent: z.number().int().positive(),      // INR per month
  deposit: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().min(0).max(10),
  bathrooms: z.number().int().min(1).max(10),
  areaSqFt: z.number().positive(),
  furnishing: FurnishingSchema,
  propertyType: PropertyTypeSchema,
  petFriendly: z.boolean(),
  amenities: z.array(z.string().max(40)).max(20),
  images: z.array(z.string()).min(1).max(10),   // first one is the cover
  lat: z.number().min(-90).max(90),             // approximate for demo data
  lng: z.number().min(-180).max(180),
  nearby: z.array(NearbySchema).max(8).optional(),
  availableFrom: z.string().optional(),         // ISO date
  createdAt: z.string(),                        // ISO timestamp
});
export type Property = z.infer<typeof PropertySchema>;

export const PreferencesSchema = z.object({
  budgetMin: z.number().int().min(0),
  budgetMax: z.number().int().min(0),
  cities: z.array(z.string()).max(5),
  bhk: z.array(z.number().int().min(0).max(6)).max(6),
  furnishing: z.array(FurnishingSchema),
  petFriendly: z.boolean(),
  workplace: z.string().max(80).optional(),     // free text, e.g. "EON IT Park, Pune"
  priorities: z.array(z.enum(["budget", "space", "commute", "safety", "quiet", "greenery", "nightlife"])).max(3),
  notes: z.string().max(300).optional(),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

export const UserDocSchema = z.object({
  uid: z.string(),
  schemaVersion: z.literal(2),
  email: z.string().nullable(),
  displayName: z.string().nullable(),
  isAnonymous: z.boolean(),
  createdAt: z.string(),
  onboardingComplete: z.boolean(),
  preferences: PreferencesSchema.nullable(),
  likedPropertyIds: z.array(z.string()).max(200),
  skippedPropertyIds: z.array(z.string()).max(500),
  lastAiPreferenceText: z.string().nullable().optional(),   // legacy v1 field, kept
});
export type UserDoc = z.infer<typeof UserDocSchema>;
```
Dropped from v1: `price` (purchase price; this is a *rental* app). Legacy aliases (`rentPrice`, `beds`, `baths`, `areaSqft`, `imageUrl`) are accepted
**only** by `normalizeProperty()` below.

### 3.2 `normalizeProperty(raw: unknown): Property | null`
Put in `lib/firestore/normalize.ts`. It maps old/loose shapes to the v2 shape, fills defaults (e.g. `furnishing: "semi-furnished"`,
`images: [imageUrl]`, `amenities: []`), runs `PropertySchema.safeParse`, and returns `null` (and logs the id) instead of throwing. **A bad document must never crash the page.**

## 4. Reading and writing safely
- **Catalogue read:** `getProperties()` = one `getDocs` call (no live listeners). Run every doc through `normalizeProperty`, drop nulls, cache in the store.
  If Firestore is empty, offline or errors → **fall back to `data/seed-properties.ts`** (so the app always shows something).
- **Likes/skips:** never overwrite the whole array. Use `updateDoc(userRef, { likedPropertyIds: arrayUnion(id) })` and `arrayRemove`.
  Batch: collect swipes in memory and flush **1.5 s after the last swipe** and on `visibilitychange`/page hide. (Spark free plan has daily read/write limits; one write per swipe is wasteful.)
- **User doc creation:** on first sign-in create `users/{uid}` with defaults (`onboardingComplete:false`, empty arrays). Use `setDoc(..., { merge:true })` so it is safe to run twice.
- **Never use `onSnapshot` for the catalogue** (it re-reads on every change and burns quota).
- **Every write is validated** with the Zod schema first (`parse`, not `safeParse`, for writes).
- **Timestamps:** use ISO strings (`new Date().toISOString()`), keep it simple and JSON-friendly.

## 5. Seeding demo data (no admin credentials needed)
1. `data/seed-properties.ts` holds the 20 homes in v2 shape (ids `prop-001` … `prop-020`, fixed so seeding is **idempotent**: running twice changes nothing).
2. `/admin` shows a **"Seed demo data"** button (visible only if `admins/<myUid>` exists). It runs `writeBatch` with `set(doc(db,"properties",id), data)` for all 20.
3. Also export a JSON backup of the seed in the repo (`data/seed-properties.json` via a script) so the catalogue can always be rebuilt.

## 6. Test the security rules (do this before launch)
In Firebase console → Firestore → **Rules → Rules Playground**, simulate:
| Request | Expected |
|---------|----------|
| unauthenticated `get /properties/prop-001` | **Allow** |
| unauthenticated `create /properties/x` | **Deny** |
| signed-in non-admin `create /properties/x` | **Deny** |
| signed-in `get /users/<someone else>` | **Deny** |
| signed-in `update /users/<own uid>` with 201 liked ids | **Deny** |
| signed-in `create /admins/<own uid>` | **Deny** |
| admin (has `admins/<uid>`) `create /properties/x` | **Allow** |

## 7. Free-plan (Spark) limits to respect
Firestore free quota per day is roughly 50k reads / 20k writes / 20k deletes (check the Firebase pricing page for current numbers). With 20 seed homes, one fetch per visit is tiny.
Do not add features that read the whole catalogue repeatedly, store chat history, or write per frame/keystroke.

## 8. Data-safety checklist (run before every merge that touches data)
- [ ] No existing field renamed/removed/re-typed
- [ ] New fields are optional or have defaults in `normalizeProperty`
- [ ] Reads go through `normalizeProperty`; writes go through Zod `parse`
- [ ] No `onSnapshot`; no write inside a render or per-frame loop
- [ ] Rules still match doc 03 §6 table; no `allow ... if true` on write
- [ ] No secret in code, logs or git (`git grep -n "AIza\|private_key"` finds nothing)
- [ ] Seed script is idempotent
- [ ] App still works with Firestore **offline** (falls back to seed)
