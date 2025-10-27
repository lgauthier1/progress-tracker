/**
 * Shared Goals Types
 * 
 * Zod schemas and types for goals and progress entries.
 * Supports both target-based and continuous counter goals.
 * 
 * Constitution: TypeScript Strict Mode + Zod validation
 */

import { z } from 'zod'

// ============================================================================
// GOAL ENTITY
// ============================================================================

export const GoalTypeSchema = z.enum(['TARGET_BASED', 'CONTINUOUS_COUNTER'])
export type GoalType = z.infer<typeof GoalTypeSchema>

export const GoalStatusSchema = z.enum(['ACTIVE', 'COMPLETED'])
export type GoalStatus = z.infer<typeof GoalStatusSchema>

// Base Goal schema (common fields)
export const BaseGoalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  goalType: GoalTypeSchema,
  unit: z.string(),
  status: GoalStatusSchema,
  categoryId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Target-based goal (with deadline)
export const TargetBasedGoalSchema = BaseGoalSchema.extend({
  goalType: z.literal('TARGET_BASED'),
  targetValue: z.number(),
  currentValue: z.number(),
  deadline: z.string().datetime(),
})

export type TargetBasedGoal = z.infer<typeof TargetBasedGoalSchema>

// Continuous counter goal (without deadline)
export const ContinuousCounterGoalSchema = BaseGoalSchema.extend({
  goalType: z.literal('CONTINUOUS_COUNTER'),
  currentValue: z.number(),
  startDate: z.string().datetime(),
})

export type ContinuousCounterGoal = z.infer<typeof ContinuousCounterGoalSchema>

// Discriminated union for all goals
export const GoalSchema = z.discriminatedUnion('goalType', [
  TargetBasedGoalSchema,
  ContinuousCounterGoalSchema,
])

export type Goal = z.infer<typeof GoalSchema>

// ============================================================================
// PROGRESS ENTRY ENTITY
// ============================================================================

export const ProgressEntrySchema = z.object({
  id: z.string().uuid(),
  goalId: z.string().uuid(),
  value: z.number(),
  entryDate: z.string().datetime(),
  note: z.string().nullable(),
  createdAt: z.string().datetime(),
})

export type ProgressEntry = z.infer<typeof ProgressEntrySchema>

// ============================================================================
// CREATE GOAL REQUEST
// ============================================================================

export const CreateGoalRequestSchema = z.discriminatedUnion('goalType', [
  // Target-based goal creation
  z.object({
    goalType: z.literal('TARGET_BASED'),
    title: z.string().min(1, 'Title is required').max(255),
    unit: z.string().min(1, 'Unit is required').max(50),
    targetValue: z.number().positive('Target value must be positive'),
    deadline: z.string().datetime('Invalid deadline format'),
    categoryId: z.string().uuid().optional(),
  }),
  // Continuous counter goal creation
  z.object({
    goalType: z.literal('CONTINUOUS_COUNTER'),
    title: z.string().min(1, 'Title is required').max(255),
    unit: z.string().min(1, 'Unit is required').max(50),
    startDate: z.string().datetime('Invalid start date format').optional(),
    categoryId: z.string().uuid().optional(),
  }),
])

export type CreateGoalRequest = z.infer<typeof CreateGoalRequestSchema>

// ============================================================================
// UPDATE GOAL REQUEST
// ============================================================================

export const UpdateGoalRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  targetValue: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  status: GoalStatusSchema.optional(),
  categoryId: z.string().uuid().nullable().optional(),
})

export type UpdateGoalRequest = z.infer<typeof UpdateGoalRequestSchema>

// ============================================================================
// CREATE PROGRESS ENTRY REQUEST
// ============================================================================

export const CreateProgressEntryRequestSchema = z.object({
  value: z.number(),
  entryDate: z.string().datetime().optional(), // Defaults to now
  note: z.string().max(1000).optional(),
})

export type CreateProgressEntryRequest = z.infer<typeof CreateProgressEntryRequestSchema>

// ============================================================================
// UPDATE PROGRESS ENTRY REQUEST
// ============================================================================

export const UpdateProgressEntryRequestSchema = z.object({
  value: z.number().optional(),
  entryDate: z.string().datetime().optional(),
  note: z.string().max(1000).nullable().optional(),
})

export type UpdateProgressEntryRequest = z.infer<typeof UpdateProgressEntryRequestSchema>

// ============================================================================
// API RESPONSES
// ============================================================================

export const GoalResponseSchema = z.object({
  goal: GoalSchema,
})

export type GoalResponse = z.infer<typeof GoalResponseSchema>

export const GoalsListResponseSchema = z.object({
  goals: z.array(GoalSchema),
})

export type GoalsListResponse = z.infer<typeof GoalsListResponseSchema>

export const ProgressEntriesResponseSchema = z.object({
  entries: z.array(ProgressEntrySchema),
})

export type ProgressEntriesResponse = z.infer<typeof ProgressEntriesResponseSchema>

export const ProgressEntryResponseSchema = z.object({
  entry: ProgressEntrySchema,
})

export type ProgressEntryResponse = z.infer<typeof ProgressEntryResponseSchema>

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export const GoalsQuerySchema = z.object({
  status: GoalStatusSchema.optional(),
  goalType: GoalTypeSchema.optional(),
  categoryId: z.string().uuid().optional(),
})

export type GoalsQuery = z.infer<typeof GoalsQuerySchema>
