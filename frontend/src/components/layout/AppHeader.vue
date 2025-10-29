<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { currentUser, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <header class="border-b bg-background">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <router-link to="/" class="text-xl font-bold hover:text-primary">
        Habits Tracker
      </router-link>
      
      <nav class="flex items-center space-x-4">
        <router-link v-if="currentUser" to="/" class="text-sm font-medium text-muted-foreground hover:text-foreground">
          Goals
        </router-link>
        <router-link v-if="currentUser" to="/habits" class="text-sm font-medium text-muted-foreground hover:text-foreground">
          Habits
        </router-link>
        <span v-if="currentUser" class="text-sm text-muted-foreground">
          {{ currentUser.email }}
        </span>
        <button v-if="currentUser" @click="handleLogout" class="text-sm font-medium text-primary hover:underline">
          Logout
        </button>
        <router-link v-else to="/login" class="text-sm font-medium text-primary hover:underline">
          Login
        </router-link>
      </nav>
    </div>
  </header>
</template>

