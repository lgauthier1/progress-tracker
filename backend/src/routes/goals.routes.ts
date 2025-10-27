/**
 * Goals Routes
 * 
 * Express routes for /api/goals/*
 * 
 * Constitution: TypeScript Strict Mode
 */

import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import {
  createGoalSchema,
  updateGoalSchema,
  goalsQuerySchema,
  uuidParamSchema,
  createProgressEntrySchema,
  updateProgressEntrySchema,
  progressEntryParamSchema,
} from '../validators/goals.validator'
import * as goalsService from '../services/goals.service'
import * as progressEntriesService from '../services/progress-entries.service'

const router = Router()

// All routes require authentication
router.use(authenticate)

/**
 * POST /api/goals
 * Create a new goal
 */
router.post(
  '/',
  validate(createGoalSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const goal = await goalsService.createGoal(req.user.userId, req.body)
      res.status(201).json({ goal })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/goals
 * Get all goals for current user
 */
router.get(
  '/',
  validate(goalsQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const goals = await goalsService.getGoals(req.user.userId, req.query)
      res.status(200).json({ goals })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/goals/:id
 * Get a specific goal
 */
router.get(
  '/:id',
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const goal = await goalsService.getGoalById(req.user.userId, req.params.id!)
      res.status(200).json({ goal })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * PATCH /api/goals/:id
 * Update a goal
 */
router.patch(
  '/:id',
  validate(uuidParamSchema, 'params'),
  validate(updateGoalSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const goal = await goalsService.updateGoal(req.user.userId, req.params.id!, req.body)
      res.status(200).json({ goal })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * DELETE /api/goals/:id
 * Delete a goal
 */
router.delete(
  '/:id',
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const result = await goalsService.deleteGoal(req.user.userId, req.params.id!)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/goals/:id/progress
 * Add a progress entry to a goal
 */
router.post(
  '/:id/progress',
  validate(uuidParamSchema, 'params'),
  validate(createProgressEntrySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const entry = await progressEntriesService.createProgressEntry(
        req.user.userId,
        req.params.id!,
        req.body
      )
      res.status(201).json({ entry })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/goals/:id/progress
 * Get all progress entries for a goal
 */
router.get(
  '/:id/progress',
  validate(uuidParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const entries = await progressEntriesService.getProgressEntries(req.user.userId, req.params.id!)
      res.status(200).json({ entries })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * PATCH /api/goals/:id/progress/:entryId
 * Update a progress entry
 */
router.patch(
  '/:id/progress/:entryId',
  validate(progressEntryParamSchema, 'params'),
  validate(updateProgressEntrySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const entry = await progressEntriesService.updateProgressEntry(
        req.user.userId,
        req.params.id!,
        req.params.entryId!,
        req.body
      )
      res.status(200).json({ entry })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * DELETE /api/goals/:id/progress/:entryId
 * Delete a progress entry
 */
router.delete(
  '/:id/progress/:entryId',
  validate(progressEntryParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        return
      }

      const result = await progressEntriesService.deleteProgressEntry(
        req.user.userId,
        req.params.id!,
        req.params.entryId!
      )
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
)

export default router

