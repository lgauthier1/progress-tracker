<template>
  <div class="space-y-4">
    <!-- Basic Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-card rounded-lg border p-4">
        <div class="text-sm text-muted-foreground">Total Progress</div>
        <div class="text-2xl font-bold">{{ formatValue(stats.totalProgress) }}</div>
      </div>
      
      <div class="bg-card rounded-lg border p-4">
        <div class="text-sm text-muted-foreground">Average per Day</div>
        <div class="text-2xl font-bold">{{ formatValue(stats.averagePerDay) }}</div>
      </div>
      
      <div class="bg-card rounded-lg border p-4">
        <div class="text-sm text-muted-foreground">Days Active</div>
        <div class="text-2xl font-bold">{{ stats.daysActive }}</div>
      </div>
      
      <div class="bg-card rounded-lg border p-4">
        <div class="text-sm text-muted-foreground">Current Streak</div>
        <div class="text-2xl font-bold">{{ stats.currentStreak }}</div>
      </div>
    </div>

    <!-- Projection (only for target-based goals) -->
    <div v-if="stats.projectedCompletion" class="bg-card rounded-lg border p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-semibold">Projection</h3>
        <div 
          class="px-2 py-1 rounded-full text-xs font-medium"
          :class="projectionBadgeClass"
        >
          {{ stats.projectedCompletion.confidence.toUpperCase() }} CONFIDENCE
        </div>
      </div>
      
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">Projected completion:</span>
          <span class="font-medium">{{ formatDate(stats.projectedCompletion.date) }}</span>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">Days remaining:</span>
          <span class="font-medium">{{ stats.projectedCompletion.daysRemaining }}</span>
        </div>
      </div>
    </div>

    <!-- Progress Bar (for target-based goals) -->
    <div v-if="goal.goalType === 'TARGET_BASED' && goal.targetValue" class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Progress to target</span>
        <span class="font-medium">
          {{ formatValue(goal.currentValue) }} / {{ formatValue(goal.targetValue) }}
          ({{ Math.round((goal.currentValue / goal.targetValue) * 100) }}%)
        </span>
      </div>
      
      <div class="w-full bg-secondary rounded-full h-2">
        <div 
          class="bg-primary h-2 rounded-full transition-all duration-300"
          :style="{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Goal } from '../../types/goals.types'
import { ProgressStats, formatProgressValue, formatDate } from '../../utils/progressStats'

interface Props {
  goal: Goal
  stats: ProgressStats
}

const props = defineProps<Props>()

const formatValue = (value: number) => {
  return formatProgressValue(value, props.goal.unit)
}

const projectionBadgeClass = computed(() => {
  if (!props.stats.projectedCompletion) return ''
  
  switch (props.stats.projectedCompletion.confidence) {
    case 'high':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'low':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
})
</script>

