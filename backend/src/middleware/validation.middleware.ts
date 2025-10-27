/**
 * Validation Middleware
 * 
 * Generic Zod schema validation middleware for Express.
 * Validates request body, query, and params against Zod schemas.
 * 
 * Constitution: TypeScript Strict Mode + Zod validation
 */

import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

export type ValidationTarget = 'body' | 'query' | 'params'

/**
 * Validate request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate ('body', 'query', or 'params')
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  target: ValidationTarget = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate the target data
      const validated = schema.parse(req[target])
      
      // Replace request data with validated data
      req[target] = validated
      
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
        })
        return
      }
      
      // Unexpected error
      next(error)
    }
  }
}

