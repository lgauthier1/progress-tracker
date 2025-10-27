/**
 * JWT Utility Functions
 * 
 * Handles JWT token generation, verification, and decoding.
 * Uses jsonwebtoken library with type-safe interfaces.
 * 
 * Constitution: TypeScript Strict Mode
 */

import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from '../config/env'

export interface JwtPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Generate JWT access token
 */
export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as unknown as string | number,
  } as SignOptions)
}

/**
 * Generate JWT refresh token
 */
export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as string | number,
  } as SignOptions)
}

/**
 * Verify and decode JWT token
 * Returns null if token is invalid or expired
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Decode JWT token without verification
 * Useful for debugging or reading expired tokens
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}

