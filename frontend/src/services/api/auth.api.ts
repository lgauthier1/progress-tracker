/**
 * Authentication API Client
 * 
 * API calls for authentication endpoints (register, login, logout, profile).
 * 
 * Constitution: TypeScript Strict Mode
 */

import apiClient from './client'
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfileResponse,
} from '../../types/auth.types'

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data)
  return response.data
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', data)
  return response.data
}

/**
 * Get current user profile
 */
export async function getMe(): Promise<UserProfileResponse> {
  const response = await apiClient.get<UserProfileResponse>('/auth/me')
  return response.data
}

/**
 * Logout (client-side only - clears tokens)
 */
export async function logout(): Promise<void> {
  // Clear tokens from localStorage
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  
  // Optionally call backend logout endpoint if implemented
  try {
    await apiClient.post('/auth/logout')
  } catch (error) {
    // Ignore errors on logout
  }
}

