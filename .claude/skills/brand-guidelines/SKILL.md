---
name: brand-guidelines
description: >
  Beize Jass Tour brand guidelines and design system. Enforces the Swiss Jass card game
  scoring PWA design language: Swiss Red primary, clean shadcn/ui components, mobile-first
  with desktop sidebar. Applies brand tokens, component patterns, and visual standards
  across all generated UI. Use when building or modifying any Jass Tour frontend component,
  page, or visual element.
user-invocable: false
---

# Beize Jass Tour Brand Guidelines

Every UI element generated for Beize Jass Tour MUST follow these brand rules. No exceptions.

## Brand Identity

- **Name:** Beize Jass Tour
- **Short name:** Jass Tour
- **Description:** Jass Scoring App for the Beize Jass Tour (Swiss card game)
- **Language:** German (Swiss German context)
- **Aesthetic:** Clean, functional, mobile-first — a scoring tool that gets out of the way
- **Theme:** Light mode default, dark mode supported (class-based `.dark`)
- **Stack:** React 19 + TypeScript + Vite 7 + Tailwind CSS 3.4 + shadcn/ui (Radix)
- **PWA:** Standalone display, installable, offline-capable
- **Icons:** lucide-react (20px default, 1.5px stroke)
- **No custom fonts** — system sans-serif stack

## Color System

All colors use HSL CSS custom properties. Use `hsl(var(--*))` tokens, never hardcode hex.

### Light Mode (`:root`)
| Token | HSL | Approx Hex | Usage |
|-------|-----|-----------|-------|
| `--background` | 0 0% 99% | `#FCFCFC` | Page background |
| `--foreground` | 0 0% 12% | `#1F1F1F` | Primary text |
| `--card` | 0 0% 100% | `#FFFFFF` | Card backgrounds |
| `--card-foreground` | 0 0% 12% | `#1F1F1F` | Card text |
| `--primary` | 1 76% 55% | `#E53935` | Swiss Red — CTAs, active nav, focus |
| `--primary-foreground` | 0 0% 100% | `#FFFFFF` | Text on primary |
| `--secondary` | 0 0% 96% | `#F5F5F5` | Secondary backgrounds |
| `--secondary-foreground` | 0 0% 12% | `#1F1F1F` | Secondary text |
| `--muted` | 0 0% 96% | `#F5F5F5` | Muted/disabled backgrounds |
| `--muted-foreground` | 0 0% 45% | `#737373` | Muted text, placeholders |
| `--accent` | 0 0% 96% | `#F5F5F5` | Hover state backgrounds |
| `--accent-foreground` | 0 0% 12% | `#1F1F1F` | Hover text |
| `--destructive` | 0 84% 60% | `#F44336` | Delete, errors |
| `--destructive-foreground` | 0 0% 100% | `#FFFFFF` | Text on destructive |
| `--border` | 0 0% 90% | `#E5E5E5` | Borders, dividers |
| `--input` | 0 0% 90% | `#E5E5E5` | Input borders |
| `--ring` | 1 76% 55% | `#E53935` | Focus rings (= primary) |

### Sidebar Tokens (Light)
| Token | HSL | Usage |
|-------|-----|-------|
| `--sidebar-background` | 0 0% 98% | Sidebar bg |
| `--sidebar-primary` | 1 76% 55% | Active nav item |
| `--sidebar-accent` | 0 0% 95% | Hover bg |
| `--sidebar-border` | 0 0% 90% | Sidebar borders |

### Dark Mode (`.dark`)
| Token | HSL | Approx Hex | Usage |
|-------|-----|-----------|-------|
| `--background` | 222.2 84% 4.9% | `#0A0E27` | Deep blue-black bg |
| `--foreground` | 210 40% 98% | `#F5F8FF` | Light text |
| `--primary` | 210 40% 98% | `#F5F8FF` | Inverted primary |
| `--primary-foreground` | 222.2 47.4% 11.2% | `#1A1A2E` | Dark text on light |
| `--secondary` | 217.2 32.6% 17.5% | `#252D45` | Secondary bg |
| `--muted` | 217.2 32.6% 17.5% | `#252D45` | Muted bg |
| `--muted-foreground` | 215 20.2% 65.1% | `#8FA3BE` | Muted text |
| `--destructive` | 0 62.8% 30.6% | `#C23030` | Dark mode red |
| `--border` | 217.2 32.6% 17.5% | `#252D45` | Dark borders |
| `--sidebar-primary` | 224.3 76.3% 48% | `#4A7FFF` | Blue sidebar active |

