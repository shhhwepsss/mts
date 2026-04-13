# MTS — Motorcycle Tracking System Design Spec

## Overview

Maintenance tracking app for enduro motorcycles. Users track engine hours and get notified when maintenance tasks are due. Engine hours are the primary wear metric (manual input). Single-user MVP with Google authentication.

## Tech Stack

- **Backend**: NestJS, PostgreSQL, TypeORM, DDD + Pragmatic Hexagonal Architecture
- **Frontend**: Vite + React, CSS Modules, Feature-Sliced Design
- **Landing**: Astro (static)
- **Monorepo**: npm workspaces with shared TypeScript types
- **Auth**: Google Sign-In → backend issues its own JWT (access + refresh)
- **Push Notifications**: Firebase Cloud Messaging (browser notifications for web)
- **File Storage**: Local for MVP (swappable to S3 via port)

---

## Domain Model

### Entities

#### User
| Field     | Type   | Constraints                              |
|-----------|--------|------------------------------------------|
| id        | UUID   | PK                                       |
| email     | string | required, non-empty, valid email, max 100 |
| name      | string | required, non-empty, max 100             |
| avatarUrl | string | optional                                 |
| createdAt | Date   |                                          |
| updatedAt | Date   |                                          |

#### GoogleProvider
| Field           | Type   | Constraints                    |
|-----------------|--------|--------------------------------|
| id              | UUID   | PK                             |
| userId          | UUID   | FK → User, unique              |
| googleUserId    | string | required, non-empty, unique    |
| googleEmail     | string | required, non-empty, valid email |
| googleAvatarUrl | string | optional                       |
| createdAt       | Date   |                                |

- 1:1 with User.
- Future providers (Github, Apple) get their own tables with provider-specific fields.
- User.email, User.name, User.avatarUrl are populated from Google data on first login only — not re-synced on subsequent logins.

#### Motorcycle
| Field        | Type                | Constraints                        |
|--------------|---------------------|------------------------------------|
| id           | UUID                | PK                                 |
| userId       | UUID                | FK → User                          |
| name         | string              | required, non-empty, max 255       |
| brand        | string              | required, non-empty, max 255       |
| model        | string              | required, non-empty, max 255       |
| year         | number              | required, cannot be in the future  |
| type         | MotorcycleTypeEnum  | required, must be valid enum value  |
| currentHours | number              | required, ≥ 0                      |
| imageUrl     | string              | optional                           |
| createdAt    | Date                |                                    |
| updatedAt    | Date                |                                    |

**MotorcycleTypeEnum**: `ENDURO` (future: `SPORT`, `STREET`)

#### MaintenanceTask
| Field               | Type    | Constraints                                          |
|---------------------|---------|------------------------------------------------------|
| id                  | UUID    | PK                                                   |
| motorcycleId        | UUID    | FK → Motorcycle                                      |
| name                | string  | required, non-empty                                  |
| description         | string  | optional                                             |
| intervalHours       | number  | required, > 0                                        |
| lastServicedAtHours | number  | nullable, if set must be ≤ motorcycle.currentHours   |
| isDefault           | boolean | required                                             |
| isActive            | boolean | required                                             |
| createdAt           | Date    |                                                      |
| updatedAt           | Date    |                                                      |

#### MaintenanceRecord
| Field            | Type     | Constraints                                  |
|------------------|----------|----------------------------------------------|
| id               | UUID     | PK                                           |
| taskId           | UUID     | FK → MaintenanceTask                         |
| motorcycleId     | UUID     | FK → Motorcycle                              |
| performedAtHours | number   | required, ≤ motorcycle.currentHours          |
| performedAtDate  | Date     | required, must not be in the future          |
| notes            | string   | optional                                     |
| photos           | string[] | optional                                     |
| createdAt        | Date     |                                              |

### Enums

- **MotorcycleTypeEnum**: `ENDURO` (future: `SPORT`, `STREET`)
- **TaskStatus** (value object, computed): `OK`, `DUE_SOON`, `OVERDUE`

### Business Rules

