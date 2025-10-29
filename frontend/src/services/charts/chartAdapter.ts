// Chart.js adapter - isolates Chart.js implementation
import { ChartData, ChartOptions, ProgressChartData, ChartTheme } from './chartTypes'
import { getChartTheme } from './chartTheme'

// Chart.js types (imported from the library)
export interface ChartJSChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
    tension?: number
  }>
}

export interface ChartJSOptions {
  responsive: boolean
  maintainAspectRatio: boolean
  plugins?: any
  scales?: any
}

// Convert application chart data to Chart.js format
export function adaptChartData(data: ChartData): ChartJSChartData {
  return {
    labels: data.labels,
    datasets: data.datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.borderColor,
      backgroundColor: dataset.backgroundColor,
      fill: dataset.fill,
      tension: dataset.tension,
    })),
  }
}

// Convert application chart options to Chart.js format
export function adaptChartOptions(options: ChartOptions): ChartJSOptions {
  return {
    responsive: options.responsive,
    maintainAspectRatio: options.maintainAspectRatio,
    plugins: options.plugins,
    scales: options.scales,
  }
}

// Create progress chart data from goal data
export function createProgressChartData(
  progressData: ProgressChartData,
  theme: ChartTheme = getChartTheme()
): ChartData {
  const { dates, values, goalTitle, unit, targetValue, currentValue } = progressData

  const datasets = [
    {
      label: `Progress (${unit})`,
      data: values,
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}20`, // 20% opacity
      fill: true,
      tension: 0.4,
    },
  ]

  // Add target line if it's a target-based goal
  if (targetValue !== undefined) {
    datasets.push({
      label: `Target (${unit})`,
      data: new Array(dates.length).fill(targetValue),
      borderColor: theme.colors.success,
      backgroundColor: 'transparent',
      fill: false,
      tension: 0,
      borderDash: [5, 5], // Dashed line
    })
  }

  return {
    labels: dates,
    datasets,
  }
}

// Create chart options for progress charts
export function createProgressChartOptions(
  unit: string,
  theme: ChartTheme = getChartTheme()
): ChartOptions {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: unit,
        },
      },
    },
  }
}

