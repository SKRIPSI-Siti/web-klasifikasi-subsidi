# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Next.js 16 / React 19 frontend MVP for a household electricity subsidy eligibility
classification system (PLN Aceh) using LightGBM. **The entire backend is currently mocked
in the frontend** — no Flask/Supabase integration yet (planned for milestone M8+). Written
primarily in Indonesian (UI copy, comments, domain terms) — match that when editing existing
files.

Reference docs: `Dokumen/PRD.md` (requirements) and `Dokumen/MVP.md` (milestones) — consult
these for the data dictionary, API contract shapes, and milestone exit criteria before
changing `lib/types.ts` or `lib/data/mock-api.ts`.

## Important: non-standard Next.js version

This repo uses Next.js 16, which has breaking changes vs. the Next.js in most training data
(APIs, conventions, file structure may differ). Before writing App Router / middleware /
config code, check `node_modules/next/dist/docs/` (`01-app/`, `02-pages/`, `03-architecture/`).
Notably, middleware here is named `proxy.ts` (not `middleware.ts`) exporting a `proxy()`
function — this is Next 16's convention, not a project quirk.

## Commands

```bash
npm run dev         # start dev server (Turbopack)
npm run build
npm run start
npm run lint         # eslint
npm run format        # prettier --write on **/*.{ts,tsx}
npm run typecheck      # tsc --noEmit
```

No test runner is configured. There is no `.git` repository initialized yet at the
`web-klasifikasi-subsidi` level (git lives at a parent directory, if at all) — verify before
assuming git commands work from this folder.

Adding shadcn/ui components (style `base-rhea`, already configured in `components.json`):
```bash
npx shadcn@latest add <component-name>
```

## Architecture

**All data access is centralized through `lib/data/*`** — pages never talk to storage or
mock logic directly:

- `lib/types.ts` — entity contracts, frozen since milestone M0 and mirroring the intended
  Supabase schema (see `docs/schema.sql`) and Flask API contract (PRD §15). Changing these
  requires agreement per `MVP.md` M0 exit criteria.
- `lib/data/seed.ts` — single centralized dummy dataset (PRD §13) used to initialize state.
- `lib/data/store.tsx` — global client state: a React Context + `useReducer` store, persisted
  to `localStorage` under key `klasifikasi-subsidi-store-v1`. `useStore()` gives
  `{ state, dispatch, addActivity }`; `useActiveModel()` is a selector for the active model.
  Delete the localStorage key to reset to the seed.
- `lib/data/mock-api.ts` — the mock "backend": scoring heuristic (`scoreRow`), row prediction
  (`predictRow`), and dummy evaluation generation (`generateEvaluation`). Return shapes
  intentionally match the future Flask API contract (PRD §15) so pages won't need to change
  when integration happens — only the function bodies get replaced with `fetch()` calls.

**Auth is a dummy cookie flow**: `lib/auth.ts` sets/clears a `subsidi_session` cookie
client-side (`loginDummy()`/`logoutDummy()`); `proxy.ts` is the route guard that redirects
based on cookie presence (matcher covers `/login` and all dashboard routes). Real auth
(Supabase) arrives at milestone M9.

**Route groups** under `app/`:
- `(auth)/login/` — login page, no sidebar.
- `(dashboard)/` — shared Sidebar + Header layout (`layout.tsx`), gated by `proxy.ts`.
  Feature routes: `dashboard/`, `dataset/`, `preprocessing/` (5-step stepper flow), `model/`
  (`training/`, `evaluation/`), `prediksi/` (history, manual/batch prediction, results),
  `laporan/`, `pengaturan/`.

**Components**: `components/ui/` are shadcn primitives (`base-rhea` style) — do not hand-roll
ad-hoc styling on top of these; extend via `cn`/`cva` per existing patterns. Composite
components (Stepper, StatCard, EmptyState, file-dropzone, etc.) live directly under
`components/`.

## Code style

Enforced via `.prettierrc` (no semicolons, double quotes, 2-space tabs, Tailwind class
sorting via `prettier-plugin-tailwindcss`) and `eslint.config.mjs` (`eslint-config-next`
core-web-vitals + typescript). Run `npm run format` and `npm run lint` before considering
a change done.
