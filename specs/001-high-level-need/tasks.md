# Tasks: Personal Progress Tracker

**Input**: Design documents from `/specs/001-high-level-need/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: API contract tests are REQUIRED per constitution (Principle III). All contract tests marked below are mandatory.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`
- **Shared types**: `shared/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create root project directory structure with backend/, frontend/, and shared/ folders
- [ ] T002 [P] Initialize backend Node.js project with TypeScript 5.x in backend/package.json
- [ ] T003 [P] Initialize frontend Vite + Vue 3 project with TypeScript in frontend/package.json
- [ ] T004 [P] Create shared types directory structure at shared/types/
- [ ] T005 [P] Configure backend tsconfig.json with strict mode enabled
- [ ] T006 [P] Configure frontend tsconfig.json with strict mode enabled and Vue settings
- [ ] T007 [P] Setup Tailwind CSS in frontend/ with tailwind.config.ts
- [ ] T008 [P] Install shadcn-vue in frontend/ using CLI
- [ ] T009 [P] Create .gitignore files for backend/, frontend/, and root
- [ ] T010 [P] Create backend/.env.example with documented environment variables
- [ ] T011 [P] Create frontend/.env.example with API base URL
- [ ] T012 Create README.md at root with project overview and quickstart reference

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & ORM

- [ ] T013 Install Prisma dependencies in backend/package.json (prisma, @prisma/client)
- [ ] T014 Initialize Prisma with PostgreSQL in backend/prisma/schema.prisma
- [ ] T015 Create complete Prisma schema in backend/src/models/schema.prisma per data-model.md (User, Goal, ProgressEntry, Habit, HabitCompletion, Category entities)
- [ ] T016 Create initial Prisma migration for all entities
- [ ] T017 Generate Prisma client in backend/src/models/index.ts

### Environment Configuration

- [ ] T018 [P] Install Zod in backend/package.json for environment validation
- [ ] T019 [P] Create environment config with Zod validation in backend/src/config/env.ts

### Authentication Infrastructure

- [ ] T020 [P] Install JWT and bcrypt dependencies in backend/package.json (jsonwebtoken, bcrypt, @types/jsonwebtoken, @types/bcrypt)
- [ ] T021 [P] Create JWT utility functions in backend/src/utils/jwt.utils.ts (sign, verify, decode)
- [ ] T022 [P] Create password hashing utilities in backend/src/utils/password.utils.ts (hash, compare)
- [ ] T023 Create authentication middleware in backend/src/middleware/auth.middleware.ts (JWT token verification)

### API Infrastructure

- [ ] T024 [P] Install Express dependencies in backend/package.json (express, @types/express, cors, @types/cors)
- [ ] T025 [P] Create Express app setup in backend/src/server.ts with middleware (cors, json parser, error handler)
- [ ] T026 [P] Create validation middleware in backend/src/middleware/validation.middleware.ts (Zod schema validator)
- [ ] T027 [P] Create error handling middleware in backend/src/middleware/error.middleware.ts (standardized JSON error format)
- [ ] T028 Create API router structure in backend/src/routes/ (empty route files for auth, goals, habits, categories)

### Testing Infrastructure

- [ ] T029 [P] Install Vitest and Supertest in backend/package.json (vitest, supertest, @types/supertest)
- [ ] T030 [P] Create Vitest configuration in backend/vitest.config.ts
- [ ] T031 [P] Create test database setup script in backend/tests/setup.ts
- [ ] T032 Create test utilities and helpers in backend/tests/helpers/ (auth helpers, test data factories)

### Shared Types Foundation

- [ ] T033 [P] Install Zod in shared/ (if separate package) or reference from backend
- [ ] T034 [P] Create shared API error types in shared/types/api.types.ts
- [ ] T035 [P] Create shared auth types in shared/types/auth.types.ts (Zod schemas for login, register, user)
- [ ] T036 Create shared types index in shared/types/index.ts (export all types)

### Frontend Foundation

- [ ] T037 [P] Install Vue Router in frontend/package.json
- [ ] T038 [P] Install Axios in frontend/package.json for HTTP client
- [ ] T039 [P] Create Axios HTTP client with JWT interceptor in frontend/src/services/api/client.ts
- [ ] T040 [P] Create Vue Router configuration in frontend/src/router/index.ts (empty routes)
- [ ] T041 [P] Create app layout component in frontend/src/components/layout/AppLayout.vue
- [ ] T042 [P] Create app header component in frontend/src/components/layout/AppHeader.vue
- [ ] T043 Create auth composable in frontend/src/composables/useAuth.ts (login, logout, token management)
- [ ] T044 Create main app entry point in frontend/src/main.ts with router and global setup

### Date/Time Utilities

- [ ] T045 [P] Install date-fns in backend/package.json
- [ ] T046 [P] Create date utility functions in backend/src/utils/date.utils.ts (streak calculations, timezone handling)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Track Quantifiable Goals (Priority: P1) 🎯 MVP

**Goal**: Enable users to create target-based goals and continuous counter goals, log progress, and view history

**Independent Test**: 
1. Create target-based goal with target value and deadline, log progress, view percentage completion
2. Create continuous counter goal, log daily progress, view accumulated count, log reset event

### Shared Types for User Story 1

- [ ] T047 [P] [US1] Create goal types with Zod schemas in shared/types/goals.types.ts (Goal, CreateGoalRequest, UpdateGoalRequest, ProgressEntry, CreateProgressEntryRequest)

### Backend: Contract Tests for User Story 1

- [ ] T048 [P] [US1] Contract test for POST /api/auth/register in backend/tests/contract/auth.test.ts
- [ ] T049 [P] [US1] Contract test for POST /api/auth/login in backend/tests/contract/auth.test.ts
- [ ] T050 [P] [US1] Contract test for GET /api/auth/me in backend/tests/contract/auth.test.ts
- [ ] T051 [P] [US1] Contract test for POST /api/goals in backend/tests/contract/goals.test.ts
- [ ] T052 [P] [US1] Contract test for GET /api/goals in backend/tests/contract/goals.test.ts
- [ ] T053 [P] [US1] Contract test for GET /api/goals/:id in backend/tests/contract/goals.test.ts
- [ ] T054 [P] [US1] Contract test for PATCH /api/goals/:id in backend/tests/contract/goals.test.ts
- [ ] T055 [P] [US1] Contract test for DELETE /api/goals/:id in backend/tests/contract/goals.test.ts
- [ ] T056 [P] [US1] Contract test for POST /api/goals/:id/progress in backend/tests/contract/goals.test.ts
- [ ] T057 [P] [US1] Contract test for GET /api/goals/:id/progress in backend/tests/contract/goals.test.ts
- [ ] T058 [P] [US1] Contract test for PATCH /api/goals/:id/progress/:entryId in backend/tests/contract/goals.test.ts
- [ ] T059 [P] [US1] Contract test for DELETE /api/goals/:id/progress/:entryId in backend/tests/contract/goals.test.ts

### Backend: Validation for User Story 1

- [ ] T060 [P] [US1] Create auth validators in backend/src/validators/auth.validator.ts (register, login schemas using Zod)
- [ ] T061 [P] [US1] Create goal validators in backend/src/validators/goals.validator.ts (create, update, progress entry schemas using Zod with discriminated union for goal types)

### Backend: Services for User Story 1

- [ ] T062 [P] [US1] Implement AuthService in backend/src/services/auth.service.ts (register, login, getUserById, password hashing, JWT generation)
- [ ] T063 [US1] Implement GoalsService in backend/src/services/goals.service.ts (create, list, get, update, delete, calculate progress for both goal types)
- [ ] T064 [US1] Implement ProgressEntriesService in backend/src/services/progress-entries.service.ts (create, list, update, delete, recalculate goal currentValue)

### Backend: Routes for User Story 1

- [ ] T065 [P] [US1] Implement auth routes in backend/src/routes/auth.routes.ts (POST /register, POST /login, GET /me, POST /logout)
- [ ] T066 [US1] Implement goals routes in backend/src/routes/goals.routes.ts (CRUD endpoints + progress endpoints per contracts/goals.yaml)

### Frontend: Authentication UI for User Story 1

- [ ] T067 [P] [US1] Create Login view in frontend/src/views/Login.vue with email/password form
- [ ] T068 [P] [US1] Create Register view in frontend/src/views/Register.vue with email/password/confirm form
- [ ] T069 [US1] Add auth routes to Vue Router in frontend/src/router/index.ts (/login, /register)
- [ ] T070 [US1] Create auth API client in frontend/src/services/api/auth.api.ts (register, login, getMe, logout)

### Frontend: Goals UI for User Story 1

- [ ] T071 [P] [US1] Create GoalCard component in frontend/src/components/goals/GoalCard.vue (displays goal with progress indicator, discriminated by goal type)
- [ ] T072 [P] [US1] Create GoalForm component in frontend/src/components/goals/GoalForm.vue (create/edit form with goal type selector, conditional fields)
- [ ] T073 [P] [US1] Create ProgressOverview component in frontend/src/components/goals/ProgressOverview.vue (percentage/count display, days remaining/elapsed)
- [ ] T074 [P] [US1] Create ProgressHistory component in frontend/src/components/goals/ProgressHistory.vue (chronological list of progress entries with edit/delete)
- [ ] T075 [US1] Create Dashboard view in frontend/src/views/Dashboard.vue (list of all goals, filter, create button)
- [ ] T076 [US1] Create GoalDetail view in frontend/src/views/GoalDetail.vue (single goal with progress history and log entry form)
- [ ] T077 [US1] Add goal routes to Vue Router in frontend/src/router/index.ts (/, /goals/:id)
- [ ] T078 [US1] Create goals API client in frontend/src/services/api/goals.api.ts (CRUD + progress endpoints)
- [ ] T079 [US1] Create useGoals composable in frontend/src/composables/useGoals.ts (state management, API calls)

### Frontend: shadcn-vue Components for User Story 1

- [ ] T080 [P] [US1] Install shadcn-vue Button component in frontend/src/components/ui/
- [ ] T081 [P] [US1] Install shadcn-vue Input component in frontend/src/components/ui/
- [ ] T082 [P] [US1] Install shadcn-vue Card component in frontend/src/components/ui/
- [ ] T083 [P] [US1] Install shadcn-vue Dialog component in frontend/src/components/ui/
- [ ] T084 [P] [US1] Install shadcn-vue Select component in frontend/src/components/ui/
- [ ] T085 [P] [US1] Install shadcn-vue Badge component in frontend/src/components/ui/

**Checkpoint**: User Story 1 (MVP) should be fully functional - users can register, login, create goals (both types), log progress, view history

---

## Phase 4: User Story 2 - Visualize Progress with Charts (Priority: P2)

**Goal**: Display line charts showing progress over time with trend indicators

**Independent Test**: Create goal, log progress over multiple dates, view chart with progress trajectory and on-track indicator (for target-based goals)

### Chart.js Abstraction Layer (Constitution Requirement)

- [ ] T086 [P] [US2] Install Chart.js and vue-chartjs in frontend/package.json
- [ ] T087 [P] [US2] Create Chart.js wrapper in frontend/src/lib/chartjs-wrapper.ts (isolated third-party imports)
- [ ] T088 [P] [US2] Create application chart types in frontend/src/services/charts/chartTypes.ts (ChartData, ChartOptions interfaces independent of Chart.js)
- [ ] T089 [P] [US2] Create chart theme configuration in frontend/src/services/charts/chartTheme.ts (colors matching Zinc palette, fonts)
- [ ] T090 [US2] Create Chart.js adapter in frontend/src/services/charts/chartAdapter.ts (converts app chart types to Chart.js format)

### Shared Types for User Story 2

- [ ] T091 [P] [US2] Add chart data types to shared/types/goals.types.ts (ChartDataPoint for API response)

### Backend: Chart Data API for User Story 2

- [ ] T092 [P] [US2] Add getChartData method to GoalsService in backend/src/services/goals.service.ts (returns time-series data with projection for target-based)
- [ ] T093 [US2] Add GET /api/goals/:id/chart endpoint to goals routes in backend/src/routes/goals.routes.ts
- [ ] T094 [P] [US2] Contract test for GET /api/goals/:id/chart in backend/tests/contract/goals.test.ts

### Frontend: Chart Components for User Story 2

- [ ] T095 [P] [US2] Create ProgressLineChart component in frontend/src/components/charts/ProgressLineChart.vue (uses chart adapter, not direct Chart.js)
- [ ] T096 [P] [US2] Create DashboardSummaryChart component in frontend/src/components/charts/DashboardSummaryChart.vue (multi-goal overview)
- [ ] T097 [US2] Integrate ProgressLineChart into GoalDetail view in frontend/src/views/GoalDetail.vue
- [ ] T098 [US2] Integrate DashboardSummaryChart into Dashboard view in frontend/src/views/Dashboard.vue
- [ ] T099 [US2] Add chart data endpoint to goals API client in frontend/src/services/api/goals.api.ts

**Checkpoint**: User Story 2 complete - users can view charts for their goals with proper isolation of Chart.js behind abstraction layer

---

## Phase 5: User Story 3 - Track Recurring Habits and Streaks (Priority: P3)

**Goal**: Enable users to create habits with flexible frequencies, log completions, track streaks

**Independent Test**: Create habit with target frequency (daily/weekly/custom), log completions, view streak and weekly progress

### Shared Types for User Story 3

- [ ] T100 [P] [US3] Create habit types with Zod schemas in shared/types/habits.types.ts (Habit, FrequencyConfig, CreateHabitRequest, UpdateHabitRequest, HabitCompletion, CreateCompletionRequest)

### Backend: Contract Tests for User Story 3

- [ ] T101 [P] [US3] Contract test for POST /api/habits in backend/tests/contract/habits.test.ts
- [ ] T102 [P] [US3] Contract test for GET /api/habits in backend/tests/contract/habits.test.ts
- [ ] T103 [P] [US3] Contract test for GET /api/habits/:id in backend/tests/contract/habits.test.ts
- [ ] T104 [P] [US3] Contract test for PATCH /api/habits/:id in backend/tests/contract/habits.test.ts
- [ ] T105 [P] [US3] Contract test for DELETE /api/habits/:id in backend/tests/contract/habits.test.ts
- [ ] T106 [P] [US3] Contract test for POST /api/habits/:id/completions in backend/tests/contract/habits.test.ts
- [ ] T107 [P] [US3] Contract test for GET /api/habits/:id/completions in backend/tests/contract/habits.test.ts
- [ ] T108 [P] [US3] Contract test for DELETE /api/habits/:id/completions/:completionId in backend/tests/contract/habits.test.ts
- [ ] T109 [P] [US3] Contract test for GET /api/habits/:id/streak in backend/tests/contract/habits.test.ts

### Backend: Validation for User Story 3

- [ ] T110 [P] [US3] Create habit validators in backend/src/validators/habits.validator.ts (create, update, completion schemas with frequencyConfig validation using Zod)

### Backend: Streak Calculation Logic for User Story 3

- [ ] T111 [P] [US3] Create streak calculation functions in backend/src/utils/date.utils.ts (calculateStreak, isFrequencyMet for all frequency types)
- [ ] T112 [P] [US3] Create frequency pattern helpers in backend/src/utils/frequency.utils.ts (daily, weekly, custom interval, monthly, advanced pattern logic)

### Backend: Services for User Story 3

- [ ] T113 [US3] Implement HabitsService in backend/src/services/habits.service.ts (create, list, get, update, delete with frequency validation)
- [ ] T114 [US3] Implement HabitCompletionsService in backend/src/services/habit-completions.service.ts (create, list, delete, recalculate streak)

### Backend: Routes for User Story 3

- [ ] T115 [US3] Implement habits routes in backend/src/routes/habits.routes.ts (CRUD endpoints + completions + streak per contracts/habits.yaml)

### Frontend: Habits UI for User Story 3

- [ ] T116 [P] [US3] Create HabitCard component in frontend/src/components/habits/HabitCard.vue (displays habit with streak and weekly status)
- [ ] T117 [P] [US3] Create HabitForm component in frontend/src/components/habits/HabitForm.vue (create/edit with frequency pattern selector)
- [ ] T118 [P] [US3] Create StreakDisplay component in frontend/src/components/habits/StreakDisplay.vue (flame icon + streak count)
- [ ] T119 [P] [US3] Create HabitHistory component in frontend/src/components/habits/HabitHistory.vue (calendar view of completions)
- [ ] T120 [US3] Update Dashboard view in frontend/src/views/Dashboard.vue (add habits section)
- [ ] T121 [US3] Create HabitDetail view in frontend/src/views/HabitDetail.vue (single habit with history and log completion button)
- [ ] T122 [US3] Add habit routes to Vue Router in frontend/src/router/index.ts (/habits/:id)
- [ ] T123 [US3] Create habits API client in frontend/src/services/api/habits.api.ts (CRUD + completions + streak endpoints)
- [ ] T124 [US3] Create useHabits composable in frontend/src/composables/useHabits.ts (state management, API calls)

### Frontend: Habit Chart Components for User Story 3

- [ ] T125 [P] [US3] Create HabitCalendarChart component in frontend/src/components/charts/HabitCalendarChart.vue (calendar heatmap using chart adapter)
- [ ] T126 [US3] Integrate HabitCalendarChart into HabitDetail view in frontend/src/views/HabitDetail.vue

### Frontend: shadcn-vue Components for User Story 3

- [ ] T127 [P] [US3] Install shadcn-vue Calendar component in frontend/src/components/ui/
- [ ] T128 [P] [US3] Install shadcn-vue RadioGroup component in frontend/src/components/ui/

**Checkpoint**: User Story 3 complete - users can create habits with flexible frequencies, log completions, view streaks

---

## Phase 6: User Story 4 - Organize Goals by Categories (Priority: P4)

**Goal**: Enable users to create categories and assign goals/habits to them for organization

**Independent Test**: Create categories, assign goals to categories, filter by category

### Shared Types for User Story 4

- [ ] T129 [P] [US4] Create category types with Zod schemas in shared/types/categories.types.ts (Category, CreateCategoryRequest, UpdateCategoryRequest)

### Backend: Contract Tests for User Story 4

- [ ] T130 [P] [US4] Contract test for POST /api/categories in backend/tests/contract/categories.test.ts
- [ ] T131 [P] [US4] Contract test for GET /api/categories in backend/tests/contract/categories.test.ts
- [ ] T132 [P] [US4] Contract test for GET /api/categories/:id in backend/tests/contract/categories.test.ts
- [ ] T133 [P] [US4] Contract test for PATCH /api/categories/:id in backend/tests/contract/categories.test.ts
- [ ] T134 [P] [US4] Contract test for DELETE /api/categories/:id in backend/tests/contract/categories.test.ts

### Backend: Validation for User Story 4

- [ ] T135 [P] [US4] Create category validators in backend/src/validators/categories.validator.ts (create, update schemas using Zod)

### Backend: Services for User Story 4

- [ ] T136 [US4] Implement CategoriesService in backend/src/services/categories.service.ts (create, list, get, update, delete, get stats)

### Backend: Routes for User Story 4

- [ ] T137 [US4] Implement categories routes in backend/src/routes/categories.routes.ts (CRUD endpoints per contracts/categories.yaml)

### Frontend: Categories UI for User Story 4

- [ ] T138 [P] [US4] Create CategoryBadge component in frontend/src/components/categories/CategoryBadge.vue (colored badge)
- [ ] T139 [P] [US4] Create CategoryForm component in frontend/src/components/categories/CategoryForm.vue (create/edit with color picker)
- [ ] T140 [P] [US4] Create CategoryFilter component in frontend/src/components/categories/CategoryFilter.vue (dropdown filter)
- [ ] T141 [US4] Update Dashboard view in frontend/src/views/Dashboard.vue (add category filter)
- [ ] T142 [US4] Update GoalForm component in frontend/src/components/goals/GoalForm.vue (add category selector)
- [ ] T143 [US4] Update HabitForm component in frontend/src/components/habits/HabitForm.vue (add category selector)
- [ ] T144 [US4] Create categories API client in frontend/src/services/api/categories.api.ts (CRUD endpoints)
- [ ] T145 [US4] Create useCategories composable in frontend/src/composables/useCategories.ts (state management, API calls)

### Frontend: shadcn-vue Components for User Story 4

- [ ] T146 [P] [US4] Install shadcn-vue Popover component in frontend/src/components/ui/

**Checkpoint**: User Story 4 complete - users can organize goals and habits with categories

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

### Error Handling & Edge Cases

- [ ] T147 [P] Add validation for negative progress entries in backend/src/services/goals.service.ts
- [ ] T148 [P] Add validation for past deadlines in backend/src/validators/goals.validator.ts
- [ ] T149 [P] Add handling for decimal values per unit type in backend/src/services/goals.service.ts
- [ ] T150 [P] Add timezone handling tests in backend/tests/integration/timezone.test.ts

### UI/UX Polish

- [ ] T151 [P] Add loading states to all forms in frontend/src/components/
- [ ] T152 [P] Add success/error toast notifications using shadcn-vue Toast in frontend/
- [ ] T153 [P] Add empty states for goals/habits lists in frontend/src/views/Dashboard.vue
- [ ] T154 [P] Add confirmation dialogs for delete actions in frontend/
- [ ] T155 [P] Add mobile-responsive breakpoints verification across all views
- [ ] T156 [P] Add celebration indicator for completed goals in frontend/src/components/goals/GoalCard.vue

### Performance Optimization

- [ ] T157 [P] Add database indexes verification per data-model.md
- [ ] T158 [P] Add pagination for goals list API endpoint in backend/src/routes/goals.routes.ts
- [ ] T159 [P] Add pagination for habits list API endpoint in backend/src/routes/habits.routes.ts
- [ ] T160 [P] Add caching for user profile in frontend/src/composables/useAuth.ts

### Documentation

- [ ] T161 [P] Update README.md with setup instructions and architecture overview
- [ ] T162 [P] Add API documentation link to OpenAPI specs in contracts/
- [ ] T163 [P] Add inline code comments for complex streak calculation logic
- [ ] T164 [P] Verify quickstart.md instructions work end-to-end

### Security Hardening

- [ ] T165 [P] Add rate limiting middleware in backend/src/middleware/rate-limit.middleware.ts
- [ ] T166 [P] Add CORS configuration validation in backend/src/server.ts
- [ ] T167 [P] Add password strength validation in backend/src/validators/auth.validator.ts
- [ ] T168 [P] Add XSS protection headers in backend/src/server.ts

### Testing & Quality

- [ ] T169 [P] Run all contract tests and verify 100% pass rate
- [ ] T170 [P] Add integration tests for complex habit frequencies in backend/tests/integration/habits.integration.test.ts
- [ ] T171 [P] Add integration tests for goal type conversions in backend/tests/integration/goals.integration.test.ts
- [ ] T172 [P] Verify TypeScript strict mode with no `any` types across codebase
- [ ] T173 Run quickstart.md validation from scratch (fresh setup)

### Deployment Preparation

- [ ] T174 [P] Create production .env.example with all required variables
- [ ] T175 [P] Add health check endpoint GET /api/health in backend/src/routes/
- [ ] T176 [P] Add database connection pooling configuration in backend/src/models/schema.prisma
- [ ] T177 Create deployment documentation in docs/deployment.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - MVP, should complete first
- **User Story 2 (Phase 4)**: Depends on Foundational + US1 (needs goals data) - Enhances US1 with visualizations
- **User Story 3 (Phase 5)**: Depends on Foundational only - Independent from US1/US2, can be done in parallel with US2
- **User Story 4 (Phase 6)**: Depends on Foundational + US1 + US3 (adds organization to goals and habits)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← CRITICAL BLOCKING PHASE
    ↓
    ├─→ User Story 1 (P1) ← MVP - Do this first
    │       ↓
    │       ├─→ User Story 2 (P2) ← Enhances US1 with charts
    │       │
    │       └─→ User Story 4 (P4) ← Needs US1 + US3
    │
    └─→ User Story 3 (P3) ← Can run parallel with US2
            ↓
            └─→ User Story 4 (P4) ← Needs US1 + US3
```

