<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGoals } from '../composables/useGoals'
import type { ProgressEntry } from '@shared/types/goals.types'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'
import Card from '../components/ui/Card.vue'
import Dialog from '../components/ui/Dialog.vue'
import ProgressOverview from '../components/goals/ProgressOverview.vue'
import ProgressHistory from '../components/goals/ProgressHistory.vue'

const route = useRoute()
const router = useRouter()
const { currentGoal, progressEntries, fetchGoal, fetchProgressEntries, addProgressEntry, updateProgressEntry, deleteProgressEntry, deleteGoal, isLoading } = useGoals()

const goalId = route.params.id as string
const progressValue = ref<number>(0)
const progressNote = ref('')
const progressDate = ref('')

// Edit modal state
const showEditModal = ref(false)
const editingEntry = ref<ProgressEntry | null>(null)
const editValue = ref<number>(0)
const editNote = ref('')
const editDate = ref('')

// Set default date to today
const setDefaultDate = () => {
  const today = new Date()
  progressDate.value = today.toISOString().split('T')[0]! // YYYY-MM-DD format
}

setDefaultDate()

onMounted(async () => {
  await fetchGoal(goalId)
  await fetchProgressEntries(goalId)
})

async function handleAddProgress() {
  try {
    await addProgressEntry(goalId, {
      value: progressValue.value,
      entryDate: progressDate.value, // Include the selected date
      note: progressNote.value || undefined,
    })
    progressValue.value = 0
    progressNote.value = ''
    setDefaultDate() // Reset to today after submission
  } catch (err) {
    console.error('Failed to add progress:', err)
  }
}

async function handleDeleteEntry(entryId: string) {
  try {
    await deleteProgressEntry(goalId, entryId)
  } catch (err) {
    console.error('Failed to delete progress:', err)
  }
}

function handleEditEntry(entry: ProgressEntry) {
  editingEntry.value = entry
  editValue.value = entry.value
  editNote.value = entry.note ?? ''
  editDate.value = entry.entryDate
  showEditModal.value = true
}

async function handleUpdateEntry() {
  if (!editingEntry.value) return

  try {
    await updateProgressEntry(goalId, editingEntry.value.id, {
      value: editValue.value,
      entryDate: editDate.value,
      note: editNote.value || undefined,
    })
    showEditModal.value = false
    editingEntry.value = null
  } catch (err) {
    console.error('Failed to update progress:', err)
  }
}

function cancelEdit() {
  showEditModal.value = false
  editingEntry.value = null
}

async function handleDeleteGoal() {
  if (!currentGoal.value) return

  const confirmed = confirm(
    `Are you sure you want to delete "${currentGoal.value.title}"? This will also delete all progress entries.`
  )

  if (!confirmed) return

  try {
    await deleteGoal(goalId)
    router.push('/') // Redirect to dashboard after deletion
  } catch (err) {
    console.error('Failed to delete goal:', err)
  }
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b bg-background">
      <div class="container mx-auto px-4 py-4">
        <button @click="goBack" class="text-sm text-muted-foreground hover:text-foreground mb-2">
          ← Back to Dashboard
        </button>
        <h1 class="text-2xl font-bold">Goal Details</h1>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-muted-foreground">Loading...</p>
      </div>

      <div v-else-if="currentGoal" class="space-y-8">
        <!-- Goal Title & Actions -->
        <Card class="p-6">
          <div class="flex items-start justify-between">
            <h2 class="text-3xl font-bold">{{ currentGoal.title }}</h2>
            <Button
              variant="destructive"
              size="sm"
              @click="handleDeleteGoal"
              :disabled="isLoading"
            >
              Delete Goal
            </Button>
          </div>
        </Card>

        <!-- Progress Overview -->
        <ProgressOverview :goal="currentGoal" />

        <!-- Add Progress Form -->
        <Card class="p-6">
          <h3 class="text-xl font-semibold mb-4">Log Progress</h3>
          <form @submit.prevent="handleAddProgress" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">
                Amount ({{ currentGoal.unit }})
              </label>
              <Input
                v-model.number="progressValue"
                type="number"
                step="any"
                required
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Date</label>
              <Input
                v-model="progressDate"
                type="date"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Note (optional)</label>
              <textarea
                v-model="progressNote"
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Add a note..."
                rows="3"
              ></textarea>
            </div>
            <Button type="submit" :disabled="isLoading">
              Add Progress
            </Button>
          </form>
        </Card>

        <!-- Progress History -->
        <ProgressHistory
          :entries="progressEntries"
          :unit="currentGoal.unit"
          @delete="handleDeleteEntry"
          @edit="handleEditEntry"
        />
      </div>

      <!-- Edit Progress Dialog -->
      <Dialog v-model:open="showEditModal" title="Edit Progress Entry">
        <form @submit.prevent="handleUpdateEntry" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">
              Amount ({{ currentGoal?.unit }})
            </label>
            <Input
              v-model.number="editValue"
              type="number"
              step="any"
              required
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Date</label>
            <Input
              v-model="editDate"
              type="date"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Note (optional)</label>
            <textarea
              v-model="editNote"
              class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Add a note..."
              rows="3"
            ></textarea>
          </div>
          <div class="flex gap-3">
            <Button type="submit" :disabled="isLoading">
              {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </Button>
            <Button type="button" variant="outline" @click="cancelEdit">
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>

      <div v-else class="text-center py-12">
        <p class="text-muted-foreground">Goal not found.</p>
        <Button variant="secondary" @click="goBack" class="mt-4">
          Go back
        </Button>
      </div>
    </main>
  </div>
</template>

