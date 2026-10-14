# Phase 7 — Reminders and Notifications

## Database behavior

Apply migrations in order with `supabase db push`. The Phase 7 migration:

- Sets the firm reminder default to 10 days and allows a user's preference to
  inherit that default.
- Replaces reminders when a case's latest hearing or next date changes.
- Creates one reminder per active firm admin/lawyer and hearing, and deduplicates
  that day's in-app notification for each reminder.
- Retires reminders for dates that have passed, superseded hearings, deleted
  cases, and decided cases.
- Schedules `generate_reminders()` and `send_daily_summary()` daily at 01:00 UTC
  (06:00 Asia/Karachi).
- Adds reminders and notifications to the `supabase_realtime` publication when
  that publication exists.

To verify reminder generation in the Supabase SQL Editor:

```sql
SELECT * FROM public.generate_reminders();
SELECT * FROM public.generate_reminders();
```

Run both calls on a database with profiles assigned to an `admin`, `lawyer`, or
`super_admin` role and at least one running case whose latest hearing has a
`next_date` inside the user's effective reminder window. The second call should
not add duplicate reminders or same-day notifications. `created_reminders`
reports newly inserted reminder rows; `closed_reminders` reports upcoming rows
retired during that run.

## Browser Web Push

Web Push requires HTTPS (localhost is allowed during development), a registered
service worker, and a matching VAPID public/private key pair. Generate a pair
with `npx web-push generate-vapid-keys`, then:

1. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in `web/.env.local` to the public key.
2. Configure these Supabase Edge Function secrets. Do not put private keys or
   service-account credentials in client environment variables or source:

   ```text
   VAPID_PUBLIC_KEY=<same public key>
   VAPID_PRIVATE_KEY=<private key>
   VAPID_SUBJECT=mailto:<your-admin-email>
   ```

3. Deploy with `supabase functions deploy send-push`.
4. Sign in, open **Settings → Notification preferences**, enable browser push,
   and use **Send test** to verify delivery.

The Edge Function accepts either `{ "notification_ids": ["..."] }` for
user-scoped dispatch or `{ "test": true }` for the signed-in user's test
notification. A service-role caller may omit IDs to dispatch up to 100 recent
undispatched notification rows. For unattended push delivery, configure your
Supabase scheduler/cron caller to invoke `send-push` after the daily database
jobs with the service-role bearer token; the key must be stored in the
scheduler's secret store, never in this repository.

Optional FCM HTTP v1 delivery for existing `device_tokens` requires the Edge
Function secrets `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT` (the JSON
service-account credential). Native device registration is still a later
phase; browser PWA delivery uses Web Push subscriptions and does not require
FCM.

To dispatch scheduled notifications automatically, enable the Supabase
`pg_net` and `vault` extensions and save `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` as Vault secrets named `project_url` and
`service_role_key`. Then schedule a bounded dispatcher (the function itself
selects up to 100 recent undispatched rows):

```sql
SELECT cron.schedule(
  'dispatch-notification-push',
  '*/5 * * * *',
  $job$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
             || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'
        )
      ),
      body := '{}'::jsonb
    );
  $job$
);
```

Do not put the service-role key in the migration, app bundle, or SQL source
control. Remove the schedule with
`SELECT cron.unschedule('dispatch-notification-push');` when disabling push.

## UI

- `/reminders` lists Upcoming, Done, and Dismissed reminders, with Done,
  Dismiss, Undo, and View case actions.
- `/notifications` provides a typed inbox, mark-all-read, related-case
  navigation, and live updates.
- `/settings/notifications` stores personal delivery preferences and allows
  admins to update the firm reminder default.
