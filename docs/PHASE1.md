# Phase 1 — Foundation

## What Was Built

| Area | Details |
|------|---------|
| Repo structure | `/web` (Next.js), `/supabase` (migrations, seed, config), `/docs` |
| Next.js 14 | App Router, TypeScript, static export (`output: 'export'`), no SSR/API routes |
| Tailwind v3 | Brand tokens: gold `#8A6414`, navy `#0B1B3A`, offwhite `#F7F7F4`, success/danger. Fonts: Playfair Display, Cormorant, Inter, Noto Nastaliq Urdu |
| Brand constants | `lib/brand.ts` — timezone, date format, colours |
| Utilities | `lib/utils.ts` — `cn()`, `fmtDate()`, `todayKarachi()`, `isUrdu()`, `vsLabel()` |
| MZM Logo | `components/shared/Logo.tsx` — gold monogram shield + navy wordmark, 4 sizes, mark-only variant |
| i18n | English + Urdu JSON, `i18n/config.ts`, `I18nProvider`. Language auto-detected from `localStorage → navigator` |
| Responsive shell | `AppShell` → `Sidebar` (desktop, fixed left, navy) + `BottomNav` (mobile, 5 items) + `TopBar` (mobile) |
| Providers | `QueryProvider` (TanStack Query), `AuthProvider` (Supabase auth + profile), `I18nProvider` |
| Supabase client | `lib/supabase/client.ts` — typed singleton, env-var validated |
| TypeScript types | `types/supabase.ts` — full `Database` generic map for all 8 tables |
| PWA | `public/manifest.json` (all icon sizes, shortcuts), `public/sw.js` (push + click handler) |
| Capacitor | `capacitor.config.ts` — app ID `pk.mzm.casemanagement`, `webDir: "out"`, SplashScreen, StatusBar |
| DB Schema | `supabase/migrations/20240001000000_initial_schema.sql` — 8 tables, enums, triggers, RLS on every table |
| Seed data | `supabase/seed.sql` — 8 courts, 3 clients, 3 cases, 3 hearings |
| UI primitives | `LoadingSpinner`, `PageLoader`, `EmptyState`, `ErrorState`, `StatusBadge`, `Badge` |

## Files Created

```
hafizzahid/
├── .gitignore
├── web/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── capacitor.config.ts
│   ├── .env.local.example
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── auth/sign-in/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navItems.ts
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── TopBar.tsx
│   │   ├── shared/
│   │   │   └── Logo.tsx
│   │   └── ui/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       └── Badge.tsx
│   ├── i18n/
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── ur.json
│   ├── lib/
│   │   ├── brand.ts
│   │   ├── utils.ts
│   │   └── supabase/client.ts
│   ├── providers/
│   │   ├── QueryProvider.tsx
│   │   ├── I18nProvider.tsx
│   │   └── AuthProvider.tsx
│   ├── types/
│   │   └── supabase.ts
│   └── public/
│       ├── manifest.json
│       └── sw.js
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   └── migrations/
│       └── 20240001000000_initial_schema.sql
└── docs/
    └── PHASE1.md
```

## How to Run / Test

### 1 — Install dependencies
```powershell
cd web
npm install
```

### 2 — Configure environment
```powershell
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 3 — Start Supabase locally (optional)
```powershell
# Install Supabase CLI first: https://supabase.com/docs/guides/cli
supabase start
supabase db push   # applies migration
# Then seed: psql -U postgres -d postgres -f supabase/seed.sql
```
Or use your Supabase cloud project — paste the migration SQL in the SQL Editor.

### 4 — Run dev server
```powershell
npm run dev
# Opens http://localhost:3000
```

### 5 — Static export (for Capacitor)
```powershell
npm run build
# Output in web/out/
```

### 6 — Capacitor (after first install)
```powershell
npx cap add android
npx cap add ios
npm run build
npx cap sync
npx cap open android
```

## Assumptions Made

1. **`From` field** — stored as `plaintiff | defendant` enum and labelled "From/For" in the UI as specified.
2. **`requires_offence`** — implemented as a DB check constraint (`case_type = 'criminal' → offence NOT NULL`) and enforced in the UI by showing/hiding the Offence field. No separate `case_types.requires_offence` lookup table (kept simpler).
3. **Auth is invite-only** — `enable_signup = false` in `supabase/config.toml`. Admins create user accounts via Supabase dashboard or an Edge Function (Phase 3).
4. **Storage bucket** — the `documents` storage bucket setup is commented-out SQL at the bottom of the migration (Supabase requires bucket creation via dashboard or CLI, not raw SQL in migrations).
5. **Icon files** — `public/icons/*.png` files are referenced but not generated; you will need to provide a 512×512 source image and use a PWA icon generator (e.g. https://realfavicongenerator.net).
6. **Logo SVG** — `components/shared/Logo.tsx` renders the monogram in code. A proper SVG file can replace it in Phase 2 if a designer provides one.
7. **pg_cron** — included in the migration; it must be enabled on your Supabase project (Settings → Database → Extensions). The actual cron job for sending push notifications will be wired in Phase 3 (Push / Reminders).
8. **RTL layout** — Urdu strings are marked `dir="rtl"` on individual elements via `textDir()` utility. Full page RTL flip is available via the `.urdu` CSS class; a full `html dir="rtl"` toggle will be added in Phase 2 when the language switcher is built.

## What Needs Your Decision

| # | Question |
|---|---------|
| 1 | **App icons**: Can you provide a 512×512 MZM logo PNG? I'll generate all PWA icon sizes from it. |
| 2 | **Supabase project**: Should I target a cloud Supabase project (give me the URL/keys) or keep local dev for now? |
| 3 | **Firebase project**: Do you have an existing Firebase project for FCM, or shall I add setup steps in Phase 3? |
| 4 | **User roles**: Admin creates users — should there be a UI for this (admin panel), or is Supabase dashboard sufficient? |
| 5 | **Multiple lawyers**: Should each lawyer see only their own cases, or all cases? (Current RLS: all authenticated users read all cases.) |
| 6 | **Cause list view**: Should "Today's Cause List" show ALL cases with a hearing today (firm-wide), or only the logged-in lawyer's cases? |
| 7 | **Document types**: Any specific list of document types (e.g., Vakalatnama, Plaint, Affidavit…) or free-text? |
