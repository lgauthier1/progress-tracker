# Research: Personal Progress Tracker

**Feature**: Personal Progress Tracker  
**Phase**: Phase 0 - Technical Research  
**Date**: 2025-10-25  
**Status**: Complete

**Purpose**: Resolve technical unknowns, validate technology choices, and document implementation patterns for the Habits Tracker application.

---

## Executive Summary

All technology choices are locked per constitution v1.2.1. This research documents implementation patterns, best practices, and architectural decisions for: Prisma ORM with PostgreSQL, Zod validation schemas, JWT authentication, date-fns for streak calculations, Chart.js isolation, and habit frequency calculation strategies.

**Key Findings**:
1. ✅ Prisma + PostgreSQL supports both target-based goals and continuous counters via discriminated union pattern
2. ✅ Zod schemas can be shared between frontend/backend for type-safe validation
3. ✅ JWT with refresh tokens provides secure, stateless authentication suitable for future mobile
4. ✅ date-fns handles streak calculations across timezones with consistent logic
5. ✅ Chart.js isolation via adapter pattern enables future library replacement
6. ✅ Strategy pattern recommended for habit frequency calculations (extensible)

---

## 1. Database Architecture (Prisma + PostgreSQL)

### Decision: Prisma ORM with PostgreSQL 16+

**Rationale**: 
- Type-safe database client (eliminates runtime SQL errors)
- Automatic migrations (schema changes tracked in version control)
- Excellent TypeScript integration (generated types match DB schema)
- Built-in relation loading (prevents N+1 queries)
- Constitution-mandated choice (locked)

### Schema Design Patterns

#### Pattern 1: Discriminated Union for Goal Types

**Challenge**: Goals have two distinct types (target-based vs continuous-counter) with different required fields.

**Solution**: Single `Goal` table with discriminator column + nullable fields

```prisma
model Goal {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title       String
  goalType    GoalType // Discriminator: TARGET_BASED | CONTINUOUS_COUNTER
  unit        String
  
  // Target-based fields (nullable for continuous)
  targetValue  Decimal? @db.Decimal(10, 2)
  deadline     DateTime? @db.Date
  
  // Continuous counter fields (nullable for target-based)
  startDate    DateTime? @db.Date
  
  // Computed field (calculated from ProgressEntries)
  currentValue Decimal  @default(0) @db.Decimal(10, 2)
  
  status      GoalStatus @default(ACTIVE) // ACTIVE | COMPLETED
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  progressEntries ProgressEntry[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId, status])
  @@index([userId, goalType])
}

enum GoalType {
  TARGET_BASED
  CONTINUOUS_COUNTER
}

enum GoalStatus {
  ACTIVE
  COMPLETED
}
```

**Alternatives Considered**:
- **Separate tables** (`TargetGoal`, `ContinuousGoal`): Rejected - creates code duplication, complicates queries
- **JSON column for type-specific data**: Rejected - loses type safety, makes querying harder

**Best Practice**: 
- Use check constraints to enforce conditional NOT NULL (`goalType = TARGET_BASED → targetValue NOT NULL`)
- Zod validation layer enforces schema at application level (defense in depth)

#### Pattern 2: Progress Entries (Incremental Logging)

**Challenge**: User decision Q2 - incremental-only progress logging

**Solution**: Store incremental deltas, compute cumulative in application layer

```prisma
model ProgressEntry {
  id        String   @id @default(uuid())
  goalId    String
  goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  
  value     Decimal  @db.Decimal(10, 2)  // Incremental amount added
  entryDate DateTime @db.Date             // Date of progress (user-specified)
  note      String?
  
  createdAt DateTime @default(now())      // When logged
  
  @@index([goalId, entryDate])
}
```

**Cumulative Calculation Strategy**:
```typescript
// In goals.service.ts
async function calculateCurrentValue(goalId: string): Promise<number> {
  const entries = await prisma.progressEntry.findMany({
    where: { goalId },
    orderBy: { entryDate: 'asc' }
  });
  
  return entries.reduce((sum, entry) => sum + entry.value.toNumber(), 0);
}
```

**Performance**: Acceptable for V1 (goals limited to ~1000 entries max). If performance degrades:
- Add materialized `currentValue` column (updated via trigger or application logic)
- Use PostgreSQL aggregate queries instead of application-layer sum

