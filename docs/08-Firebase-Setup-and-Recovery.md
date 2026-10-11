# 08 — Firebase Setup and "Localhost Won't Open" Recovery

## 1. Why localhost may not open (check in this order, 10 minutes)
You said the site does not open. I could not see your repo, so these are the most likely causes, most likely first:

1. **Missing or wrong `.env.local`.** The old Firebase project is gone and `lib/firebase.ts` checks the config at start-up, so the whole app can crash on load. -> Fix with section 2 below.
2. **Old Node version.** Firebase now needs Node 24.12+. Run `node -v`. If lower, install Node 24 LTS, close and reopen the terminal.
3. **Old `node_modules` after 8 months.** Run (Windows PowerShell):
   `Remove-Item -Recurse -Force node_modules, .next` then `npm install` then `npm run dev`
   (Mac/Linux: `rm -rf node_modules .next && npm install && npm run dev`)
4. **Port busy.** If the terminal says port 3000 is in use, use the URL it prints (maybe 3001), or close the other process.
5. **Missing `service-account.json`** (old Vertex mode). Only AI routes need it; the page should still open. Phase 1 removes this dependency.
6. **Read the FIRST red error** in the terminal and the browser console (F12 -> Console). Paste it to Claude if it is not one of the above.

Phase 1 of the build guide fixes all of this on a clean base, so you do not need to debug the old setup for long.

## 2. Create the new Firebase project (about 15 minutes)
1. Go to console.firebase.google.com -> **Add project** -> name it `propswipe` -> Google Analytics: **off** (not needed).
2. **Project settings (gear) -> General -> Your apps -> Web (`</>`)** -> register app "propswipe-web". Copy the config values into `.env.local`:
   `apiKey -> NEXT_PUBLIC_FIREBASE_API_KEY`, `authDomain -> ..._AUTH_DOMAIN`, `projectId -> ..._PROJECT_ID`, `storageBucket -> ..._STORAGE_BUCKET`, `messagingSenderId -> ..._MESSAGING_SENDER_ID`, `appId -> ..._APP_ID`.
3. **Build -> Authentication -> Get started -> Sign-in method:** enable **Email/Password** and **Google** (pick a support email).
4. **Authentication -> Settings -> Authorized domains:** `localhost` is there by default. Add your Vercel domain later.
5. **Build -> Firestore Database -> Create database** -> region **asia-south1 (Mumbai)** -> start in **production mode**.
6. **Firestore -> Rules** -> paste the contents of `firestore.rules` -> **Publish**.
7. Run the app, sign in once. Then **Authentication -> Users** -> copy your **User UID**.
8. **Firestore -> Start collection** `admins` -> Document ID = your UID -> add any field (e.g. `role: "admin"`) -> Save. (The rules only check that the document exists.)
9. **Admin SDK key (server):** Project settings -> **Service accounts -> Generate new private key**. A JSON file downloads.
   Turn it into one line (base64):
   - Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\key.json"))`
   - Mac/Linux: `base64 -w0 key.json` (Mac: `base64 -i key.json`)
   Paste the result into `FIREBASE_ADMIN_CREDENTIALS_BASE64=` in `.env.local`. **Then delete the JSON file** from your Downloads and never put it in the repo.
10. **Gemini key:** aistudio.google.com/apikey -> create key -> `GEMINI_API_KEY=` in `.env.local`. If `gemini-3.8-flash` gives an error on your key, set `GEMINI_MODEL=gemini-3.5-flash-lite`.
11. Restart `npm run dev`.

## 3. `.env.local` checklist
- File is in the project root (next to `package.json`), named exactly `.env.local`.
- No quotes needed, no spaces around `=`.
- Restart the dev server after every edit.
- It is listed in `.gitignore` (lines in `.gitignore.additions`).

## 4. Rotating old secrets (do this if the old repo was ever public or pushed)
- Delete the old Gemini API key in AI Studio and make a new one.
- Delete any old service-account keys in Google Cloud Console -> IAM -> Service accounts -> Keys.
- Old Firebase web config values are not secret, but they belong to the old project, which is gone, so replace them anyway.

## 5. Quick rule tests (Firebase console -> Firestore -> Rules -> Rules Playground)
- Unauthenticated `get /properties/1` -> **allowed**
- Authenticated (not admin) `create /properties/x` -> **denied**
- Authenticated as `uid-A` `get /users/uid-B` -> **denied**
- Authenticated as `uid-A` `update /users/uid-A` -> **allowed**

## 6. Free-plan limits to keep in mind
Firestore free tier is plenty for a portfolio demo, but avoid loops that read the whole collection on every render. Load once per session (the store already does).