### Brand Color
**Swiss Red: `#E53935`** — the primary brand color. Used for CTAs, active states, nav highlights, focus rings, loading spinners.

## Typography

**No custom fonts loaded.** Uses system sans-serif stack.

| Level | Tailwind | Weight | Usage |
|-------|----------|--------|-------|
| Page title | `text-2xl` to `text-4xl` | 700 | Page headings |
| Section title | `text-xl` to `text-2xl` | 600 | Card titles |
| Body | `text-base` | 400 | Standard body text |
| Small | `text-sm` | 400-500 | Labels, secondary |
| Caption | `text-xs` | 500 | Small text, nav labels |

**Weights used:** 400 (body), 500 (labels), 600 (titles), 700 (headings)

## Layout

| Element | Value |
|---------|-------|
| Content max-width (mobile) | `max-w-2xl` (512px) |
| Content max-width (desktop) | `lg:max-w-4xl` (896px) |
| Content padding (mobile) | `px-4 py-6` |
| Content padding (desktop) | `lg:px-8` |
| Sidebar width | `w-64` (256px), fixed left |
| Bottom nav height | `h-16` (64px) |
| Desktop breakpoint | `lg` (1024px) — sidebar appears |
| Bottom padding (mobile) | `pb-20` (80px, clears bottom nav) |
| Content left margin (desktop) | `lg:pl-64` (256px, clears sidebar) |

### Navigation Structure
- **Mobile (< lg):** Fixed bottom nav with 5 items (Dashboard, Session, Abende, Rangliste, Kasse)
- **Desktop (>= lg):** Fixed left sidebar with 7 items (adds Statuten, Einstellungen)
- Both at `z-50`

### Sidebar Nav Styles
- Default: `text-muted-foreground hover:bg-accent hover:text-foreground`
- Active: `bg-primary/10 text-primary`
- Base: `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors`

### Bottom Nav Styles
- Default: `text-muted-foreground hover:text-foreground`
- Active: `text-primary`
- Base: `flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium`

## Border Radii

Base: `--radius: 0.75rem` (12px)

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 12px | Cards, nav items |
| `rounded-md` | 10px | Buttons, inputs, tabs, toasts |
| `rounded-sm` | 8px | Small elements |
| `rounded-full` | 9999px | Switch, pills |

## Shadows

| Token | Usage |
|-------|-------|
| `shadow-sm` | Cards at rest |
| `shadow-md` | Modals, dropdowns |
| `shadow-lg` | Toast notifications, prominent elements |

## Components (shadcn/ui)

### Buttons (CVA-based)
| Variant | Background | Text | Hover |
|---------|-----------|------|-------|
| `default` | `bg-primary` (Swiss Red) | White | `bg-primary/90` |
| `destructive` | `bg-destructive` | White | `bg-destructive/90` |
| `outline` | `bg-background` + border | Foreground | `bg-accent` |
| `secondary` | `bg-secondary` | Foreground | `bg-secondary/80` |
| `ghost` | Transparent | Inherits | `bg-accent` |
| `link` | Transparent | `text-primary` | Underline |

**Sizes:** sm: h-9 px-3, default: h-10 px-4, lg: h-11 px-8, icon: h-10 w-10
**Focus:** `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

### Cards
- `rounded-lg border bg-card text-card-foreground shadow-sm`
- Header: `p-6 space-y-1.5`
- Title: `text-2xl font-semibold tracking-tight`
- Description: `text-sm text-muted-foreground`
- Content: `p-6 pt-0`
- Footer: `flex items-center p-6 pt-0`

### Inputs
- `h-10 px-3 py-2 border border-input rounded-md`
- `placeholder:text-muted-foreground`
- `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- `disabled:opacity-50 disabled:cursor-not-allowed`

