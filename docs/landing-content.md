# Landing page content guide

The landing page lives in `web/components/marketing/Landing.tsx` and is rendered at
both `/` (for logged-out visitors) and `/welcome`. All visitor-facing strings are
translated in `web/i18n/locales/en.json` and `ur.json` under the `marketing.*` keys —
run `npm run i18n:check` (must exit 0) after any change.

## Site config

`web/lib/siteConfig.ts`:

- `SITE.tagline` — hero headline (brand text, shown as-is).
- `SITE.whatsapp` / `SITE.email` — contact links used by the CTA band and footer.
  Note: the contact page reads `app_settings.whatsapp_number` from the database;
  the `SITE.whatsapp` value is the placeholder fallback used by `whatsappLink()`.
- `SITE.trialDays` — display copy only; the real trial length is `app_settings.trial_days`
  in the database (enforced by `register_firm`).
- `SITE.SHOW_REVIEWS` — reviews section switch (see below).

## Pricing

Prices, seat limits and durations come from the `plans` table (anon-readable via
migration `20261019040000_public_reads.sql`). Edit plans as super admin — the landing
and `/pricing` render whatever rows have `is_active = true`, ordered by `sort_order`.
"No fake counts / ratings" is deliberate: there is no hard-coded pricing in JSX.

## Reviews (sample entries, hidden by default)

`web/lib/reviews.ts` contains clearly-labelled SAMPLE quotes (`sample: true`). The
section is rendered only when `SITE.SHOW_REVIEWS === true` in `web/lib/siteConfig.ts`
— it must stay `false` in production until real testimonials exist.

To add real reviews:

1. Get written permission from each reviewer (name, role, firm, quote).
2. Replace the entries in `web/lib/reviews.ts` and set `sample: false`.
3. Keep `stars` between 1 and 5 and truthful.
4. Set `SHOW_REVIEWS: true` in `web/lib/siteConfig.ts`.
5. Remove or mark clearly any remaining sample entries — do not mix invented
   testimonials with real ones.

## App screenshots

Hero and showcase images use real product screenshots from `web/public/marketing/`
(`cause-list.webp`, `reminders.webp`, `case-view.webp`, `clients.webp`). Regenerate
them from a running app rather than using mockups.

## Plan selection funnel

Pricing CTAs link to `/register?plan=<code>`. The register page keeps the code and
redirects to `/billing?plan=<code>` after `register_firm`; the billing page only
preselects the plan in the form (no billing logic reads the URL).

## Visual tokens

navy `#0B1B3A`, navy gradient `#13264D` (`bg-navy-header`), gold `#8A6414`,
gold-light `#A57A1F` (in `bg-gold-cta` / `.btn-primary` gradients), off-white
`#F7F7F4`. Playfair headings, Inter body, Noto Nastaliq Urdu (applied by
`LangProvider`). Container `max-w-[1200px]`, H1 56px desktop / 36px mobile, section
padding 72px mobile / 112px desktop, CTA buttons 52px tall. Use logical properties
(`start/end`) so the layout mirrors correctly in Urdu RTL.