#### Pattern 3: Habit Frequency (Flexible Patterns)

**Challenge**: Support daily, weekly, custom intervals, monthly, and complex patterns

**Solution**: JSON column for flexible configuration + enum for pattern type

```prisma
model Habit {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title           String
  frequencyType   FrequencyType    // DAILY | WEEKLY | CUSTOM_INTERVAL | MONTHLY | ADVANCED
  frequencyConfig Json             // Type-safe via Zod schema
  
  currentStreak   Int      @default(0)
  categoryId      String?
  category        Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  completions     HabitCompletion[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId, frequencyType])
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
  habitId        String
  habit          Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  completionDate DateTime @db.Date
  completionTime DateTime? // Optional time (for multiple per day)
  
  createdAt      DateTime @default(now())
  
  @@unique([habitId, completionDate, completionTime]) // Prevent duplicate completions
  @@index([habitId, completionDate])
}
```

**Frequency Config Examples (Zod-validated JSON)**:
```typescript
// Daily: { allowMultiplePerDay: boolean }
{ allowMultiplePerDay: false }

// Weekly: { timesPerWeek: number, specificDays?: DayOfWeek[] }
{ timesPerWeek: 3, specificDays: ['MON', 'WED', 'FRI'] }

// Custom Interval: { intervalDays: number }
{ intervalDays: 3 } // Every 3 days

// Monthly: { timesPerMonth: number }
{ timesPerMonth: 4 }

// Advanced: { pattern: string, rules: object }
{ pattern: 'WEEKDAYS_ONLY', rules: { timesPerWeek: 5 } }
```

**Alternatives Considered**:
- **Separate tables per frequency type**: Rejected - over-normalization, query complexity
- **Flat columns for each config option**: Rejected - not extensible, wastes space

### Migration Strategy

```bash
# Initial migration (after schema finalized)
npx prisma migrate dev --name init

# Subsequent migrations
npx prisma migrate dev --name add_habit_frequency_config

# Production migrations
npx prisma migrate deploy
```

**Best Practices**:
- Never edit generated migration files manually
- Always run migrations before deploying code changes
- Use `prisma migrate reset` only in development (destroys data)

---

## 2. Validation Layer (Zod)

### Decision: Zod for runtime validation + TypeScript inference

**Rationale**:
- Runtime validation catches invalid data at API boundary
- TypeScript types inferred from schemas (single source of truth)
- Shared schemas between frontend/backend (consistent validation)
- Constitution-mandated choice (locked)

### Shared Schema Pattern

**File**: `shared/types/goals.types.ts`
```typescript
import { z } from 'zod';

// Base goal schema (shared fields)
const baseGoalSchema = z.object({
  title: z.string().min(1).max(255),
  unit: z.string().min(1).max(50),
  categoryId: z.string().uuid().optional(),
});

// Target-based goal (discriminated union branch)
export const targetBasedGoalSchema = baseGoalSchema.extend({
  goalType: z.literal('TARGET_BASED'),
  targetValue: z.number().positive(),
  deadline: z.coerce.date(),
});

// Continuous counter goal (discriminated union branch)
export const continuousGoalSchema = baseGoalSchema.extend({
  goalType: z.literal('CONTINUOUS_COUNTER'),
  targetValue: z.undefined(), // Explicitly undefined
  deadline: z.undefined(),
});

// Union type (enforces discriminator)
export const createGoalSchema = z.discriminatedUnion('goalType', [
  targetBasedGoalSchema,
  continuousGoalSchema,
]);

// Infer TypeScript types
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type TargetBasedGoal = z.infer<typeof targetBasedGoalSchema>;
export type ContinuousGoal = z.infer<typeof continuousGoalSchema>;

// Progress entry schema
export const createProgressEntrySchema = z.object({
  goalId: z.string().uuid(),
  value: z.number().positive(), // Incremental value only
  entryDate: z.coerce.date(),
  note: z.string().max(500).optional(),
});

export type CreateProgressEntryInput = z.infer<typeof createProgressEntrySchema>;
```

### Backend Validation Middleware

**File**: `backend/src/middleware/validation.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: result.error.errors,
        }
      });
    }
    
    req.body = result.data; // Replace with parsed/coerced data
    next();
  };
}
```