1. **Hours remaining** = `task.intervalHours - (motorcycle.currentHours - task.lastServicedAtHours)`
2. **New task** (`lastServicedAtHours = null`): treat as due immediately (hoursRemaining = 0)
3. **Task is overdue** when hoursRemaining ≤ 0
4. **Task is due soon** when hoursRemaining ≤ 2 hours (hardcoded for MVP, configurable later)
5. When user updates motorcycle hours → recalculate all task statuses for that motorcycle
6. When user completes a task → create MaintenanceRecord, set `task.lastServicedAtHours = motorcycle.currentHours`
7. When a new motorcycle is added → copy hardcoded default tasks for that motorcycle type
8. `currentHours` can only increase (no rollback)
9. Default tasks can be deactivated but not deleted; custom tasks can be deleted
10. When a maintenance record is deleted → if it was the latest record for that task, roll back `task.lastServicedAtHours` to the previous record's `performedAtHours`, or null if no prior records exist

### Default Maintenance Tasks (Enduro)

Hardcoded domain constants (not a DB table). Copied to MaintenanceTask when a new motorcycle is created.

| Task                        | Default Interval (hours) |
|-----------------------------|--------------------------|
| Engine Oil Change           | 15                       |
| Oil Filter Replacement      | 15                       |
| Air Filter Cleaning         | 10                       |
| Chain Lubrication           | 5                        |
| Chain Tension Adjustment    | 10                       |
| Coolant Check               | 30                       |
| Brake Pads Check            | 25                       |
| Brake Fluid Replacement     | 50                       |
| Fork Seal Inspection        | 40                       |
| Shock Absorber Service      | 50                       |
| Spark Plug Replacement      | 30                       |
| Valve Clearance Check       | 30                       |

---

## Backend Architecture

### Approach: Pragmatic Hexagonal

Hexagonal structure with DDD concepts where they add value. Domain layer owns entities and business rules. Ports for external concerns (DB, notifications, file storage). Simple CRUD paths use thin use cases without unnecessary abstraction.

### Layer Diagram

```
Controllers (Driving Adapters)
    ↓ calls
Use Cases (Driving Ports / Application Layer)
    ↓ uses
Domain (Entities, Value Objects, Domain Services, Driven Port interfaces)
    ↑ implemented by
Infrastructure (Driven Adapters: TypeORM repos, FCM, file storage, Google OAuth)
```

**Dependency Rule**: Domain depends on nothing. Infrastructure depends on domain (implements ports). Application depends on domain (orchestrates). Controllers depend on application (invoke use cases).

### Domain Entities vs ORM Entities

Domain entities are pure classes with business logic. ORM entities are TypeORM-decorated classes for persistence. Mappers translate between them.

### Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── domain/
│   │   │   │   ├── entities/user.entity.ts
│   │   │   │   └── ports/user-repository.port.ts
│   │   │   ├── application/
│   │   │   │   └── use-cases/get-user-profile.use-case.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── user.orm-entity.ts
│   │   │   │   │   ├── user.mapper.ts
│   │   │   │   │   └── user.repository.ts
│   │   │   │   └── controllers/user.controller.ts
│   │   │   └── user.module.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   │   ├── entities/google-provider.entity.ts
│   │   │   │   └── ports/auth-provider-repository.port.ts
│   │   │   ├── application/
│   │   │   │   └── use-cases/google-login.use-case.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── google-provider.orm-entity.ts
│   │   │   │   │   ├── google-provider.mapper.ts
│   │   │   │   │   └── google-provider.repository.ts
│   │   │   │   ├── controllers/auth.controller.ts
│   │   │   │   └── guards/jwt-auth.guard.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── motorcycle/
│   │   │   ├── domain/
│   │   │   │   ├── entities/motorcycle.entity.ts
│   │   │   │   ├── enums/motorcycle-type.enum.ts
│   │   │   │   └── ports/motorcycle-repository.port.ts
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   │       ├── create-motorcycle.use-case.ts
│   │   │   │       ├── update-hours.use-case.ts
│   │   │   │       └── get-motorcycles.use-case.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── motorcycle.orm-entity.ts
│   │   │   │   │   ├── motorcycle.mapper.ts
│   │   │   │   │   └── motorcycle.repository.ts
│   │   │   │   └── controllers/motorcycle.controller.ts
│   │   │   └── motorcycle.module.ts
│   │   │
│   │   ├── maintenance/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── maintenance-task.entity.ts
│   │   │   │   │   └── maintenance-record.entity.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── maintenance-calculator.service.ts
│   │   │   │   │   └── default-task-factory.service.ts
│   │   │   │   ├── constants/default-tasks.constants.ts
│   │   │   │   ├── value-objects/task-status.vo.ts
│   │   │   │   └── ports/
│   │   │   │       ├── maintenance-task-repository.port.ts
│   │   │   │       └── maintenance-record-repository.port.ts
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   │       ├── complete-task.use-case.ts
│   │   │   │       ├── create-custom-task.use-case.ts
│   │   │   │       ├── edit-record.use-case.ts
│   │   │   │       ├── delete-record.use-case.ts
│   │   │   │       └── get-task-dashboard.use-case.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── maintenance-task.orm-entity.ts
│   │   │   │   │   ├── maintenance-record.orm-entity.ts
│   │   │   │   │   ├── maintenance-task.mapper.ts
│   │   │   │   │   ├── maintenance-record.mapper.ts
│   │   │   │   │   ├── maintenance-task.repository.ts
│   │   │   │   │   └── maintenance-record.repository.ts
│   │   │   │   └── controllers/
│   │   │   │       ├── maintenance-task.controller.ts
│   │   │   │       └── maintenance-record.controller.ts
│   │   │   └── maintenance.module.ts
│   │   │
│   │   └── notification/
│   │       ├── domain/
│   │       │   └── ports/notification.port.ts
│   │       ├── infrastructure/
│   │       │   └── firebase-notification.adapter.ts
│   │       └── notification.module.ts
│   │
│   ├── shared/
│   │   ├── domain/base.entity.ts
│   │   ├── infrastructure/
│   │   │   ├── database/database.module.ts
│   │   │   └── file-storage/
│   │   │       ├── file-storage.port.ts
│   │   │       └── local-file-storage.adapter.ts
│   │   └── guards/owner.guard.ts
│   │
│   ├── config/app.config.ts
│   ├── app.module.ts
│   └── main.ts
│
├── test/
├── package.json
├── tsconfig.json
└── .env
```

### Cross-Module Communication

Modules import each other's ports, not implementations. Example: motorcycle module uses MaintenanceTaskRepository port when creating a motorcycle (to seed default tasks).

---

## Auth Flow

1. Web app gets a Google token via Google Sign-In SDK (@react-oauth/google)
2. `POST /api/auth/google` — backend receives Google token, verifies with Google
3. First login: create User (populate email, name, avatarUrl from Google data) + create GoogleProvider record
4. Subsequent login: look up GoogleProvider by googleUserId → return existing User (no re-sync of User fields)
5. Backend issues its own JWT: access token + refresh token
6. All subsequent API requests use the backend-issued JWT
7. `POST /api/auth/refresh` — rotates refresh token, returns new access + refresh pair

---

## API Endpoints

### Auth
| Method | Path                | Description                          |
|--------|---------------------|--------------------------------------|
| POST   | /api/auth/google    | Exchange Google token for JWT pair   |
| POST   | /api/auth/refresh   | Refresh JWT token pair               |

### User
| Method | Path           | Description          |
|--------|----------------|----------------------|
| GET    | /api/users/me  | Get current profile  |
| PATCH  | /api/users/me  | Update name          |

### Motorcycles
| Method | Path                          | Description                                    |
|--------|-------------------------------|------------------------------------------------|
| GET    | /api/motorcycles              | List user's motorcycles                        |
| GET    | /api/motorcycles/:id          | Get motorcycle detail with task summary        |
| POST   | /api/motorcycles              | Create motorcycle (seeds default tasks)        |
| PATCH  | /api/motorcycles/:id          | Update motorcycle details                      |
| PATCH  | /api/motorcycles/:id/hours    | Update current hours (triggers recalculation)  |
| DELETE | /api/motorcycles/:id          | Delete motorcycle (cascades tasks & records)   |

### Maintenance Tasks
| Method | Path                                            | Description                                     |
|--------|-------------------------------------------------|-------------------------------------------------|
| GET    | /api/motorcycles/:id/tasks                      | List tasks with status (OK/due soon/overdue)    |
| POST   | /api/motorcycles/:id/tasks                      | Create custom task                              |
| PATCH  | /api/motorcycles/:id/tasks/:taskId              | Update task (interval, name, active/inactive)   |
| POST   | /api/motorcycles/:id/tasks/:taskId/complete     | Mark done (creates record, resets counter)      |
| DELETE | /api/motorcycles/:id/tasks/:taskId              | Delete custom task (not allowed for defaults)   |

### Maintenance Records
| Method | Path                                              | Description                                    |
|--------|---------------------------------------------------|------------------------------------------------|
| GET    | /api/motorcycles/:id/records                      | List history (paginated, filterable by task)    |
| GET    | /api/motorcycles/:id/records/:recordId            | Get record detail (with photos)                |
| PATCH  | /api/motorcycles/:id/records/:recordId            | Edit record (notes, photos, hours, date)       |
| DELETE | /api/motorcycles/:id/records/:recordId            | Delete record (rolls back task if latest)      |

### Notifications
| Method | Path                            | Description                |
|--------|---------------------------------|----------------------------|
| POST   | /api/notifications/device-token | Register FCM device token  |

---

## Monorepo Structure

```
mts/
├── package.json              ← root workspace config
├── packages/
│   └── shared/               ← shared TypeScript types
│       ├── src/
│       │   ├── types/        — DTOs, enums (MotorcycleTypeEnum, TaskStatus)
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── backend/                  ← NestJS (see Backend Architecture)
├── frontend/                 ← Vite + React (see Frontend Architecture)
└── landing/                  ← Astro (see Landing Page)
```

---

## Frontend Architecture

### Tech: Vite + React, CSS Modules, react-router-dom

Responsive SPA with dark theme. CSS Modules for scoped styling. All form input text is white.

### Feature-Sliced Design Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── providers/          — auth, query client, theme, router
│   │   ├── router/             — route definitions
│   │   ├── styles/             — global CSS, variables, reset
│   │   └── index.tsx
│   │
│   ├── pages/
│   │   ├── login/
│   │   ├── garage/             — motorcycle list (home)
│   │   ├── motorcycle-detail/
│   │   ├── add-motorcycle/
│   │   ├── edit-motorcycle/
│   │   ├── task-detail/
│   │   ├── complete-task/
│   │   ├── records-history/
│   │   ├── record-detail/
│   │   ├── edit-record/
│   │   └── profile/
│   │
│   ├── widgets/
│   │   ├── motorcycle-card/    — card with hours + status summary
│   │   ├── task-list/          — task table with status indicators
│   │   ├── record-list/        — records history table
│   │   └── header/             — top navbar with logo, breadcrumbs, user avatar
│   │
│   ├── features/
│   │   ├── google-login/       — Google Sign-In flow
│   │   ├── log-hours/          — update motorcycle hours (modal)
│   │   ├── create-motorcycle/  — create motorcycle
│   │   ├── edit-motorcycle/    — edit motorcycle details
│   │   ├── delete-motorcycle/  — delete motorcycle
│   │   ├── create-task/        — create custom maintenance task
│   │   ├── edit-task/          — edit task (interval, name, active/inactive)
│   │   ├── delete-task/        — delete custom task
│   │   ├── complete-task/      — mark task done with notes/photos (modal)
│   │   ├── edit-record/        — edit maintenance record
│   │   └── delete-record/      — delete maintenance record
│   │
│   ├── entities/
│   │   ├── motorcycle/         — type, API, model
│   │   ├── task/               — type, API, model, status calc
│   │   ├── record/             — type, API, model
│   │   └── user/               — type, API, model
│   │
│   └── shared/
│       ├── ui/                 — Button, Input, Card, StatusBadge, Modal, etc.
│       ├── api/                — axios instance, interceptors, token management
│       ├── lib/                — date utils, hour formatting
│       └── config/             — env vars, constants
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Screens

1. **Login** — centered card with Google Sign-In button
2. **Garage (Motorcycle List)** — grid of motorcycle cards (2-3 cols desktop, 1 mobile), color-coded status border (red=overdue, green=all good, orange=due soon)
3. **Motorcycle Detail** — sidebar with bike info + hours + log hours button, task table with status/interval/remaining/action columns, link to records history
4. **Complete Task (modal)** — form: performed at hours (default: current), date, notes, photos
5. **Records History** — table with task filter, edit/delete inline actions, pagination
6. **Record Detail** — full record with photos, edit and delete actions
7. **Edit Record** — same form as complete task, pre-filled with existing data
8. **Add/Edit Motorcycle** — form: name, brand, model, year, type dropdown, current hours, photo upload
9. **Profile** — avatar, name edit, email display, sign out

### Routing

```
/ (unauthenticated)
└── /login

