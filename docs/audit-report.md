# Phases 1–7 Audit Report

## Current requested logo / Urdu / requirements pass (2026-10-15)

| Item | Status | Evidence |
|---|---|---|
| Supplied logo integrated into shared logo, PDF export, and generated PWA assets | DONE | `logoadv.jpeg` identified as JPEG 858×1279; generated `brand-mark.png`; manifest check confirms every icon has its declared dimensions. Firm logo URL remains preferred in PDF export and existing firm upload branches remain present. |
| Requirements trace and mockup confirmation list | DONE | `docs/requirements-trace.md` maps the listed requirements to routes/source; subscription, payments, admin web panel, and OTP are listed for client confirmation. |
| Locale resource parity and unused-key validation | DONE | `npm run i18n:check`: EN_KEYS 214, UR_KEYS 214, MISSING_IN_UR 0, EXTRA_IN_UR 0, UNUSED_KEYS 0. |
| Urdu visual verification | PARTIAL | Playwright `/auth/sign-in` returned 200 with `dir=rtl`; screenshot saved at `web/e2e/screenshots/ur/sign-in.png`. Authenticated screens were not verified. |
| Inline hardcoded-string migration | PARTIAL | Expanded scan reports 116 JSX matches, 84 toast matches, and 9 error-constructor matches (209 raw matches; overlapping categories possible). No claim of zero remaining strings. |
| Typecheck, lint, build, and unit smoke test | DONE | All exited 0; Vitest reports 1 file and 1 test passed. |

**Current pass counts:** DONE 4 / PARTIAL 2 / MISSING 0 / BROKEN 0.

**Last updated:** 2026-10-15  
**Scope:** Stage 1 audit, verified Stage 2 Part 1 (P0/P1 items C–J), and the accepted Stage 2 Part 2 Chunk 2 work (Documents, query errors, uploads, generated types, filter-option pagination). P2 items outside this chunk, Stages 3–4, and Phase 8 remain out of scope.

## Verification commands and results

| Check | Result |
|---|---|
| `npm install` | First attempt failed with `ENOENT`/`chmod` for `node_modules/semver/bin/semver.js`; a subsequent retry completed successfully using `--package-lock=false --ignore-scripts --no-audit --no-fund`. No manifest or lockfile was intentionally changed. |
| `npx supabase db push --db-url ... --dry-run` | Initial retry showed only migration `20240006000000_stage2_p0_p1.sql` pending; after applying migrations 006 and 007, final dry-run reported `Remote database is up to date.` |
| `npx supabase migration list --db-url ...` | Remote history lists migrations `20240001000000` through `20240007000000` in order, all matching local history. |
| `node supabase/scripts/verify-stage2-part1.mjs` | **9/9 checks passed** with the admin, lawyer, and clerk authenticated by the public anon key. Service role was used only for fixtures/cleanup and administrative reads. |
| `node supabase/scripts/reset-demo-data.mjs` | Restored the remote dev demo set: firms 1, profiles 3, clients 10, cases 25, hearings 30, reminders 0. |
| `node supabase/scripts/verify-seed.mjs` | **PASS**; three identical runs (1 firm, 3 profiles, 10 clients, 25 cases, 30 hearings, 0 reminders), all required Karachi-date seed metrics passed, including 0 invalid date-order rows and 9 cases with Urdu party names. |
| `generate_reminders()` (remote dev) | **PASS**; processed 21 cases, created 34 reminders, closed 0; total/upcoming counts were 34/34. |
| `node supabase/scripts/verify-filter-options.mjs` | **PASS**; inserted 620 temporary hearings, lawyer JWT returned all 620 distinct test courts and judges, missing values 0/0, cleanup left 0 temporary rows and restored total hearings to 30. |
| `npx supabase gen types typescript --project-id zxxpsvhlekemgccrcwtg --schema public` | Passed against the remote project. Output was not allowed to overwrite application aliases; generated typed relationships remain in `web/types/supabase.ts`. |
| `npx tsc --noEmit` (serial run) | Passed. A first concurrent run overlapped `next build` regenerating `.next/types` and failed transiently; serial rerun passed. |
| `npm run lint` | Passed. |
| `npm run build` (`next build`) | Passed; all 32 static pages generated. |
| Current handoff verification (2026-10-14) | `npm ci` in `web/` passed; `npx tsc --noEmit`, `npm run lint`, and `npm run build` all exited 0; build generated 32 static pages. `supabase/scripts/npm ci`, reset-demo, seed verification (including final 34/34 reminders), Stage 2 Part 1 (9/9), and document-delete real-JWT verification passed. Clerk storage/row deletes denied; own-firm lawyer and admin storage/row deletes succeeded; second-firm lawyer storage/row deletes denied. Cleanup: 0 temp document rows, 0 temp objects, temp firm/user removed. Root migration list: 8 local = 8 remote. No Phase 8 work started. |
| Generated Supabase types | `supabase gen types typescript --project-id zxxpsvhlekemgccrcwtg --schema public` completed; 1,272 generated lines were written to a temporary file, leaving application types untouched. |
| `supabase db reset` | Not run; Docker is unavailable and the approved verification target is the remote dev project. No reset or destructive operation was performed. |
| Seed load | Earlier setup verification seeded the remote dev project. The revised seed file now also fills missing seeded-case hearings and includes the requested date cases; this latest seed revision was not re-run during this verification pass. |
| Automated tests | No Vitest/Playwright suite was run. The requested re-runnable remote verification script is `supabase/scripts/verify-stage2-part1.mjs`; P2 and Stages 3–4 remain unstarted. |

