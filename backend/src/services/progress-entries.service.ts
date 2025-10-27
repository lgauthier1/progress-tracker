/**
 * Progress Entries Service
 * 
 * Business logic for progress entries (create, read, update, delete).
 * Automatically recalculates goal currentValue after changes.
 * 
 * Constitution: TypeScript Strict Mode
 */

import { prisma } from '../models'
import { createError } from '../middleware/error.middleware'
import { recalculateGoalProgress, checkAndCompleteGoal } from './goals.service'

export interface CreateProgressEntryData {
  value: number
  entryDate?: string
  note?: string
}

export interface UpdateProgressEntryData {
  value?: number
  entryDate?: string
  note?: string | null
}

/**
 * Create a progress entry
 */
export async function createProgressEntry(
  userId: string,
  goalId: string,
  data: CreateProgressEntryData
) {
  // Verify goal exists and belongs to user
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    throw createError(404, 'NOT_FOUND', 'Goal not found')
  }

  if (goal.userId !== userId) {
    throw createError(403, 'FORBIDDEN', 'You do not have permission to add progress to this goal')
  }

  // Create progress entry
  const entry = await prisma.progressEntry.create({
    data: {
      goalId,
      value: data.value,
      entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
      note: data.note || null,
    },
  })

  // Recalculate goal currentValue
  await recalculateGoalProgress(goalId)

  // Check if goal should be auto-completed (FR-005)
  await checkAndCompleteGoal(goalId)

  return formatProgressEntry(entry)
}

/**
 * Get all progress entries for a goal
 */
export async function getProgressEntries(userId: string, goalId: string) {
  // Verify goal exists and belongs to user
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    throw createError(404, 'NOT_FOUND', 'Goal not found')
  }

  if (goal.userId !== userId) {
    throw createError(403, 'FORBIDDEN', 'You do not have permission to view this goal')
  }

  const entries = await prisma.progressEntry.findMany({
    where: { goalId },
    orderBy: { entryDate: 'desc' },
  })

  return entries.map(formatProgressEntry)
}

/**
 * Update a progress entry
 */
export async function updateProgressEntry(
  userId: string,
  goalId: string,
  entryId: string,
  data: UpdateProgressEntryData
) {
  // Verify goal exists and belongs to user
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    throw createError(404, 'NOT_FOUND', 'Goal not found')
  }

  if (goal.userId !== userId) {
    throw createError(403, 'FORBIDDEN', 'You do not have permission to update this entry')
  }

  // Verify entry exists and belongs to goal
  const existingEntry = await prisma.progressEntry.findUnique({
    where: { id: entryId },
  })

  if (!existingEntry) {
    throw createError(404, 'NOT_FOUND', 'Progress entry not found')
  }

  if (existingEntry.goalId !== goalId) {
    throw createError(403, 'FORBIDDEN', 'This entry does not belong to this goal')
  }

  // Update entry
  const entry = await prisma.progressEntry.update({
    where: { id: entryId },
    data: {
      ...(data.value !== undefined && { value: data.value }),
      ...(data.entryDate && { entryDate: new Date(data.entryDate) }),
      ...(data.note !== undefined && { note: data.note }),
    },
  })

  // Recalculate goal currentValue
  await recalculateGoalProgress(goalId)

  // Check if goal should be auto-completed (FR-005)
  await checkAndCompleteGoal(goalId)

  return formatProgressEntry(entry)
}

/**
 * Delete a progress entry
 */
export async function deleteProgressEntry(userId: string, goalId: string, entryId: string) {
  // Verify goal exists and belongs to user
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    throw createError(404, 'NOT_FOUND', 'Goal not found')
  }

  if (goal.userId !== userId) {
    throw createError(403, 'FORBIDDEN', 'You do not have permission to delete this entry')
  }

  // Verify entry exists and belongs to goal
  const entry = await prisma.progressEntry.findUnique({
    where: { id: entryId },
  })

  if (!entry) {
    throw createError(404, 'NOT_FOUND', 'Progress entry not found')
  }

  if (entry.goalId !== goalId) {
    throw createError(403, 'FORBIDDEN', 'This entry does not belong to this goal')
  }

  // Delete entry
  await prisma.progressEntry.delete({
    where: { id: entryId },
  })

  // Recalculate goal currentValue
  await recalculateGoalProgress(goalId)

  // Check if goal should be auto-completed (FR-005)
  await checkAndCompleteGoal(goalId)

  return { success: true }
}

/**
 * Format progress entry for API response
 */
function formatProgressEntry(entry: any) {
  return {
    id: entry.id,
    goalId: entry.goalId,
    value: Number(entry.value),
    entryDate: entry.entryDate.toISOString(),
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
  }
}