/ (authenticated)
├── /garage                              — motorcycle list (home)
├── /garage/add                          — add motorcycle
├── /garage/:id                          — motorcycle detail + task list
├── /garage/:id/edit                     — edit motorcycle
├── /garage/:id/tasks/:taskId            — task detail
├── /garage/:id/tasks/:taskId/complete   — complete task
├── /garage/:id/records                  — records history
├── /garage/:id/records/:recordId        — record detail
├── /garage/:id/records/:recordId/edit   — edit record
└── /profile                             — user profile
```

### Responsive Breakpoints

- **Desktop (≥1024px)** — garage 2-3 column grid, motorcycle detail sidebar + task table
- **Tablet (768-1023px)** — garage 2 columns, motorcycle detail stacks sidebar above tasks
- **Mobile (<768px)** — garage single column, tasks as cards instead of table, forms full-width
- **Navigation** — top navbar on all sizes, hamburger menu on mobile
- **Modals** — centered on desktop, full-screen on mobile

### Design Tokens (CSS Variables)

```css
--bg-primary: #0d0d1a;
--bg-secondary: #1a1a2e;
--bg-tertiary: #2a2a3e;
--text-primary: #e0e0e0;
--text-secondary: #888888;
--text-input: #ffffff;
--border: #333333;
--accent: #90caf9;
--status-ok: #4caf50;
--status-due-soon: #ff9800;
--status-overdue: #f44336;
--action-primary: #2e7d32;
--action-danger: #c62828;
```

### Notifications

- Browser notifications (Notification API) when tasks cross "due soon" or "overdue" thresholds
- In-app: badge/indicator on motorcycle card and task list items
- Triggered when hours are updated

---

## Landing Page

### Tech: Astro (static site), i18n

Static marketing page with internationalization support. Dark theme matching the web app.

### Structure

```
landing/
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro              — default language
│   │   └── [lang]/
│   │       └── index.astro          — localized pages
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── Features.astro
│   │   ├── HowItWorks.astro
│   │   └── Cta.astro
│   ├── i18n/
│   │   ├── en.json                  — English translations
│   │   ├── uk.json                  — Ukrainian translations (add more as needed)
│   │   └── utils.ts                 — i18n helper (getTranslation, getCurrentLocale)
│   └── styles/
│       └── global.css
├── public/
│   └── images/
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

