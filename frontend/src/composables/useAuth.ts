/**
 * Authentication Composable
 * 
 * Vue composable for authentication state and operations.
 * Handles login, logout, registration, and user profile.
 * 
 * Constitution: TypeScript Strict Mode
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as authApi from '../services/api/auth.api'
import type { LoginRequest, RegisterRequest, User } from '@shared/types/auth.types'

// Global auth state (reactive)
const currentUser = ref<User | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  const router = useRouter()

  // Computed
  const isAuthenticated = computed(() => currentUser.value !== null)
  const hasToken = computed(() => !!localStorage.getItem('accessToken'))

  // Actions
  async function login(credentials: LoginRequest) {
    try {
      isLoading.value = true
      error.value = null

      const response = await authApi.login(credentials)
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      // Set current user
      currentUser.value = response.user

      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      error.value = 'Login failed. Please check your credentials.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    try {
      isLoading.value = true
      error.value = null

      const response = await authApi.register(data)
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      // Set current user
      currentUser.value = response.user

      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      error.value = 'Registration failed. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      currentUser.value = null
      router.push('/login')
    }
  }

  async function fetchCurrentUser() {
    if (!hasToken.value) {
      return
    }

    try {
      isLoading.value = true
      const response = await authApi.getMe()
      currentUser.value = response.user
    } catch (err) {
      // Token invalid - clear it
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      currentUser.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    hasToken,

    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
  }
}

