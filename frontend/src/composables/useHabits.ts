import { ref, computed } from 'vue'
import { habitsApi } from '../services/api/habits.api'
import { 
  Habit, 
  HabitCompletion, 
  CreateHabitRequest, 
  UpdateHabitRequest, 
  CreateHabitCompletionRequest, 
  UpdateHabitCompletionRequest 
} from '../../types/habits.types'

// State
const habits = ref<Habit[]>([])
const currentHabit = ref<Habit | null>(null)
const habitCompletions = ref<HabitCompletion[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useHabits() {
  // Habits CRUD
  const fetchHabits = async (status?: string, categoryId?: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await habitsApi.getHabits(status, categoryId)
      habits.value = response.habits
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch habits'
      console.error('Failed to fetch habits:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchHabit = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await habitsApi.getHabit(id)
      console.log('fetchHabit response:', response)
      currentHabit.value = response.habit
      return currentHabit.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch habit'
      console.error('Failed to fetch habit:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createHabit = async (data: CreateHabitRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await habitsApi.createHabit(data)
      habits.value.push(response.habit)
      return response.habit
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create habit'
      console.error('Failed to create habit:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateHabit = async (id: string, data: UpdateHabitRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await habitsApi.updateHabit(id, data)
      
      // Update in habits list
      const index = habits.value.findIndex(h => h.id === id)
      if (index !== -1) {
        habits.value[index] = response.habit
      }
      
      // Update current habit if it's the same
      if (currentHabit.value?.id === id) {
        currentHabit.value = response.habit
      }
      
      return response.habit
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update habit'
      console.error('Failed to update habit:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteHabit = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      await habitsApi.deleteHabit(id)
      
      // Remove from habits list
      habits.value = habits.value.filter(h => h.id !== id)
      
      // Clear current habit if it's the same
      if (currentHabit.value?.id === id) {
        currentHabit.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete habit'
      console.error('Failed to delete habit:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Habit completions
  const fetchHabitCompletions = async (habitId: string, startDate?: string, endDate?: string) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await habitsApi.getHabitCompletions(habitId, startDate, endDate)
      habitCompletions.value = response.completions
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch habit completions'
      console.error('Failed to fetch habit completions:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createHabitCompletion = async (habitId: string, data: CreateHabitCompletionRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await habitsApi.createHabitCompletion(habitId, data)
      habitCompletions.value.push(response.completion)
      
      // Update habit streak if we have current habit
      if (currentHabit.value?.id === habitId) {
        await fetchHabitStreak(habitId)
      }
      
      return response.completion
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create habit completion'
      console.error('Failed to create habit completion:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateHabitCompletion = async (habitId: string, completionId: string, data: UpdateHabitCompletionRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await habitsApi.updateHabitCompletion(habitId, completionId, data)
      
      // Update in completions list
      const index = habitCompletions.value.findIndex(c => c.id === completionId)
      if (index !== -1) {
        habitCompletions.value[index] = response.completion
      }
      
      return response.completion
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update habit completion'
      console.error('Failed to update habit completion:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteHabitCompletion = async (habitId: string, completionId: string) => {
    try {
      isLoading.value = true
      error.value = null
      await habitsApi.deleteHabitCompletion(habitId, completionId)
      
      // Remove from completions list
      habitCompletions.value = habitCompletions.value.filter(c => c.id !== completionId)
      
      // Update habit streak if we have current habit
      if (currentHabit.value?.id === habitId) {
        await fetchHabitStreak(habitId)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete habit completion'
      console.error('Failed to delete habit completion:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Habit analytics
  const fetchHabitStreak = async (habitId: string) => {
    try {
      const response = await habitsApi.getHabitStreak(habitId)
      
      // Update current habit streak if it's the same
      if (currentHabit.value?.id === habitId) {
        currentHabit.value.currentStreak = response.currentStreak
        currentHabit.value.totalCompletions = response.totalCompletions
        currentHabit.value.lastCompletion = response.lastCompletion
      }
      
      return response
    } catch (err) {
      console.error('Failed to fetch habit streak:', err)
      throw err
    }
  }

  const fetchHabitCalendar = async (habitId: string, year?: number, month?: number) => {
    try {
      const response = await habitsApi.getHabitCalendar(habitId, year, month)
      return response
    } catch (err) {
      console.error('Failed to fetch habit calendar:', err)
      throw err
    }
  }

  // Quick check-in (today's completion)
  const checkInHabit = async (habitId: string, note?: string) => {
    const today = new Date().toISOString()
    return createHabitCompletion(habitId, {
      completionDate: today,
      note,
    })
  }

  // Computed properties
  const activeHabits = computed(() => habits.value.filter(h => h.status === 'ACTIVE'))
  const pausedHabits = computed(() => habits.value.filter(h => h.status === 'PAUSED'))
  const completedHabits = computed(() => habits.value.filter(h => h.status === 'COMPLETED'))
  const dailyHabits = computed(() => habits.value.filter(h => h.frequency === 'DAILY'))
  const weeklyHabits = computed(() => habits.value.filter(h => h.frequency === 'WEEKLY'))
  const monthlyHabits = computed(() => habits.value.filter(h => h.frequency === 'MONTHLY'))

  return {
    // State
    habits,
    currentHabit,
    habitCompletions,
    isLoading,
    error,
    
    // Habits CRUD
    fetchHabits,
    fetchHabit,
    getHabit: fetchHabit, // Alias for convenience
    createHabit,
    updateHabit,
    deleteHabit,
    
    // Habit completions
    fetchHabitCompletions,
    createHabitCompletion,
    updateHabitCompletion,
    deleteHabitCompletion,
    
    // Habit analytics
    fetchHabitStreak,
    fetchHabitCalendar,
    
    // Quick actions
    checkInHabit,
    
    // Computed
    activeHabits,
    pausedHabits,
    completedHabits,
    dailyHabits,
    weeklyHabits,
    monthlyHabits,
  }
}
