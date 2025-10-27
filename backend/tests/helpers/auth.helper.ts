/**
 * Auth Test Helpers
 * 
 * Utilities for authentication in tests.
 * Provides helper functions for creating test users and tokens.
 * 
 * Constitution: TypeScript Strict Mode
 */

import { signToken } from '../../src/utils/jwt.utils'
import { hashPassword } from '../../src/utils/password.utils'
import { prisma } from '../../src/models'

export interface TestUser {
  id: string
  email: string
  passwordHash: string
  token: string
}

/**
 * Create a test user in the database
 */
export async function createTestUser(
  email: string = 'test@example.com',
  password: string = 'password123'
): Promise<TestUser> {
  const passwordHash = await hashPassword(password)
  
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  })

  const token = signToken({
    userId: user.id,
    email: user.email,
  })

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    token,
  }
}

/**
 * Clean up all test users
 */
export async function cleanupTestUsers(): Promise<void> {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'test',
      },
    },
  })
}

/**
 * Generate auth header for Supertest requests
 */
export function authHeader(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`,
  }
}

