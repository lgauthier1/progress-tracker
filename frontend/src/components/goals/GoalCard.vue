<script setup lang="ts">
/**
 * GoalCard Component
 * 
 * Displays a goal with progress indicator (discriminated by goal type).
 * 
 * Constitution: TypeScript Strict Mode
 */

import { computed } from 'vue'
import type { Goal } from '@shared/types/goals.types'
import Card from '../ui/Card.vue'
import Badge from '../ui/Badge.vue'

interface Props {
  goal: Goal
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const progressPercentage = computed(() => {
  if (props.goal.goalType === 'TARGET_BASED') {
    return Math.min(Math.round((props.goal.currentValue / props.goal.targetValue) * 100), 100)
  }
  return 0
})

const daysRemaining = computed(() => {
  if (props.goal.goalType === 'TARGET_BASED') {
    const deadline = new Date(props.goal.deadline)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  return null
})

function handleClick() {
  emit('click')
}
</script>

<template>
  <Card class="p-6 cursor-pointer hover:border-primary transition-colors" @click="handleClick">
    <div class="space-y-3">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <h3 class="text-xl font-semibold line-clamp-2">{{ goal.title }}</h3>
        <Badge v-if="goal.status === 'COMPLETED'" variant="secondary">
          Completed
        </Badge>
      </div>

      <!-- Target-based goal display -->
      <template v-if="goal.goalType === 'TARGET_BASED'">
        <div class="space-y-2">
          <div class="text-3xl font-bold">{{ progressPercentage }}%</div>
          <p class="text-sm text-muted-foreground">
            {{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}
          </p>

          <!-- Progress bar -->
          <div class="w-full bg-secondary rounded-full h-2.5">
            <div
              class="bg-primary h-2.5 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>

          <!-- Days remaining -->
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span v-if="daysRemaining !== null">
              <template v-if="daysRemaining > 0">{{ daysRemaining }} days left</template>
              <template v-else-if="daysRemaining === 0">Due today</template>
              <template v-else>{{ Math.abs(daysRemaining) }} days overdue</template>
            </span>
            <span>{{ new Date(goal.deadline).toLocaleDateString() }}</span>
          </div>
        </div>
      </template>

      <!-- Continuous counter goal display -->
      <template v-else>
        <div class="space-y-2">
          <div class="text-3xl font-bold">{{ goal.currentValue }} {{ goal.unit }}</div>
          <p class="text-sm text-muted-foreground">Continuous counter</p>
          <p class="text-xs text-muted-foreground">
            Started {{ new Date(goal.startDate).toLocaleDateString() }}
          </p>
        </div>
      </template>
    </div>
  </Card>
</template>

