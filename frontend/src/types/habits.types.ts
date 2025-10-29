/**
 * Shared Habits Types
 * 
 * Zod schemas and types for habits and habit completions.
 * 
 * Constitution: TypeScript Strict Mode + Zod validation
 */

import { z } from 'zod'
import { UserSchema } from './auth.types'

// ============================================================================
// ENUMS
// ============================================================================

export const HabitStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED'])
export type HabitStatus = z.infer<typeof HabitStatusSchema>

export const HabitFrequencySchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'])
export type HabitFrequency = z.infer<typeof HabitFrequencySchema>

// ============================================================================
// HABIT COMPLETION
// ============================================================================

export const HabitCompletionSchema = z.object({
  id: z.string().uuid(),
  habitId: z.string().uuid(),
  completionDate: z.string().datetime(),
  note: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
})

export type HabitCompletion = z.infer<typeof HabitCompletionSchema>

export const CreateHabitCompletionRequestSchema = z.object({
  completionDate: z.string().datetime().optional(),
  note: z.string().max(255).optional(),
})
export type CreateHabitCompletionRequest = z.infer<typeof CreateHabitCompletionRequestSchema>

export const UpdateHabitCompletionRequestSchema = CreateHabitCompletionRequestSchema.partial()
export type UpdateHabitCompletionRequest = z.infer<typeof UpdateHabitCompletionRequestSchema>

// ============================================================================
// HABIT
// ============================================================================

export const HabitSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(500).nullable().optional(),
  frequency: HabitFrequencySchema,
  frequencyConfig: z.record(z.any()).optional(), // JSON config for custom frequencies
  status: HabitStatusSchema,
  categoryId: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Computed fields
  currentStreak: z.number().optional(),
  totalCompletions: z.number().optional(),
  lastCompletion: z.string().datetime().nullable().optional(),
})

export type Habit = z.infer<typeof HabitSchema>

export const CreateHabitRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(500).optional(),
  frequency: HabitFrequencySchema,
  frequencyConfig: z.record(z.any()).optional(),
  categoryId: z.string().uuid().optional().nullable(),
})
export type CreateHabitRequest = z.infer<typeof CreateHabitRequestSchema>

export const UpdateHabitRequestSchema = CreateHabitRequestSchema.partial()
export type UpdateHabitRequest = z.infer<typeof UpdateHabitRequestSchema>

// ============================================================================
// RESPONSES
// ============================================================================

export const HabitsResponseSchema = z.object({
  habits: z.array(HabitSchema),
})
export type HabitsResponse = z.infer<typeof HabitsResponseSchema>

export const HabitResponseSchema = z.object({
  habit: HabitSchema,
})
export type HabitResponse = z.infer<typeof HabitResponseSchema>

export const HabitCompletionsResponseSchema = z.object({
  completions: z.array(HabitCompletionSchema),
})
export type HabitCompletionsResponse = z.infer<typeof HabitCompletionsResponseSchema>

export const HabitCompletionResponseSchema = z.object({
  completion: HabitCompletionSchema,
})
export type HabitCompletionResponse = z.infer<typeof HabitCompletionResponseSchema>

export const HabitStreakResponseSchema = z.object({
  habitId: z.string().uuid(),
  currentStreak: z.number(),
  totalCompletions: z.number(),
  lastCompletion: z.string().datetime().nullable(),
})
export type HabitStreakResponse = z.infer<typeof HabitStreakResponseSchema>

export const HabitCalendarResponseSchema = z.object({
  habitId: z.string().uuid(),
  year: z.number(),
  month: z.number(),
  calendarData: z.record(z.number()),
})
export type HabitCalendarResponse = z.infer<typeof HabitCalendarResponseSchema>

