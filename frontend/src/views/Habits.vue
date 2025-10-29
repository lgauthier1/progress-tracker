<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    
    <div class="container mx-auto px-4 py-4">
      <button @click="goBack" class="text-sm text-muted-foreground hover:text-foreground mb-2">
        ← Back to Dashboard
      </button>
      <h1 class="text-2xl font-bold">Habits</h1>
    </div>

    <main class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold">Daily Habits</h2>
        <Button @click="openCreateHabit">
          + New Habit
        </Button>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-muted-foreground">Loading habits...</p>
      </div>

      <div v-else-if="activeHabits.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🎯</div>
        <p class="text-muted-foreground mb-4">No habits yet.</p>
        <p class="text-sm text-muted-foreground mb-6">
          Create your first habit to start building better daily routines!
        </p>
        <Button @click="openCreateHabit">
          Create your first habit
        </Button>
      </div>

      <div v-else class="space-y-6">
        <!-- Daily Habits -->
        <div v-if="dailyHabits.length > 0">
          <h3 class="text-xl font-semibold mb-4">Daily Habits</h3>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <HabitCheckIn
              v-for="habit in dailyHabits"
              :key="habit.id"
              :habit="habit"
              :is-loading="isLoading"
              @check-in="handleCheckIn"
              @go-to-detail="handleGoToDetail"
            />
          </div>
        </div>

        <!-- Weekly Habits -->
        <div v-if="weeklyHabits.length > 0">
          <h3 class="text-xl font-semibold mb-4">Weekly Habits</h3>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <HabitCheckIn
              v-for="habit in weeklyHabits"
              :key="habit.id"
              :habit="habit"
              :is-loading="isLoading"
              @check-in="handleCheckIn"
              @go-to-detail="handleGoToDetail"
            />
          </div>
        </div>

        <!-- Monthly Habits -->
        <div v-if="monthlyHabits.length > 0">
          <h3 class="text-xl font-semibold mb-4">Monthly Habits</h3>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <HabitCheckIn
              v-for="habit in monthlyHabits"
              :key="habit.id"
              :habit="habit"
              :is-loading="isLoading"
              @check-in="handleCheckIn"
              @go-to-detail="handleGoToDetail"
            />
          </div>
        </div>
      </div>

      <!-- Create Habit Dialog -->
      <Dialog v-model:open="showCreateModal" title="Create New Habit">
        <HabitForm
          :is-loading="isLoading"
          @submit="handleCreateHabit"
          @cancel="showCreateModal = false"
        />
      </Dialog>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHabits } from '../composables/useHabits'
import { CreateHabitRequest } from '../../types/habits.types'
import Button from '../components/ui/Button.vue'
import Dialog from '../components/ui/Dialog.vue'
import AppHeader from '../components/layout/AppHeader.vue'
import HabitCheckIn from '../components/habits/HabitCheckIn.vue'
import HabitForm from '../components/habits/HabitForm.vue'

const router = useRouter()
const { 
  activeHabits, 
  dailyHabits, 
  weeklyHabits, 
  monthlyHabits,
  fetchHabits, 
  createHabit, 
  checkInHabit,
  isLoading 
} = useHabits()

const showCreateModal = ref(false)

onMounted(async () => {
  await fetchHabits('ACTIVE')
})

function openCreateHabit() {
  showCreateModal.value = true
}

async function handleCreateHabit(data: CreateHabitRequest) {
  try {
    await createHabit(data)
    showCreateModal.value = false
  } catch (err) {
    console.error('Failed to create habit:', err)
  }
}

async function handleCheckIn(habitId: string, note?: string) {
  try {
    await checkInHabit(habitId, note)
    // Refresh habits to reflect updated streak/lastCompletion and disable button
    await fetchHabits('ACTIVE')
  } catch (err) {
    console.error('Failed to check in habit:', err)
  }
}

function goBack() {
  router.push('/')
}

function handleGoToDetail(habitId: string) {
  console.log('Parent handling navigation to habit detail:', habitId)
  router.push(`/habits/${habitId}`)
}
</script>