### Stage 2 Part 1 remote verification evidence

- **C:** Lawyer JWT attempts to change own role, firm, and active state left all values unchanged. Admin JWT changed an own-firm clerk role; an outside-firm role stayed unchanged.
- **D:** Private `documents` and public `avatars` buckets exist. Own-firm document and own-avatar writes passed; cross-firm document read/write, clerk document deletion, and writing to another user's avatar path were denied.
- **E:** Case and first hearing were created together. An invalid first-hearing date failed and left no case.
- **F:** Valid update completed the old hearing and created the new hearing. A next date equal to the old hearing date was rejected with no partial changes.
- **G:** Same-date hearings produced exactly one latest row and honored `created_at DESC`. Outcome/year/type/court server filters returned 21 matching fixtures across pages of 20 and 1.
- **H:** Reopen produced exactly one `case_reopened` activity entry with the reason in its summary and metadata.
- **I:** Decision dismissed the reminder and logged one activity entry. A rejected decision left no document metadata or activity entry.
- **J:** Source assertions confirmed the guard waits for session/profile loading, redirects a missing profile, and keeps protected children behind the loading state.
- **Reminder boundary:** `generate_reminders(p_today)` created one upcoming reminder for exactly +10 days, none for +11 days, and did not duplicate the reminder on a second run.

## Architecture and source scans

- **Architecture violations found:** none in the searched application source. No server actions (`"use server"`), API routes, middleware, `getServerSideProps`, `cookies()`/`headers()` usage, or dynamic route segments were found. The app uses static page routes and query-string IDs, which are compatible with the configured static export.
- **Explicit unfinished routes:** No query-backed page in the scanned application was left without the shared retry error state. `/hearings/new` redirects to the shared Update Hearing flow. Ordinary form `placeholder` attributes are not counted as unfinished feature placeholders.
- **TODO/FIXME, lorem ipsum, mock data, `console.log`:** no matches in the searched source/config files.
- **`any` escape hatches:** No matches for `: any`, `as any`, or `<any>` in `web/**/*.ts` or `web/**/*.tsx` after this chunk. Cause-list and case joins use generated/explicit row types.
- **Hardcoded colors and strings:** literal color declarations are present in brand/design-system configuration and styles. Numerous user-facing English literals also remain inline in pages/components rather than going through translation keys; examples include case/reminder actions and form labels. This is an i18n consistency issue, not an architecture violation.
- **Static assets:** `web/public/manifest.json` references `/icons/icon-*.png`; all nine referenced PNG assets are present in `web/public/icons`. The service worker implements push/click handlers, but browser push delivery has not been configured or run in Chrome.