**Usage in Routes**:
```typescript
import { createGoalSchema } from '@shared/types/goals.types';
import { validateBody } from '@/middleware/validation.middleware';

router.post('/goals', validateBody(createGoalSchema), goalsController.create);
```

### Frontend Validation

**Same schema, different usage**:
```typescript
import { createGoalSchema } from '@shared/types/goals.types';

function onSubmit(formData: unknown) {
  const result = createGoalSchema.safeParse(formData);
  
  if (!result.success) {
    // Show validation errors in form
    setErrors(result.error.errors);
    return;
  }
  
  // Type-safe API call
  await goalsApi.create(result.data);
}
```

**Best Practices**:
- Validate at API boundary (backend) - never trust client
- Use same schema on frontend for better UX (instant feedback)
- Use `safeParse` instead of `parse` (avoids throwing errors)
- Coerce dates (`z.coerce.date()`) for flexible input formats

---

## 3. Authentication (JWT + bcrypt)

### Decision: JWT access tokens + bcrypt password hashing

**Rationale**:
- Stateless authentication (no server-side session storage)
- Works for web + future mobile apps
- Scalable (no shared session store required)
- Constitution-mandated choice (locked)

### JWT Strategy

**Token Structure**:
```typescript
// Access token (short-lived: 15 minutes)
{
  userId: string;
  email: string;
  iat: number;  // Issued at
  exp: number;  // Expires at
}

// Refresh token (long-lived: 7 days)
{
  userId: string;
  tokenVersion: number; // For token revocation
  iat: number;
  exp: number;
}
```

**Implementation Pattern**:
```typescript
// backend/src/utils/jwt.utils.ts
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(userId: string, tokenVersion: number): string {
  return jwt.sign(
    { userId, tokenVersion },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
}
```

**Auth Middleware**:
```typescript
// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt.utils';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authentication token provided',
      }
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Authentication token is invalid or expired',
      }
    });
  }
}
```

### Password Hashing (bcrypt)

```typescript
// backend/src/utils/password.utils.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Registration Flow**:
```typescript
// backend/src/services/auth.service.ts
async function register(email: string, password: string) {
  // 1. Validate email not already registered
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');
  
  // 2. Hash password
  const passwordHash = await hashPassword(password);
  
  // 3. Create user
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });
  
  // 4. Generate tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, 0);
  
  return { user, accessToken, refreshToken };
}
```

**Frontend Token Storage**:
```typescript
// localStorage (simple, works for V1)
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Axios interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Security Considerations**:
- HTTPS required in production (protects tokens in transit)
- HttpOnly cookies alternative (more secure than localStorage, but complicates mobile)
- Token refresh flow required (15min access token expiry)
- Token version in DB enables revocation (logout all devices)

**Alternatives Considered**:
- **Session-based auth**: Rejected - requires shared session store, not mobile-friendly
- **OAuth2 providers**: Deferred to V2 - adds complexity, YAGNI for V1

---

## 4. Date/Time Handling (date-fns)

### Decision: date-fns for all date operations

**Rationale**:
- Modular (tree-shakeable, small bundle size)
- Immutable (functional approach, no mutation bugs)
- Timezone-aware with `date-fns-tz` addon
- Constitution-mandated choice (locked)

### Critical Use Cases

#### Use Case 1: Streak Calculation (Habits)

**Challenge**: Calculate consecutive days/weeks where habit was completed, handling timezones and edge cases.

**Pattern**:
```typescript
// backend/src/services/habits.service.ts
import { differenceInDays, startOfDay, parseISO } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

interface StreakResult {
  currentStreak: number;
  lastCompletionDate: Date | null;
}

async function calculateStreak(
  habitId: string,
  userTimezone: string
): Promise<StreakResult> {
  // Get completions ordered desc
  const completions = await prisma.habitCompletion.findMany({
    where: { habitId },
    orderBy: { completionDate: 'desc' },
  });
  
  if (completions.length === 0) {
    return { currentStreak: 0, lastCompletionDate: null };
  }
  
  // Convert to user's timezone
  const now = utcToZonedTime(new Date(), userTimezone);
  const today = startOfDay(now);
  
  let streak = 0;
  let checkDate = today;
  
  for (const completion of completions) {
    const completionDate = startOfDay(
      utcToZonedTime(completion.completionDate, userTimezone)
    );
    
    const dayDiff = differenceInDays(checkDate, completionDate);
    
    if (dayDiff === 0) {
      // Completed on expected day
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (dayDiff === 1 && streak === 0) {
      // Yesterday completion (grace period for first check)
      streak++;
      checkDate = subDays(checkDate, 2);
    } else {
      // Gap in streak
      break;
    }
  }
  
  return {
    currentStreak: streak,
    lastCompletionDate: completions[0].completionDate,
  };
}
```

