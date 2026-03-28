# Jass Tour UI Kit — Mobile Responsive Audit Fixes

**Date:** 2026-03-28
**Audit type:** Phase 1 — Code-Level Deep Analysis (5 parallel agents)
**Breakpoints:** 375px (iPhone SE), 390px (iPhone 12), 430px (iPhone 14 Pro Max)
**i18n:** None (German only)

---

## Summary

| Severity | Found | Fixed |
|----------|-------|-------|
| Critical | 1 | 1 |
| High | 10 | 10 |
| Medium | 26 | 26 |
| Low | 12 | 12 |
| **Total** | **49** | **49** |

---

## Systemic Fixes (5)

### S1 — Card padding responsive (`card.tsx`)
**Resolves:** H1, H2, H3 + all card padding findings across all pages
- `CardHeader`: `p-6` → `p-4 sm:p-6`
- `CardContent`: `p-6 pt-0` → `p-4 pt-0 sm:p-6 sm:pt-0`
- `CardFooter`: `p-6 pt-0` → `p-4 pt-0 sm:p-6 sm:pt-0`

### S2 — TabsList height (`tabs.tsx`)
**Resolves:** H4, Rangliste tab height conflict
- `h-10` → `h-auto min-h-[48px]`

### S3 — Table scroll affordance (`table.tsx` + `index.css`)
**Resolves:** H7, H8, M23
- Added `.scroll-affordance` CSS class with gradient fade mask on mobile
- Applied class to the Table overflow container
- Gradient fades out on `md:` breakpoint where tables fit

### S4 — Safe-area-inset-bottom (`Layout.tsx`, `index.html`, `PointsStep.tsx`, `QuickFineBar.tsx`)
**Resolves:** L2, H9, M17, M18
- `index.html`: Added `viewport-fit=cover` to viewport meta
- `Layout.tsx`: Bottom nav gets `pb-[env(safe-area-inset-bottom)]`; main content bottom padding accounts for safe area
- `PointsStep.tsx`: Sticky footer uses `bottom-[calc(5rem+env(safe-area-inset-bottom))]`
- `QuickFineBar.tsx`: Fixed bar uses `bottom-[calc(4rem+env(safe-area-inset-bottom))]`

### S5 — Toast responsive padding & touch targets (`toast.tsx`)
**Resolves:** M3, M4, M5
- Toast body: `p-6 pr-8` → `p-4 pr-8 sm:p-6 sm:pr-8`
- ToastAction: Added `min-h-[44px]`
- ToastClose: `p-1` → `p-2 min-h-[44px] min-w-[44px] flex items-center justify-center`

---

## Individual Fixes (28)

### F1 — Score inputs `inputMode="numeric"` (Critical)
**File:** `src/components/session/PointsStep.tsx`
- Added `inputMode="numeric" pattern="[0-9]*"` to both score Input elements
- iOS now shows numeric keypad instead of full keyboard for 40+ entries per session

### F2 — Auth tab text size
**File:** `src/pages/Auth.tsx`
- Added `className="text-xs sm:text-sm"` to all three TabsTrigger elements
- "Registrieren" no longer gets cramped at 375px

### F3 — Dashboard "Bearbeiten" button touch target
**File:** `src/pages/Dashboard.tsx`
- Removed `h-8` class that was overriding `min-h-[44px]`

### F4 — QuickFineBar 2×2 grid on mobile
**File:** `src/components/session/QuickFineBar.tsx`
- `grid-cols-4` → `grid-cols-2 gap-2 sm:grid-cols-4`
- Fine buttons no longer clip text at 375px

### F5 — PasswordGate German translation
**File:** `src/components/shared/PasswordGate.tsx`
- Translated all 5 English strings to German

### F6 — Dialog close sr-only text
**File:** `src/components/ui/dialog.tsx`
- "Close" → "Schliessen"

### F7 — Dashboard date flex-wrap
**File:** `src/pages/Dashboard.tsx`
- Added `flex-wrap` and `text-base sm:text-lg` to date container

### F8 — QuickAccessCard + SessionLobby card accessibility
**Files:** `src/pages/Dashboard.tsx`, `src/pages/SessionLobby.tsx`
- Added `role="button"`, `tabIndex={0}`, `onKeyDown` handlers to clickable cards

### F9 — SessionLobby remove misleading cursor-pointer
**File:** `src/pages/SessionLobby.tsx`
- Removed `cursor-pointer` from non-clickable "Session beitreten" card

### F10 — SessionLobby waiting card padding
**File:** `src/pages/SessionLobby.tsx`
- `p-6` → `p-4` on waiting card

### F11 — LuckyWheel responsive SVG text + overflow
**File:** `src/components/LuckyWheel.tsx`
- SVG text: Added `textLength`/`lengthAdjust` + name truncation at 8 chars
- "Noch zu vergeben": Added `break-words max-w-full`