## Phase checklist

Status definitions: `[DONE]` verified complete; `[PARTIAL]` implemented but incomplete, buggy, or not fully runtime-verified; `[MISSING]` absent; `[BROKEN]` a demonstrated blocker or defect. Remote verification applies to Stage 2 Part 1 behaviors listed above; unrelated database and UI behavior remains unverified.

### Phase 1 — Foundation (DONE 3 / PARTIAL 3 / MISSING 0 / BROKEN 0)

- [PARTIAL] Core schema, relationships, timestamps, and later-phase tables are declared across the SQL migrations, but the migrations could not be applied to a fresh database; `supabase/migrations/20240001000000_initial_schema.sql`, `20240002000000_case_notes_softdelete.sql`, `20240003000000_activity_log.sql`, `20240004000000_reminders_notifications.sql`.
- [PARTIAL] Required hearing/case indexes and trigram indexes are present in migration source, but their creation and query behavior were not database-tested; `supabase/migrations/20240001000000_initial_schema.sql`.
- [DONE] Profile escalation is blocked by a column-guard trigger and RLS, and storage buckets/policies are active. Real JWT checks verified role/firm/active escalation protection and document/avatar access; `supabase/migrations/20240006000000_stage2_p0_p1.sql`, `supabase/migrations/20240007000000_storage_policy_guards.sql`.
- [DONE] `v_cause_list` has a deterministic latest hearing ordered by hearing date, creation time, and ID. Remote verification confirmed exactly one latest row for same-date hearings; `supabase/migrations/20240006000000_stage2_p0_p1.sql`.
- [DONE] Supabase CLI config and seed UUID/auth setup were corrected and the remote dev database has applied migrations through `20240007000000`. The current expanded seed revision was not re-run in this pass; `supabase/config.toml`, `supabase/seed.sql`, `supabase/scripts/seed-users.mjs`.
- [PARTIAL] Design-system route and English/Urdu resources exist, but LTR/RTL rendering was not visually exercised in a browser; `web/app/design-system/page.tsx`, `web/i18n/`.

### Phase 2 — Auth & Shell (DONE 3 / PARTIAL 4 / MISSING 0 / BROKEN 0)

- [PARTIAL] Email/password, remember-email, forgot-password, and feature-flagged SMS OTP flows exist; phone-plus-password authentication is not implemented, and authentication flows were not tested against Supabase; `web/app/auth/sign-in/page.tsx`, `web/app/auth/forgot-password/page.tsx`.
- [DONE] Client-side guards wait for session and profile loading, then redirect missing profiles and unauthorized roles; remote profile resolution was checked and source assertions verified the guard path. Database RLS remains the security boundary; `web/hooks/useRequireAuth.ts`, `web/providers/AuthProvider.tsx`, `web/components/shared/RouteGuard.tsx`.
- [PARTIAL] Responsive shell/navigation code exists, but one-nav-per-breakpoint behavior has not been verified at mobile and desktop sizes; `web/components/layout/`.
- [PARTIAL] Dashboard and hearing preview query code exists, but live counts and preview behavior could not be checked without a working Supabase database; `web/app/page.tsx`, `web/hooks/`.
- [DONE] Avatar uploads use a separate public `avatars` bucket and `{user_id}/...` path; private document uploads remain firm-scoped. Real JWT tests verified own-avatar and own-firm document writes and denied cross-firm/foreign-user access; `web/app/profile/page.tsx`, `web/components/documents/DocumentUploader.tsx`, migrations `20240006000000` and `20240007000000`.
- [PARTIAL] More/profile screens and English/Urdu resources exist, but inline English strings remain and RTL/language-switch behavior was not browser-tested; `web/app/more/page.tsx`, `web/app/profile/page.tsx`, `web/i18n/locales/`.
- [DONE] Query-backed pages and shared lists render the shared `QueryErrorState` with a Retry action; direct duplicate-check read failures are surfaced in toasts. Coverage was inventoried and TypeScript/build checks passed; `web/components/ui/QueryErrorState.tsx`, query-backed app pages and list components.