**Edge Cases Handled**:
- Timezone differences (user in different timezone than server)
- Daylight saving time transitions
- Grace period (yesterday completion counts if checking today)
- Multiple completions same day (deduplicated via unique constraint)

#### Use Case 2: Days Remaining (Target Goals)

```typescript
import { differenceInDays, startOfDay } from 'date-fns';

function calculateDaysRemaining(deadline: Date): number {
  const now = startOfDay(new Date());
  const deadlineDay = startOfDay(deadline);
  
  return Math.max(0, differenceInDays(deadlineDay, now));
}
```

#### Use Case 3: Progress Pace (On Track Indicator)

```typescript
import { differenceInDays, startOfDay } from 'date-fns';

interface PaceResult {
  onTrack: boolean;
  requiredDailyRate: number;
}

function calculatePace(
  currentValue: number,
  targetValue: number,
  deadline: Date
): PaceResult {
  const remaining = targetValue - currentValue;
  const daysRemaining = calculateDaysRemaining(deadline);
  
  if (daysRemaining === 0) {
    return {
      onTrack: currentValue >= targetValue,
      requiredDailyRate: 0,
    };
  }
  
  const requiredDailyRate = remaining / daysRemaining;
  
  // On track if current pace meets or exceeds required pace
  // (Simplified: assumes linear progress)
  return {
    onTrack: requiredDailyRate <= 0, // Already at or past goal
    requiredDailyRate: Math.max(0, requiredDailyRate),
  };
}
```

**Best Practices**:
- Always use `startOfDay` for date comparisons (ignores time)
- Store dates in UTC in database, convert to user timezone for display/calculation
- Use `parseISO` for parsing ISO date strings from API
- Use `format` for displaying dates to users

**Alternatives Considered**:
- **Luxon**: Rejected - heavier, more complex API
- **Day.js**: Rejected - less comprehensive, smaller community
- **Native Date**: Rejected - mutable, inconsistent timezone handling

---

## 5. Chart.js Isolation (Dependency Abstraction)

### Decision: Adapter pattern for Chart.js isolation

**Rationale**:
- Constitution Principle VI requires isolation of external libraries
- Enables future replacement (ECharts, ApexCharts, etc.) without app-wide refactoring
- Improves testability (mock chart adapter in tests)
- Centralizes theming and configuration

### Abstraction Architecture

**File**: `frontend/src/services/charts/chartTypes.ts`
```typescript
// Application-specific chart interfaces (library-agnostic)

export type ChartDataPoint = {
  date: Date;
  value: number;
};

export type ChartSeries = {
  label: string;
  data: ChartDataPoint[];
  color?: string;
  style?: 'solid' | 'dashed';
};

export type LineChartConfig = {
  series: ChartSeries[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showProjection?: boolean; // For goal on-track indicator
};

export interface ChartAdapter {
  renderLineChart(container: HTMLElement, config: LineChartConfig): void;
  updateLineChart(chartId: string, config: LineChartConfig): void;
  destroyChart(chartId: string): void;
}
```

