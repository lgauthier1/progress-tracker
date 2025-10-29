// Chart abstraction layer - Application-specific chart interfaces
// This isolates Chart.js implementation details from business components

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  borderColor?: string
  backgroundColor?: string
  fill?: boolean
  tension?: number
}

export interface ChartOptions {
  responsive: boolean
  maintainAspectRatio: boolean
  plugins?: {
    legend?: {
      display: boolean
      position?: 'top' | 'bottom' | 'left' | 'right'
    }
    tooltip?: {
      enabled: boolean
    }
  }
  scales?: {
    x?: {
      display: boolean
      title?: {
        display: boolean
        text: string
      }
    }
    y?: {
      display: boolean
      title?: {
        display: boolean
        text: string
      }
    }
  }
}

export interface ProgressChartData {
  dates: string[]
  values: number[]
  goalTitle: string
  unit: string
  targetValue?: number
  currentValue: number
}

export interface ChartTheme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    background: string
    text: string
  }
  fonts: {
    family: string
    size: number
  }
}

