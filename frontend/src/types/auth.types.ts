/**
 * Shared Authentication Types
 * 
 * Zod schemas and types for authentication (login, register, user profile).
 * Shared between frontend and backend for type consistency.
 * 
 * Constitution: TypeScript Strict Mode + Zod validation
 */

import { z } from 'zod'

// ============================================================================
// USER ENTITY
// ============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  timezone: z.string().default('UTC'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

// ============================================================================
// REGISTRATION
// ============================================================================

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string(),
  timezone: z.string().default('UTC').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

export const RegisterResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>

// ============================================================================
// LOGIN
// ============================================================================

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type LoginResponse = z.infer<typeof LoginResponseSchema>

// ============================================================================
// TOKEN REFRESH
// ============================================================================

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
})

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>

// ============================================================================
// USER PROFILE
// ============================================================================

export const UpdateUserRequestSchema = z.object({
  timezone: z.string().optional(),
})

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>

export const UserProfileResponseSchema = z.object({
  user: UserSchema,
})

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>

