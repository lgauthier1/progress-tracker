<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    
    <div class="container mx-auto px-4 py-4">
      <button @click="goBack" class="text-sm text-muted-foreground hover:text-foreground mb-2">
        ← Back to Dashboard
      </button>
      <h1 class="text-2xl font-bold">Goals</h1>
    </div>

    <main class="container mx-auto px-4 py-8">
      <div class="text-center py-12">
        <h2 class="text-3xl font-bold mb-4">Goals List</h2>
        <p class="text-muted-foreground">This is a simple goals page for testing navigation.</p>
        <Button @click="goBack" class="mt-4">Go Back to Dashboard</Button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import Button from '../components/ui/Button.vue'

const router = useRouter()

function goBack() {
  router.push('/')
}
</script>