**File**: `frontend/src/services/charts/chartAdapter.ts`
```typescript
// Chart.js implementation of adapter (isolated)

import { Chart as ChartJS, registerables } from 'chart.js';
import type { ChartAdapter, LineChartConfig } from './chartTypes';
import { getChartTheme } from './chartTheme';

ChartJS.register(...registerables);

class ChartJSAdapter implements ChartAdapter {
  private charts = new Map<string, ChartJS>();
  
  renderLineChart(container: HTMLElement, config: LineChartConfig): void {
    const chartId = container.id || `chart-${Date.now()}`;
    
    // Convert application data to Chart.js format
    const datasets = config.series.map(series => ({
      label: series.label,
      data: series.data.map(d => ({
        x: d.date.getTime(),
        y: d.value,
      })),
      borderColor: series.color || getChartTheme().primaryColor,
      borderDash: series.style === 'dashed' ? [5, 5] : [],
      fill: false,
    }));
    
    const chart = new ChartJS(container, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: config.showLegend ?? true },
          title: {
            display: !!config.title,
            text: config.title,
          },
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day' },
            title: {
              display: !!config.xAxisLabel,
              text: config.xAxisLabel,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: !!config.yAxisLabel,
              text: config.yAxisLabel,
            },
          },
        },
      },
    });
    
    this.charts.set(chartId, chart);
  }
  
  updateLineChart(chartId: string, config: LineChartConfig): void {
    const chart = this.charts.get(chartId);
    if (!chart) return;
    
    // Update chart data
    chart.data.datasets = config.series.map(series => ({
      label: series.label,
      data: series.data.map(d => ({ x: d.date.getTime(), y: d.value })),
      borderColor: series.color || getChartTheme().primaryColor,
      borderDash: series.style === 'dashed' ? [5, 5] : [],
      fill: false,
    }));
    
    chart.update();
  }
  
  destroyChart(chartId: string): void {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.destroy();
      this.charts.delete(chartId);
    }
  }
}

// Singleton instance
export const chartAdapter = new ChartJSAdapter();
```

**File**: `frontend/src/services/charts/chartTheme.ts`
```typescript
// Centralized chart theming (uses Tailwind colors)

export function getChartTheme() {
  return {
    primaryColor: '#3b82f6',  // Tailwind blue-500
    successColor: '#10b981',  // Tailwind green-500
    warningColor: '#f59e0b',  // Tailwind amber-500
    gridColor: '#e5e7eb',     // Tailwind gray-200
    textColor: '#6b7280',     // Tailwind gray-500
  };
}
```

### Usage in Components

**File**: `frontend/src/components/charts/ProgressLineChart.vue`
```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { chartAdapter } from '@/services/charts/chartAdapter';
import type { ChartDataPoint } from '@/services/charts/chartTypes';

const props = defineProps<{
  data: ChartDataPoint[];
  projectionData?: ChartDataPoint[];
  title?: string;
}>();

const chartContainer = ref<HTMLCanvasElement>();

onMounted(() => {
  if (chartContainer.value) {
    const series = [
      {
        label: 'Progress',
        data: props.data,
        color: '#3b82f6',
        style: 'solid' as const,
      },
    ];
    
    if (props.projectionData) {
      series.push({
        label: 'Projection',
        data: props.projectionData,
        color: '#6b7280',
        style: 'dashed' as const,
      });
    }
    
    chartAdapter.renderLineChart(chartContainer.value, {
      series,
      title: props.title,
      xAxisLabel: 'Date',
      yAxisLabel: 'Progress',
      showLegend: true,
      showProjection: !!props.projectionData,
    });
  }
});

watch(() => props.data, () => {
  if (chartContainer.value?.id) {
    chartAdapter.updateLineChart(chartContainer.value.id, {
      series: [
        { label: 'Progress', data: props.data, style: 'solid' },
        ...(props.projectionData
          ? [{ label: 'Projection', data: props.projectionData, style: 'dashed' as const }]
          : []),
      ],
      title: props.title,
    });
  }
});

onUnmounted(() => {
  if (chartContainer.value?.id) {
    chartAdapter.destroyChart(chartContainer.value.id);
  }
});
</script>

<template>
  <canvas ref="chartContainer" :id="`chart-${Date.now()}`"></canvas>
</template>
```

**Benefits**:
- ✅ Components never import Chart.js directly
- ✅ Switching to ECharts = only change `chartAdapter.ts`
- ✅ Easy to mock in tests (`jest.mock('@/services/charts/chartAdapter')`)
- ✅ Centralized theming (consistent colors across all charts)
- ✅ Type-safe (application types, not library types)

**Alternatives Considered**:
- **Direct Chart.js usage**: Rejected - violates constitution Principle VI
- **Component library wrapper**: Rejected - adds extra dependency layer

---

## 6. Habit Frequency Calculation (Strategy Pattern)

### Challenge

