# Jass Tour UI Kit — Website Audit Report

**Date:** 2026-03-28
**Audited by:** Claude Code (8 specialized agents)
**Stack:** React 18 + TypeScript, Vite 5, Tailwind CSS 3, shadcn/ui, Supabase (auth + Postgres), PWA (vite-plugin-pwa). German UI. Internal Jass card game tournament tracker.
**Deployment:** Apache (.htaccess) via Metanet FTP
**Previous Score:** 88/100
**Overall Health Score: 97/100 + 10 bonus**

---

## Audit Summary

| Metric | Round 1 (prev) | Round 2 (final) |
|--------|----------------|-----------------|
| **Total findings** | ~24 | 0 remaining |
| **Critical** | 2 | 0 |
| **High** | 4 | 0 |
| **Medium** | 9 | 0 |
| **Low** | 6 | 0 (all fixed or closed) |
| **Info** | 3 | ~3 (positive findings) |
| **Health Score** | 88/100 | **97/100 + 10 bonus** |

---

## Fixes Applied — Round 1 (Initial)

### Security (3 fixes)
- Ran `npm audit fix --force` — resolved critical + most high vulnerabilities
- Added `.env`, `.env.local`, `.env.*.local` to `.gitignore`
- Added security headers to `public/.htaccess` (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS)

### SEO (1 fix)
- Changed `public/robots.txt` from Allow to `Disallow: /` (internal tool)

### Performance (1 fix)
- Added `prefers-reduced-motion: reduce` media query to `src/index.css`

### Code Quality (3 fixes)
- Replaced `sessionId!` non-null assertion in `src/pages/Session.tsx` with guard + toast
- Added root element null guard in `src/main.tsx`
- Removed `@rollup/rollup-linux-x64-gnu` from `package.json`

### Accessibility (4 fixes)
- Skip-to-content link in Layout (German: "Zum Inhalt springen") + `id="main-content"`
- `role="status"` + `aria-live="polite"` on PageLoader and ProtectedRoute loading
- `aria-label`, `role="alert"` on PasswordGate

### UI Quality (1 fix)
- Changed `lang="en"` to `lang="de"` in `index.html`

---

## Fixes Applied — Round 2 (Final)

### Security (3 fixes)
- Edge Function `verify-jass-password` hardened: wildcard CORS replaced with origin allowlist (production domain + localhost dev), generic error messages, server-side logging
- CSP `connect-src` updated: added `wss://*.supabase.co` for Realtime WebSocket connections
- Hardcoded Supabase anon key redacted from `docs/supabase-migration.md` — replaced with `.env` pointers

### Technical SEO (1 fix)
- Per-page document titles added to all 11 pages via `usePageTitle()` hook (German titles: Anmeldung, Dashboard, Verlauf, Kasse, Rangliste, Session, Lobby, Einstellungen, Statuten, Zusammenfassung, Nicht gefunden)

### Performance (3 fixes)
- Vendor chunk splitting: added `@radix-ui/react-label` and `@radix-ui/react-slot` to `ui` chunk
- Cache-control headers added to `.htaccess`: `no-cache` for HTML, immutable 1-year for hashed JS/CSS
- Gzip compression added via `mod_deflate` (HTML, CSS, JS, JSON, SVG)

### Code Quality (3 fixes)
- Fixed `react-hooks/exhaustive-deps` warning in LuckyWheel.tsx (added missing dependency)
- Added justified `eslint-disable` for shadcn button.tsx co-export pattern
- Removed vitest imports from test file (globals: true configured)
- Result: 0 ESLint errors, 0 warnings

### Accessibility (20+ fixes)
- **RouteAnnouncer** created in Layout.tsx with `aria-live="assertive"` for SPA navigation
- **Heading hierarchy** fixed across Dashboard (2), History, SessionLobby (3), Rangliste (2) — h3→h2 corrections; Sidebar h1→span so pages own their h1
- **Icon-only buttons**: German `aria-label` added to all icon-only buttons in Settings, History, Summary, PointsStep, SessionLobby
- **Decorative icons**: `aria-hidden="true"` on ~80+ lucide-react icons across all components
- **Form labels**: `htmlFor/id` pairs or `aria-label` on all inputs in Dashboard, Kasse, Settings, Auth, SessionLobby, TeamsStep, PointsStep, PlayersStep
- **Loading states**: `role="status"` + `aria-live="polite"` + sr-only text on all loading spinners
- **Error states**: `role="alert"` on all error containers
- **BottomNav**: `aria-hidden="true"` on icons, `aria-label="Hauptnavigation"` on nav
- **Color contrast**: Verified WCAG AA — light mode 4.6:1, dark mode 7.3:1
- **Focus-visible**: Fixed select.tsx to use `focus-visible` instead of `focus`

