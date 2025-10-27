# Habits Tracker - Personal Progress Tracker

**Version**: 0.1.0 (MVP)  
**Status**: In Development 🚧

A web application that enables users to track progress toward personal goals and maintain recurring habits. Supports target-based goals with deadlines and continuous counter goals (e.g., "days without alcohol").

## 🎯 Features (MVP - User Story 1)

- ✅ User authentication (JWT-based)
- ✅ Create target-based goals (with deadline and target value)
- ✅ Create continuous counter goals (without deadline, track streaks)
- ✅ Log progress entries (incremental mode)
- ✅ View progress history and statistics
- ✅ Calculate progress percentage and days remaining

## 🏗️ Architecture

**Stack**:
- **Backend**: Node.js 22+ | TypeScript 5.x | Express | PostgreSQL 16+ | Prisma ORM
- **Frontend**: Vue 3 (Composition API) | TypeScript 5.x | Vite | Tailwind CSS | shadcn-vue
- **Validation**: Zod (shared types between frontend/backend)
- **Testing**: Vitest + Supertest (API contract tests)
- **Auth**: JWT + bcrypt

**Structure**:
```
├── backend/          # Express REST API
├── frontend/         # Vue 3 + Vite application
├── shared/           # Shared TypeScript types (Zod schemas)
└── specs/            # Feature specifications and design docs
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22+ LTS
- **PostgreSQL** 16+
- **npm** or **pnpm**

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd lg-habits2

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Configure environment**:
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your VITE_API_BASE_URL
```

3. **Setup database**:
```bash
cd backend
npm run db:migrate    # Run Prisma migrations
```

4. **Start development servers**:
```bash
# Terminal 1 - Backend
cd backend
npm run dev           # Starts on http://localhost:3000

# Terminal 2 - Frontend
cd frontend
npm run dev           # Starts on http://localhost:5173
```

5. **Open browser**:
```
http://localhost:5173
```

## 📚 Documentation

Detailed documentation is available in the `specs/001-high-level-need/` directory:

- **[spec.md](./specs/001-high-level-need/spec.md)** - Feature specification with user stories
- **[plan.md](./specs/001-high-level-need/plan.md)** - Implementation plan and architecture
- **[tasks.md](./specs/001-high-level-need/tasks.md)** - Detailed task breakdown (177 tasks)
- **[data-model.md](./specs/001-high-level-need/data-model.md)** - Database schema and entities
- **[quickstart.md](./specs/001-high-level-need/quickstart.md)** - Developer setup guide
- **[contracts/](./specs/001-high-level-need/contracts/)** - OpenAPI 3.0 API specifications

## 🧪 Testing

### Run all tests:
```bash
cd backend
npm test
```

### Run contract tests:
```bash
cd backend
npm test tests/contract/
```

## 🛠️ Development

### Backend

```bash
cd backend
npm run dev           # Start with hot reload
npm run build         # Build for production
npm run db:migrate    # Run Prisma migrations
npm run db:studio     # Open Prisma Studio
```

### Frontend

```bash
cd frontend
npm run dev           # Start with hot reload
npm run build         # Build for production
npm run type-check    # Check TypeScript types
```

## 🏛️ Constitution

This project follows the **Habits Tracker Constitution** (v1.2.1) with 6 core principles:

1. **Simplicity First (YAGNI)** - Use proven solutions, avoid over-engineering
2. **TypeScript Strict Mode** - Zero `any` types, full type safety
3. **API Testing Required** - Contract tests mandatory for all endpoints
4. **Code Review Mandatory** - PR workflow with quality gates
5. **Mobile-Ready Architecture** - Stateless API, JWT auth, JSON responses
6. **Dependency Isolation** - External libraries abstracted behind internal interfaces

## 📦 Project Status

**Current Phase**: Phase 1 - Setup ✅  
**Next Phase**: Phase 2 - Foundational Infrastructure  
**MVP Target**: Phase 3 - User Story 1 (Goals Tracking)

### Task Progress

- Phase 1: Setup (12 tasks) - **In Progress**
- Phase 2: Foundational (34 tasks) - Pending
- Phase 3: User Story 1 - MVP (39 tasks) - Pending
- Phase 4: User Story 2 - Charts (14 tasks) - Pending
- Phase 5: User Story 3 - Habits (29 tasks) - Pending
- Phase 6: User Story 4 - Categories (18 tasks) - Pending
- Phase 7: Polish (31 tasks) - Pending

**Total**: 177 tasks

## 📝 License

MIT

## 👥 Contributing

1. Create a feature branch from `main`
2. Follow the constitution principles (strict TypeScript, tests required)
3. Submit PR with passing tests
4. Await code review

---

**Built with ❤️ following Speckit workflow and Simplicity First principle**

