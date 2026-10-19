# Handoff Status — UI Polish Pass

## Done
- Step 0 before screenshots (15 files) in web/e2e/screenshots/ui-before/
- Step 1 design tokens in tailwind.config.ts + app/globals.css
- Step 2 shared components upgraded: Button, Card, Input, Select, Textarea, Badge, Modal/BottomSheet, Toast, Skeleton, EmptyState, Table
- Step 3 partial: Home, Sign-in, BottomNav, MobileHeader, Sidebar, AppShell
- Step 4 animations: page transition, stagger, press scale, shimmer, reduced-motion, RTL flips
- Step 5 a11y: contrast ratios printed, no horizontal overflow on 14 routes (Playwright)
- Step 6 after screenshots (21 files) in web/e2e/screenshots/ui-after/
- Verification: tsc 0, lint 0 (source), build 32 pages, i18n 0 missing, vitest 1/1

## Not done
- Screen-level polish for: cause list, running cases, case view, clients, client profile, add client, new case, reminders, notifications, documents, profile, settings (use upgraded components but not individually restyled)
- Lighthouse before/after on authenticated routes (requires login)
- Success checkmark draw, bell shake, count-up, gold glow pulse (CSS keyframes defined, not wired to components)
- Dark-safe pass beyond contrast calc

## Next command
- Continue screen-level polish starting with web/app/cause-list/page.tsx and web/app/cases/running/page.tsx
- Run: npx playwright test e2e/ui-after.spec.ts