**Recommended Order**: Phase 1 → Phase 2 → Phase 3 (US1 MVP) → Phase 4 (US2 charts) → Phase 5 (US3 habits) → Phase 6 (US4 categories) → Phase 7 (polish)

**Parallel Opportunities**:
- After Foundational: US1 can start
- After US1: US2 and US3 can run in parallel
- After US1 + US3: US4 can start

### Within Each User Story

1. Shared types first (can be parallel with contract tests)
2. Contract tests written and FAIL before implementation
3. Backend validation/services/routes (services depend on validation)
4. Frontend API client and composables
5. Frontend UI components (can be parallel)
6. Frontend views integrating components
7. Story complete - test independently

### Parallel Opportunities

**Setup Phase**: All T002-T012 can run in parallel (different files)

**Foundational Phase**:
- Database group (T013-T017) sequential
- T018-T019, T020-T022, T024-T028, T029-T032, T033-T036, T037-T044, T045-T046 can all run in parallel across groups

**User Story 1**:
- All contract tests T048-T059 can run in parallel
- Validators T060-T061 can run in parallel
- Services T062-T064 sequential (dependencies)
- Routes T065-T066 can run after services
- Frontend components T071-T074 can run in parallel
- shadcn-vue installs T080-T085 can run in parallel

**User Story 2**:
- Chart abstraction T086-T090 can run in parallel
- Frontend charts T095-T096 can run in parallel

