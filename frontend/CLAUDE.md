# Frontend

React + Vite SPA for the MTS application.

## Structure

- `src/features/` — feature-sliced modules (create-task, edit-task, delete-task, edit-motorcycle, delete-motorcycle, delete-record)

## Conventions

### Types

- Types live inside a `type/` folder within their module.
- Files use the `.type.ts` extension (e.g. `task.type.ts`).

### Functions used inside JSX

- Helpers/handlers referenced from JSX live inside a `lib/` folder within their module.
- Files use the `.lib.ts` extension (e.g. `format-date.lib.ts`).

### Constants

- Constants live inside a `const/` folder within their module.

### Module `index.ts` re-exports

- A module's `index.ts` must only re-export symbols that are consumed **outside** the module.
- Keep internal-only symbols unexported to preserve module boundaries.

## Reference

- Plan: `../docs/superpowers/plans/2026-04-13-mts-frontend.md`
- Design spec: `../docs/superpowers/specs/2026-04-13-mts-design.md`
- Root: @../CLAUDE.md