### Phase 3 — Clients & Documents (DONE 0 / PARTIAL 5 / MISSING 0 / BROKEN 0)

- [PARTIAL] Client list/search/filter/pagination and duplicate-warning code exist, but end-to-end behavior and server error handling were not verified; `web/app/clients/page.tsx`, `web/hooks/useClients.ts`.
- [PARTIAL] Add/edit client forms implement CNIC and phone normalization, WhatsApp same-as-phone, and duplicate checks; validation and draft retention across the multi-step flow were not exercised; `web/app/clients/new/page.tsx`, `web/app/clients/edit/page.tsx`, `web/lib/phone.ts`.
- [PARTIAL] Reusable uploader, compression, signed URLs, preview, and delete code use provisioned firm-scoped storage. Oversized/unsupported files now report filename and limits/types, and XHR upload progress is measured; browser interaction was not manually exercised; `web/components/documents/DocumentUploader.tsx`, `web/components/cases/MarkDecidedModal.tsx`, `web/lib/supabase/client.ts`.
- [PARTIAL] Client profile tabs, edit, case display, and deactivate flow exist; live case/document behavior and error states were not verified; `web/app/clients/view/page.tsx`.
- [PARTIAL] Standalone `/documents` now reuses the Documents module for firm-wide name search and client/case/type filters, signed view/download, and role-guarded delete; clerk deletion is hidden and denied by database policy. Browser interactions were not manually exercised; `web/app/documents/page.tsx`, `web/components/documents/DocumentsModule.tsx`, `web/components/documents/DocumentList.tsx`.

### Phase 4 — Cases (DONE 1 / PARTIAL 4 / MISSING 0 / BROKEN 0)

- [DONE] Case creation uses `create_case_with_first_hearing` atomically and surfaces RPC failures. A real lawyer JWT created both records together; a forced invalid hearing date left no orphan case; `web/hooks/useCases.ts`, migration `20240006000000`.
- [PARTIAL] Case detail includes overview, hearing history, documents, and notes code, but related queries and permissions were not runtime-tested; `web/app/cases/view/page.tsx`.
- [PARTIAL] Case edit form and update mutation exist; field validation and saved values were not exercised against the database; `web/app/cases/edit/page.tsx`, `web/hooks/useCases.ts`.
- [PARTIAL] Case-type and court settings pages and role-aware controls exist, but admin enforcement and CRUD were not tested against RLS; `web/app/settings/case-types/page.tsx`, `web/app/settings/courts/page.tsx`.
- [PARTIAL] Soft-delete/action UI and database delete policies exist, but full authorization behavior was not tested; `web/app/cases/view/page.tsx`, initial schema case policies.

### Phase 5 — Cause List (DONE 3 / PARTIAL 4 / MISSING 0 / BROKEN 0)

- [DONE] Today and running-case screens use the shared `CauseListView` component rather than separate table implementations; `web/components/cases/CauseListView.tsx`, `web/app/cause-list/page.tsx`, `web/app/cases/running/page.tsx`.
- [PARTIAL] Shared cause-list view and column data include the requested hearing/case fields, but display, edit controls, and Urdu PDF rendering were not browser-verified; `web/components/cases/CauseListView.tsx`.
- [PARTIAL] Today date navigation and inline quick-edit code exist, but ordering and persistence were not tested with seeded hearings; `web/app/cause-list/page.tsx`, `web/hooks/useHearings.ts`.
- [DONE] Running list implements filters, debounced search, sorting, and server-side pagination. Filter-option discovery is paginated without a 500-row cap; a lawyer JWT returned all 620 temporary court and judge values, then teardown restored the baseline; `web/app/cases/running/page.tsx`, `web/hooks/useHearings.ts`, `supabase/scripts/verify-filter-options.mjs`.
- [DONE] Hearing completion and new-hearing insertion use the atomic `update_hearing` RPC; validation requires the next date to exceed the existing hearing date. Remote JWT checks confirmed valid updates and rejected invalid dates without partial changes; `web/hooks/useHearings.ts`, `web/components/cases/UpdateHearingSheet.tsx`, migration `20240006000000`.
- [PARTIAL] PDF export/print/share code exists, but output quality and Urdu text rendering were not verified; `web/lib/exportPdf.ts`, cause-list components.
- [DONE] `/hearings/new` redirects to the shared Update Hearing flow, which can open the selected case's update sheet; `web/app/hearings/new/page.tsx`, `web/app/cases/running/page.tsx`, `web/components/cases/CauseListView.tsx`.

