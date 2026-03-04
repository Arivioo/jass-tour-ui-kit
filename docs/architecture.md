# Beize Jass Tour — Architecture

## Overview
Swiss Jass card game scoring PWA for the "Beize Jass Tour" group. Tracks matches, rankings, fines, and a shared cash balance (Kasse) across game sessions with 4 fixed players.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite 5 + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Data Fetching:** TanStack React Query (useQuery, useMutation)
- **PWA:** vite-plugin-pwa with offline Supabase API caching (NetworkFirst)
- **Deployment:** GitHub Actions → FTPS to `Beize-Jass-Tour.mueller.ro`

## Supabase Project
- **Project ID:** `dkxdlovwzsxnepoteebk`
- **URL:** `https://dkxdlovwzsxnepoteebk.supabase.co`
- **Region:** eu-central-1

## Database Schema (10 tables)

### Core Tables
| Table | Purpose |
|-------|---------|
| `players` | 4 fixed players: Mötzi, Poli, Husi, Rötschi |
| `sessions` | Jass evenings (date, location, total_pot, is_completed) |
| `matches` | Individual games within a session |
| `match_results` | Player scores per match (winner, fines) |
| `session_rankings` | Final rankings with tie-breaking |

### Extended Tables
| Table | Purpose |
|-------|---------|
| `match_fines` | Detailed fine records per player per match |
| `kasse_transactions` | Running cash balance (session_pot, payout, adjustment) |
| `app_settings` | Global settings (next event date) |
| `profiles` | User profiles linked to auth.users |
| `session_participants` | Tracks who joined a collaborative session |

### Key Columns Added Later
- `sessions.losli_player_id` → tracks "Lösli" loser designation
- `sessions.owner_user_id` → session ownership
- `sessions.join_code` → collaborative session joining
- `players.user_id` → links player to Supabase auth user

### RLS Strategy
All tables have **public read/write** policies. The app uses a shared password gate (not fine-grained Supabase auth) for access control.

## Authentication (Dual-Layer)

### Layer 1: Shared Password Gate (Primary)
- User enters shared password on app load
- Validated via `verify-jass-password` edge function
- Stores `sessionStorage['jass-access'] = 'granted'`
- Resets on browser close

### Layer 2: Supabase Auth (Optional)
- Optional user signup/login
- Links auth user to a player record via `players.user_id`
- Enables per-player session ownership

### Edge Function: `verify-jass-password`
- **Location:** `supabase/functions/verify-jass-password/index.ts`
- **Secret:** `JASS_PASSWORD` (set in Supabase project secrets)
- **Endpoint:** POST with `{ password: string }` → `{ valid: boolean }`

## Realtime
- **Location:** `src/lib/realtime.ts`
- Uses Supabase Realtime broadcast channels per session
- Events: `score:update`, `fine:add`, `fine:remove`, `match:complete`, `session:start`, `step:change`, `teams:set`

## Frontend Structure

### Pages
| Page | Route | Purpose |
|------|-------|---------|
| Auth | `/auth` | Password gate + optional signup |
| Session | `/session/:id` | Active game session |
| SessionLobby | `/lobby` | Create/join sessions |
| Rangliste | `/rangliste` | All-time rankings |

### Custom Hooks (Data Layer)
| Hook | File | Purpose |
|------|------|---------|
| `usePlayers` | `src/hooks/usePlayers.ts` | Player CRUD |
| `useSessions` | `src/hooks/useSessions.ts` | Session lifecycle, matches, rankings |
| `useKasse` | `src/hooks/useKasse.ts` | Cash balance transactions |
| `useAppSettings` | `src/hooks/useAppSettings.ts` | Global settings (next event date) |

### Key Components
- `ProtectedRoute` — Route guard (checks password gate or auth)
- `src/integrations/supabase/client.ts` — Supabase client init
- `src/integrations/supabase/types.ts` — Auto-generated TypeScript types

## CI/CD & GitHub Actions

### Workflows (`.github/workflows/`)
| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy.yml` | push to main | lint → test → build → FTPS deploy |
| `keep-alive.yml` | cron (every 3 days) | Ping Supabase to prevent free-tier pause |
| `code-review.yml` | PR | Claude Code review |
| `design-review.yml` | PR | Design review |
| `security-review.yml` | PR | Security audit |

### GitHub Secrets Required
| Secret | Purpose |
|--------|---------|
| `SUPABASE_URL` | Keepalive workflow |
| `SUPABASE_ANON_KEY` | Keepalive workflow |
| FTP credentials | Deploy workflow |

## PWA & Offline
- Service worker via vite-plugin-pwa (generateSW mode)
- Supabase API responses cached with NetworkFirst strategy (1 day TTL, max 50 entries)
- App icons: `pwa-192x192.png`, `pwa-512x512.png`

## Environment Variables
```
VITE_SUPABASE_PROJECT_ID="dkxdlovwzsxnepoteebk"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
VITE_SUPABASE_URL="https://dkxdlovwzsxnepoteebk.supabase.co"
```

## Development
```sh
npm install
npm run dev      # starts on http://localhost:8080
npm run build    # production build
npm run lint     # ESLint
npm test         # Vitest
```

### WSL2 Notes
- Install `@rollup/rollup-linux-x64-gnu` for builds on WSL2
- `.htaccess` copy may fail with EPERM on `/mnt/c/` — works fine in CI
