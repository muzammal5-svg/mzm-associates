# Seed and reset the MZM demo data

This project uses the remote Supabase dev project `zxxpsvhlekemgccrcwtg` as the demo environment.

## Demo credentials

See [demo-credentials.md](./demo-credentials.md) for the user logins and their roles.

## Reseed the demo state

From the repo root:

```bash
node supabase/scripts/reset-demo-data.mjs
```

The script verifies the project ref is the approved dev project, creates and confirms the demo auth users with the service role key, and re-runs the idempotent SQL seed.

## Reset the demo state

Use the same command above to restore the expected demo state after a schema or data change.

This script is intentionally guarded to refuse to run against any other project ref.