### Phase 6 — Decided Cases (DONE 2 / PARTIAL 3 / MISSING 0 / BROKEN 0)

- [PARTIAL] Mark-decided status, reminder closure, activity logging, and document metadata insertion are one RPC transaction. RPC rejection rollback was verified; the UI's storage upload compensation path was not forced through a browser; `web/components/cases/MarkDecidedModal.tsx`, `web/hooks/useActivityLog.ts`, migration `20240006000000`.
- [DONE] Outcome, year, case-type ID, and court filters are applied server-side before pagination. A remote query returned 21 matching fixtures across pages of 20 and 1; the UI includes the court filter; `web/app/cases/decided/page.tsx`, `web/hooks/useCases.ts`.
- [PARTIAL] Decided-case detail/read-only presentation and document controls are implemented, but access, filtering, and file operations were not database-tested; `web/app/cases/view/page.tsx`.
- [DONE] Reopen uses one RPC and the status trigger stores the reason in the single activity row. Remote verification confirmed exactly one reason-bearing row; `web/hooks/useActivityLog.ts`, `web/components/cases/ReopenCaseModal.tsx`, migration `20240006000000`.
- [PARTIAL] Client profile separates running and decided cases, but case history and decision displays were not verified with seeded data; `web/app/clients/view/page.tsx`.

### Phase 7 — Reminders & Notifications (DONE 0 / PARTIAL 6 / MISSING 0 / BROKEN 0)

- [PARTIAL] Reminder generation, idempotency keys, close/replace logic, summary function, 01:00 UTC (06:00 Pakistan) cron schedules, and Realtime publication setup exist in SQL. The remote date-boundary/idempotency function check passed; scheduled execution and Realtime behavior remain unverified; `supabase/migrations/20240004000000_reminders_notifications.sql`, `supabase/migrations/20240005000000_phase7_reminder_delivery.sql`, `supabase/migrations/20240006000000_stage2_p0_p1.sql`.
- [PARTIAL] Upcoming/Done/Dismissed tabs and reminder actions exist; reminders, undo, urgency, and Realtime behavior were not exercised against PostgreSQL; `web/app/reminders/page.tsx`, reminder hooks.
- [PARTIAL] Inbox, read-state, filtering, Realtime subscription, and badge code exist, but delivery and badge updates were not run with Supabase Realtime; `web/app/notifications/page.tsx`, notification hooks, navigation components.
- [PARTIAL] User preferences and admin firm default controls exist, but RLS/RPC effects were not tested; `web/app/settings/notifications/page.tsx`, `supabase/migrations/20240005000000_phase7_reminder_delivery.sql`.
- [PARTIAL] Daily summary SQL and cron job are present, but scheduled execution and counts were not verified; `supabase/migrations/20240005000000_phase7_reminder_delivery.sql`.
- [PARTIAL] Edge Function contains Web Push/FCM dispatch code and a service worker handles push clicks. All manifest icon targets are present, but secrets, subscriptions, endpoint delivery, and desktop Chrome behavior were not configured or tested; `supabase/functions/send-push/index.ts`, `web/lib/push.ts`, `web/public/sw.js`, `web/public/manifest.json`.

## Cross-cutting findings

- Query-backed screens use one shared retryable error component. Direct duplicate checks now check returned errors and surface failures instead of silently treating them as no duplicates.
- Date utilities and database functions use Asia/Karachi in key places, but the entire app was not exhaustively checked for timezone/date-format consistency.
- No service-role key was found in client-side source during the scan; it is referenced by the Edge Function as an environment secret.
- Urdu input/output paths and RTL support exist, but no browser/database round-trip test was possible.
- Duplicate/inconsistent code: the duplicate `app/cases/decide/page.tsx` form was removed in Stage 2 Part 1. Joined case/cause-list data now uses generated and explicit relationship types; the cause-list case-type filter uses IDs consistently. The main Today/Running cause-list table is shared.

