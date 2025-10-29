<template>
  <div class="p-8 space-y-8">
    <h1 class="text-3xl font-bold">Chart Test Component</h1>
    
    <!-- Test Progress Chart -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Progress Line Chart Test</h2>
      <ProgressLineChart 
        :progress-data="testChartData"
        :loading="false"
      />
    </div>

    <!-- Test Stats -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Progress Stats Test</h2>
      <ProgressStats 
        :goal="testGoal"
        :stats="testStats"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Goal } from '../../types/goals.types'
import { ProgressStats as ProgressStatsType, calculateProgressStats } from '../../utils/progressStats'
import ProgressLineChart from './ProgressLineChart.vue'
import ProgressStats from '../goals/ProgressStats.vue'

// Test data
const testGoal: Goal = {
  id: 'test-goal-1',
  userId: 'test-user-1',
  title: 'Test Goal - Save Money',
  goalType: 'TARGET_BASED',
  unit: 'dollars',
  currentValue: 1500,
  targetValue: 5000,
  deadline: '2025-12-31T00:00:00Z',
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const testProgressEntries = [
  { value: 100, entryDate: '2024-01-01T00:00:00Z' },
  { value: 200, entryDate: '2024-01-02T00:00:00Z' },
  { value: 150, entryDate: '2024-01-03T00:00:00Z' },
  { value: 300, entryDate: '2024-01-04T00:00:00Z' },
  { value: 250, entryDate: '2024-01-05T00:00:00Z' },
  { value: 500, entryDate: '2024-01-06T00:00:00Z' },
]

const testStats = computed(() => {
  return calculateProgressStats(
    testProgressEntries,
    testGoal.targetValue,
    testGoal.deadline
  )
})

const testChartData = computed(() => ({
  dates: testProgressEntries.map(entry => entry.entryDate.split('T')[0]!),
  values: testProgressEntries.map(entry => entry.value),
  goalTitle: testGoal.title,
  unit: testGoal.unit,
  targetValue: testGoal.targetValue,
  currentValue: testGoal.currentValue,
}))
</script>

