# Implementation Plan: Personal Progress Tracker

**Branch**: `001-high-level-need` | **Date**: 2025-10-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-high-level-need/spec.md`

**Note**: This plan follows the Habits Tracker Constitution v1.2.1 (governance document) and applies "Simplicity First" principle throughout. Application version: 0.1.0 (initial MVP).

## Summary

Build a web application (TypeScript + PostgreSQL + Express + Vue3) that enables users to track progress toward personal goals and maintain recurring habits. The system supports two distinct tracking models: (1) target-based goals with deadlines showing percentage progress toward a specific value, and (2) continuous counter goals tracking accumulated streaks (e.g., "days without alcohol"). Users manually log progress entries and view visual representations of their trajectory using Chart.js line charts isolated behind an abstraction layer. The MVP (P1) focuses on core tracking functionality; visualization (P2), advanced habit frequencies (P3), and organization features (P4) follow incrementally.

**Technical Approach**: Web application with separate backend (Express REST API + Prisma ORM) and frontend (Vue 3 + shadcn-vue). Token-based authentication (JWT). Chart.js isolated in services layer per constitution. Incremental progress logging. API contract tests mandatory (Vitest + Supertest).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Primary Dependencies**: Express.js (backend), Vue 3 Composition API (frontend), Prisma 5.x (ORM), Zod 3.x (validation), Chart.js (visualization)  
**Storage**: PostgreSQL 16+ with Prisma migrations  
**Testing**: Vitest 1.x + Supertest (API contract tests mandatory per constitution)  
**Target Platform**: Web (Linux/macOS server), mobile-responsive frontend (future native mobile apps)  
**Project Type**: Web application (backend + frontend)  
**Performance Goals**: <1s API response time, handle 50+ active goals per user without degradation  
**Constraints**: Mobile-ready architecture (stateless API, JWT auth), Chart.js MUST be isolated behind abstraction  
**Scale/Scope**: V1 targets individual users, 36 functional requirements across 4 prioritized user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First ✅ PASS

- **Adherence**: Using established frameworks (Express, Vue3, Prisma) over custom implementations
- **Adherence**: shadcn-vue default theme (no custom design system)
- **Adherence**: ESLint/Prettier deferred to post-MVP
- **Adherence**: Reminders feature deferred to V2 (out of scope for V1)
- ⚠️ **Watch**: Habit frequency flexibility (daily/weekly/custom/complex patterns) adds significant complexity
  - **Justification**: User explicitly requested full flexibility (Q3 decision)
  - **Mitigation**: Implement in phases (basic patterns first, complex patterns later within V1)
  - **Documented in**: Complexity Tracking section below

### Principle II: TypeScript Strict Mode ✅ PASS

- **Adherence**: `strict: true` enforced in tsconfig.json
- **Adherence**: Zod schemas provide runtime validation + compile-time types
- **Adherence**: Prisma generates type-safe database client
- **Adherence**: Shared types directory for frontend/backend consistency
- **No violations**

### Principle III: API Testing Required ✅ PASS

- **Adherence**: Vitest + Supertest configured for contract tests
- **Adherence**: All 36 functional requirements map to testable API endpoints
- **Adherence**: Test-first approach documented in quickstart.md
- **No violations**

### Principle IV: Code Review Mandatory ✅ PASS

- **Adherence**: PR workflow enforced via branch strategy
- **Adherence**: Quality gates defined (tests pass, TypeScript compiles, no `any` types)
- **No violations**

### Principle V: Mobile-Ready Architecture ✅ PASS

- **Adherence**: Backend is stateless REST API (no server-side sessions)
- **Adherence**: JWT token-based auth (works for web + future mobile)
- **Adherence**: API returns JSON only (no HTML rendering)
- **Adherence**: Frontend calls backend API (no direct DB access)
- **No violations**

### Principle VI: Dependency Isolation ✅ PASS

- **Adherence**: Chart.js isolated in `frontend/src/services/charts/` layer
- **Adherence**: Components use abstraction, not direct Chart.js imports
- **Adherence**: Internal chart interfaces defined independently of library
- **Structure**: `chartAdapter.ts`, `chartTypes.ts`, `chartTheme.ts` per constitution
- **No violations**

### Visual Design Standards ✅ PASS

- **Adherence**: shadcn-vue default theme (Zinc palette)
- **Adherence**: System fonts with Inter fallback
- **Adherence**: Lucide icons + emoji for goal/habit avatars
- **No violations**

### Development Standards ✅ PASS

- **Adherence**: Standard API error format defined (JSON with code/message/details)
- **Adherence**: Environment validation with Zod at startup
- **Adherence**: `.env.example` will document all required variables
- **No violations**

**Gate Status**: ✅ **PASS** - Proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```
specs/001-high-level-need/
├── spec.md              # Feature specification (COMPLETE)
├── wireframes.md        # UI wireframes - 7 screens (COMPLETE)
├── checklists/
│   └── requirements.md  # Spec validation checklist (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0 output (PENDING)
├── data-model.md        # Phase 1 output (PENDING)
├── quickstart.md        # Phase 1 output (PENDING)
├── contracts/           # Phase 1 output (PENDING)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── models/              # Prisma schema + generated client
│   │   ├── schema.prisma    # Database schema definition
│   │   └── index.ts         # Prisma client export
│   ├── services/            # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── goals.service.ts
│   │   ├── habits.service.ts
│   │   └── categories.service.ts
│   ├── routes/              # Express route handlers
│   │   ├── auth.routes.ts
│   │   ├── goals.routes.ts
│   │   ├── habits.routes.ts
│   │   └── categories.routes.ts
│   ├── middleware/          # Auth, validation, error handling
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── validators/          # Zod schemas for request validation
│   │   ├── auth.validator.ts
│   │   ├── goals.validator.ts
│   │   ├── habits.validator.ts
│   │   └── shared.validator.ts
│   ├── config/              # Environment config + validation
│   │   └── env.ts           # Zod-validated environment variables
│   ├── utils/               # Utilities (date handling, JWT, bcrypt)
│   │   ├── date.utils.ts    # date-fns wrappers for streaks/timezones
│   │   ├── jwt.utils.ts
│   │   └── password.utils.ts
│   └── server.ts            # Express app setup + startup
├── tests/
│   ├── contract/            # API contract tests (REQUIRED)
│   │   ├── auth.test.ts
│   │   ├── goals.test.ts
│   │   ├── habits.test.ts
│   │   └── categories.test.ts
│   ├── integration/         # Database integration tests
│   │   ├── goals.integration.test.ts
│   │   └── habits.integration.test.ts
│   └── setup.ts             # Test database setup
├── prisma/
│   └── migrations/          # Prisma migration files (auto-generated)
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .env.example

