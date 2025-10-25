<!--
Sync Impact Report:
- Version change: 1.2.0 → 1.2.1
- PATCH version bump: Visual design direction documented
- Added sections:
  * Visual Design: shadcn-vue default theme (Zinc palette), typography, icons, customization philosophy
- Design decisions documented:
  * Design system: shadcn-vue defaults (minimalist, professional)
  * Dark mode: Optional capability for V1
  * Typography: System fonts with Inter fallback
  * Colors: Zinc palette (neutral grays + blue accents)
  * Icons: Lucide icons + emoji for avatars
  * Philosophy: YAGNI for visual design, iterate post-MVP
- Templates alignment: ✅ All templates compatible
- Follow-up: /speckit.plan will generate UI with shadcn-vue default styling
- Previous reports:
  * Version 1.2.0 - Core libraries locked + development standards (2025-10-25)
  * Version 1.1.0 - Added Principle VI (Dependency Isolation) + Chart.js (2025-10-25)
  * Version 1.0.0 - Initial constitution (2025-10-25)
-->

# Habits Tracker Constitution

## Core Principles

### I. Simplicity First (NON-NEGOTIABLE)

**Principle**: Start simple, add complexity only when justified by real needs.

- MUST follow YAGNI (You Aren't Gonna Need It) - no speculative features
- MUST justify any abstraction or pattern beyond direct implementation
- MUST prefer readable code over clever code
- MUST avoid over-engineering - solve today's problems, not tomorrow's hypothetical ones
- Libraries and frameworks: use standard, well-established solutions over custom implementations

**Rationale**: Habits tracking is fundamentally simple. Complexity kills velocity and makes future mobile port harder. Simple code is easier to maintain, test, and migrate.

### II. TypeScript Strict Mode (NON-NEGOTIABLE)

**Principle**: All code MUST be TypeScript with strict mode enabled.

- MUST enable `strict: true` in tsconfig.json (no implicit any, strict null checks, etc.)
- MUST define explicit types for all function parameters and return values
- MUST use interfaces or types for all data structures
- MUST NOT use `any` type (use `unknown` if type truly unknown, then narrow)
- Shared types MUST be defined in common location for frontend/backend reuse

**Rationale**: Type safety prevents entire classes of bugs, provides self-documentation, and enables confident refactoring. Critical for team collaboration and future mobile API integration.

### III. API Testing Required (NON-NEGOTIABLE)

**Principle**: All API endpoints MUST have automated tests before merging.

- MUST write contract tests for all REST endpoints (request/response validation)
- MUST test happy path and primary error cases (4xx, 5xx)
- MUST validate request body schemas and response structures
- MUST test authentication/authorization on protected endpoints
- Integration tests MUST use real PostgreSQL (test database)

**Rationale**: Frontend and future mobile app depend on stable API contracts. Tests document behavior and prevent regressions.

### IV. Code Review Mandatory (NON-NEGOTIABLE)

**Principle**: No code merges to main without review approval.

- MUST create feature branch from main
- MUST open pull request when feature complete
- MUST receive at least one approval before merge
- Reviewer MUST verify: tests pass, constitution compliance, code simplicity
- MUST NOT use `--no-verify` or skip review process

**Rationale**: Catches bugs, knowledge sharing, maintains code quality, ensures constitution adherence.

### V. Mobile-Ready Architecture

**Principle**: Design with future mobile app in mind, but don't build it yet.

- Backend MUST be stateless REST API (no server-side sessions - use JWT or similar)
- API MUST return JSON (no HTML rendering from backend)
- Frontend MUST call backend API (no direct database access from Vue)
- MUST separate business logic from presentation logic
- Authentication MUST work for web and future mobile (token-based, not cookies-only)

**Rationale**: Enables future iOS/Android app without backend rewrite. Clean separation allows independent frontend/backend development.

### VI. Dependency Isolation (Library Abstraction)

**Principle**: External libraries with potential for replacement MUST be isolated behind internal abstractions.

- MUST create wrapper/adapter layers for third-party visualization libraries (Chart.js)
- MUST NOT import chart libraries directly in business components
- MUST define internal chart interfaces/types independent of library specifics
- Chart components MUST consume data in application-specific format, not library-specific format
- MUST centralize chart configuration and theming in dedicated chart service/composable
- Application code MUST depend on abstractions, not concrete chart implementations

**Rationale**: Chart.js meets V1 needs but requirements may evolve. Isolation enables library replacement (e.g., ECharts, ApexCharts) without refactoring entire application. Clean abstraction also improves testability and maintainability. This applies "dependency inversion" principle for external dependencies with business criticality.

**Example Structure**:
```
frontend/src/
  ├── components/charts/       # Internal chart components (use abstraction)
  │   ├── ProgressLineChart.vue
  │   └── HabitCalendarChart.vue
  ├── services/charts/         # Abstraction layer (sandbox)
  │   ├── chartAdapter.ts      # Adapter for Chart.js
  │   ├── chartTypes.ts        # Application chart interfaces
  │   └── chartTheme.ts        # Centralized theming
  └── lib/                     # Third-party imports (only accessed from services/charts/)
      └── chartjs-wrapper.ts
```

## Visual Design

**Design System**: shadcn-vue default theme (Zinc/Slate palette)

- Minimalist, professional appearance using shadcn-vue defaults
- Built-in dark mode capability (optional feature for V1)
- Typography: System fonts with Inter fallback if available
- Spacing/sizing: Tailwind CSS default scale
- Colors: shadcn-vue Zinc palette (neutral grays with blue accents)
- Animations: Subtle, fast transitions for user feedback
- Icons: Lucide icons (included with shadcn-vue) + emoji for goal/habit avatars

**Customization Philosophy**:
- Use shadcn-vue defaults unless strong UX reason to customize
- Iterate visual design based on user feedback, not speculation
- YAGNI principle applies to visual design: start simple, enhance after validation
- Focus effort on functionality and user experience over visual polish in V1

**Rationale**: Professional appearance with zero setup time. Allows team to focus on core tracking functionality. Visual refinements can be iterated post-MVP based on real user feedback.

## Technology Stack

**Locked Decisions** (changes require constitution amendment):

- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL
- **Backend Framework**: Express.js
- **Frontend Framework**: Vue 3 (Composition API)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-vue
- **Charts & Visualization**: Chart.js (vue-chartjs wrapper)
- **API Style**: RESTful JSON
- **Authentication**: Token-based (JWT recommended)

**Core Libraries** (locked for consistency):
- **ORM/Database**: Prisma (type-safe queries, automatic migrations)
- **Validation**: Zod (type-safe schemas, shared frontend/backend)
- **Testing**: Vitest + Supertest (fast, ESM-native, API contract tests)
- **Date/Time**: date-fns (modular, tree-shakeable, timezone-aware)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing

**Version Requirements**:
- Node.js: 22+ LTS
- TypeScript: 5.x
- PostgreSQL: 16+
- Vue: 3.x
- Prisma: 5.x
- Zod: 3.x
- Vitest: 1.x

## Project Structure

**Required Structure** (V1 web application):

```
backend/
├── src/
│   ├── models/          # TypeScript types + database models
│   ├── services/        # Business logic
│   ├── routes/          # Express route handlers
│   ├── middleware/      # Auth, validation, error handling
│   └── config/          # Database, env configuration
└── tests/
    ├── contract/        # API contract tests (REQUIRED)
    └── integration/     # Database integration tests

frontend/
├── src/
│   ├── components/      # Vue components (shadcn + custom)
│   │   └── charts/      # Chart components (use chart abstraction)
│   ├── views/           # Page-level components
│   ├── services/        # API client calls
│   │   └── charts/      # Chart abstraction layer (Chart.js sandbox)
│   ├── composables/     # Vue composition functions
│   ├── lib/             # Third-party library wrappers
│   └── types/           # TypeScript interfaces (shared with backend)
└── tests/
    └── unit/            # Component tests (optional for V1)

shared/
└── types/               # Shared TypeScript types between frontend/backend
```

## Development Standards

### API Error Handling

**Standard Error Response Format**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": {} // Optional, for validation errors
  }
}
```

- MUST use consistent HTTP status codes (400, 401, 403, 404, 500)
- MUST return JSON error format for all API errors
- MUST use centralized error handling middleware (Express)
- MUST NOT expose internal error details in production

### Environment Configuration

- MUST use `.env` files for environment-specific config
- MUST validate environment variables at application startup using Zod
- MUST fail fast if required environment variables are missing
- MUST document all environment variables in `.env.example`
- MUST NOT commit `.env` files (add to `.gitignore`)

**Required Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port (default: 3000)

### Code Quality Tools

**Linting/Formatting**: Deferred to post-MVP
- ESLint and Prettier configuration will be added after initial implementation
- Focus on working code first, tooling second (YAGNI principle)

## Development Workflow

### Feature Development Process

1. **Specify**: Define feature with `/speckit.specify` (creates spec.md with user stories)
2. **Plan**: Generate implementation plan with `/speckit.plan` (creates plan.md, research.md, etc.)
3. **Tasks**: Break down into tasks with `/speckit.tasks` (creates tasks.md)
4. **Branch**: Create feature branch `###-feature-name`
5. **Implement**: Complete tasks in order, commit frequently
6. **Test**: API tests MUST pass before PR
7. **Review**: Submit PR, wait for approval
8. **Merge**: Squash merge to main after approval

