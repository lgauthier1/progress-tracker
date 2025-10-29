import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models'
import { ApiError } from '../utils/api.errors'
import { calculateStreak } from '../utils/date.utils'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
      }
    }
  }
}

// Helper function to map habit from DB to API format
function mapHabitForApi(habit: any) {
  return {
    ...habit,
    frequency: habit.frequencyType, // Map frequencyType to frequency
    frequencyType: undefined, // Remove frequencyType from response
    frequencyConfig: habit.frequencyConfig || {}, // Ensure frequencyConfig is always present
    description: null, // Add description field for API compatibility (not stored in DB)
    status: 'ACTIVE', // Add status field for API compatibility (not stored in DB)
  }
}

// Helper function to map habit completion from DB to API format
function mapHabitCompletionForApi(completion: any) {
  return {
    ...completion,
    note: null, // Add note field for API compatibility (not stored in DB)
  }
}

// Helper function to calculate and update habit streak
async function updateHabitStreak(habitId: string) {
  // Get all completions for this habit, ordered by date
  const completions = await prisma.habitCompletion.findMany({
    where: { habitId },
    orderBy: { completionDate: 'desc' },
  })

  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate current streak
  for (let i = 0; i < completions.length; i++) {
    const completionDate = new Date(completions[i].completionDate)
    completionDate.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    
    if (completionDate.getTime() === expectedDate.getTime()) {
      currentStreak++
    } else {
      break
    }
  }

  // Update the habit's current streak
  await prisma.habit.update({
    where: { id: habitId },
    data: { currentStreak },
  })

  return currentStreak
}

