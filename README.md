# Aanu

**Upload it. Understand it. Keep it.**

Aanu re-teaches any uploaded document (lecture notes, textbook chapters, past
questions, scanned handouts) back to the student in plain language, broken
into topic -> subtopic, with a short quiz after every subtopic.

## What's in this starter

This folder is a working scaffold: Next.js app shell, the Supabase schema +
Row-Level-Security migration, the file-parsing pipeline (PDF/DOCX/TXT/OCR,
including scanned-PDF rasterization), and the Claude-powered
segmentation/reteach/quiz module (`src/lib/ai/reteach.ts`). Data-access layer
and UI components are the next layer to build on top.

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
   - `ANTHROPIC_API_KEY` — from https://console.anthropic.com/settings/keys
     (this is the one paid dependency in the stack — low-cost pay-as-you-go,
     not a free tier)
4. **Run the database migration** — in the Supabase dashboard, open the SQL
   editor and run the contents of `supabase/migrations/0001_init.sql`.
5. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 — you should see the Aanu starter page.

## Cost note

Every other service here (Supabase, Vercel) has a free tier sufficient for a
portfolio project. The Anthropic API does not — usage is billed per token,
though the cost for this project's realistic volume is low. All AI calls are
isolated behind `src/lib/ai/reteach.ts` so the model/provider can be swapped
later.

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
