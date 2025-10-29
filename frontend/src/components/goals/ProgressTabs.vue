<template>
  <div class="space-y-4">
    <!-- Tab Navigation -->
    <div class="flex space-x-1 bg-muted p-1 rounded-lg">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors"
        :class="[
          activeTab === tab.id
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="min-h-[200px]">
      <ProgressStats
        v-if="activeTab === 'stats'"
        :goal="goal"
        :stats="stats"
      />
      
      <div v-else-if="activeTab === 'chart'" class="space-y-4">
        <ProgressLineChart 
          v-if="chartData"
          :progress-data="chartData"
          :loading="loading"
        />
        <div v-else class="text-center py-8 text-muted-foreground">
          <div class="text-4xl mb-2">📊</div>
          <p>No progress data to display</p>
          <p class="text-sm">Start logging progress to see your chart!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Goal } from '../../types/goals.types'
import { ProgressStats as ProgressStatsType, ProgressChartData } from '../../utils/progressStats'
import ProgressStats from './ProgressStats.vue'
import ProgressLineChart from '../charts/ProgressLineChart.vue'

interface Props {
  goal: Goal
  stats: ProgressStatsType
  chartData: ProgressChartData | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const activeTab = ref<'stats' | 'chart'>('stats')

const tabs = [
  { id: 'stats' as const, label: 'Statistics' },
  { id: 'chart' as const, label: 'Chart' },
]
</script>

