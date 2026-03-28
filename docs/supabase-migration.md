# Supabase Migration Log

## Date: 2026-03-04

## Reason
Moved the Supabase project from a separate personal account to the same account/organization as the API project (`pjsxzjjhlwjqpkvsopuj`), to consolidate all Supabase projects under one account.

## Old Project
- **Project ID:** `xvnmzdxdhecnsxjdtbva`
- **URL:** `https://xvnmzdxdhecnsxjdtbva.supabase.co`
- **Anon Key:** (redacted -- old project, to be deleted)
- **Organization:** YouTube Migration (FREE tier, separate account)
- **Status:** TO BE DELETED after migration is verified

## New Project
- **Project ID:** `dkxdlovwzsxnepoteebk`
- **URL:** `https://dkxdlovwzsxnepoteebk.supabase.co`
- **Publishable Key:** (see .env or GitHub Actions secrets)
- **Direct DB Connection:** `postgresql://postgres:[PASSWORD]@db.dkxdlovwzsxnepoteebk.supabase.co:5432/postgres`
- **Organization:** Same as API project

## Code Changes (committed in `d747ba4`)
| File | Change |
|------|--------|
| `.env` | Updated project ID, publishable key, URL |
| `supabase/config.toml` | Updated project_id |
| `vite.config.ts` | Updated hardcoded Supabase URL in PWA workbox caching regex |
| `supabase/.temp/project-ref` | Updated project ref (local, not committed) |
| `supabase/.temp/pooler-url` | Updated pooler connection string (local, not committed) |

## Manual Steps Required

### 1. Apply Database Migrations
Run in the [SQL Editor](https://supabase.com/dashboard/project/dkxdlovwzsxnepoteebk/sql/new) in this order:

1. `supabase/migrations/20260129163554_adaeb3c3-a4a8-435a-9144-67a132101d7a.sql`
   - Creates: profiles, players, sessions, matches, match_results, session_rankings
   - Inserts 4 fixed players: Mötzi, Poli, Husi, Rötschi
   - Sets up RLS (authenticated-only), triggers, auto-profile on signup

2. `supabase/migrations/20260129164515_f033be08-a665-4061-b954-f36633c8646c.sql`
   - Creates: app_settings table
   - Converts ALL tables to public read/write (password gate replaces auth)
   - Drops authenticated-only policies, creates public policies

3. `supabase/migrations/20260211120000_match_fines_and_losli.sql`
   - Creates: match_fines table (detailed fine records)
   - Adds losli_player_id column to sessions
   - Public RLS policies

4. `supabase/migrations/20260211130000_kasse_transactions.sql`
   - Creates: kasse_transactions table (running cash balance)
   - Indexes on session_id and player_id
   - Public RLS policies

5. `supabase/migrations/20260211140000_player_auth.sql`
   - Adds user_id to players (link to auth.users)
   - Adds owner_user_id and join_code to sessions
   - Creates: session_participants table
   - Public RLS policies

### 2. Deploy Edge Function
- Function: `verify-jass-password` (located at `supabase/functions/verify-jass-password/index.ts`)
- Deploy via [Edge Functions](https://supabase.com/dashboard/project/dkxdlovwzsxnepoteebk/functions)
- Set `JASS_PASSWORD` secret in [Project Secrets](https://supabase.com/dashboard/project/dkxdlovwzsxnepoteebk/settings/vault/secrets)

### 3. Update GitHub Actions Secrets
At [Repository Secrets](https://github.com/Arivioo/jass-tour-ui-kit/settings/secrets/actions):
- `SUPABASE_URL` → `https://dkxdlovwzsxnepoteebk.supabase.co`
- `SUPABASE_ANON_KEY` → (see .env or GitHub Actions secrets)

### 4. Migrate Data (if any)
Export from old project's [Table Editor](https://supabase.com/dashboard/project/xvnmzdxdhecnsxjdtbva/editor) as CSV and import into the new project.

### 5. Delete Old Project
After verifying everything works, delete the old project at [Old Project Settings](https://supabase.com/dashboard/project/xvnmzdxdhecnsxjdtbva/settings/general).
