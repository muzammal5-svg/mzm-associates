# Chunk 3 handoff status — 2026-10-14

## Completed

- Locale parity/unused-key checker: 214 English and 214 Urdu keys, zero missing/extra/unused.
- RTL direction: Urdu sets document lang/dir and Noto Nastaliq Urdu; 87 measured physical utility classes reduced to zero; directional icon mirroring added.
- User-facing dates now route through `fmtDate` in Asia/Karachi with `dd MMM yyyy`.
- Logo-derived PWA icons, maskable icon, favicon, manifest size checker and shared real-logo component.
- Vitest and Playwright smoke configuration; both requested smoke tests passed.
- Final TypeScript, lint, production build, i18n check and unit smoke test passed.

## Incomplete

- M1 is PARTIAL. The scan still found 207 JSX text candidates, 106 static UI attribute candidates, and 37 toast calls with literal arguments in `web/app` and `web/components`. These have not all been moved to translation keys. A sample grep output is in the Chunk 3 audit evidence.
- The Playwright smoke test is the only E2E test run. No additional test suites, RLS tests or Phase 8 work were started.
- `chunk3-verified` was intentionally not tagged because M1 is incomplete.

## Reviewer constraint

Automatic approval review rejected replacing the existing firm-specific logo branches in the mobile and desktop shell. The shared MZM logo is used by SplashScreen, SignInPage, and Header; existing configured firm branding in MobileHeader/Sidebar remains intact.
