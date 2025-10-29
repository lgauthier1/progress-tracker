/**
 * Shared API Types
 * 
 * Common API response and error types used across frontend and backend.
 * 
 * Constitution: TypeScript Strict Mode + Zod validation
 */

import { z } from 'zod'

// ============================================================================
// API ERROR TYPES (Standard format per constitution)
// ============================================================================

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      'VALIDATION_ERROR',
      'UNAUTHORIZED',
      'INVALID_TOKEN',
      'FORBIDDEN',
      'NOT_FOUND',
      'DUPLICATE_ENTRY',
      'INTERNAL_ERROR',
    ]),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export const PaginationQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// COMMON RESPONSE TYPES
// ============================================================================

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>

