<template>
  <div class="w-full h-80 bg-card rounded-lg border p-4">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div class="text-muted-foreground">Loading chart...</div>
    </div>
    <div v-else-if="error" class="flex items-center justify-center h-full">
      <div class="text-destructive">Error loading chart: {{ error }}</div>
    </div>
    <div v-else-if="!hasData" class="flex items-center justify-center h-full">
      <div class="text-muted-foreground text-center">
        <div class="text-lg mb-2">📊</div>
        <div>No progress data to display</div>
        <div class="text-sm mt-1">Start logging progress to see your chart!</div>
      </div>
    </div>
    <canvas v-else ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { 
  ChartData, 
  ChartOptions, 
  ProgressChartData,
  createProgressChartData,
  createProgressChartOptions,
  getChartTheme,
  adaptChartData,
  adaptChartOptions
} from '../../services/charts'

// Props
interface Props {
  progressData: ProgressChartData
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: undefined,
})

// Chart instance ref
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

// Computed
const hasData = computed(() => {
  return props.progressData && props.progressData.values.length > 0
})

// Chart lifecycle
const createChart = async () => {
  if (!chartCanvas.value || !hasData.value) return

  try {
    // Dynamic import of Chart.js to avoid bundling issues
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)

    // Destroy existing chart
    if (chartInstance) {
      chartInstance.destroy()
    }

    // Create chart data and options
    const theme = getChartTheme(false) // TODO: Add dark mode support
    const chartData = createProgressChartData(props.progressData, theme)
    const chartOptions = createProgressChartOptions(props.progressData.unit, theme)

    // Adapt to Chart.js format
    const chartJSData = adaptChartData(chartData)
    const chartJSOptions = adaptChartOptions(chartOptions)

    // Create new chart
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: chartJSData,
      options: chartJSOptions,
    })
  } catch (error) {
    console.error('Failed to create chart:', error)
  }
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

// Lifecycle hooks
onMounted(async () => {
  await nextTick()
  if (hasData.value) {
    await createChart()
  }
})

onUnmounted(() => {
  destroyChart()
})

// Watch for data changes
watch(
  () => props.progressData,
  async () => {
    await nextTick()
    if (hasData.value) {
      await createChart()
    } else {
      destroyChart()
    }
  },
  { deep: true }
)

// Watch for loading/error state changes
watch(
  () => [props.loading, props.error],
  async () => {
    if (!props.loading && !props.error && hasData.value) {
      await nextTick()
      await createChart()
    }
  }
)
</script>

