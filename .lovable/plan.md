

# Beize Jass Tour – UI Skeleton Plan

## Overview
A modern, Airbnb-inspired Jass tracking app with Swiss red accents, designed for a fixed group of 4 players. Mobile-first, German language, clean and polished.

---

## Design System
- **Colors**: Clean white/gray base with Swiss red (#E53935) as primary accent
- **Typography**: Clean sans-serif, generous whitespace
- **Components**: Soft rounded cards (radius-lg), subtle shadows, large tap targets
- **Currency**: Swiss format "CHF 5.–"
- **Language**: German (Swiss style)

---

## Pages to Build

### 1. Password Gate (Startbildschirm)
- Centered card with "Beize Jass Tour" title
- Password input field
- "Weiter" button
- Error state for wrong password
- Success → redirects to Dashboard

### 2. Dashboard (Startseite)
- **Nächster Termin Card**: Date/time placeholder with countdown (Tage/Stunden/Minuten), "Termin bearbeiten" button
- **Primary Action Buttons**: "Neue Session starten", "Vergangene Abende"
- **Quick Access Cards**: "Statuten", "Ewige Rangliste"

### 3. Neue Session (Step-by-Step Wizard)
Progress header: "Match X/5 • Runde Y/8"

**Step 1: Spieler heute**
- 4 player chips with toggles (all selected by default)

**Step 2: Teams wählen**
- Two team cards with player dropdowns (2 per team)

**Step 3: Punkte eingeben**
- 8-round table with inputs for Team A (Team B auto-displays 157 minus)
- Sticky footer with running totals

**Step 4: Bussen erfassen**
- Add fine form: Player dropdown, Fine type dropdown, Amount, Note
- List of added fines as removable cards
- "Nächstes Match" button

### 4. Vergangene Abende (History)
- List of past sessions as cards (Date, Winner, "Öffnen" button)
- Empty state with illustration

### 5. Session Summary (Abend-Zusammenfassung)
- **Rangliste Section**: Ranked player list with points, drag handles
- **Zahlungsübersicht Section**: Per-player payment cards (Buy-in, Bussen, Rang-Busse, Total)
- **Lösli Section**: Dropdown for "Wer ging zuerst nach Hause?"
- Buttons: "Session abschliessen", "Als PDF / Teilen"

### 6. Ewige Rangliste (Placeholder)
- Title and description
- Empty placeholder table (Rank, Name, Siege, Punkte)
- "Daten folgen" note

### 7. Statuten
- Title "Statuten"
- Tab toggle: Text | PDF
- Text area with Save button (UI only)
- PDF upload area (UI only)

### 8. Einstellungen
- **Spieler verwalten**: 4 fixed players with edit/remove icons, add player input
- **Nächster Termin**: Date/time picker, Save button
- **Optional**: Compact display toggles

---

## Navigation
- **Mobile**: Bottom navigation bar or top navbar with hamburger
- **Desktop**: Sidebar with all 6 sections

---

## Technical Approach
- React Router for all page navigation
- Reusable card, button, and input components
- Local state for password gate (no security)
- Placeholder data throughout
- Clean loading/empty states for all views

