/**
 * Goals Service
 * 
 * Business logic for goal management (create, read, update, delete).
 * Handles both target-based and continuous counter goals.
 * 
 * Constitution: TypeScript Strict Mode
 */

import { prisma } from '../models'
import { GoalType, GoalStatus } from '@prisma/client'
import { createError } from '../middleware/error.middleware'

export interface CreateTargetBasedGoalData {
  goalType: 'TARGET_BASED'
  title: string
  unit: string
  targetValue: number
  deadline: string
  categoryId?: string
}

export interface CreateContinuousCounterGoalData {
  goalType: 'CONTINUOUS_COUNTER'
  title: string
  unit: string
  startDate?: string
  categoryId?: string
}

export type CreateGoalData = CreateTargetBasedGoalData | CreateContinuousCounterGoalData

export interface UpdateGoalData {
  title?: string
  targetValue?: number
  deadline?: string
  status?: GoalStatus
  categoryId?: string | null
}

export interface GoalsQuery {
  status?: GoalStatus
  goalType?: GoalType
  categoryId?: string
}

/**
 * Create a new goal
 */
export async function createGoal(userId: string, data: CreateGoalData) {
  if (data.goalType === 'TARGET_BASED') {
    // Create target-based goal
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: data.title,
        goalType: 'TARGET_BASED',
        unit: data.unit,
        targetValue: data.targetValue,
        deadline: new Date(data.deadline),
        categoryId: data.categoryId,
        currentValue: 0,
        status: 'ACTIVE',
      },
    })

    return formatGoal(goal)
  } else {
    // Create continuous counter goal
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: data.title,
        goalType: 'CONTINUOUS_COUNTER',
        unit: data.unit,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        categoryId: data.categoryId,
        currentValue: 0,
        status: 'ACTIVE',
      },
    })

    return formatGoal(goal)
  }
}

/**
 * Get all goals for a user
 */
export async function getGoals(userId: string, query: GoalsQuery = {}) {
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.goalType && { goalType: query.goalType }),
      ...(query.categoryId && { categoryId: query.categoryId }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return goals.map(formatGoal)
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(userId: string, goalId: string) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    throw createError(404, 'NOT_FOUND', 'Goal not found')
  }

  if (goal.userId !== userId) {
    throw createError(403, 'FORBIDDEN', 'You do not have permission to access this goal')
  }

  return formatGoal(goal)
}

/**
 * Update a goal
 */
export async function updateGoal(userId: string, goalId: string, data: UpdateGoalData) {
  const existingGoal = await prisma.goal.findUnique({
    where: { id: goalId },
  })

  if (!existingGoal) {
    throw createError(404, 'NOT_FOUND', 'Goal not found')
  }

  if (existingGoal.userId !== userId) {
    throw createError(403, 'FORBIDDEN', 'You do not have permission to update this goal')
  }

  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.targetValue !== undefined && { targetValue: data.targetValue }),
      ...(data.deadline && { deadline: new Date(data.deadline) }),
      ...(data.status && { status: data.status }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    },
  })

  return formatGoal(goal)
}

/**
 * Delete a goal
 */
export async function deleteGoal(userId: string, goalId: string) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    throw createError(404, 'NOT_FOUND', 'Goal not found')
  }

  if (goal.userId !== userId) {
    throw createError(403, 'FORBIDDEN', 'You do not have permission to delete this goal')
  }

  await prisma.goal.delete({
    where: { id: goalId },
  })

  return { success: true }
}

/**
 * Recalculate goal currentValue from all progress entries
 */
export async function recalculateGoalProgress(goalId: string) {
  const entries = await prisma.progressEntry.findMany({
    where: { goalId },
    orderBy: { entryDate: 'asc' },
  })

  const totalValue = entries.reduce((sum, entry) => sum + Number(entry.value), 0)

  await prisma.goal.update({
    where: { id: goalId },
    data: { currentValue: totalValue },
  })

  return totalValue
}

/**
 * Check if a target-based goal should be marked as completed
 * Call this after recalculating progress
 * 
 * FR-005: Auto-complete target-based goals when they reach 100%
 */
export async function checkAndCompleteGoal(goalId: string) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    return
  }

  // Only auto-complete target-based goals
  if (goal.goalType !== 'TARGET_BASED' || !goal.targetValue) {
    return
  }

  // If already completed, don't change
  if (goal.status === 'COMPLETED') {
    return
  }

  // Check if current value >= target value
  const currentValue = Number(goal.currentValue)
  const targetValue = Number(goal.targetValue)

  if (currentValue >= targetValue) {
    await prisma.goal.update({
      where: { id: goalId },
      data: { status: 'COMPLETED' },
    })
  }
}

/**
 * Format goal for API response
 */
function formatGoal(goal: any) {
  const base = {
    id: goal.id,
    userId: goal.userId,
    title: goal.title,
    goalType: goal.goalType,
    unit: goal.unit,
    status: goal.status,
    categoryId: goal.categoryId,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  }

  if (goal.goalType === 'TARGET_BASED') {
    return {
      ...base,
      targetValue: Number(goal.targetValue),
      currentValue: Number(goal.currentValue),
      deadline: goal.deadline ? goal.deadline.toISOString() : null,
    }
  } else {
    return {
      ...base,
      currentValue: Number(goal.currentValue),
      startDate: goal.startDate ? goal.startDate.toISOString() : null,
    }
  }
}