### Sections

1. **Nav** — MTS logo + "Open App" button linking to the web app
2. **Hero** — headline ("Never Miss a Maintenance Window"), subtitle, "Get Started" CTA, app screenshot
3. **Features** — 6 cards in 3x2 grid: Hours-Based Tracking, Smart Alerts, Full History, Multi-Bike Garage, Custom Tasks, Responsive
4. **How It Works** — 3 numbered steps: Add Your Bike → Log Your Hours → Stay on Top
5. **CTA** — "Ready to Ride?" + Get Started button
6. **Footer** — minimal, app name

### i18n

- Default language: English
- Translations stored as JSON files in `src/i18n/`
- Language switcher in the nav
- Astro static routing: `/` for English, `/uk/` for Ukrainian, etc.
- All visible text pulled from translation files, no hardcoded strings in components

### Responsive

- **Desktop** — features 3 columns, how-it-works horizontal
- **Tablet** — features 2 columns
- **Mobile** — features 1 column, how-it-works stacked vertical

---

## Error Handling

- Domain validation errors return 400 with structured error response
- Auth errors return 401
- Ownership violations return 403
- Not found returns 404
- All domain entities validate invariants in constructors/methods
- Controllers use NestJS exception filters to map domain exceptions to HTTP responses

## Testing Strategy

- **Domain layer**: unit tests for entities, value objects, domain services (maintenance calculator, default task factory)
- **Use cases**: unit tests with mocked ports
- **Controllers**: integration tests with test database
- **Frontend**: component tests for widgets, integration tests for features
