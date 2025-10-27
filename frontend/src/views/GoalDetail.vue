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
const { currentGoal, progressEntries, fetchGoal, fetchProgressEntries, addProgressEntry, updateProgressEntry, deleteProgressEntry, updateGoal, deleteGoal, isLoading } = useGoals()

const goalId = route.params.id as string
const progressValue = ref<number>(0)
const progressNote = ref('')
const progressDate = ref('')

// Edit progress modal state
const showEditProgressModal = ref(false)
const editingEntry = ref<ProgressEntry | null>(null)
const editValue = ref<number>(0)
const editNote = ref('')
const editDate = ref('')

// Edit goal modal state
const showEditGoalModal = ref(false)
const editGoalTitle = ref('')
const editGoalUnit = ref('')
const editGoalTargetValue = ref<number | undefined>(undefined)
const editGoalDeadline = ref('')
const editGoalStartDate = ref('')

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
    // Convert YYYY-MM-DD to ISO datetime (start of day in local timezone)
    const entryDateTime = new Date(progressDate.value).toISOString()
    
    await addProgressEntry(goalId, {
      value: progressValue.value,
      entryDate: entryDateTime,
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
  // Extract YYYY-MM-DD from ISO datetime for the date input
  editDate.value = entry.entryDate.split('T')[0]!
  showEditProgressModal.value = true
}

function handleEditGoal() {
  if (!currentGoal.value) return

  editGoalTitle.value = currentGoal.value.title
  editGoalUnit.value = currentGoal.value.unit

  if (currentGoal.value.goalType === 'TARGET_BASED') {
    editGoalTargetValue.value = currentGoal.value.targetValue
    editGoalDeadline.value = currentGoal.value.deadline.split('T')[0]!
  } else {
    editGoalStartDate.value = currentGoal.value.startDate?.split('T')[0] ?? ''
  }

  showEditGoalModal.value = true
}

async function handleUpdateEntry() {
  if (!editingEntry.value) return

  try {
    // Convert YYYY-MM-DD to ISO datetime
    const entryDateTime = new Date(editDate.value).toISOString()
    
    await updateProgressEntry(goalId, editingEntry.value.id, {
      value: editValue.value,
      entryDate: entryDateTime,
      note: editNote.value || undefined,
    })
    showEditProgressModal.value = false
    editingEntry.value = null
  } catch (err) {
    console.error('Failed to update progress:', err)
  }
}

async function handleUpdateGoal() {
  if (!currentGoal.value) return

  try {
    const updateData: any = {
      title: editGoalTitle.value,
      unit: editGoalUnit.value,
    }

    if (currentGoal.value.goalType === 'TARGET_BASED') {
      updateData.targetValue = editGoalTargetValue.value
      updateData.deadline = new Date(editGoalDeadline.value).toISOString()
    } else {
      if (editGoalStartDate.value) {
        updateData.startDate = new Date(editGoalStartDate.value).toISOString()
      }
    }

    await updateGoal(goalId, updateData)
    showEditGoalModal.value = false
  } catch (err) {
    console.error('Failed to update goal:', err)
  }
}

function cancelEditProgress() {
  showEditProgressModal.value = false
  editingEntry.value = null
}

function cancelEditGoal() {
  showEditGoalModal.value = false
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
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="handleEditGoal"
                :disabled="isLoading"
              >
                Edit Goal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                @click="handleDeleteGoal"
                :disabled="isLoading"
              >
                Delete Goal
              </Button>
            </div>
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

      <div v-else class="text-center py-12">
        <p class="text-muted-foreground">Goal not found.</p>
        <Button variant="secondary" @click="goBack" class="mt-4">
          Go back
        </Button>
      </div>
    </main>

    <!-- Edit Progress Dialog (outside v-if/v-else chain) -->
    <Dialog v-model:open="showEditProgressModal" title="Edit Progress Entry">
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
          <Button type="button" variant="outline" @click="cancelEditProgress">
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Edit Goal Dialog -->
    <Dialog v-model:open="showEditGoalModal" title="Edit Goal">
      <form @submit.prevent="handleUpdateGoal" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Title</label>
          <Input
            v-model="editGoalTitle"
            type="text"
            required
            placeholder="Goal title"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Unit</label>
          <Input
            v-model="editGoalUnit"
            type="text"
            required
            placeholder="e.g., dollars, kilometers"
          />
        </div>

        <!-- Target-based specific fields -->
        <template v-if="currentGoal?.goalType === 'TARGET_BASED'">
          <div>
            <label class="block text-sm font-medium mb-2">Target Value</label>
            <Input
              v-model.number="editGoalTargetValue"
              type="number"
              step="any"
              required
              placeholder="Target value"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Deadline</label>
            <Input
              v-model="editGoalDeadline"
              type="date"
              required
            />
          </div>
        </template>

        <!-- Continuous counter specific fields -->
        <template v-else>
          <div>
            <label class="block text-sm font-medium mb-2">Start Date (optional)</label>
            <Input
              v-model="editGoalStartDate"
              type="date"
            />
          </div>
        </template>

        <div class="flex gap-3">
          <Button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
          </Button>
          <Button type="button" variant="outline" @click="cancelEditGoal">
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

