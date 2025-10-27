/**
 * Goals API Client
 * 
 * API calls for goals and progress entries endpoints.
 * 
 * Constitution: TypeScript Strict Mode
 */

import apiClient from './client'
import type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  ProgressEntry,
  CreateProgressEntryRequest,
  UpdateProgressEntryRequest,
  GoalsQuery,
} from '@shared/types/goals.types'

/**
 * Create a new goal
 */
export async function createGoal(data: CreateGoalRequest): Promise<{ goal: Goal }> {
  const response = await apiClient.post<{ goal: Goal }>('/goals', data)
  return response.data
}

/**
 * Get all goals
 */
export async function getGoals(query?: GoalsQuery): Promise<{ goals: Goal[] }> {
  const response = await apiClient.get<{ goals: Goal[] }>('/goals', { params: query })
  return response.data
}

/**
 * Get a single goal
 */
export async function getGoal(id: string): Promise<{ goal: Goal }> {
  const response = await apiClient.get<{ goal: Goal }>(`/goals/${id}`)
  return response.data
}

/**
 * Update a goal
 */
export async function updateGoal(id: string, data: UpdateGoalRequest): Promise<{ goal: Goal }> {
  const response = await apiClient.patch<{ goal: Goal }>(`/goals/${id}`, data)
  return response.data
}

/**
 * Delete a goal
 */
export async function deleteGoal(id: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`/goals/${id}`)
  return response.data
}

/**
 * Add a progress entry to a goal
 */
export async function createProgressEntry(
  goalId: string,
  data: CreateProgressEntryRequest
): Promise<{ entry: ProgressEntry }> {
  const response = await apiClient.post<{ entry: ProgressEntry }>(`/goals/${goalId}/progress`, data)
  return response.data
}

/**
 * Get all progress entries for a goal
 */
export async function getProgressEntries(goalId: string): Promise<{ entries: ProgressEntry[] }> {
  const response = await apiClient.get<{ entries: ProgressEntry[] }>(`/goals/${goalId}/progress`)
  return response.data
}

/**
 * Update a progress entry
 */
export async function updateProgressEntry(
  goalId: string,
  entryId: string,
  data: UpdateProgressEntryRequest
): Promise<{ entry: ProgressEntry }> {
  const response = await apiClient.patch<{ entry: ProgressEntry }>(
    `/goals/${goalId}/progress/${entryId}`,
    data
  )
  return response.data
}

/**
 * Delete a progress entry
 */
export async function deleteProgressEntry(goalId: string, entryId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`/goals/${goalId}/progress/${entryId}`)
  return response.data
}

