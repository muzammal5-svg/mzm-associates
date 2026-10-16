# Client requirements trace

Source review dated 2026-10-16. `DONE (browser)` means verified via Playwright screenshot or script check in this session. `CODE-ONLY` means the route/component/control is present in source but not live-service tested. `DONE (script)` means verified via automated script (tsc, lint, build, i18n:check).

| Requirement | Route / source | Status |
|---|---|---|
| Header: profile picture, user name, firm logo | `web/components/layout/Sidebar.tsx`, `MobileHeader.tsx`, `DesktopTopBar.tsx`, `web/providers/AuthProvider.tsx` | CODE-ONLY |
| Services: Add new client | `/clients/new`, `web/app/page.tsx` | CODE-ONLY |
| Services: New case entry | `/cases/new`, `web/app/page.tsx` | CODE-ONLY |
| Services: Today's cause list | `/cause-list`, `web/app/page.tsx` | CODE-ONLY |
| Services: All running cases | `/cases/running`, `web/app/page.tsx` | CODE-ONLY |
| Services: Reminder | `/reminders`, `web/app/page.tsx` | CODE-ONLY |
| Services: Decided cases | `/cases/decided`, `web/app/page.tsx` | CODE-ONLY |
| Services: Clients | `/clients`, `web/app/page.tsx` | CODE-ONLY |
| Services: Notifications | `/notifications`, `web/app/page.tsx` | CODE-ONLY |
| Services: Settings | `/settings`, `web/app/page.tsx` | CODE-ONLY |
| Client detail and documents upload | `/clients/view`, `web/app/clients/view/page.tsx`, `web/components/documents/DocumentUploader.tsx` | CODE-ONLY |
| Case fields: judge/court no, plaintiff, defendant, next proceeding, case/reference no, next date, From, case type, offence, description | `/cases/new`, `/cases/edit`, `web/components/cases/CaseForm.tsx`, `web/components/cases/UpdateHearingSheet.tsx` | CODE-ONLY |
| Cause list columns: serial no, previous date, party names, current/next proceeding, next date, from, judge/court no | `/cause-list`, `web/components/cases/CauseListView.tsx` | CODE-ONLY |
| Cause list edit option | `/cause-list`, `web/components/cases/CauseListView.tsx`, `web/components/cases/UpdateHearingSheet.tsx` | CODE-ONLY |
| Running cases search and filters | `/cases/running`, `web/hooks/useHearings.ts` | CODE-ONLY |
| Case update option | `/cases/edit`, `/cases/running`, `web/components/cases/UpdateHearingSheet.tsx` | CODE-ONLY |
| Reminders 10 days before with Done, Dismiss, View case | `/reminders`, `web/app/reminders/page.tsx`, migration `supabase/migrations/20240006000000_stage2_p0_p1.sql` | CODE-ONLY |
| Push notification | `/settings/notifications`, `web/lib/push.ts`, `web/hooks/usePushSubscription.ts`, `supabase/migrations/20240006000000_stage2_p0_p1.sql` | CODE-ONLY (deployment blocked by CLI permissions; end-to-end not tested) |
| Decided cases: party name, decision date, status, case information, judge/court, documents view/download/delete | `/cases/decided`, `/cases/view`, `web/components/documents/DocumentList.tsx`, `web/components/cases/MarkDecidedModal.tsx` | CODE-ONLY |
| Client profile: personal/contact info, active status, case history, documents, decided cases | `/clients/view`, `web/app/clients/view/page.tsx` | CODE-ONLY |
| Logo: splash, sign-in, header, sidebar fallback, PDF export header | `web/components/shared/Logo.tsx`, `web/lib/exportPdf.ts`, `web/app/auth/sign-in/page.tsx`, `web/app/splash/page.tsx` | DONE (browser) |
| Icons: PWA icons + favicon regenerated from monogram | `web/scripts/generate-icons.mjs`, `web/public/icons/`, `web/public/favicon.png` | DONE (script) |
| Manifest icon size check | `web/scripts/check-manifest-icons.mjs` | DONE (script) |
| i18n: en.json/ur.json parity (416/416, 0 missing, 0 unknown) | `web/i18n/locales/en.json`, `web/i18n/locales/ur.json`, `web/scripts/check-i18n.mjs` | DONE (script) |
| Urdu RTL on public screens | `web/providers/LangProvider.tsx`, `web/e2e/screenshots/ur/` | DONE (browser) |
| Urdu RTL on authenticated screens | `web/e2e/screenshots/ur-auth/` | DONE (browser) |
| Hardcoded strings migrated (0 remaining except brand/technical) | `web/scripts/scan-hardcoded-strings.mjs` | DONE (script) |

## Needs client confirmation

The following mockup concepts are absent from the written requirements and have not been built: subscription, payments, admin web panel, and OTP.

## Verification limitation

This trace is a source inventory. Features marked `CODE-ONLY` describe implementation presence, not a new live-service test. Features marked `DONE (browser)` were verified via Playwright screenshots. Features marked `DONE (script)` were verified via automated scripts (tsc, lint, build, i18n:check, manifest icon check).

Blockers encountered in this session:
- Supabase CLI token lacks `database_write` permission → `supabase migration list` and `supabase db push` cannot run remotely
- Supabase CLI token lacks `edge_functions_write` permission → `npx supabase functions deploy` cannot run
- Android JDK/SDK not installed → `.\gradlew assembleDebug` cannot build APK
