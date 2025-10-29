<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useGoals } from '../composables/useGoals'
import { useRouter } from 'vue-router'
import type { CreateGoalRequest } from '../../types/goals.types'
import Button from '../components/ui/Button.vue'
import Dialog from '../components/ui/Dialog.vue'
import GoalCard from '../components/goals/GoalCard.vue'
import GoalForm from '../components/goals/GoalForm.vue'
import DashboardStats from '../components/goals/DashboardStats.vue'
import AppHeader from '../components/layout/AppHeader.vue'

const router = useRouter()
const { currentUser, logout } = useAuth()
const { goals, activeGoals, fetchGoals, createGoal, isLoading } = useGoals()

const showCreateModal = ref(false)

onMounted(async () => {
  await fetchGoals()
})

function openCreateGoal() {
  showCreateModal.value = true
}

async function handleCreateGoal(data: CreateGoalRequest) {
  try {
    await createGoal(data)
    showCreateModal.value = false
  } catch (err) {
    console.error('Failed to create goal:', err)
  }
}

function goToGoalDetail(id: string) {
  router.push(`/goals/${id}`)
}

async function handleLogout() {
  await logout()
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader />

    <main class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold">Dashboard</h2>
        <Button @click="openCreateGoal">
          + New Goal
        </Button>
      </div>

      <!-- Dashboard Statistics -->
      <DashboardStats :goals="goals" />

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-muted-foreground">Loading goals...</p>
      </div>

      <div v-else-if="activeGoals.length === 0" class="text-center py-12">
        <p class="text-muted-foreground mb-4">No active goals yet.</p>
        <Button @click="openCreateGoal">
          Create your first goal
        </Button>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GoalCard
          v-for="goal in activeGoals"
          :key="goal.id"
          :goal="goal"
          @click="goToGoalDetail(goal.id)"
        />
      </div>

      <!-- Create Goal Dialog -->
      <Dialog v-model:open="showCreateModal" title="Create New Goal">
        <GoalForm
          :is-loading="isLoading"
          @submit="handleCreateGoal"
          @cancel="showCreateModal = false"
        />
      </Dialog>
    </main>
  </div>
</template>