### Dialogs/Modals
- Overlay: `bg-black/80` (80% opacity)
- Content: `max-w-lg p-6 rounded-lg` centered
- Close: `absolute right-4 top-4`
- Z-index: `z-50`
- Animation: fade-in + zoom-in-95 + slide-in (200ms)

### Tabs
- List: `h-10 rounded-md bg-muted p-1`
- Trigger: `rounded-sm px-3 py-1.5 text-sm font-medium`
- Active: `bg-background text-foreground shadow-sm`

### Tables
- Header: `h-12 px-4 font-medium text-muted-foreground border-b`
- Cell: `p-4`
- Row hover: `hover:bg-muted/50`
- Footer: `border-t bg-muted/50 font-medium`

### Toasts
- Position: top on mobile, bottom-right on desktop (`sm:bottom-0 sm:right-0`)
- Max width: `md:max-w-[420px]`
- Z-index: `z-[100]` (above everything)
- Variants: default (border) | destructive (red bg)

### Switch
- Track: `h-6 w-11 rounded-full`
- Checked: `bg-primary` (Swiss Red)
- Unchecked: `bg-input`
- Thumb: `h-5 w-5 rounded-full bg-background shadow-lg`

## Animations

### Dialog
- Open: `fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]` (200ms)
- Close: `fade-out-0 zoom-out-95 slide-out-to-left-1/2 slide-out-to-top-[48%]` (200ms)

### Toast
- Enter: `slide-in-from-top-full` (mobile) / `slide-in-from-bottom-full` (desktop)
- Exit: `slide-out-to-right-full fade-out-80`

### Accordion
- Expand: 200ms ease-out (height 0 → content height)
- Collapse: 200ms ease-out

### General
- Hover: `transition-colors` (150ms)
- Loading: `animate-spin` on Loader2 icon, `text-primary`

## PWA Configuration
- **theme_color:** `#1a1a2e` (dark mode)
- **background_color:** `#ffffff`
- **display:** standalone
- **Icons:** 192x192 + 512x512 PNG (+ maskable)

## Pages & Navigation
| Path | Icon | Label (DE) | Purpose |
|------|------|------------|---------|
| `/` | Home | Dashboard | Overview |
| `/session` | Play | Neue Session | Start scoring session |
| `/history` | History | Vergangene Abende | Past game nights |
| `/rangliste` | Trophy | Ewige Rangliste | All-time rankings |
| `/kasse` | Wallet | Kasse | Cash/treasury |
| `/statuten` | FileText | Statuten | Club rules (sidebar only) |
| `/settings` | Settings | Einstellungen | Settings (sidebar only) |

## Mandatory Rules

### ALWAYS
- Use HSL CSS variable tokens — `hsl(var(--*))` for all colors
- Use Swiss Red (`--primary`) for CTAs and active states
- Use shadcn/ui components as foundation
- Use `transition-colors` on all interactive elements
- Support both light and dark mode
- Use mobile-first responsive design (bottom nav mobile, sidebar desktop at `lg`)
- Use `rounded-lg` for cards, `rounded-md` for buttons/inputs
- Use system sans-serif font stack (no custom fonts)
- Keep all labels in German
- Use lucide-react for all icons (20px default)
- Add `pb-20` on mobile pages to clear bottom nav
- Use `lg:pl-64` on main content to clear sidebar

### NEVER
- Hardcode hex values — use CSS variable tokens
- Load custom web fonts (the app uses system fonts for performance)
- Use icons without text labels in navigation
- Use z-index values that conflict with nav (z-50) or toast (z-100) layers
- Mix English and German in UI labels
- Use colors outside the defined token palette
- Ignore dark mode — every component must work in both themes
- Use heavy shadows or decorative effects — keep it functional
