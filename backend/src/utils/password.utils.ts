/**
 * Password Hashing Utilities
 * 
 * Handles password hashing and comparison using bcrypt.
 * Salt rounds configured via environment variables.
 * 
 * Constitution: TypeScript Strict Mode
 */

import bcrypt from 'bcrypt'
import { env } from '../config/env'

/**
 * Hash a plain-text password
 * @param password - Plain-text password to hash
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS)
  return hash
}

/**
 * Compare a plain-text password with a hashed password
 * @param password - Plain-text password to check
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hashedPassword)
  return isMatch
}