Support flexible habit frequencies (daily, weekly, custom intervals, monthly, advanced) with consistent streak calculation logic.

### Decision: Strategy Pattern with Frequency Calculators

**Pattern**:
```typescript
// backend/src/services/habits/frequency.strategy.ts

interface FrequencyStrategy {
  calculateStreak(completions: Date[], userTimezone: string): number;
  isOnTrack(completions: Date[], config: any, userTimezone: string): boolean;
  getNextExpectedDate(lastCompletion: Date, config: any): Date;
}

class DailyStrategy implements FrequencyStrategy {
  calculateStreak(completions: Date[], userTimezone: string): number {
    // Implementation from date-fns section
    // Check consecutive days
  }
  
  isOnTrack(completions: Date[], config: any, userTimezone: string): boolean {
    const today = startOfDay(new Date());
    return completions.some(c => isSameDay(c, today) || isSameDay(c, subDays(today, 1)));
  }
  
  getNextExpectedDate(lastCompletion: Date, config: any): Date {
    return addDays(lastCompletion, 1);
  }
}

class WeeklyStrategy implements FrequencyStrategy {
  calculateStreak(completions: Date[], userTimezone: string): number {
    // Check if each week had required number of completions
    const weeksMap = this.groupByWeek(completions);
    let streak = 0;
    let currentWeek = startOfWeek(new Date());
    
    while (weeksMap.has(currentWeek.getTime())) {
      const weekCompletions = weeksMap.get(currentWeek.getTime())!;
      if (weekCompletions.length >= config.timesPerWeek) {
        streak++;
        currentWeek = subWeeks(currentWeek, 1);
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  // ... other methods
}

// Factory
export function getFrequencyStrategy(type: FrequencyType): FrequencyStrategy {
  switch (type) {
    case 'DAILY':
      return new DailyStrategy();
    case 'WEEKLY':
      return new WeeklyStrategy();
    case 'CUSTOM_INTERVAL':
      return new CustomIntervalStrategy();
    case 'MONTHLY':
      return new MonthlyStrategy();
    case 'ADVANCED':
      return new AdvancedStrategy();
  }
}
```

**Usage**:
```typescript
// In habits.service.ts
async function updateHabitStreak(habitId: string): Promise<void> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: { completions: true },
  });
  
  const strategy = getFrequencyStrategy(habit.frequencyType);
  const streak = strategy.calculateStreak(
    habit.completions.map(c => c.completionDate),
    habit.user.timezone
  );
  
  await prisma.habit.update({
    where: { id: habitId },
    data: { currentStreak: streak },
  });
}
```

**Benefits**:
- ✅ Extensible (add new frequency types without modifying existing code)
- ✅ Testable (test each strategy independently)
- ✅ Maintainable (frequency logic isolated per type)
- ✅ Supports phased rollout (implement basic strategies first, complex later)

**Alternatives Considered**:
- **Single function with if/else**: Rejected - becomes unmaintainable with 5+ frequency types
- **Inheritance hierarchy**: Rejected - composition over inheritance

---

## 7. Environment Configuration

### Decision: Zod-validated environment variables

**Rationale**: Constitution requires environment validation at startup (fail fast)

**Implementation**:
```typescript
// backend/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  DATABASE_URL: z.string().url(),
  
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }
  
  return result.data;
}

export const env = validateEnv();
```

**`.env.example`**:
```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/habits_tracker

# Authentication (use long random strings in production)
JWT_SECRET=your-secret-key-min-32-characters-long-please-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-also-32-chars-min-change-this

# CORS
FRONTEND_URL=http://localhost:5173
```

**Usage in server.ts**:
```typescript
import { env } from './config/env';

// Environment is validated before server starts
const app = express();
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
```

---

## 8. API Error Handling

### Standard Error Format (Constitution Requirement)

**Middleware**:
```typescript
// backend/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.errors,
      },
    });
  }
  
  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Resource already exists',
          details: { field: err.meta?.target },
        },
      });
    }
    
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      });
    }
  }
  
  // Default error
  console.error('Unhandled error:', err);
  
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  });
}
```

---

## Research Complete

All technical decisions documented. No unresolved NEEDS CLARIFICATION items remain.

**Next Phase**: Phase 1 - Design (data-model.md, contracts/, quickstart.md)

