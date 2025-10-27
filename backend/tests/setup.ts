/**
 * Test Setup
 * 
 * Global test setup and teardown.
 * Configures test database and environment.
 * 
 * Constitution: API Testing Required
 */

import { beforeAll, afterAll } from 'vitest'

// Test environment setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test'
  
  // Use test database URL if not already set
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/habits_tracker_test?schema=public'
  }
  
  // Set test environment variables
  process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long-for-testing'
  process.env.JWT_EXPIRES_IN = '1h'
  process.env.JWT_REFRESH_EXPIRES_IN = '7d'
  process.env.CORS_ORIGIN = 'http://localhost:5173'
  process.env.BCRYPT_ROUNDS = '4' // Lower rounds for faster tests
  process.env.API_BASE_URL = 'http://localhost:3000'
  process.env.LOG_LEVEL = 'error' // Reduce log noise in tests

  console.log('🧪 Test environment configured')
})

afterAll(async () => {
  console.log('🧪 Test suite completed')
})