## Phase status summary

| Phase | DONE | PARTIAL | MISSING | BROKEN |
|---|---:|---:|---:|---:|
| 1 — Foundation | 3 | 3 | 0 | 0 |
| 2 — Auth & Shell | 3 | 4 | 0 | 0 |
| 3 — Clients & Documents | 0 | 5 | 0 | 0 |
| 4 — Cases | 1 | 4 | 0 | 0 |
| 5 — Cause List | 4 | 3 | 0 | 0 |
| 6 — Decided Cases | 2 | 3 | 0 | 0 |
| 7 — Reminders & Notifications | 0 | 6 | 0 | 0 |
| **Total** | **13** | **28** | **0** | **0** |

## Remaining work outside this approval

- Stage 2 Part 1 P0/P1 items C–J are implemented and the remote behaviors listed above passed verification.
- Complete Urdu translation coverage, responsive/RTL checks, and end-to-end push delivery remain unfinished. PWA manifest icons are present. The Documents page, shared query errors, upload validation/progress, `any` cleanup, and filter-option pagination are implemented; browser interactions were not manually exercised.
- Stage 3 automated tests and Stage 4 manual checklist have not started.

**Stage 2 Part 1 verification completed 2026-10-12; accepted Chunk 2 work verified 2026-10-13.** P2 items outside this chunk, Stages 3–4, and Phase 8 were not started.
## Chunk 3 — M/N/P verification (2026-10-14)

| Chunk 3 item | Status | Evidence / remaining work |
|---|---|---|
| M1 hardcoded UI strings | PARTIAL | AST scan: 207 JSX text candidates, 106 static UI attribute candidates, and 37 toast calls with literal arguments. A representative `rg -n` scan still finds English in auth, document upload, and document-list UI. These strings were not fully migrated; this item is not complete. |
| M2 locale parity and checker | DONE | `npm run i18n:check`: EN_KEYS 214, UR_KEYS 214, MISSING_IN_UR 0, EXTRA_IN_UR 0, UNUSED_KEYS 0. The checker scans static translation calls and interpolated namespace prefixes. 68 source-unreferenced locale keys were removed from both locale files. |
| M3 RTL/logical classes | DONE | Physical directional utility count measured against `chunk2-verified`: 87 before, 0 after. `LangProvider` updates html lang/dir and toggles `font-urdu`; global CSS loads Noto Nastaliq Urdu and mirrors arrow/chevron icons. |
| M4 date formatting | DONE | User-visible date values call `fmtDate` in `web/lib/utils.ts`, which formats timestamps in Asia/Karachi as `dd MMM yyyy`; date-only values preserve their calendar date. Reminder cards now use the helper. |
| N1/N2 logo-derived PWA assets | DONE | Source `web/public/logo/mzm-mark.svg`; Sharp generator creates 72/96/128/144/152/180/192/384/512 icons, separate maskable 512, and 64 favicon. Manifest checker passed all 10 icon dimension checks. |
| N3 logo usage | DONE | Shared `Logo` component renders `/logo/mzm-mark.svg`; it is used by splash, sign-in, and Header. Mobile/sidebar firm-logo branches retain configured firm branding and use the shared logo fallback. |
| P1/P2 smoke test setup | DONE | Added typecheck/test/test:watch/test:e2e/i18n:check scripts, Vitest, Playwright, Sharp and coverage dependencies. Vitest smoke: 1/1 passed. Playwright `/auth/sign-in/` smoke: 1 passed. |
| Final checks | DONE | TypeScript, lint, build (32 static pages), i18n checker, npm test, and the single Playwright smoke test exited successfully. |

**Chunk 3 subtotal:** DONE 8 / PARTIAL 1 / MISSING 0 / BROKEN 0.  
**Tag:** `chunk3-verified` was not created because M1 remains partial.
