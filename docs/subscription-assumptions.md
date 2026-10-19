# Subscription Assumptions (configurable in DB/admin panel)

- Plans: monthly Rs 1,000; 6-month Rs 5,400; yearly Rs 9,600.
- Seats: 1 owner + 2 lawyers + 2 clerks (max_users 5).
- Free trial: 7 days (toggle in settings, default ON).
- Grace period: 3 days read-only after expiry.
- Renewal reminder: 7 days before expiry.
- Currency: PKR.
- No auto-recurring billing; renewal = pay again before expiry.

## Device enforcement limitation
`is_session_valid()` currently returns TRUE. Device revocation (max 2 active devices) is enforced in `register_device` (revokes oldest) and checked client-side on app start; server-side JWT `session_id` claim validation is NOT enforced in this version. Documented limitation.
