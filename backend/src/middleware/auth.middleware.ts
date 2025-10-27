/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user information to request object.
 * Protects routes requiring authentication.
 * 
 * Constitution: TypeScript Strict Mode
 */

import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt.utils'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No authentication token provided',
        },
      })
      return
    }

    // Check Bearer format
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authorization header format. Expected: Bearer <token>',
        },
      })
      return
    }

    const token = parts[1]
    if (!token) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided',
        },
      })
      return
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      })
      return
    }

    // Attach user to request
    req.user = payload
    next()
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication failed',
      },
    })
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if missing
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  
  if (authHeader) {
    const parts = authHeader.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1]
      if (token) {
        const payload = verifyToken(token)
        if (payload) {
          req.user = payload
        }
      }
    }
  }
  
  next()
}