### Quality Gates

**Before PR submission**:
- [ ] All API endpoints have contract tests
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles with no errors (`npm run build`)
- [ ] No `any` types in new code
- [ ] Code follows simplicity principle (no unnecessary abstractions)

**During Code Review**:
- [ ] Reviewer verifies tests exist and are meaningful
- [ ] Reviewer checks for over-engineering
- [ ] Reviewer validates TypeScript types are explicit
- [ ] Reviewer confirms constitution compliance

## Governance

**Constitution Authority**: This constitution supersedes all other project practices and documentation. When conflicts arise, constitution takes precedence.

**Amendment Process**:
1. Propose amendment in PR with rationale
2. Update constitution version following semantic versioning
3. Update all affected templates and documentation
4. Require explicit team acknowledgment
5. Document in Sync Impact Report

**Versioning Policy**:
- **MAJOR** (X.0.0): Removing principles, changing non-negotiable rules, incompatible tech stack changes
- **MINOR** (x.Y.0): Adding new principles, expanding requirements, new mandatory sections
- **PATCH** (x.y.Z): Clarifications, typo fixes, non-semantic refinements

**Compliance**:
- All PRs MUST be reviewed for constitution compliance
- Feature specs MUST align with simplicity and mobile-ready principles
- Complexity violations MUST be explicitly justified in plan.md Complexity Tracking section
- Constitution review MUST occur before Phase 0 research and after Phase 1 design

**Runtime Guidance**: For AI-assisted development, refer to auto-generated agent guidance file (created by `/speckit.plan` from constitution + feature context).

---

**Version**: 1.2.1 | **Ratified**: 2025-10-25 | **Last Amended**: 2025-10-25
