/**
 * Authentication Routes
 * 
 * Express routes for /api/auth/*
 * 
 * Constitution: TypeScript Strict Mode
 */

import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { registerSchema, loginSchema } from '../validators/auth.validator'
import * as authService from '../services/auth.service'

const router = Router()

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/auth/login
 * Login a user
 */
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const user = await authService.getUserById(req.user.userId)
      res.status(200).json({ user })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/auth/logout
 * Logout (client-side only, no server action needed)
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' })
})

export default router

