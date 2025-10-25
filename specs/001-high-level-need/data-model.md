# Data Model: Personal Progress Tracker

**Feature**: Personal Progress Tracker  
**Phase**: Phase 1 - Database Design  
**Date**: 2025-10-25  
**Technology**: PostgreSQL 16+ with Prisma ORM  
**Status**: Complete

---

## Overview

This data model supports two core tracking paradigms:
1. **Target-based goals** - Track progress toward a specific value by a deadline (e.g., "Save $5,000 by Dec 31")
2. **Continuous counter goals** - Track accumulated streaks without deadlines (e.g., "Days without alcohol")

Additionally supports recurring habits with flexible frequency patterns (daily, weekly, custom intervals, monthly, advanced).

**Design Principles**:
- Discriminated union for goal types (single table, type field discriminator)
- Incremental progress logging (store deltas, compute cumulative)
- Flexible habit frequency via JSON config (validated with Zod)
- Cascade deletes for data cleanup (user deletion removes all owned data)
- Indexes for common query patterns (user + status, user + type, date ranges)

---

## Entity Relationship Diagram (ERD)

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ├───────┬──────────┬────────────┐
     │       │          │            │
     ▼       ▼          ▼            ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│  Goal  │ │ Habit  │ │Category│ │          │
└───┬────┘ └───┬────┘ └────────┘ │          │
    │          │                  │          │
    ▼          ▼                  │          │
┌─────────────┐ ┌────────────────┐          │
│ProgressEntry│ │HabitCompletion │          │
└─────────────┘ └────────────────┘          │
                                             │
         (Goals and Habits can optionally    │
          reference a Category)──────────────┘
```

**Relationships**:
- User `1:N` Goal
- User `1:N` Habit  
- User `1:N` Category
- Goal `1:N` ProgressEntry
- Habit `1:N` HabitCompletion
- Category `1:N` Goal (optional)
- Category `1:N` Habit (optional)

---

## Prisma Schema

**File**: `backend/src/models/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENTITIES
// ============================================================================

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  timezone     String   @default("UTC") // User's timezone for streak calculations
  
  goals        Goal[]
  habits       Habit[]
  categories   Category[]
  
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  @@map("users")
}

model Goal {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Common fields
  title       String
  goalType    GoalType @map("goal_type")
  unit        String
  
  // Target-based fields (NULL for continuous)
  targetValue  Decimal? @map("target_value") @db.Decimal(10, 2)
  deadline     DateTime? @db.Date
  
  // Continuous counter fields (NULL for target-based)
  startDate    DateTime? @map("start_date") @db.Date
  
  // Computed/cached field (calculated from ProgressEntries)
  currentValue Decimal  @default(0) @map("current_value") @db.Decimal(10, 2)
  
  // Metadata
  status      GoalStatus @default(ACTIVE)
  categoryId  String?    @map("category_id")
  category    Category?  @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  progressEntries ProgressEntry[]
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@index([userId, status])
  @@index([userId, goalType])
  @@index([categoryId])
  @@map("goals")
}

enum GoalType {
  TARGET_BASED
  CONTINUOUS_COUNTER
}

enum GoalStatus {
  ACTIVE
  COMPLETED
}

model ProgressEntry {
  id        String   @id @default(uuid())
  goalId    String   @map("goal_id")
  goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  
  value     Decimal  @db.Decimal(10, 2)  // Incremental amount (positive or negative for resets)
  entryDate DateTime @map("entry_date") @db.Date
  note      String?  @db.Text
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([goalId, entryDate])
  @@map("progress_entries")
}

model Habit {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title           String
  frequencyType   FrequencyType @map("frequency_type")
  frequencyConfig Json          @map("frequency_config") // Zod-validated JSON
  
  currentStreak   Int      @default(0) @map("current_streak")
  
  categoryId      String?  @map("category_id")
  category        Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  completions     HabitCompletion[]
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@index([userId, frequencyType])
  @@index([categoryId])
  @@map("habits")
}

