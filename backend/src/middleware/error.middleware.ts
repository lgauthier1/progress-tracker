/**
 * Error Handling Middleware
 * 
 * Centralized error handler for Express.
 * Returns standardized JSON error responses per constitution.
 * 
 * Constitution: TypeScript Strict Mode + Standard API error format
 */

import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
  details?: unknown
}

/**
 * Global error handling middleware
 * Must be registered LAST in the middleware chain
 */
export function errorHandler(
  error: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default values
  const statusCode = error.statusCode || 500
  const code = error.code || 'INTERNAL_ERROR'
  const message = error.message || 'An unexpected error occurred'

  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      statusCode,
      code,
      message,
      stack: error.stack,
      details: error.details,
    })
  }

  // Send standardized error response
  const response: {
    error: {
      code: string
      message: string
      details?: unknown
      stack?: string
    }
  } = {
    error: {
      code,
      message,
    },
  }

  if (error.details) {
    response.error.details = error.details
  }

  if (env.NODE_ENV === 'development' && error.stack) {
    response.error.stack = error.stack
  }

  res.status(statusCode).json(response)
}

/**
 * 404 Not Found middleware
 * Catches all unhandled routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.path}`,
    },
  })
}

/**
 * Create a custom API error
 */
export function createError(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): ApiError {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.code = code
  error.details = details
  return error
}