frontend/
├── src/
│   ├── components/          # Vue components (shadcn-vue + custom)
│   │   ├── ui/              # shadcn-vue components (auto-generated)
│   │   ├── charts/          # Chart components (use chart abstraction)
│   │   │   ├── ProgressLineChart.vue
│   │   │   └── HabitCalendarChart.vue
│   │   ├── goals/
│   │   │   ├── GoalCard.vue
│   │   │   ├── GoalForm.vue
│   │   │   ├── ProgressOverview.vue
│   │   │   └── ProgressHistory.vue
│   │   ├── habits/
│   │   │   ├── HabitCard.vue
│   │   │   ├── HabitForm.vue
│   │   │   ├── StreakDisplay.vue
│   │   │   └── HabitHistory.vue
│   │   └── layout/
│   │       ├── AppHeader.vue
│   │       └── AppLayout.vue
│   ├── views/               # Page-level components (Vue Router)
│   │   ├── Dashboard.vue
│   │   ├── GoalDetail.vue
│   │   ├── HabitDetail.vue
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── services/            # API client + business logic
│   │   ├── api/             # HTTP client + API calls
│   │   │   ├── client.ts    # Axios/fetch wrapper with auth interceptor
│   │   │   ├── auth.api.ts
│   │   │   ├── goals.api.ts
│   │   │   ├── habits.api.ts
│   │   │   └── categories.api.ts
│   │   └── charts/          # Chart abstraction layer (CRITICAL - constitution requirement)
│   │       ├── chartAdapter.ts      # Adapter for Chart.js
│   │       ├── chartTypes.ts        # Application chart interfaces
│   │       └── chartTheme.ts        # Centralized theming
│   ├── composables/         # Vue composition functions
│   │   ├── useAuth.ts
│   │   ├── useGoals.ts
│   │   └── useHabits.ts
│   ├── lib/                 # Third-party library wrappers
│   │   └── chartjs-wrapper.ts       # Chart.js imports (isolated)
│   ├── router/              # Vue Router configuration
│   │   └── index.ts
│   ├── stores/              # Pinia state management (if needed)
│   │   ├── auth.store.ts
│   │   └── goals.store.ts
│   ├── types/               # TypeScript interfaces (shared with backend)
│   │   └── index.ts         # Import from shared/types
│   └── main.ts              # Vue app entry point
├── tests/
│   └── unit/                # Component tests (optional for V1)
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── .env.example

shared/
└── types/                   # Shared TypeScript types (Zod schemas exported as types)
    ├── auth.types.ts
    ├── goals.types.ts
    ├── habits.types.ts
    └── api.types.ts         # Common API response/error types

