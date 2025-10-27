/**
 * Goals Validators
 * 
 * Zod schemas for goals and progress entries request validation.
 * Supports discriminated union for goal types.
 * 
 * Constitution: TypeScript Strict Mode + Zod validation
 */

import { z } from 'zod'

// Create goal schema (discriminated union)
export const createGoalSchema = z.discriminatedUnion('goalType', [
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

// Update goal schema
export const updateGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  targetValue: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
  categoryId: z.string().uuid().nullable().optional(),
})

// Query parameters for listing goals
export const goalsQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
  goalType: z.enum(['TARGET_BASED', 'CONTINUOUS_COUNTER']).optional(),
  categoryId: z.string().uuid().optional(),
})

// Create progress entry schema
export const createProgressEntrySchema = z.object({
  value: z.number(),
  entryDate: z.string().datetime().optional(), // Defaults to now
  note: z.string().max(1000).optional(),
})

// Update progress entry schema
export const updateProgressEntrySchema = z.object({
  value: z.number().optional(),
  entryDate: z.string().datetime().optional(),
  note: z.string().max(1000).nullable().optional(),
})

// UUID parameter validation
export const uuidParamSchema = z.object({
  id: z.string().uuid(),
})

export const progressEntryParamSchema = z.object({
  id: z.string().uuid(),
  entryId: z.string().uuid(),
})