enum FrequencyType {
  DAILY
  WEEKLY
  CUSTOM_INTERVAL
  MONTHLY
  ADVANCED
}

model HabitCompletion {
  id             String   @id @default(uuid())
  habitId        String   @map("habit_id")
  habit          Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  completionDate DateTime @map("completion_date") @db.Date
  completionTime DateTime? @map("completion_time") @db.Time // NULL if only once per day
  
  createdAt      DateTime @default(now()) @map("created_at")
  
  @@unique([habitId, completionDate, completionTime])
  @@index([habitId, completionDate])
  @@map("habit_completions")
}

model Category {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name      String
  color     String?  @db.Char(7) // Hex color code #RRGGBB
  
  goals     Goal[]
  habits    Habit[]
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@unique([userId, name]) // Unique category names per user
  @@index([userId])
  @@map("categories")
}
```

---

## Entity Specifications

### 1. User

**Purpose**: Represents an authenticated user with ownership of all tracking data.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `email` (String, UNIQUE): Authentication identifier
- `passwordHash` (String): bcrypt-hashed password (never store plaintext)
- `timezone` (String): IANA timezone (e.g., "America/New_York") for accurate streak calculations
- `createdAt`, `updatedAt`: Audit timestamps

**Relationships**:
- 1:N Goals
- 1:N Habits
- 1:N Categories

**Validation Rules** (Zod):
- Email must be valid format
- Password must be 8+ characters (validated before hashing)
- Timezone must be valid IANA identifier

**Indexes**:
- `email` (unique) - fast lookup for authentication

**Cascade Behavior**:
- **DELETE User** → Cascade delete Goals, Habits, Categories (and their children)

---

### 2. Goal (Discriminated Union)

**Purpose**: Tracks progress toward either a target value by deadline OR an ongoing counter without deadline.

**Discriminator**: `goalType` (enum: TARGET_BASED | CONTINUOUS_COUNTER)

#### Type: TARGET_BASED

**Required Fields**:
- `title`, `goalType`, `unit`, `targetValue`, `deadline`

**Optional Fields**:
- `currentValue` (defaults to 0, updated via ProgressEntries)
- `categoryId`, `startDate`

**Example**:
```json
{
  "title": "Save for vacation",
  "goalType": "TARGET_BASED",
  "unit": "dollars",
  "targetValue": 5000.00,
  "deadline": "2025-12-31",
  "currentValue": 2250.00,
  "status": "ACTIVE"
}
```

#### Type: CONTINUOUS_COUNTER

**Required Fields**:
- `title`, `goalType`, `unit`

**Optional Fields**:
- `startDate` (when counting began)
- `categoryId`

**NULL Fields** (enforced by validation):
- `targetValue` = NULL
- `deadline` = NULL

**Example**:
```json
{
  "title": "Days without alcohol",
  "goalType": "CONTINUOUS_COUNTER",
  "unit": "days",
  "targetValue": null,
  "deadline": null,
  "currentValue": 23.00,
  "startDate": "2025-10-02",
  "status": "ACTIVE"
}
```

**Computed Fields**:
- `currentValue`: Sum of all ProgressEntry values (incremental)
  - For target-based: represents dollars saved, pages read, etc.
  - For continuous: represents days accumulated, hours logged, etc.

**Status Transitions**:
- `ACTIVE` → User is tracking this goal
- `COMPLETED` → Target reached (target-based) OR user manually completed (continuous)

**Validation Rules** (Zod):
- If `TARGET_BASED`: `targetValue` and `deadline` MUST be present
- If `CONTINUOUS_COUNTER`: `targetValue` and `deadline` MUST be null
- `targetValue` must be positive (if present)
- `deadline` must be future date (if present)
- `unit` max 50 characters

**Indexes**:
- `(userId, status)` - list active/completed goals per user
- `(userId, goalType)` - filter goals by type
- `categoryId` - filter goals by category

**Cascade Behavior**:
- **DELETE Goal** → Cascade delete ProgressEntries
- **DELETE Category** → Set `categoryId` to NULL (SetNull)

---

### 3. ProgressEntry

**Purpose**: Records an incremental change in goal progress (user decision: incremental-only logging).

**Fields**:
- `id` (UUID, PK): Unique identifier
- `goalId` (FK → Goal): Belongs to goal
- `value` (Decimal 10,2): Incremental amount added (positive for progress, negative for resets/corrections)
- `entryDate` (Date): Date of progress (user can backdate)
- `note` (Text, optional): User note about progress
- `createdAt`: When entry was logged

**Examples**:
```json
// Target-based goal progress
{
  "goalId": "goal-uuid",
  "value": 250.00,
  "entryDate": "2025-10-24",
  "note": "Paycheck deposit"
}