### F14 — History SessionCard stat wrapping + date truncation
**File:** `src/pages/History.tsx`
- Added `min-w-0` to parent div
- Changed bullet separators to `hidden sm:inline`
- Reduced gap to `gap-x-3`

### F15 — Rangliste tab sr-only labels
**File:** `src/pages/Rangliste.tsx`
- Added `sr-only sm:hidden` spans for each icon-only tab on mobile

### F16 — Rangliste bar chart min-width
**File:** `src/pages/Rangliste.tsx`
- Added `min-w-[1.25rem]` to all 4 bar chart segments
- Small percentages now remain readable

### F17 — Summary metadata stack on mobile
**File:** `src/pages/Summary.tsx`
- Changed metadata container to `flex-col` on mobile, `sm:flex-row`

### F18 — Kasse transaction overflow protection
**File:** `src/pages/Kasse.tsx`
- Added `min-w-0` to inner containers
- Added `truncate` to transaction type text
- Added `gap-3` to outer flex for proper spacing

### F19 — Settings "Hinzufügen" button icon-only on mobile
**File:** `src/pages/Settings.tsx`
- Button text: `hidden sm:inline` with `sr-only sm:hidden` fallback

### F20 — NotFound link touch target
**File:** `src/pages/NotFound.tsx`
- Added `inline-flex min-h-[44px] items-center`

### F21 — BottomNav active indicator
**File:** `src/components/BottomNav.tsx`
- Added bottom dot indicator via `after:` pseudo-element on active nav item

### F22 — Responsive vertical spacing
**Files:** `src/pages/Dashboard.tsx`, `src/pages/SessionLobby.tsx`
- `space-y-6` → `space-y-4 sm:space-y-6` (5 occurrences)

### F24 — Dashboard ghost button affordance
**File:** `src/pages/Dashboard.tsx`
- "Vergangene Abende" button: `variant="ghost"` → `variant="outline"`

### F25 — Fine amount input inputMode
**File:** `src/components/session/PointsStep.tsx`
- Added `inputMode="numeric" pattern="[0-9]*"` to custom fine amount input

### F26 — Summary payment container padding
**File:** `src/pages/Summary.tsx`
- `p-4` → `p-3 sm:p-4`

### F28 — Statuten text size responsive
**File:** `src/pages/Statuten.tsx`
- `text-sm` → `text-xs sm:text-sm` on the `<pre>` block

---

## Files Modified (18)

| File | Fixes Applied |
|------|---------------|
| `src/components/ui/card.tsx` | S1 (CardHeader, CardContent, CardFooter padding) |
| `src/components/ui/tabs.tsx` | S2 (TabsList height) |
| `src/components/ui/table.tsx` | S3 (scroll affordance class) |
| `src/components/ui/toast.tsx` | S5 (padding + touch targets) |
| `src/components/ui/dialog.tsx` | F6 (sr-only German text) |
| `src/index.css` | S3 (scroll affordance CSS) |
| `index.html` | S4 (viewport-fit=cover) |
| `src/components/Layout.tsx` | S4 (safe-area-inset on nav + main) |
| `src/components/BottomNav.tsx` | F21 (active indicator) |
| `src/components/shared/PasswordGate.tsx` | F5 (German translation) |
| `src/components/LuckyWheel.tsx` | F11 (SVG text + overflow) |
| `src/components/session/PointsStep.tsx` | F1, F25, S4 (inputMode, safe-area) |
| `src/components/session/QuickFineBar.tsx` | F4, S4 (2×2 grid, safe-area) |
| `src/pages/Auth.tsx` | F2 (tab text size) |
| `src/pages/Dashboard.tsx` | F3, F7, F8, F22, F24 |
| `src/pages/SessionLobby.tsx` | F8, F9, F10, F22 |
| `src/pages/NotFound.tsx` | F20 (touch target) |
| `src/pages/History.tsx` | F14 (stat wrapping) |
| `src/pages/Rangliste.tsx` | F15, F16 (sr-only labels, bar min-width) |
| `src/pages/Summary.tsx` | F17, F26 (metadata stack, padding) |
| `src/pages/Kasse.tsx` | F18 (overflow protection) |
| `src/pages/Settings.tsx` | F19 (icon-only button) |
| `src/pages/Statuten.tsx` | F28 (text size) |

---

## Verification

- **Build:** `npm run build` — 0 errors
- **Lint:** `npm run lint` — 0 errors
- **Tests:** `npm test -- --run` — 1/1 passing

---

## Next Steps

Phase 2 — Visual Verification: Take Playwright screenshots at 430×932px of every page and review them for remaining rendering issues that code analysis alone cannot predict.
