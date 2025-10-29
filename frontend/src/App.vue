<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'

// Habits Tracker - Main App Component
// Phase 2 infrastructure complete

// Initialize authentication on app start
const { fetchCurrentUser } = useAuth()

onMounted(async () => {
  try {
    await fetchCurrentUser()
  } catch (error) {
    console.log('Auth initialization failed:', error)
  }
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <router-view />
  </div>
</template>

