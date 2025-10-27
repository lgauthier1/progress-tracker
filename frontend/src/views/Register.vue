<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { register, isLoading, error } = useAuth()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return true
  return password.value === confirmPassword.value
})

async function handleRegister() {
  if (!passwordsMatch.value) {
    return
  }

  try {
    await register({
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    })
    // Navigation handled by useAuth composable
  } catch (err) {
    // Error handled by useAuth composable
    console.error('Registration failed:', err)
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold">Habits Tracker</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Create your account
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
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
              minlength="8"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
            <p class="mt-1 text-xs text-muted-foreground">
              At least 8 characters
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              :class="{ 'border-red-500': !passwordsMatch }"
            />
            <p v-if="!passwordsMatch" class="mt-1 text-xs text-red-600">
              Passwords don't match
            </p>
          </div>
        </div>

        <div v-if="error" class="text-sm text-red-600">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading || !passwordsMatch"
          class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Creating account...' : 'Create account' }}
        </button>

        <div class="text-center text-sm">
          <span class="text-muted-foreground">Already have an account? </span>
          <button
            type="button"
            @click="goToLogin"
            class="text-primary hover:underline"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

