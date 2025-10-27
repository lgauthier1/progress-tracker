/**
 * Prisma Client Export
 * 
 * Single source of truth for database access.
 * All services must import PrismaClient from this file.
 * 
 * Constitution: TypeScript Strict Mode enabled
 */

import { PrismaClient } from '@prisma/client'

// Singleton Prisma Client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export Prisma types for use across the application
export * from '@prisma/client'