// Continuous counter daily progress
{
  "goalId": "continuous-goal-uuid",
  "value": 1.00,
  "entryDate": "2025-10-24",
  "note": "Another sober day"
}

// Reset event (negative value)
{
  "goalId": "continuous-goal-uuid",
  "value": -23.00,
  "entryDate": "2025-10-25",
  "note": "Relapse - restarting count"
}
```

**Cumulative Calculation** (in application logic):
```sql
SELECT SUM(value) as current_value
FROM progress_entries
WHERE goal_id = :goalId
```

**Validation Rules**:
- `value` can be positive or negative (allows corrections and resets)
- `entryDate` cannot be in future
- `note` max 500 characters

**Indexes**:
- `(goalId, entryDate)` - chronological progress history

**Cascade Behavior**:
- **DELETE Goal** → Cascade delete ProgressEntries

---

### 4. Habit

**Purpose**: Tracks recurring behaviors with flexible frequency patterns and streak calculation.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `userId` (FK → User): Belongs to user
- `title` (String): Habit name
- `frequencyType` (Enum): Pattern type (DAILY, WEEKLY, CUSTOM_INTERVAL, MONTHLY, ADVANCED)
- `frequencyConfig` (JSON): Type-specific configuration (Zod-validated)
- `currentStreak` (Int): Cached streak count (recomputed on completion)
- `categoryId` (FK → Category, optional): Organizational category
- `createdAt`, `updatedAt`: Audit timestamps

**Frequency Config Schemas** (Zod-validated JSON):

#### DAILY
```typescript
{
  allowMultiplePerDay: boolean  // Can complete more than once per day
}
```
**Example**:
```json
{
  "title": "Morning meditation",
  "frequencyType": "DAILY",
  "frequencyConfig": {
    "allowMultiplePerDay": false
  }
}
```

#### WEEKLY
```typescript
{
  timesPerWeek: number (1-7)
  specificDays?: DayOfWeek[]  // Optional: restrict to specific days
}
```
**Example**:
```json
{
  "title": "Gym workout",
  "frequencyType": "WEEKLY",
  "frequencyConfig": {
    "timesPerWeek": 3,
    "specificDays": ["MON", "WED", "FRI"]
  }
}
```

#### CUSTOM_INTERVAL
```typescript
{
  intervalDays: number  // Complete every N days
}
```
**Example**:
```json
{
  "title": "Deep clean house",
  "frequencyType": "CUSTOM_INTERVAL",
  "frequencyConfig": {
    "intervalDays": 7
  }
}
```

#### MONTHLY
```typescript
{
  timesPerMonth: number (1-31)
}
```
**Example**:
```json
{
  "title": "Financial review",
  "frequencyType": "MONTHLY",
  "frequencyConfig": {
    "timesPerMonth": 1
  }
}
```

#### ADVANCED
```typescript
{
  pattern: string           // Pattern identifier
  rules: Record<string, any>  // Pattern-specific rules
}
```
**Example**:
```json
{
  "title": "Work commute bike",
  "frequencyType": "ADVANCED",
  "frequencyConfig": {
    "pattern": "WEEKDAYS_ONLY",
    "rules": {
      "timesPerWeek": 5,
      "excludeDays": ["SAT", "SUN"]
    }
  }
}
```

**Streak Calculation**:
- Stored in `currentStreak` field (cached)
- Recomputed after each HabitCompletion insert
- Logic varies by `frequencyType` (see research.md Strategy Pattern)

**Validation Rules**:
- `frequencyConfig` MUST match schema for `frequencyType` (Zod validation)
- `currentStreak` cannot be negative
- `title` max 255 characters

**Indexes**:
- `(userId, frequencyType)` - filter habits by pattern type
- `categoryId` - filter by category

**Cascade Behavior**:
- **DELETE Habit** → Cascade delete HabitCompletions
- **DELETE Category** → Set `categoryId` to NULL

---

### 5. HabitCompletion

**Purpose**: Records a single instance of completing a habit.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `habitId` (FK → Habit): Belongs to habit
- `completionDate` (Date): Date completed
- `completionTime` (Time, optional): Time completed (for multiple-per-day habits)
- `createdAt`: When logged

**Unique Constraint**:
- `(habitId, completionDate, completionTime)` - prevents duplicate completions

**Examples**:
```json
// Single daily completion
{
  "habitId": "habit-uuid",
  "completionDate": "2025-10-24",
  "completionTime": null
}

