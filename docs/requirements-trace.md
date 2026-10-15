# Client requirements trace

Source review dated 2026-10-15. `DONE` means the route/component and control are present in source; it does not imply a live database or end-to-end check unless called out.

| Requirement | Route / source | Status |
|---|---|---|
| Header: profile picture, user name, firm logo | `web/components/layout/Sidebar.tsx`, `MobileHeader.tsx`, `DesktopTopBar.tsx`, `web/providers/AuthProvider.tsx` | DONE |
| Services: Add new client | `/clients/new`, `web/app/page.tsx` | DONE |
| Services: New case entry | `/cases/new`, `web/app/page.tsx` | DONE |
| Services: Today's cause list | `/cause-list`, `web/app/page.tsx` | DONE |
| Services: All running cases | `/cases/running`, `web/app/page.tsx` | DONE |
| Services: Reminder | `/reminders`, `web/app/page.tsx` | DONE |
| Services: Decided cases | `/cases/decided`, `web/app/page.tsx` | DONE |
| Services: Clients | `/clients`, `web/app/page.tsx` | DONE |
| Services: Notifications | `/notifications`, `web/app/page.tsx` | DONE |
| Services: Settings | `/settings`, `web/app/page.tsx` | DONE |
| Client detail and documents upload | `/clients/view`, `web/app/clients/view/page.tsx`, `web/components/documents/DocumentUploader.tsx` | DONE |
| Case fields: judge/court no, plaintiff, defendant, next proceeding, case/reference no, next date, From, case type, offence, description | `/cases/new`, `/cases/edit`, `web/components/cases/CaseForm.tsx`, `web/components/cases/UpdateHearingSheet.tsx` | DONE |
| Cause list columns: serial no, previous date, party names, current/next proceeding, next date, from, judge/court no | `/cause-list`, `web/components/cases/CauseListView.tsx` | DONE |
| Cause list edit option | `/cause-list`, `web/components/cases/CauseListView.tsx`, `web/components/cases/UpdateHearingSheet.tsx` | DONE |
| Running cases search and filters | `/cases/running`, `web/hooks/useHearings.ts` | DONE |
| Case update option | `/cases/edit`, `/cases/running`, `web/components/cases/UpdateHearingSheet.tsx` | DONE |
| Reminders 10 days before with Done, Dismiss, View case | `/reminders`, `web/app/reminders/page.tsx`, migration `supabase/migrations/20240006000000_stage2_p0_p1.sql` | DONE (source and prior database verification recorded in audit report) |
| Push notification | `/settings/notifications`, `web/lib/push.ts`, `web/hooks/usePushSubscription.ts`, `supabase/migrations/20240006000000_stage2_p0_p1.sql` | DONE — subscription and server delivery path are implemented; delivery was not re-exercised in this pass |
| Decided cases: party name, decision date, status, case information, judge/court, documents view/download/delete | `/cases/decided`, `/cases/view`, `web/components/documents/DocumentList.tsx`, `web/components/cases/MarkDecidedModal.tsx` | DONE (delete authorization has prior real-JWT verification recorded in audit report) |
| Client profile: personal/contact info, active status, case history, documents, decided cases | `/clients/view`, `web/app/clients/view/page.tsx` | DONE |

## Needs client confirmation

The following mockup concepts are absent from the written requirements and have not been built: subscription, payments, admin web panel, and OTP.

## Verification limitation

This trace is a source inventory. Features marked `DONE` describe implementation presence, not a new live-service test. Urdu visual coverage and the remaining inline-string migration are tracked separately in the handoff/audit report.
