# Development Demo Credentials

These accounts are for the **MZM dev Supabase project only**. Do not use these credentials in production or reuse them for real accounts.

Run `node supabase/scripts/seed-users.mjs` to create or reset the confirmed Auth users and ensure their firm profiles exist. Then run the SQL seed using `supabase db push --include-seed` with the development session-pooler connection.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@mzm.pk` | `Admin1234!` |
| Lawyer | `lawyer@mzm.pk` | `Lawyer1234!` |
| Clerk | `clerk@mzm.pk` | `Clerk1234!` |

The seed script refuses to run unless `SUPABASE_PROJECT_REF` and `NEXT_PUBLIC_SUPABASE_URL` identify the approved development project. It reads the service-role key from the ignored `web/.env.local`; never commit that file or expose its contents.

Verify all three accounts using:

```powershell
node supabase/scripts/test-demo-login.mjs
```
