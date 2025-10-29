import apiClient from './client'
import { 
  Habit, 
  CreateHabitRequest, 
  UpdateHabitRequest, 
  HabitsResponse, 
  HabitResponse,
  HabitCompletion,
  CreateHabitCompletionRequest,
  UpdateHabitCompletionRequest,
  HabitCompletionsResponse,
  HabitCompletionResponse,
  HabitStreakResponse,
  HabitCalendarResponse
} from '../../types/habits.types'

export const habitsApi = {
  // Habits CRUD
  async getHabits(status?: string, categoryId?: string): Promise<HabitsResponse> {
    const params: any = {}
    if (status) params.status = status
    if (categoryId) params.categoryId = categoryId
    
    const response = await apiClient.get<HabitsResponse>('/habits', { params })
    return response.data
  },

  async getHabit(id: string): Promise<HabitResponse> {
    const response = await apiClient.get<HabitResponse>(`/habits/${id}`)
    return response.data
  },

  async createHabit(data: CreateHabitRequest): Promise<HabitResponse> {
    const response = await apiClient.post<HabitResponse>('/habits', data)
    return response.data
  },

  async updateHabit(id: string, data: UpdateHabitRequest): Promise<HabitResponse> {
    const response = await apiClient.patch<HabitResponse>(`/habits/${id}`, data)
    return response.data
  },

  async deleteHabit(id: string): Promise<void> {
    await apiClient.delete(`/habits/${id}`)
  },

  // Habit completions
  async getHabitCompletions(habitId: string, startDate?: string, endDate?: string): Promise<HabitCompletionsResponse> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await apiClient.get<HabitCompletionsResponse>(`/habits/${habitId}/completions`, { params })
    return response.data
  },

  async createHabitCompletion(habitId: string, data: CreateHabitCompletionRequest): Promise<HabitCompletionResponse> {
    const response = await apiClient.post<HabitCompletionResponse>(`/habits/${habitId}/completions`, data)
    return response.data
  },

  async updateHabitCompletion(habitId: string, completionId: string, data: UpdateHabitCompletionRequest): Promise<HabitCompletionResponse> {
    const response = await apiClient.patch<HabitCompletionResponse>(`/habits/${habitId}/completions/${completionId}`, data)
    return response.data
  },

  async deleteHabitCompletion(habitId: string, completionId: string): Promise<void> {
    await apiClient.delete(`/habits/${habitId}/completions/${completionId}`)
  },

  // Habit analytics
  async getHabitStreak(habitId: string): Promise<HabitStreakResponse> {
    const response = await apiClient.get<HabitStreakResponse>(`/habits/${habitId}/streak`)
    return response.data
  },

  async getHabitCalendar(habitId: string, year?: number, month?: number): Promise<HabitCalendarResponse> {
    const params: any = {}
    if (year) params.year = year
    if (month) params.month = month
    
    const response = await apiClient.get<HabitCalendarResponse>(`/habits/${habitId}/calendar`, { params })
    return response.data
  },
}
