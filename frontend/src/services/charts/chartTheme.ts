// Centralized chart theming - shadcn-vue default theme integration
import { ChartTheme } from './chartTypes'

export const defaultChartTheme: ChartTheme = {
  colors: {
    primary: 'hsl(222.2, 47.4%, 11.2%)', // shadcn primary
    secondary: 'hsl(210, 40%, 96.1%)',   // shadcn secondary
    success: 'hsl(142.1, 76.2%, 36.3%)', // green-600
    warning: 'hsl(38, 92%, 50%)',        // amber-500
    error: 'hsl(0, 84.2%, 60.2%)',       // red-500
    background: 'hsl(0, 0%, 100%)',      // white
    text: 'hsl(222.2, 84%, 4.9%)',       // shadcn foreground
  },
  fonts: {
    family: 'Inter, system-ui, sans-serif',
    size: 12,
  },
}

export const darkChartTheme: ChartTheme = {
  colors: {
    primary: 'hsl(210, 40%, 98%)',       // shadcn primary (dark)
    secondary: 'hsl(217.2, 32.6%, 17.5%)', // shadcn secondary (dark)
    success: 'hsl(142.1, 76.2%, 36.3%)', // green-600
    warning: 'hsl(38, 92%, 50%)',        // amber-500
    error: 'hsl(0, 84.2%, 60.2%)',       // red-500
    background: 'hsl(222.2, 84%, 4.9%)', // shadcn background (dark)
    text: 'hsl(210, 40%, 98%)',          // shadcn foreground (dark)
  },
  fonts: {
    family: 'Inter, system-ui, sans-serif',
    size: 12,
  },
}

export function getChartTheme(isDark = false): ChartTheme {
  return isDark ? darkChartTheme : defaultChartTheme
}

