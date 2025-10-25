# Quickstart: Personal Progress Tracker

**Feature**: Personal Progress Tracker  
**Phase**: Phase 1 - Development Setup  
**Date**: 2025-10-25  
**Target Audience**: Developers  
**Status**: Complete

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 22+ LTS ([download](https://nodejs.org/))
- **PostgreSQL** 16+ ([download](https://www.postgresql.org/download/))
- **Git** (for version control)
- **Code Editor** (VS Code recommended)

**Optional**:
- **Docker** (for containerized PostgreSQL)
- **Postman** or **Thunder Client** (for API testing)

---

## Initial Setup

### 1. Clone Repository (if not already)

```bash
# Clone the repository
git clone <repository-url>
cd lg-habits2

# Checkout feature branch
git checkout 001-high-level-need
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 3. Setup PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Create database
createdb habits_tracker_dev

# Create test database
createdb habits_tracker_test
```

#### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL container
docker run --name habits-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=habits_tracker_dev \
  -p 5432:5432 \
  -d postgres:14

# Create test database
docker exec habits-postgres createdb -U postgres habits_tracker_test
```

### 4. Configure Environment Variables

#### Backend `.env`

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/habits_tracker_dev

# Authentication (CHANGE THESE IN PRODUCTION)
JWT_SECRET=your-secret-key-min-32-characters-long-please-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-also-32-chars-min-change-this-in-production

# CORS
FRONTEND_URL=http://localhost:5173
```

#### Frontend `.env`

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```bash
# API
VITE_API_URL=http://localhost:3000/api
```

### 5. Run Database Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Optionally seed database (if seed script exists)
npm run seed
```

**Verify Migration**:
```bash
# Open Prisma Studio to inspect database
npx prisma studio
# Opens at http://localhost:5555
```

---

## Development Workflow

### Starting Development Servers

#### Terminal 1: Backend

```bash
cd backend
npm run dev

# Server starts at http://localhost:3000
# Swagger docs at http://localhost:3000/api-docs (if configured)
```

#### Terminal 2: Frontend

```bash
cd frontend
npm run dev

# Vite dev server starts at http://localhost:5173
```

### Running Tests

#### Backend Tests (Vitest + Supertest)

```bash
cd backend

# Run all tests
npm test

# Run contract tests only
npm run test:contract

# Run integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

#### Frontend Tests (Vitest - Optional for V1)

```bash
cd frontend

# Run tests
npm test

# Watch mode
npm run test:watch
```

---

## Project Structure

```
lg-habits2/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── schema.prisma           # Database schema
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── goals.service.ts
│   │   │   ├── habits.service.ts
│   │   │   └── categories.service.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── goals.routes.ts
│   │   │   ├── habits.routes.ts
│   │   │   └── categories.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── validators/                 # Zod schemas
│   │   ├── config/
│   │   │   └── env.ts                  # Environment validation
│   │   ├── utils/
│   │   │   ├── date.utils.ts
│   │   │   ├── jwt.utils.ts
│   │   │   └── password.utils.ts
│   │   └── server.ts                   # Entry point
│   ├── tests/
│   │   ├── contract/                   # API contract tests (REQUIRED)
│   │   ├── integration/
│   │   └── setup.ts
│   ├── prisma/
│   │   └── migrations/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn-vue components
│   │   │   ├── charts/                 # Chart components (use abstraction)
│   │   │   ├── goals/
│   │   │   ├── habits/
│   │   │   └── layout/
│   │   ├── views/                      # Pages (Vue Router)
│   │   ├── services/
│   │   │   ├── api/                    # API clients
│   │   │   └── charts/                 # Chart.js abstraction (CRITICAL)
│   │   ├── composables/                # Vue composables
│   │   ├── router/
│   │   ├── stores/                     # Pinia (if needed)
│   │   ├── types/                      # TypeScript types
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── .env
│
├── shared/
│   └── types/                          # Shared Zod schemas + types
│
└── specs/
    └── 001-high-level-need/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── quickstart.md               # This file
        ├── wireframes.md
        └── contracts/
            ├── openapi.yaml
            ├── auth.yaml
            ├── goals.yaml
            ├── habits.yaml
            └── categories.yaml
```

---

## Key Commands

### Backend

```bash
# Development
npm run dev                    # Start dev server with hot reload

# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create new migration
npx prisma migrate reset       # Reset database (DESTROYS DATA)
npx prisma generate            # Regenerate Prisma client after schema changes

# Testing
npm test                       # Run all tests
npm run test:contract          # Contract tests only
npm run test:watch             # Watch mode

# Build
npm run build                  # Compile TypeScript
npm start                      # Run production build

# Linting (post-MVP)
npm run lint                   # ESLint
npm run format                 # Prettier
```

### Frontend

```bash
# Development
npm run dev                    # Start Vite dev server

# Build
npm run build                  # Build for production
npm run preview                # Preview production build

# shadcn-vue components
npx shadcn-vue@latest add button    # Add button component
npx shadcn-vue@latest add card      # Add card component
```

---

## API Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Create Goal (with JWT token)
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "goalType": "TARGET_BASED",
    "title": "Save for vacation",
    "unit": "dollars",
    "targetValue": 5000,
    "deadline": "2025-12-31"
  }'
```

### Using Postman/Thunder Client

1. Import OpenAPI spec: `specs/001-high-level-need/contracts/openapi.yaml`
2. Set base URL: `http://localhost:3000/api`
3. For authenticated endpoints:
   - Add header: `Authorization: Bearer YOUR_ACCESS_TOKEN`
   - Get token from `/auth/register` or `/auth/login` response

---

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

```bash
# Check PostgreSQL is running
pg_isready

# Docker: Check container status
docker ps

# Verify DATABASE_URL in .env matches your PostgreSQL config
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change PORT in backend/.env
```

### Prisma Migration Issues

**Error**: `Migration failed`

```bash
# Reset database (DESTROYS DATA)
npx prisma migrate reset

# Force push schema (dev only)
npx prisma db push

# Check migration status
npx prisma migrate status
```

### TypeScript Compilation Errors

```bash
# Regenerate Prisma client
npx prisma generate

# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf dist

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Development Best Practices

### 1. Constitution Compliance

Before committing code, verify:
- ✅ TypeScript strict mode (`strict: true`) - no `any` types
- ✅ All API endpoints have contract tests (Vitest + Supertest)
- ✅ Chart.js imports ONLY in `frontend/src/services/charts/` (isolation principle)
- ✅ Zod validation on all API inputs
- ✅ Environment variables validated with Zod at startup

### 2. Testing Discipline

**Test-First Approach** (Constitution Principle III):
1. Write API contract test (should fail)
2. Implement endpoint
3. Run test (should pass)
4. Commit

**Example**:
```typescript
// backend/tests/contract/goals.test.ts
describe('POST /api/goals', () => {
  it('should create target-based goal', async () => {
    const response = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Save for vacation',
        unit: 'dollars',
        targetValue: 5000,
        deadline: '2025-12-31',
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Save for vacation');
  });
});
```

### 3. Database Workflow

**Making Schema Changes**:
1. Edit `backend/src/models/schema.prisma`
2. Run `npx prisma migrate dev --name describe_change`
3. Prisma generates migration SQL + updates client
4. Commit both schema.prisma and migration files

**Example**:
```bash
# Add description field to Goal model
# Edit schema.prisma: add `description String? @db.Text`

npx prisma migrate dev --name add_goal_description

# Commit
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add description field to Goal model"
```

### 4. Chart.js Isolation (CRITICAL)

**❌ WRONG**:
```typescript
// In a Vue component (VIOLATES CONSTITUTION)
import { Chart } from 'chart.js';  // Direct import - NOT ALLOWED
```

**✅ CORRECT**:
```typescript
// In a Vue component
import { chartAdapter } from '@/services/charts/chartAdapter';
import type { ChartDataPoint } from '@/services/charts/chartTypes';

// Use abstraction
chartAdapter.renderLineChart(container, { series, title });
```

### 5. Shared Types (Zod Schemas)

**Define once in** `shared/types/`:
```typescript
// shared/types/goals.types.ts
import { z } from 'zod';

export const createGoalSchema = z.discriminatedUnion('goalType', [
  // ... schemas
]);

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
```

**Use in backend**:
```typescript
// backend/src/validators/goals.validator.ts
import { createGoalSchema } from '@shared/types/goals.types';
export { createGoalSchema };
```

**Use in frontend**:
```typescript
// frontend/src/services/api/goals.api.ts
import { createGoalSchema, type CreateGoalInput } from '@shared/types/goals.types';

async function createGoal(data: CreateGoalInput) {
  // Validation
  const result = createGoalSchema.safeParse(data);
  // API call
}
```

---

## Next Steps

Once development environment is set up:

1. **Review Specs**:
   - Read `spec.md` for functional requirements
   - Review `wireframes.md` for UI structure
   - Check `data-model.md` for entity relationships

2. **Generate Tasks**:
   ```bash
   # Use speckit to generate implementation tasks
   /speckit.tasks
   ```

3. **Start Implementation**:
   - Follow tasks.md sequentially
   - Commit after each task
   - Run tests before committing

4. **Code Review**:
   - Create PR when feature complete
   - Ensure all tests pass
   - Constitution compliance verified

---

## Resources

**Documentation**:
- [Prisma Docs](https://www.prisma.io/docs)
- [Zod Docs](https://zod.dev/)
- [Vue 3 Docs](https://vuejs.org/)
- [shadcn-vue Docs](https://www.shadcn-vue.com/)
- [Chart.js Docs](https://www.chartjs.org/)
- [Vitest Docs](https://vitest.dev/)
- [date-fns Docs](https://date-fns.org/)

**Constitution**: `.specify/memory/constitution.md`
**API Contracts**: `specs/001-high-level-need/contracts/`
**Data Model**: `specs/001-high-level-need/data-model.md`

---

**Happy Coding! 🚀**

For questions or issues, refer to the constitution or reach out to the team.