// Multiple completions same day
{
  "habitId": "habit-uuid",
  "completionDate": "2025-10-24",
  "completionTime": "07:30:00"
}
{
  "habitId": "habit-uuid",
  "completionDate": "2025-10-24",
  "completionTime": "19:00:00"
}
```

**Validation Rules**:
- `completionDate` cannot be in future
- `completionTime` required if habit `frequencyConfig.allowMultiplePerDay = true`
- Cannot create duplicate (enforced by unique constraint)

**Indexes**:
- `(habitId, completionDate)` - chronological completion history

**Cascade Behavior**:
- **DELETE Habit** → Cascade delete HabitCompletions

---

### 6. Category

**Purpose**: Organizes goals and habits into life areas (Health, Finance, Lifestyle, etc.).

**Fields**:
- `id` (UUID, PK): Unique identifier
- `userId` (FK → User): Belongs to user
- `name` (String): Category name
- `color` (String, optional): Hex color code (#RRGGBB) for UI theming
- `createdAt`, `updatedAt`: Audit timestamps

**Unique Constraint**:
- `(userId, name)` - users cannot have duplicate category names

**Example**:
```json
{
  "id": "cat-uuid",
  "userId": "user-uuid",
  "name": "Health",
  "color": "#10b981"
}
```

**Validation Rules**:
- `name` max 100 characters
- `color` must match regex `^#[0-9A-Fa-f]{6}$` (if provided)
- Name unique per user

**Indexes**:
- `(userId, name)` - enforce uniqueness, fast lookup
- `userId` - list all categories for user

**Cascade Behavior**:
- **DELETE Category** → Set `categoryId` to NULL in Goals and Habits (SetNull, not cascade)

---

## Database Constraints Summary

### Primary Keys
- All tables use UUID primary keys (better for distributed systems, no integer overflow)

### Foreign Keys with Cascade Rules
- `Goal.userId` → `User.id` (ON DELETE CASCADE)
- `Habit.userId` → `User.id` (ON DELETE CASCADE)
- `Category.userId` → `User.id` (ON DELETE CASCADE)
- `ProgressEntry.goalId` → `Goal.id` (ON DELETE CASCADE)
- `HabitCompletion.habitId` → `Habit.id` (ON DELETE CASCADE)
- `Goal.categoryId` → `Category.id` (ON DELETE SET NULL)
- `Habit.categoryId` → `Category.id` (ON DELETE SET NULL)

**Rationale**: User deletion removes all owned data. Category deletion preserves goals/habits but removes categorization.

### Unique Constraints
- `User.email` (authentication uniqueness)
- `Category(userId, name)` (no duplicate category names per user)
- `HabitCompletion(habitId, completionDate, completionTime)` (prevent duplicate completions)

