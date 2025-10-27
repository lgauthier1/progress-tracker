<script setup lang="ts">
/**
 * ProgressOverview Component
 * 
 * Displays percentage/count, days remaining/elapsed.
 * 
 * Constitution: TypeScript Strict Mode
 */

import { computed } from 'vue'
import type { Goal } from '@shared/types/goals.types'
import Card from '../ui/Card.vue'

interface Props {
  goal: Goal
}

const props = defineProps<Props>()

const progressPercentage = computed(() => {
  if (props.goal.goalType === 'TARGET_BASED') {
    return Math.min(Math.round((props.goal.currentValue / props.goal.targetValue) * 100), 100)
  }
  return 0
})

const remaining = computed(() => {
  if (props.goal.goalType === 'TARGET_BASED') {
    return props.goal.targetValue - props.goal.currentValue
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

const daysElapsed = computed(() => {
  const startDate = props.goal.goalType === 'CONTINUOUS_COUNTER'
    ? new Date(props.goal.startDate)
    : new Date(props.goal.createdAt)
  const today = new Date()
  const diffTime = today.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})
</script>

<template>
  <Card class="p-6">
    <h3 class="text-lg font-semibold mb-4">Progress Overview</h3>

    <!-- Target-based overview -->
    <template v-if="goal.goalType === 'TARGET_BASED'">
      <div class="space-y-4">
        <!-- Progress percentage -->
        <div>
          <div class="text-4xl font-bold mb-2">{{ progressPercentage }}%</div>
          <p class="text-sm text-muted-foreground">
            {{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}
          </p>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-secondary rounded-full h-3">
          <div
            class="bg-primary h-3 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p class="text-sm text-muted-foreground">Remaining</p>
            <p class="text-xl font-semibold">{{ remaining }} {{ goal.unit }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">
              <template v-if="daysRemaining !== null && daysRemaining >= 0">Days left</template>
              <template v-else>Overdue by</template>
            </p>
            <p class="text-xl font-semibold" :class="{ 'text-destructive': daysRemaining !== null && daysRemaining < 0 }">
              <template v-if="daysRemaining !== null">
                {{ Math.abs(daysRemaining) }} days
              </template>
            </p>
          </div>
        </div>

        <!-- Deadline -->
        <div class="pt-2 border-t">
          <p class="text-sm text-muted-foreground">Deadline</p>
          <p class="text-base font-medium">{{ new Date(goal.deadline).toLocaleDateString() }}</p>
        </div>

        <!-- On track indicator -->
        <div v-if="daysRemaining !== null && daysRemaining > 0" class="pt-2">
          <p class="text-xs text-muted-foreground">
            {{ progressPercentage >= 50 ? '✅ On track!' : '⚠️ Need to catch up' }}
          </p>
        </div>
      </div>
    </template>

    <!-- Continuous counter overview -->
    <template v-else>
      <div class="space-y-4">
        <!-- Current count -->
        <div>
          <div class="text-4xl font-bold mb-2">{{ goal.currentValue }}</div>
          <p class="text-sm text-muted-foreground">{{ goal.unit }}</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p class="text-sm text-muted-foreground">Days elapsed</p>
            <p class="text-xl font-semibold">{{ daysElapsed }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Started</p>
            <p class="text-base font-medium">
              {{ new Date(goal.startDate).toLocaleDateString() }}
            </p>
          </div>
        </div>

        <!-- Motivation message -->
        <div class="pt-2 border-t">
          <p class="text-sm font-medium">
            <template v-if="goal.currentValue === 0">🎯 Start your journey!</template>
            <template v-else-if="goal.currentValue < 7">💪 Building momentum...</template>
            <template v-else-if="goal.currentValue < 30">🔥 Great progress!</template>
            <template v-else>🌟 Amazing streak!</template>
          </p>
        </div>
      </div>
    </template>
  </Card>
</template>

