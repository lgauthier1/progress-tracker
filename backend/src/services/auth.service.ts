/**
 * Authentication Service
 * 
 * Business logic for user authentication (register, login, profile).
 * 
 * Constitution: TypeScript Strict Mode
 */

import { prisma } from '../models'
import { hashPassword, comparePassword } from '../utils/password.utils'
import { signToken, signRefreshToken } from '../utils/jwt.utils'
import { createError } from '../middleware/error.middleware'

export interface RegisterData {
  email: string
  password: string
  timezone?: string
}

export interface LoginData {
  email: string
  password: string
}

/**
 * Register a new user
 */
export async function register(data: RegisterData) {
  const { email, password, timezone = 'UTC' } = data

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw createError(409, 'DUPLICATE_ENTRY', 'Email already registered')
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      timezone,
    },
  })

  // Generate tokens
  const accessToken = signToken({
    userId: user.id,
    email: user.email,
  })

  const refreshToken = signRefreshToken({
    userId: user.id,
    email: user.email,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    accessToken,
    refreshToken,
  }
}

/**
 * Login a user
 */
export async function login(data: LoginData) {
  const { email, password } = data

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw createError(401, 'UNAUTHORIZED', 'Invalid email or password')
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash)

  if (!isPasswordValid) {
    throw createError(401, 'UNAUTHORIZED', 'Invalid email or password')
  }

  // Generate tokens
  const accessToken = signToken({
    userId: user.id,
    email: user.email,
  })

  const refreshToken = signRefreshToken({
    userId: user.id,
    email: user.email,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    accessToken,
    refreshToken,
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw createError(404, 'NOT_FOUND', 'User not found')
  }

  return {
    id: user.id,
    email: user.email,
    timezone: user.timezone,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, data: { timezone?: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  })

  return {
    id: user.id,
    email: user.email,
    timezone: user.timezone,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

