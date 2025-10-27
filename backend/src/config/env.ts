/**
 * Environment Configuration with Zod Validation
 * 
 * All environment variables are validated at application startup.
 * Fails fast if required variables are missing or invalid.
 * 
 * Constitution: TypeScript Strict Mode + Zod validation
 */

import { z } from 'zod'

// Environment variable schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3000'),

  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // CORS
  CORS_ORIGIN: z.string().transform((str) => str.split(',')),

  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().int().min(8).max(15)).default('10'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
})

// Validate and export environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      console.error(JSON.stringify(error.errors, null, 2))
      process.exit(1)
    }
    throw error
  }
}

export const env = validateEnv()

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

