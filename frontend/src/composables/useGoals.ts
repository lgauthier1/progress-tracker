/**
 * Goals Composable
 * 
 * Vue composable for goals state and operations.
 * Handles goal CRUD, progress entries, and state management.
 * 
 * Constitution: TypeScript Strict Mode
 */

import { ref, computed } from 'vue'
import * as goalsApi from '../services/api/goals.api'
import type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  ProgressEntry,
  CreateProgressEntryRequest,
  GoalsQuery,
} from '@shared/types/goals.types'

// Global state
const goals = ref<Goal[]>([])
const currentGoal = ref<Goal | null>(null)
const progressEntries = ref<ProgressEntry[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useGoals() {
  // Computed
  const activeGoals = computed(() => goals.value.filter((g) => g.status === 'ACTIVE'))
  const completedGoals = computed(() => goals.value.filter((g) => g.status === 'COMPLETED'))

  // Actions
  async function fetchGoals(query?: GoalsQuery) {
    try {
      isLoading.value = true
      error.value = null

      const response = await goalsApi.getGoals(query)
      goals.value = response.goals
    } catch (err) {
      error.value = 'Failed to fetch goals'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGoal(id: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await goalsApi.getGoal(id)
      currentGoal.value = response.goal
    } catch (err) {
      error.value = 'Failed to fetch goal'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function createGoal(data: CreateGoalRequest) {
    try {
      isLoading.value = true
      error.value = null

      const response = await goalsApi.createGoal(data)
      goals.value.unshift(response.goal)

      return response.goal
    } catch (err) {
      error.value = 'Failed to create goal'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateGoal(id: string, data: UpdateGoalRequest) {
    try {
      isLoading.value = true
      error.value = null

      const response = await goalsApi.updateGoal(id, data)

      // Update in list
      const index = goals.value.findIndex((g) => g.id === id)
      if (index !== -1) {
        goals.value[index] = response.goal
      }

      // Update current goal if it's the same
      if (currentGoal.value?.id === id) {
        currentGoal.value = response.goal
      }

      return response.goal
    } catch (err) {
      error.value = 'Failed to update goal'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteGoal(id: string) {
    try {
      isLoading.value = true
      error.value = null

      await goalsApi.deleteGoal(id)

      // Remove from list
      goals.value = goals.value.filter((g) => g.id !== id)

      // Clear current goal if it's the same
      if (currentGoal.value?.id === id) {
        currentGoal.value = null
      }
    } catch (err) {
      error.value = 'Failed to delete goal'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProgressEntries(goalId: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await goalsApi.getProgressEntries(goalId)
      progressEntries.value = response.entries
    } catch (err) {
      error.value = 'Failed to fetch progress entries'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function addProgressEntry(goalId: string, data: CreateProgressEntryRequest) {
    try {
      isLoading.value = true
      error.value = null

      const response = await goalsApi.createProgressEntry(goalId, data)
      progressEntries.value.unshift(response.entry)

      // Refresh the goal to get updated currentValue
      await fetchGoal(goalId)

      return response.entry
    } catch (err) {
      error.value = 'Failed to add progress entry'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteProgressEntry(goalId: string, entryId: string) {
    try {
      isLoading.value = true
      error.value = null

      await goalsApi.deleteProgressEntry(goalId, entryId)

      // Remove from list
      progressEntries.value = progressEntries.value.filter((e) => e.id !== entryId)

      // Refresh the goal to get updated currentValue
      await fetchGoal(goalId)
    } catch (err) {
      error.value = 'Failed to delete progress entry'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearCurrentGoal() {
    currentGoal.value = null
    progressEntries.value = []
  }

  return {
    // State
    goals: computed(() => goals.value),
    currentGoal: computed(() => currentGoal.value),
    progressEntries: computed(() => progressEntries.value),
    activeGoals,
    completedGoals,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Actions
    fetchGoals,
    fetchGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    fetchProgressEntries,
    addProgressEntry,
    deleteProgressEntry,
    clearCurrentGoal,
  }
}