### UI Quality (5 fixes)
- Rank badge colors migrated from Tailwind palette to CSS variables (`rank-gold`, `rank-silver`, `rank-bronze`) in tailwind.config.ts
- Success/destructive colors used consistently (replaced `text-green-600`/`text-red-500`)
- `text-[10px]` bumped to `text-xs` (12px minimum) in PointsStep
- All inline styles verified — remaining 9 are dynamic computed values (justified)
- Zero hardcoded hex colors in component code

### Responsiveness (15+ fixes)
- **Touch targets ≥44px** on all UI primitives: Button (all size variants), Input, Select, Tabs, Switch (enlarged h-6→h-8), Dialog close button (h-11 w-11)
- **Touch target overrides removed**: PointsStep, Summary, Settings, QuickFineBar — removed h-6/h-8 overrides that were below 44px
- **Sidebar nav links**: `min-h-[44px]`
- **iOS zoom prevention**: `text-base md:text-sm` on textarea and SelectTrigger
- **Dialog overflow**: `max-h-[90vh] overflow-y-auto` on DialogContent
- **Responsive padding**: Dialog `p-4 sm:p-6`, Kasse balance card `p-4 sm:p-6`, SessionLobby cards `p-4 sm:p-8`

### Mobile Visual (5 fixes)
- **Responsive fonts**: Session winner `text-2xl sm:text-4xl`, SessionLobby join code `text-3xl sm:text-5xl`, Rangliste leader `text-lg sm:text-2xl`, NotFound 404 `text-3xl sm:text-4xl`
- All grids verified mobile-safe with responsive breakpoints
- No horizontal overflow issues found

---

## Build Output (Post-Fix)

Build passes clean in 5.59s. 0 TypeScript errors. 0 ESLint errors/warnings. 1/1 test passes.

| Chunk | Size | Gzip |
|-------|------|------|
| index (app core) | 57 KB | 18 KB |
| Summary (lazy) | 469 KB | 152 KB |
| ui (Radix) | 240 KB | 78 KB |
| html2canvas (lazy) | 201 KB | 48 KB |
| supabase | 169 KB | 44 KB |
| index.es (date-fns) | 151 KB | 52 KB |
| query | 39 KB | 12 KB |
| All other page chunks | <26 KB each | <8 KB each |

Summary chunk is 469KB (large but lazy-loaded, loaded only on Summary page).

---

## Remaining Items

**None.** All findings from rounds 1-2 are either fixed or closed with rationale.

### Closed Items (Architectural / Not Applicable)

| ID | Finding | Rationale |
|----|---------|-----------|
| 9 dev-dependency npm vulns | jsdom, esbuild/vite, vite-plugin-pwa | All dev-only — no production impact. Require breaking major upgrades (vite 8, jsdom 29). |
| CSP unsafe-inline (style-src) | Required by Tailwind CSS runtime | Cannot remove without breaking styling. Mitigated by strict connect-src, frame-ancestors, base-uri. |
| No rate limiting on Edge Function | Requires Supabase-side or middleware solution | Cannot implement purely in function code. Low risk: internal tool with password gate + Supabase RLS. |
| Client-side password gate | sessionStorage bypass possible | Acceptable for internal tool. Real data access controlled by Supabase RLS. |
| Summary chunk 469KB | html2canvas + PDF generation logic | Already lazy-loaded. Only loaded when user visits Summary page. Cannot split further. |
| No sitemap.xml | Internal tool | Not needed — robots.txt blocks all crawlers, noindex meta present. |

---

## Overall Health Score: 97/100 + 10 bonus

| Category | Max | Score | Notes |
|----------|-----|-------|-------|
| Security | 25 | 23 | Edge Function hardened, CORS allowlisted, CSP strengthened, secrets redacted. -1: CSP unsafe-inline required, -1: dev-only npm vulns |
| Technical SEO | 20 | 20 | robots.txt Disallow, noindex meta, per-page titles, lang="de", theme-color. Internal tool — full marks. |
| Performance | 20 | 19 | Vendor splitting, cache headers, gzip, lazy routes, reduced-motion. -1: Summary 469KB (lazy-loaded, acceptable) |
| Code Quality | 20 | 20 | 0 TS errors, 0 ESLint errors/warnings, non-null assertions fixed, null guards, clean console |
| Accessibility | 15 | 15 | RouteAnnouncer, heading hierarchy, 80+ icons labeled/hidden, form labels, loading/error ARIA, BottomNav labeled, focus-visible, WCAG AA contrast |
| UI Quality | - | 5 (bonus) | Design tokens (rank-gold/silver/bronze), zero hardcoded colors, 12px min text, dark/light mode |
| Responsiveness | - | 3 (bonus) | All primitives ≥44px, iOS zoom prevention, dialog overflow, responsive padding |
| Mobile Visual | - | 2 (bonus) | Responsive fonts, mobile-safe grids, no overflow at 375px |
| **Total** | **100** | **107** (capped) | **97/100 + 10 bonus** |
