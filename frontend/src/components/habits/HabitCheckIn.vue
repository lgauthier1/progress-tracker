<template>
  <div class="bg-card rounded-lg border p-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex-1 cursor-pointer" @click="goToDetail">
        <h3 class="font-semibold hover:text-primary transition-colors">{{ habit.title }}</h3>
        <p v-if="habit.description" class="text-sm text-muted-foreground">{{ habit.description }}</p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold text-primary">{{ habit.currentStreak || 0 }}</div>
        <div class="text-xs text-muted-foreground">day streak</div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        {{ habit.totalCompletions || 0 }} total completions
      </div>
      
      <Button
        v-if="!isCompletedToday"
        @click="handleCheckIn"
        :disabled="isLoading"
        size="sm"
        class="bg-green-600 hover:bg-green-700"
      >
        {{ isLoading ? 'Checking in...' : '✓ Check In' }}
      </Button>
      
      <div v-else class="flex items-center text-green-600">
        <span class="text-sm font-medium">✓ Completed today</span>
      </div>
    </div>

    <!-- Quick note input -->
    <div v-if="showNoteInput" class="mt-3">
      <textarea
        v-model="note"
        placeholder="Add a note (optional)"
        class="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        rows="2"
      ></textarea>
      <div class="flex gap-2 mt-2">
        <Button @click="handleCheckInWithNote" :disabled="isLoading" size="sm">
          Check In with Note
        </Button>
        <Button @click="showNoteInput = false" variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>

    <!-- Note button -->
    <Button
      v-if="!isCompletedToday && !showNoteInput"
      @click="showNoteInput = true"
      variant="outline"
      size="sm"
      class="mt-2 w-full"
    >
      + Add Note
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Habit } from '../../types/habits.types'
import { format, isToday } from 'date-fns'
import Button from '../ui/Button.vue'

interface Props {
  habit: Habit
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  checkIn: [habitId: string, note?: string]
  goToDetail: [habitId: string]
}>()

const router = useRouter()
const note = ref('')
const showNoteInput = ref(false)

const isCompletedToday = computed(() => {
  if (!props.habit.lastCompletion) return false
  const lastCompletionDate = new Date(props.habit.lastCompletion)
  return isToday(lastCompletionDate)
})

const handleCheckIn = () => {
  emit('checkIn', props.habit.id)
}

const handleCheckInWithNote = () => {
  emit('checkIn', props.habit.id, note.value || undefined)
  note.value = ''
  showNoteInput.value = false
}

const goToDetail = () => {
  console.log('Navigating to habit detail:', props.habit.id)
  emit('goToDetail', props.habit.id)
}
</script>
