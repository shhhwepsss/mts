# Frontend

React + Vite SPA for the MTS application.

## Structure

- `src/features/` — feature-sliced modules (create-task, edit-task, delete-task, edit-motorcycle, delete-motorcycle, delete-record)

## Conventions

### Domain entities (Zod)

- Domain entities are defined as Zod schemas — **not** hand-written TypeScript interfaces.
- Schemas live in a `schema/` folder and use the `.schema.ts` extension (e.g. `motorcycle.schema.ts`).
- Inferred types live in a `model/` folder and use the `.model.ts` extension:

  ```ts
  // model/motorcycle.model.ts
  import { z } from 'zod';
  import { MotorcycleSchema } from '../schema/motorcycle.schema';
  export type Motorcycle = z.infer<typeof MotorcycleSchema>;
  ```

- API responses must be validated with `Schema.safeParse(...)`. On failure, log the Zod issues with `console.error` and surface/propagate the error — never silently cast.

### Non-domain types

- Non-domain types (component prop interfaces, utility types, etc.) live inside a `type/` folder within their module.
- Files use the `.type.ts` extension (e.g. `task-list.type.ts`).

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
