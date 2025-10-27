<script setup lang="ts">
/**
 * GoalForm Component
 * 
 * Create/edit form with goal type selector and conditional fields.
 * 
 * Constitution: TypeScript Strict Mode
 */

import { ref, computed, watch } from 'vue'
import type { CreateGoalRequest } from '@shared/types/goals.types'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import Select from '../ui/Select.vue'

interface Props {
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  submit: [data: CreateGoalRequest]
  cancel: []
}>()

const goalType = ref<'TARGET_BASED' | 'CONTINUOUS_COUNTER'>('TARGET_BASED')
const title = ref('')
const unit = ref('')
const targetValue = ref<number | undefined>(undefined)
const deadline = ref('')
const startDate = ref('')

const goalTypeOptions = [
  { value: 'TARGET_BASED', label: 'Target-based (with deadline)' },
  { value: 'CONTINUOUS_COUNTER', label: 'Continuous counter (without deadline)' },
]

const isValid = computed(() => {
  if (!title.value || !unit.value) return false

  if (goalType.value === 'TARGET_BASED') {
    return targetValue.value !== undefined && targetValue.value > 0 && deadline.value !== ''
  }

  return true
})

// Reset conditional fields when goal type changes
watch(goalType, () => {
  targetValue.value = undefined
  deadline.value = ''
  startDate.value = ''
})

function handleSubmit() {
  if (!isValid.value) return

  if (goalType.value === 'TARGET_BASED') {
    const data: CreateGoalRequest = {
      goalType: 'TARGET_BASED',
      title: title.value,
      unit: unit.value,
      targetValue: targetValue.value!,
      deadline: new Date(deadline.value).toISOString(),
    }
    emit('submit', data)
  } else {
    const data: CreateGoalRequest = {
      goalType: 'CONTINUOUS_COUNTER',
      title: title.value,
      unit: unit.value,
      startDate: startDate.value ? new Date(startDate.value).toISOString() : undefined,
    }
    emit('submit', data)
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Goal Type -->
    <div>
      <label class="block text-sm font-medium mb-2">Goal Type</label>
      <Select v-model="goalType" :options="goalTypeOptions" />
    </div>

    <!-- Title -->
    <div>
      <label class="block text-sm font-medium mb-2">Title *</label>
      <Input
        v-model="title"
        type="text"
        placeholder="e.g., Save for vacation"
        required
      />
    </div>

    <!-- Unit -->
    <div>
      <label class="block text-sm font-medium mb-2">Unit *</label>
      <Input
        v-model="unit"
        type="text"
        placeholder="e.g., dollars, kilometers, days"
        required
      />
    </div>

    <!-- Target-based specific fields -->
    <template v-if="goalType === 'TARGET_BASED'">
      <div>
        <label class="block text-sm font-medium mb-2">Target Value *</label>
        <Input
          v-model.number="targetValue"
          type="number"
          step="any"
          placeholder="e.g., 5000"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Deadline *</label>
        <Input v-model="deadline" type="date" required />
      </div>
    </template>

    <!-- Continuous counter specific fields -->
    <template v-else>
      <div>
        <label class="block text-sm font-medium mb-2">Start Date (optional)</label>
        <Input v-model="startDate" type="date" />
        <p class="text-xs text-muted-foreground mt-1">
          Leave empty to use today's date
        </p>
      </div>
    </template>

    <!-- Actions -->
    <div class="flex gap-3 pt-4">
      <Button type="submit" :disabled="!isValid || isLoading">
        {{ isLoading ? 'Creating...' : 'Create Goal' }}
      </Button>
      <Button type="button" variant="outline" @click="handleCancel">
        Cancel
      </Button>
    </div>
  </form>
</template>