**User Story 3**:
- All contract tests T101-T109 can run in parallel
- Streak utils T111-T112 can run in parallel
- Frontend components T116-T119 can run in parallel

**User Story 4**:
- All contract tests T130-T134 can run in parallel

**Polish Phase**:
- Most polish tasks T147-T177 can run in parallel (different concerns)

---

## Parallel Example: User Story 1 (MVP)

### Step 1: Launch all contract tests together (these should FAIL initially)
```
Parallel batch:
  T048: POST /api/auth/register contract test
  T049: POST /api/auth/login contract test
  T050: GET /api/auth/me contract test
  T051: POST /api/goals contract test
  T052: GET /api/goals contract test
  T053: GET /api/goals/:id contract test
  T054: PATCH /api/goals/:id contract test
  T055: DELETE /api/goals/:id contract test
  T056: POST /api/goals/:id/progress contract test
  T057: GET /api/goals/:id/progress contract test
  T058: PATCH /api/goals/:id/progress/:entryId contract test
  T059: DELETE /api/goals/:id/progress/:entryId contract test
```

### Step 2: Create validators in parallel
```
Parallel batch:
  T060: Auth validators
  T061: Goal validators
```

### Step 3: Implement services (sequential due to dependencies)
```
Sequential:
  T062: AuthService → T063: GoalsService → T064: ProgressEntriesService
```

