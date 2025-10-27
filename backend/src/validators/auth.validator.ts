/**
 * Authentication Validators
 * 
 * Zod schemas for authentication request validation.
 * 
 * Constitution: TypeScript Strict Mode + Zod validation
 */

import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string(),
  timezone: z.string().optional().default('UTC'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const updateUserSchema = z.object({
  timezone: z.string().optional(),
})

