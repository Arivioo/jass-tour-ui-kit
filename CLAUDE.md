# Jass Tour UI Kit

## Stack
- React 18 + TypeScript + Vite 5 (port 8080), Tailwind + shadcn/ui, TanStack Query
- Supabase backend
- PWA enabled (vite-plugin-pwa)
- Vitest + Testing Library for tests

## Dev Server
- URL: http://localhost:8080
- Start: `npm run dev`

---

## Visual Development

### Design References
- Design principles: `/context/design-principles.md`
- Brand style guide: `/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, ALWAYS refer to these files for guidance

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** — Review the modified components/pages
2. **Navigate to affected pages** — Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** — Compare against `/context/design-principles.md` and `/context/style-guide.md`
4. **Validate feature implementation** — Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** — Review any provided context files, UI mocks, or requirements
6. **Capture evidence** — Take full-page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** — Run `mcp__playwright__browser_console_messages` and fix any errors before reporting completion

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review
Invoke the `@design-review` agent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

---

## Verification Loop (MANDATORY)

After ANY code change, verify before reporting completion:
1. **Build** — `npm run build` must pass with zero TypeScript errors
2. **Lint** — `npm run lint` must pass with zero errors
3. **Test** — `npm test -- --run` must pass (all green)
4. If any step fails, fix the issue before proceeding — do NOT move on with broken code

For comprehensive validation, invoke the `@build-validator` agent.

### Plan Before Building
For non-trivial features (3+ files, new patterns, architectural changes):
- Run `/plan` first to create a structured implementation plan
- Wait for user approval before writing code

---

## Code Quality

### Before Creating PRs
- Run `/code-review` for a comprehensive code quality check
- Run `/security-review` for any changes touching auth, APIs, or data handling
- Run `/design-review` for any visual/UI changes
- Run `@build-validator` to verify build, tests, lint, and no debug artifacts

### Learn From Mistakes
After a PR review catches issues, run `/learn` to extract recurring patterns and propose additions to this file.

### Rules
- NO hardcoded hex colors or magic pixel values — use design tokens
- NO new frameworks or libraries without discussion
- All components must support light and dark mode
- Comments explain 'why', not 'what'

---

## Project-Specific Rules

- Do NOT deploy to Vercel unless explicitly asked — user tests locally
- Path alias: `@/` maps to `./src/`
- Use Vitest with `globals: true` — do NOT import from 'vitest' in test files
