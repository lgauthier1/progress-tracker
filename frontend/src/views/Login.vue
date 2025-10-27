<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { login, isLoading, error } = useAuth()

const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await login({
      email: email.value,
      password: password.value,
    })
    // Navigation handled by useAuth composable
  } catch (err) {
    // Error handled by useAuth composable
    console.error('Login failed:', err)
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold">Habits Tracker</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium mb-2">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="error" class="text-sm text-red-600">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Signing in...' : 'Sign in' }}
        </button>

        <div class="text-center text-sm">
          <span class="text-muted-foreground">Don't have an account? </span>
          <button
            type="button"
            @click="goToRegister"
            class="text-primary hover:underline"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