.env.example                 # Environment variable documentation
.gitignore
package.json                 # Root workspace config (if using monorepo)
README.md
```

**Structure Decision**: Web application (Option 2) with separate backend and frontend directories. This structure supports:
- Independent deployment of backend/frontend
- Clear separation of concerns (API layer vs presentation layer)
- Mobile-ready architecture (future mobile apps can consume same backend API)
- Shared types via dedicated `shared/` directory
- Chart.js isolation in `frontend/src/services/charts/` per constitution Principle VI

## Complexity Tracking

*Filled because Constitution Check identified one complexity concern*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Habit frequency patterns (full flexibility: daily, weekly, custom intervals, monthly, complex) | User explicitly requested (Q3 decision: Option D). Requirement FR-019 demands flexible patterns including "3x/week on weekdays only" | Simpler options (A: daily only, B: daily+weekly) would fail to meet user requirements for diverse habit tracking scenarios (gym 3x/week, monthly check-ins, etc.). User prioritized flexibility over simplicity for this feature. |

**Mitigation Strategy**: 
- Implement habit frequency patterns in phases within V1:
  - Phase 1 (MVP): Daily and simple weekly (X times per week, any days)
  - Phase 2 (V1 mid): Custom intervals (every N days) and monthly
  - Phase 3 (V1 final): Complex patterns (weekdays only, specific days, etc.)
- Use strategy pattern for frequency calculation (easily extensible)
- Isolate frequency logic in dedicated service (`habits.frequency.service.ts`)
- Comprehensive unit tests for each frequency pattern

**Justification Accepted**: Complexity is feature-driven, not over-engineering. Phased implementation approach maintains simplicity principle while delivering full flexibility.

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETE

**File**: [research.md](./research.md)

**Completed**:
- ✅ Prisma ORM architecture patterns (discriminated union for goals, incremental progress)
- ✅ Zod validation strategy (shared schemas frontend/backend)
- ✅ JWT authentication with refresh tokens (stateless, mobile-ready)
- ✅ date-fns patterns for streak calculation (timezone-aware)
- ✅ Chart.js isolation via adapter pattern (dependency abstraction)
- ✅ Habit frequency strategy pattern (extensible for 5 frequency types)
- ✅ Environment validation with Zod (fail-fast startup)
- ✅ API error handling middleware (standard error format)

**Key Decisions Documented**:
- Database: Prisma + PostgreSQL with discriminated unions
- Validation: Zod schemas shared via `shared/types/`
- Auth: JWT access (15min) + refresh tokens (7 days)
- Dates: date-fns for all date operations
- Charts: Adapter pattern isolates Chart.js in `services/charts/`
- Habits: Strategy pattern for frequency calculations

**No NEEDS CLARIFICATION items remain** - all technical unknowns resolved.

---

### Phase 1: Design ✅ COMPLETE

**Files Generated**:
1. [data-model.md](./data-model.md) - Complete Prisma schema with 6 entities
2. [contracts/openapi.yaml](./contracts/openapi.yaml) - Main API spec
3. [contracts/auth.yaml](./contracts/auth.yaml) - Authentication endpoints (5)
4. [contracts/goals.yaml](./contracts/goals.yaml) - Goal endpoints (8)
5. [contracts/habits.yaml](./contracts/habits.yaml) - Habit endpoints (9)
6. [contracts/categories.yaml](./contracts/categories.yaml) - Category endpoints (6)
7. [quickstart.md](./quickstart.md) - Developer setup guide

**Data Model Summary**:
- **6 Entities**: User, Goal, ProgressEntry, Habit, HabitCompletion, Category
- **Discriminated union** for goal types (TARGET_BASED | CONTINUOUS_COUNTER)
- **Flexible JSON config** for habit frequencies (Zod-validated)
- **Cascade deletes** for data cleanup (User → Goals → ProgressEntries)
- **Indexes** for common query patterns (userId + status, goalType, dates)
- **Migration strategy** documented (Prisma migrate dev/deploy)

**API Contracts Summary**:
- **28 REST endpoints** across 4 resource groups
- **OpenAPI 3.0.3 spec** with Zod schema alignment
- **JWT Bearer auth** on all endpoints except register/login
- **Standard error responses** (JSON with code/message/details)
- **Request/response examples** for all endpoints

**Quickstart Guide Includes**:
- Prerequisites and installation steps
- Environment configuration (.env setup)
- Database migration workflow
- Development server commands (backend + frontend)
- Testing commands (Vitest + Supertest)
- API testing examples (cURL + Postman)
- Troubleshooting common issues
- Constitution compliance checklist
- Development best practices

---

## Implementation Readiness

### ✅ Ready for /speckit.tasks

All Phase 0 and Phase 1 artifacts complete. The feature is ready for task breakdown.

**Available for Task Generation**:
1. ✅ Spec with 36 functional requirements (FR-001 to FR-036)
2. ✅ 4 prioritized user stories (P1-P4)
3. ✅ Complete data model (6 entities, all fields, relationships)
4. ✅ 28 API endpoints with request/response schemas
5. ✅ Wireframes for 7 screens + component inventory
6. ✅ Technical patterns documented (Prisma, Zod, JWT, date-fns, Chart.js)
7. ✅ Development environment setup guide

**Next Command**:
```
/speckit.tasks
```

This will generate `tasks.md` with sequenced implementation tasks organized by user story (P1 MVP → P2 → P3 → P4).

---

## Architecture Summary

### Backend Stack

- **Runtime**: Node.js 22+ with TypeScript 5.x (strict mode)
- **Framework**: Express.js (REST API)
- **ORM**: Prisma 5.x (type-safe, auto-migrations)
- **Database**: PostgreSQL 16+
- **Validation**: Zod 3.x (runtime + compile-time types)
- **Auth**: JWT (jsonwebtoken) + bcrypt (password hashing)
- **Testing**: Vitest + Supertest (contract tests)
- **Date/Time**: date-fns (streak calculations)

**Structure**:
```
backend/src/
├── models/schema.prisma    # Database schema
├── services/               # Business logic
├── routes/                 # Express route handlers
├── middleware/             # Auth, validation, errors
├── validators/             # Zod schemas
├── config/env.ts           # Zod-validated environment
└── utils/                  # JWT, password, date helpers
```

### Frontend Stack

- **Runtime**: Node.js 22+ with TypeScript 5.x (strict mode)
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS + shadcn-vue (default theme)
- **Charts**: Chart.js (isolated via adapter pattern)
- **Routing**: Vue Router
- **State**: Pinia (if needed) or composables
- **HTTP**: Axios/fetch with JWT interceptor

**Structure**:
```
frontend/src/
├── components/
│   ├── ui/                 # shadcn-vue auto-generated
│   ├── charts/             # Chart components (use abstraction)
│   ├── goals/              # Goal-specific components
│   ├── habits/             # Habit-specific components
│   └── layout/             # App layout components
├── views/                  # Pages (Router)
├── services/
│   ├── api/                # HTTP clients
│   └── charts/             # Chart.js abstraction (CRITICAL)
├── composables/            # Vue composables
└── types/                  # TypeScript types (from shared)
```

### Shared

```
shared/types/               # Zod schemas + inferred types
├── auth.types.ts
├── goals.types.ts
├── habits.types.ts
└── api.types.ts
```

---

## Constitution Compliance Final Check

### ✅ All Principles Satisfied

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Simplicity First | ✅ PASS | Established frameworks (Express, Vue3, Prisma), shadcn-vue defaults, reminders deferred to V2 |
| II. TypeScript Strict | ✅ PASS | `strict: true` enforced, Zod schemas, Prisma generated types, shared types directory |
| III. API Testing Required | ✅ PASS | Vitest + Supertest configured, 28 endpoints documented, contract test structure defined |
| IV. Code Review Mandatory | ✅ PASS | PR workflow enforced, quality gates defined in quickstart.md |
| V. Mobile-Ready Architecture | ✅ PASS | Stateless REST API, JWT tokens, JSON responses, separate frontend/backend |
| VI. Dependency Isolation | ✅ PASS | Chart.js isolated in `services/charts/` with adapter pattern, internal types defined |
| Visual Design | ✅ PASS | shadcn-vue default theme (Zinc palette), system fonts, Lucide icons |
| Development Standards | ✅ PASS | API error format standardized, environment validation (Zod), ESLint deferred |

**Complexity Tracking**: Habit frequency flexibility justified and mitigated with phased rollout strategy.

---

## Plan Complete ✅

**Status**: All planning phases complete (Phase 0 Research + Phase 1 Design)

**Branch**: `001-high-level-need`  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)  
**Data Model**: [data-model.md](./data-model.md)  
**Contracts**: [contracts/](./contracts/)  
**Quickstart**: [quickstart.md](./quickstart.md)

**Next Steps**:
1. Run `/speckit.tasks` to generate task breakdown
2. Begin implementation following tasks.md
3. Commit frequently (after each task)
4. Run contract tests before PRs
5. Review constitution compliance before merge

---

**Generated**: 2025-10-25  
**Constitution Version**: 1.2.1 (governance document)  
**Application Version**: 0.1.0 (initial MVP)  
**Ready for Implementation**: YES ✅