### Indexes
- `User.email` (unique index for fast auth lookup)
- `Goal(userId, status)` (list active/completed goals)
- `Goal(userId, goalType)` (filter by goal type)
- `Goal.categoryId` (filter by category)
- `ProgressEntry(goalId, entryDate)` (chronological progress)
- `Habit(userId, frequencyType)` (filter by frequency)
- `Habit.categoryId` (filter by category)
- `HabitCompletion(habitId, completionDate)` (chronological completions)
- `Category(userId, name)` (unique constraint index)

---

## Migration Strategy

### Initial Migration

```bash
# Create Prisma migration
npx prisma migrate dev --name init

# This generates:
# - prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql
# - Updates prisma/schema.prisma
# - Generates @prisma/client with TypeScript types
```

### Adding Columns (Example: Add Goal.description)

```prisma
model Goal {
  // ... existing fields
  description String? @db.Text
}
```

```bash
npx prisma migrate dev --name add_goal_description
```

### Data Migrations (Example: Populate currentStreak)

```typescript
// prisma/migrations/YYYYMMDDHHMMSS_recalculate_streaks/migration.ts
import { PrismaClient } from '@prisma/client';
import { getFrequencyStrategy } from '@/services/habits/frequency.strategy';

async function main() {
  const prisma = new PrismaClient();
  
  const habits = await prisma.habit.findMany({
    include: { completions: true, user: true },
  });
  
  for (const habit of habits) {
    const strategy = getFrequencyStrategy(habit.frequencyType);
    const streak = strategy.calculateStreak(
      habit.completions.map(c => c.completionDate),
      habit.user.timezone
    );
    
    await prisma.habit.update({
      where: { id: habit.id },
      data: { currentStreak: streak },
    });
  }
}

main();
```

### Production Migrations

```bash
# Deploy migrations to production
npx prisma migrate deploy

# Rollback (manual - requires SQL knowledge)
# Identify migration to rollback
ls prisma/migrations
# Manually write rollback SQL and execute
```

**Best Practices**:
- Test migrations in staging first
- Never edit generated migration files (create new migration instead)
- Backup database before production migrations
- Use data migrations for complex transformations

---

## Sample Queries

### Get User's Active Goals with Progress
```typescript
const goals = await prisma.goal.findMany({
  where: {
    userId: 'user-uuid',
    status: 'ACTIVE',
  },
  include: {
    category: true,
    progressEntries: {
      orderBy: { entryDate: 'desc' },
      take: 1, // Latest entry
    },
  },
});
```

### Calculate Goal Current Value
```typescript
const entries = await prisma.progressEntry.findMany({
  where: { goalId: 'goal-uuid' },
});

const currentValue = entries.reduce((sum, entry) => 
  sum + entry.value.toNumber(), 0
);
```

### Get Habit with Recent Completions
```typescript
const habit = await prisma.habit.findUnique({
  where: { id: 'habit-uuid' },
  include: {
    completions: {
      orderBy: { completionDate: 'desc' },
      take: 30, // Last 30 days
    },
  },
});
```

### Get All Categories with Counts
```typescript
const categories = await prisma.category.findMany({
  where: { userId: 'user-uuid' },
  include: {
    _count: {
      select: {
        goals: true,
        habits: true,
      },
    },
  },
});
```

---

## Performance Considerations

### Query Optimization
- Use `include` selectively (avoid loading unnecessary relations)
- Use `select` to fetch only needed fields
- Paginate large result sets (ProgressEntries, HabitCompletions)

### Caching Strategy (Future)
- Cache `Goal.currentValue` (recompute on ProgressEntry insert)
- Cache `Habit.currentStreak` (recompute on HabitCompletion insert)
- Use Redis for frequently accessed data (V2+)

### Scaling (Future)
- Read replicas for dashboard queries
- Partition tables by `userId` (if millions of users)
- Archive completed goals/habits (soft delete, move to archive table)

---

## Data Model Complete

All entities, relationships, constraints, and validation rules defined. Ready for API contract definition (contracts/) and development quickstart (quickstart.md).

**Next Steps**:
- Generate API contracts (OpenAPI specs in contracts/)
- Create quickstart guide for developers
- Update agent context with final architecture

