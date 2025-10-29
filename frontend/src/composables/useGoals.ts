import { ref, computed } from 'vue'
import { goalsApi } from '../services/api/goals.api'
import { Goal, ProgressEntry, CreateGoalRequest, UpdateGoalRequest, CreateProgressEntryRequest, UpdateProgressEntryRequest } from '../../types/goals.types'

// State
const goals = ref<Goal[]>([])
const currentGoal = ref<Goal | null>(null)
const progressEntries = ref<ProgressEntry[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useGoals() {
  // Goals CRUD
  const fetchGoals = async (status?: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await goalsApi.getGoals(status)
      goals.value = response.goals
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch goals'
      console.error('Failed to fetch goals:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchGoal = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await goalsApi.getGoal(id)
      currentGoal.value = response.goal
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch goal'
      console.error('Failed to fetch goal:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createGoal = async (data: CreateGoalRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await goalsApi.createGoal(data)
      goals.value.push(response.goal)
      return response.goal
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create goal'
      console.error('Failed to create goal:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateGoal = async (id: string, data: UpdateGoalRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await goalsApi.updateGoal(id, data)
      
      // Update in goals list
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value[index] = response.goal
      }
      
      // Update current goal if it's the same
      if (currentGoal.value?.id === id) {
        currentGoal.value = response.goal
      }
      
      return response.goal
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update goal'
      console.error('Failed to update goal:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      await goalsApi.deleteGoal(id)
      
      // Remove from goals list
      goals.value = goals.value.filter(g => g.id !== id)
      
      // Clear current goal if it's the same
      if (currentGoal.value?.id === id) {
        currentGoal.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete goal'
      console.error('Failed to delete goal:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Progress entries
  const fetchProgressEntries = async (goalId: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await goalsApi.getProgressEntries(goalId)
      progressEntries.value = response.entries
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch progress entries'
      console.error('Failed to fetch progress entries:', err)
    } finally {
      isLoading.value = false
    }
  }

  const addProgressEntry = async (goalId: string, data: CreateProgressEntryRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await goalsApi.createProgressEntry(goalId, data)
      progressEntries.value.push(response.entry)
      
      // Update current goal's currentValue
      if (currentGoal.value?.id === goalId) {
        currentGoal.value.currentValue += data.value
      }
      
      return response.entry
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add progress entry'
      console.error('Failed to add progress entry:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProgressEntry = async (goalId: string, entryId: string, data: UpdateProgressEntryRequest) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Get the old entry to calculate the difference
      const oldEntry = progressEntries.value.find(e => e.id === entryId)
      if (!oldEntry) throw new Error('Progress entry not found')
      
      const response = await goalsApi.updateProgressEntry(goalId, entryId, data)
      
      // Update in progress entries list
      const index = progressEntries.value.findIndex(e => e.id === entryId)
      if (index !== -1) {
        progressEntries.value[index] = response.entry
      }
      
      // Update current goal's currentValue
      if (currentGoal.value?.id === goalId) {
        const valueDiff = (data.value || response.entry.value) - oldEntry.value
        currentGoal.value.currentValue += valueDiff
      }
      
      return response.entry
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update progress entry'
      console.error('Failed to update progress entry:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteProgressEntry = async (goalId: string, entryId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Get the entry to calculate the difference
      const entry = progressEntries.value.find(e => e.id === entryId)
      if (!entry) throw new Error('Progress entry not found')
      
      await goalsApi.deleteProgressEntry(goalId, entryId)
      
      // Remove from progress entries list
      progressEntries.value = progressEntries.value.filter(e => e.id !== entryId)
      
      // Update current goal's currentValue
      if (currentGoal.value?.id === goalId) {
        currentGoal.value.currentValue -= entry.value
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete progress entry'
      console.error('Failed to delete progress entry:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Computed properties
  const activeGoals = computed(() => goals.value.filter(g => g.status === 'ACTIVE'))
  const completedGoals = computed(() => goals.value.filter(g => g.status === 'COMPLETED'))
  const targetBasedGoals = computed(() => goals.value.filter(g => g.goalType === 'TARGET_BASED'))
  const continuousCounterGoals = computed(() => goals.value.filter(g => g.goalType === 'CONTINUOUS_COUNTER'))

  return {
    // State
    goals,
    currentGoal,
    progressEntries,
    isLoading,
    error,
    
    // Goals CRUD
    fetchGoals,
    fetchGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    
    // Progress entries
    fetchProgressEntries,
    addProgressEntry,
    updateProgressEntry,
    deleteProgressEntry,
    
    // Computed
    activeGoals,
    completedGoals,
    targetBasedGoals,
    continuousCounterGoals,
  }
}