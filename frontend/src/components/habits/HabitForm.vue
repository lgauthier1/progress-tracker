<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-2">Title *</label>
      <Input
        v-model="form.title"
        type="text"
        required
        placeholder="e.g., Daily meditation, No alcohol, Exercise"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-2">Description</label>
      <textarea
        v-model="form.description"
        class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        placeholder="Optional description..."
        rows="3"
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium mb-2">Frequency *</label>
      <select
        v-model="form.frequency"
        class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        required
      >
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
        <option value="CUSTOM">Custom</option>
      </select>
    </div>

    <!-- Custom frequency config -->
    <div v-if="form.frequency === 'CUSTOM'" class="space-y-2">
      <label class="block text-sm font-medium">Custom Frequency</label>
      <div class="text-xs text-muted-foreground mb-2">
        Advanced configuration coming soon. For now, use Daily/Weekly/Monthly.
      </div>
    </div>

    <div class="flex gap-3 pt-4">
      <Button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Creating...' : 'Create Habit' }}
      </Button>
      <Button type="button" variant="outline" @click="$emit('cancel')">
        Cancel
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { CreateHabitRequest, HabitFrequency } from '../../types/habits.types'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'

interface Props {
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  submit: [data: CreateHabitRequest]
  cancel: []
}>()

const form = reactive<CreateHabitRequest>({
  title: '',
  description: '',
  frequency: 'DAILY' as HabitFrequency,
})

const handleSubmit = () => {
  if (!form.title.trim()) return
  
  emit('submit', {
    title: form.title.trim(),
    description: form.description?.trim() || undefined,
    frequency: form.frequency,
  })
}
</script>
