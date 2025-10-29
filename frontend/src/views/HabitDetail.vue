<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    
    <div class="container mx-auto px-4 py-4">
      <button @click="goBack" class="text-sm text-muted-foreground hover:text-foreground mb-2">
        ← Back to Habits
      </button>
    </div>

    <main class="container mx-auto px-4 py-8">
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-muted-foreground">Loading habit...</p>
      </div>

      <div v-else-if="!habit" class="text-center py-12">
        <h1 class="text-2xl font-bold mb-4">Habit not found</h1>
        <p class="text-muted-foreground mb-4">This habit doesn't exist or you don't have access to it.</p>
        <Button @click="goBack" variant="secondary">Go Back to Habits</Button>
      </div>

      <div v-else>
        <!-- Habit Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold">{{ habit.title }}</h1>
              <p v-if="habit.category" class="text-muted-foreground">
                {{ habit.category.name }}
              </p>
            </div>
            <div class="flex gap-2">
              <Button @click="handleCheckIn" :disabled="isCompletedToday" variant="outline">
                {{ isCompletedToday ? '✓ Completed Today' : 'Log Today' }}
              </Button>
              <Button variant="outline" size="sm">
                ⋮
              </Button>
            </div>
          </div>
        </div>

        <!-- Current Streak -->
        <div class="bg-card rounded-lg border p-6 mb-6">
          <div class="text-center">
            <div class="text-6xl mb-2">🔥</div>
            <div class="text-4xl font-bold text-primary mb-2">{{ habit.currentStreak || 0 }}</div>
            <div class="text-lg text-muted-foreground">Current Streak</div>
            <div class="text-sm text-muted-foreground mt-2">
              Frequency: {{ habit.frequency }}
            </div>
            <div v-if="habit.frequency === 'DAILY'" class="text-sm text-muted-foreground">
              This week: {{ weeklyCompletions }}/7 days completed
            </div>
          </div>
        </div>

        <!-- Habit Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-card rounded-lg border p-4 text-center">
            <div class="text-2xl font-bold text-primary">{{ habit.totalCompletions || 0 }}</div>
            <div class="text-sm text-muted-foreground">Total Completions</div>
          </div>
          <div class="bg-card rounded-lg border p-4 text-center">
            <div class="text-2xl font-bold text-primary">{{ habit.currentStreak || 0 }}</div>
            <div class="text-sm text-muted-foreground">Current Streak</div>
          </div>
          <div class="bg-card rounded-lg border p-4 text-center">
            <div class="text-2xl font-bold text-primary">{{ habit.frequency }}</div>
            <div class="text-sm text-muted-foreground">Frequency</div>
          </div>
        </div>

        <!-- Calendar Heatmap (Placeholder) -->
        <div class="bg-card rounded-lg border p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">Completion Calendar</h3>
          <div class="text-center py-8 text-muted-foreground">
            <p>📅 Calendar heatmap will be implemented here</p>
            <p class="text-sm">Showing completion history for the last 3 months</p>
          </div>
        </div>

        <!-- Recent Completions -->
        <div class="bg-card rounded-lg border p-6">
          <h3 class="text-lg font-semibold mb-4">Recent Completions</h3>
          <div v-if="habit.completions && habit.completions.length > 0" class="space-y-2">
            <div 
              v-for="completion in habit.completions.slice(0, 10)" 
              :key="completion.id"
              class="flex items-center justify-between py-2 border-b border-border last:border-b-0"
            >
              <div class="flex items-center gap-2">
                <span class="text-green-600">✓</span>
                <span class="text-sm">{{ formatDate(completion.completionDate) }}</span>
              </div>
              <Button variant="ghost" size="sm" @click="deleteCompletion(completion.id)">
                Delete
              </Button>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted-foreground">
            <p>No completions yet. Start your streak by logging your first completion!</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHabits } from '../composables/useHabits'
import { format, isToday } from 'date-fns'
import AppHeader from '../components/layout/AppHeader.vue'
import Button from '../components/ui/Button.vue'

const router = useRouter()
const route = useRoute()
const { fetchHabit, checkInHabit, deleteHabitCompletion, isLoading } = useHabits()

const habit = ref(null)
const habitId = computed(() => route.params.id as string)

const isCompletedToday = computed(() => {
  if (!habit.value?.completions) return false
  const today = new Date()
  return habit.value.completions.some(completion => 
    isToday(new Date(completion.completionDate))
  )
})

const weeklyCompletions = computed(() => {
  if (!habit.value?.completions) return 0
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return habit.value.completions.filter(completion => 
    new Date(completion.completionDate) >= weekAgo
  ).length
})

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy')
}

const goBack = () => {
  router.push('/habits')
}

const loadHabit = async () => {
  try {
    console.log('Loading habit with ID:', habitId.value)
    const result = await fetchHabit(habitId.value)
    console.log('Habit loaded:', result)
    // Use composable state if API didn't return payload directly
    const fallback = useHabits().currentHabit
    habit.value = result ?? fallback.value ?? null
  } catch (error) {
    console.error('Failed to load habit:', error)
    habit.value = null
  }
}

const handleCheckIn = async () => {
  try {
    await checkInHabit(habitId.value)
    await loadHabit() // Reload to get updated data so button disables
  } catch (error) {
    console.error('Failed to check in habit:', error)
  }
}

const deleteCompletion = async (completionId: string) => {
  try {
    await deleteHabitCompletion(habitId.value, completionId)
    await loadHabit() // Reload to get updated data
  } catch (error) {
    console.error('Failed to delete completion:', error)
  }
}

onMounted(() => {
  loadHabit()
})
</script>