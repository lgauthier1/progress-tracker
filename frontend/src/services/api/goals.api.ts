import apiClient from './client'
import { 
  Goal, 
  CreateGoalRequest, 
  UpdateGoalRequest, 
  GoalsListResponse, 
  GoalResponse,
  ProgressEntry,
  CreateProgressEntryRequest,
  UpdateProgressEntryRequest,
  ProgressEntriesResponse,
  ProgressEntryResponse
} from '../../types/goals.types'

export const goalsApi = {
  // Goals CRUD
  async getGoals(status?: string): Promise<GoalsListResponse> {
    const params = status ? { status } : {}
    const response = await apiClient.get<GoalsListResponse>('/goals', { params })
    return response.data
  },

  async getGoal(id: string): Promise<GoalResponse> {
    const response = await apiClient.get<GoalResponse>(`/goals/${id}`)
    return response.data
  },

  async createGoal(data: CreateGoalRequest): Promise<GoalResponse> {
    const response = await apiClient.post<GoalResponse>('/goals', data)
    return response.data
  },

  async updateGoal(id: string, data: UpdateGoalRequest): Promise<GoalResponse> {
    const response = await apiClient.patch<GoalResponse>(`/goals/${id}`, data)
    return response.data
  },

  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`)
  },

  // Progress entries
  async getProgressEntries(goalId: string): Promise<ProgressEntriesResponse> {
    const response = await apiClient.get<ProgressEntriesResponse>(`/goals/${goalId}/progress`)
    return response.data
  },

  async createProgressEntry(goalId: string, data: CreateProgressEntryRequest): Promise<ProgressEntryResponse> {
    const response = await apiClient.post<ProgressEntryResponse>(`/goals/${goalId}/progress`, data)
    return response.data
  },

  async updateProgressEntry(goalId: string, entryId: string, data: UpdateProgressEntryRequest): Promise<ProgressEntryResponse> {
    const response = await apiClient.patch<ProgressEntryResponse>(`/goals/${goalId}/progress/${entryId}`, data)
    return response.data
  },

  async deleteProgressEntry(goalId: string, entryId: string): Promise<void> {
    await apiClient.delete(`/goals/${goalId}/progress/${entryId}`)
  },
}