export const habitsController = {
  // Get all habits for the authenticated user
  async getHabits(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { categoryId } = req.query

      const where: any = { userId }
      if (categoryId) where.categoryId = categoryId

      const habits = await prisma.habit.findMany({
        where,
        include: {
          category: true,
          _count: { select: { completions: true } },
          completions: {
            orderBy: { completionDate: 'desc' },
            take: 1, // only latest for lastCompletion on list view
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const mapped = habits.map((h: any) => {
        const api = mapHabitForApi(h)
        return {
          ...api,
          totalCompletions: h._count?.completions ?? 0,
          lastCompletion: h.completions?.[0]?.completionDate ?? null,
        }
      })

      res.json({ habits: mapped })
    } catch (error) {
      next(error)
    }
  },

  // Get a specific habit
  async getHabit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.userId

      const habit = await prisma.habit.findFirst({
        where: { id, userId },
        include: {
          category: true,
          _count: { select: { completions: true } },
          completions: { orderBy: { completionDate: 'desc' } },
        },
      })

      if (!habit) {
        throw new ApiError('Habit not found', 404)
      }

      const api = mapHabitForApi(habit)
      res.json({
        habit: {
          ...api,
          totalCompletions: habit._count?.completions ?? 0,
          lastCompletion: habit.completions?.[0]?.completionDate ?? null,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  // Create a new habit
  async createHabit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { frequency, frequencyConfig, description, ...restData } = req.body

      // Only include fields that exist in Prisma schema
      const habitData = {
        title: restData.title,
        categoryId: restData.categoryId || null,
        frequencyType: frequency, // Map frequency to frequencyType
        frequencyConfig: frequencyConfig || {}, // Provide default empty object if not provided
        userId,
      }

      const habit = await prisma.habit.create({
        data: habitData,
        include: {
          category: true,
        },
      })

      res.status(201).json({ habit: mapHabitForApi(habit) })
    } catch (error) {
      next(error)
    }
  },

  // Update a habit
  async updateHabit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.userId
      const { frequency, frequencyConfig, description, ...restData } = req.body

      const habit = await prisma.habit.findFirst({
        where: { id, userId },
      })

      if (!habit) {
        throw new ApiError('Habit not found', 404)
      }

      // Only include fields that exist in Prisma schema
      const updateData: any = {}
      if (restData.title) updateData.title = restData.title
      if (restData.categoryId !== undefined) updateData.categoryId = restData.categoryId
      if (frequency) updateData.frequencyType = frequency
      if (frequencyConfig !== undefined) updateData.frequencyConfig = frequencyConfig

      const updatedHabit = await prisma.habit.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
        },
      })

      res.json({ habit: mapHabitForApi(updatedHabit) })
    } catch (error) {
      next(error)
    }
  },

  // Delete a habit
  async deleteHabit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.userId

      const habit = await prisma.habit.findFirst({
        where: { id, userId },
      })

      if (!habit) {
        throw new ApiError('Habit not found', 404)
      }

      await prisma.habit.delete({
        where: { id },
      })

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },

  // Get habit completions
  async getHabitCompletions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.userId
      const { startDate, endDate } = req.query

      // Verify habit belongs to user
      const habit = await prisma.habit.findFirst({
        where: { id, userId },
      })

      if (!habit) {
        throw new ApiError('Habit not found', 404)
      }

      const where: any = { habitId: id }
      if (startDate) {
        where.completionDate = { ...where.completionDate, gte: new Date(startDate as string) }
      }
      if (endDate) {
        where.completionDate = { ...where.completionDate, lte: new Date(endDate as string) }
      }

      const completions = await prisma.habitCompletion.findMany({
        where,
        orderBy: { completionDate: 'desc' },
      })

      res.json({ completions: completions.map(mapHabitCompletionForApi) })
    } catch (error) {
      next(error)
    }
  },

  // Create habit completion (check-in)
  async createHabitCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.userId
      const { completionDate, note } = req.body

      // Verify habit belongs to user
      const habit = await prisma.habit.findFirst({
        where: { id, userId },
      })

      if (!habit) {
        throw new ApiError('Habit not found', 404)
      }

      const completion = await prisma.habitCompletion.create({
        data: {
          habitId: id,
          completionDate: new Date(completionDate),
          // Note: 'note' field doesn't exist in Prisma schema, so we ignore it
        },
      })

      // Update the habit's streak
      await updateHabitStreak(id)

      res.status(201).json({ completion: mapHabitCompletionForApi(completion) })
    } catch (error) {
      next(error)
    }
  },

  // Update habit completion
  async updateHabitCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, completionId } = req.params
      const userId = req.user!.userId
      const { completionDate, note, ...restData } = req.body

      // Verify habit belongs to user
      const habit = await prisma.habit.findFirst({
        where: { id, userId },
      })

      if (!habit) {
        throw new ApiError('Habit not found', 404)
      }

      const completion = await prisma.habitCompletion.findFirst({
        where: { id: completionId, habitId: id },
      })

      if (!completion) {
        throw new ApiError('Habit completion not found', 404)
      }

      // Only include fields that exist in Prisma schema
      const updateData: any = {}
      if (completionDate) updateData.completionDate = new Date(completionDate)
      // Note: 'note' field doesn't exist in Prisma schema, so we ignore it

      const updatedCompletion = await prisma.habitCompletion.update({
        where: { id: completionId },
        data: updateData,
      })

      res.json({ completion: mapHabitCompletionForApi(updatedCompletion) })
    } catch (error) {
      next(error)
    }
  },

  // Delete habit completion
  async deleteHabitCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, completionId } = req.params
      const userId = req.user!.userId

      // Verify habit belongs to user
      const habit = await prisma.habit.findFirst({
        where: { id, userId },
      })

      if (!habit) {
        throw new ApiError('Habit not found', 404)
      }

      const completion = await prisma.habitCompletion.findFirst({
        where: { id: completionId, habitId: id },
      })

      if (!completion) {
        throw new ApiError('Habit completion not found', 404)
      }

      await prisma.habitCompletion.delete({
        where: { id: completionId },
      })
      // Recalculate streak after deletion
      await updateHabitStreak(id)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },

  // Get habit streak
  async getHabitStreak(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.userId

      // Verify habit belongs to user
      const habit = await prisma.habit.findFirst({
        where: { id, userId },
      })

      if (!habit) {
        throw new ApiError('Habit not found', 404)
      }

      const completions = await prisma.habitCompletion.findMany({
        where: { habitId: id },
        select: { completionDate: true },
        orderBy: { completionDate: 'asc' },
      })

      const completionDates = completions.map(c => c.completionDate)
      const currentStreak = calculateStreak(completionDates)

      res.json({ 
        habitId: id,
        currentStreak,
        totalCompletions: completions.length,
        lastCompletion: completions[completions.length - 1]?.completionDate || null,
      })
    } catch (error) {
      next(error)
    }
  },

  // Get habit calendar data (for heatmap)
  async getHabitCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.userId
      const { year, month } = req.query

      // Verify habit belongs to user
      const habit = await prisma.habit.findFirst({
        where: { id, userId },
      })

      if (!habit) {
        throw new ApiError('Habit not found', 404)
      }

      const targetYear = year ? parseInt(year as string) : new Date().getFullYear()
      const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1

      const startDate = new Date(targetYear, targetMonth - 1, 1)
      const endDate = new Date(targetYear, targetMonth, 0)

      const completions = await prisma.habitCompletion.findMany({
        where: {
          habitId: id,
          completionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { completionDate: true },
      })

      // Group completions by date
      const calendarData = completions.reduce((acc, completion) => {
        const dateKey = format(completion.completionDate, 'yyyy-MM-dd')
        acc[dateKey] = (acc[dateKey] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      res.json({ 
        habitId: id,
        year: targetYear,
        month: targetMonth,
        calendarData,
      })
    } catch (error) {
      next(error)
    }
  },
}