### Step 4: Create all frontend components in parallel
```
Parallel batch:
  T071: GoalCard
  T072: GoalForm
  T073: ProgressOverview
  T074: ProgressHistory
  T080-T085: All shadcn-vue components
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (12 tasks)
2. ✅ Complete Phase 2: Foundational (34 tasks) ← CRITICAL
3. ✅ Complete Phase 3: User Story 1 (39 tasks) ← MVP
4. **STOP and VALIDATE**: Test US1 independently per acceptance scenarios
5. Deploy/demo MVP

**MVP Delivers**: User registration, authentication, goal creation (both types), progress logging, history view

### Incremental Delivery (Recommended)

1. **Sprint 1**: Setup + Foundational → Foundation ready (46 tasks)
2. **Sprint 2**: User Story 1 → Test independently → Deploy MVP (39 tasks)
3. **Sprint 3**: User Story 2 → Test independently → Deploy with charts (14 tasks)
4. **Sprint 4**: User Story 3 → Test independently → Deploy with habits (29 tasks)
5. **Sprint 5**: User Story 4 → Test independently → Deploy with categories (18 tasks)
6. **Sprint 6**: Polish → Final production release (31 tasks)

**Total: 177 tasks**

### Parallel Team Strategy

With 3 developers after Foundational phase:

1. **All together**: Complete Setup + Foundational (46 tasks)
2. **Developer A**: User Story 1 only (39 tasks) → MVP ready
3. **After MVP validated**:
   - **Developer A**: User Story 2 (14 tasks)
   - **Developer B**: User Story 3 (29 tasks) ← Parallel with US2
   - **Developer C**: Start Polish tasks that don't depend on US2/US3
4. **Developer C**: User Story 4 after US1 + US3 complete (18 tasks)
5. **All together**: Complete remaining Polish tasks (31 tasks)

---

## Notes

- **[P]** tasks = different files, no dependencies, safe to parallelize
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Contract tests are MANDATORY** per constitution (not optional)
- Verify all contract tests fail before implementing features (TDD approach)
- Chart.js MUST remain isolated behind abstraction layer (constitution requirement)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 1 is the MVP - can ship with just that story complete
- User Stories 2-4 add incremental value without breaking previous stories
- TypeScript strict mode enforced - no `any` types allowed
- All API endpoints must follow standardized error format
- All forms must use Zod validation for type safety

---

## Success Metrics

- **MVP (US1)**: 85 tasks total (Setup + Foundational + US1)
- **Full V1**: 177 tasks total (all user stories + polish)
- **Contract tests**: 37 tests covering all 28 API endpoints
- **Independent stories**: Each story (US1-US4) can be tested and validated independently
- **Parallel opportunities**: ~60% of tasks within each phase can run in parallel
- **Constitution compliance**: 100% (strict TypeScript, API tests, Chart.js isolation, mobile-ready architecture)

