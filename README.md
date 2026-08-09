# Aanu

**Upload it. Understand it. Keep it.**

Aanu re-teaches any uploaded document (lecture notes, textbook chapters, past
questions, scanned handouts) back to the student in plain language, broken
into topic -> subtopic, with a short quiz after every subtopic.

## What's in this starter

This folder is a working scaffold: Next.js app shell, the Supabase schema +
Row-Level-Security migration, the file-parsing pipeline (any file type up to
70MB, PDF/DOCX/TXT/OCR including scanned-PDF rasterization), and the
Gemini-powered segmentation/reteach/quiz module (`src/lib/ai/reteach.ts`).
Data-access layer and UI components are the next layer to build on top.

## Local setup (do these in order)

1. **Install Node.js LTS** from https://nodejs.org if you haven't already.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create your local env file:**
   ```bash
   cp .env.example .env.local
   ```
   Then fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
     — from a free project at https://supabase.com
   - `GEMINI_API_KEY` — from https://aistudio.google.com/app/apikey
     (free tier available, rate-limited — no payment required to get started)
4. **Run the database migrations** — in the Supabase dashboard, open the SQL
   editor and run the contents of `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_widen_uploads.sql`, in that order.
5. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 — you should see the Aanu starter page.

## Auth

Email/password auth is wired up via Supabase:
- `/signup` — creates an account, sends a confirmation email
- `/login` — signs in, redirects to `/library`
- `/auth/callback` — handles the confirmation-email redirect
- `/library` — a protected page; `src/middleware.ts` redirects anyone
  not logged in back to `/login` for any dashboard route

One extra Supabase setting to check: in your Supabase dashboard, go to
**Authentication → URL Configuration** and make sure `http://localhost:3000/auth/callback`
is added under **Redirect URLs** — otherwise the confirmation email link
won't come back to your local app correctly.

## Uploads

- Any file type is accepted, up to **70MB** (enforced client-side and in the
  Supabase Storage bucket's `file_size_limit`).
- Files can be deleted from `/library` — this removes the file from Storage
  and its `documents` row; related `topics`/`subtopics`/`quizzes`/
  `user_progress` rows are removed automatically via `ON DELETE CASCADE`
  foreign keys already defined in `0001_init.sql`.
- **Architecture note on images:** the current parsing pipeline
  (`src/lib/parsing/`) OCRs images and scanned PDFs into plain text before
  anything reaches the AI layer, per the original "ingest → clean text"
  design. `lib/ai/reteach.ts` also supports passing an image directly to
  Gemini's multimodal input (`reteachSubtopic(title, excerpt, images)`) as an
  alternative to OCR — but nothing in the processing pipeline calls it that
  way yet. Whether image uploads should skip OCR and go straight to Gemini
  multimodal instead is an open decision for whoever wires up the actual
  processing route.

## Cost note

Every service here has a free tier sufficient for a portfolio project,
including the Gemini API (rate-limited on the free tier — a "please try
again" message is shown if a request is rate-limited or fails). All AI calls
are isolated behind `src/lib/ai/reteach.ts` so the model/provider can be
swapped again later.

## Turning this into an installable Android app

Once deployed to a live HTTPS URL (e.g. Vercel), this project can be wrapped
as an Android app with Capacitor:

```bash
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
npx cap add android
```

Then edit `capacitor.config.ts` (already included in this scaffold) with
your real `appId` and deployed `server.url`, and run:

```bash
npx cap sync
npx cap open android
```

This opens Android Studio with a ready-to-run native project pointed at your
live site.
