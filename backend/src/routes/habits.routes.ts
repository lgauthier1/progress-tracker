import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { 
  CreateHabitRequestSchema, 
  UpdateHabitRequestSchema,
  CreateHabitCompletionRequestSchema,
  UpdateHabitCompletionRequestSchema
} from '../../../shared/types/habits.types'
import { habitsController } from '../controllers/habits.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Habits CRUD
router.get('/', habitsController.getHabits)
router.get('/:id', habitsController.getHabit)
router.post('/', validate(CreateHabitRequestSchema), habitsController.createHabit)
router.patch('/:id', validate(UpdateHabitRequestSchema), habitsController.updateHabit)
router.delete('/:id', habitsController.deleteHabit)

// Habit completions
router.get('/:id/completions', habitsController.getHabitCompletions)
router.post('/:id/completions', validate(CreateHabitCompletionRequestSchema), habitsController.createHabitCompletion)
router.patch('/:id/completions/:completionId', validate(UpdateHabitCompletionRequestSchema), habitsController.updateHabitCompletion)
router.delete('/:id/completions/:completionId', habitsController.deleteHabitCompletion)

// Habit analytics
router.get('/:id/streak', habitsController.getHabitStreak)
router.get('/:id/calendar', habitsController.getHabitCalendar)

export default router
