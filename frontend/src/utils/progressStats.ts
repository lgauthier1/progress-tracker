// Progress statistics and projection calculations
import { format, parseISO, differenceInDays, addDays } from 'date-fns'

export interface ProgressStats {
  totalProgress: number
  averagePerDay: number
  daysActive: number
  currentStreak: number
  projectedCompletion?: {
    date: string
    daysRemaining: number
    confidence: 'high' | 'medium' | 'low'
  }
}

export interface ProgressEntry {
  value: number
  entryDate: string
}

export interface ProgressChartData {
  dates: string[]
  values: number[]
  goalTitle: string
  unit: string
  targetValue?: number
  currentValue: number
}

export function calculateProgressStats(
  entries: ProgressEntry[],
  targetValue?: number,
  deadline?: string
): ProgressStats {
  if (entries.length === 0) {
    return {
      totalProgress: 0,
      averagePerDay: 0,
      daysActive: 0,
      currentStreak: 0,
    }
  }

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  // Calculate basic stats
  const totalProgress = sortedEntries.reduce((sum, entry) => sum + entry.value, 0)
  const firstEntryDate = parseISO(sortedEntries[0].entryDate)
  const lastEntryDate = parseISO(sortedEntries[sortedEntries.length - 1].entryDate)
  const daysActive = differenceInDays(lastEntryDate, firstEntryDate) + 1
  const averagePerDay = daysActive > 0 ? totalProgress / daysActive : 0

  // Calculate current streak (consecutive days with entries)
  const currentStreak = calculateCurrentStreak(sortedEntries)

  // Calculate projection if target and deadline are provided
  let projectedCompletion: ProgressStats['projectedCompletion'] | undefined

  if (targetValue && deadline) {
    projectedCompletion = calculateProjection(
      totalProgress,
      targetValue,
      averagePerDay,
      deadline,
      lastEntryDate
    )
  }

  return {
    totalProgress,
    averagePerDay,
    daysActive,
    currentStreak,
    projectedCompletion,
  }
}

function calculateCurrentStreak(entries: ProgressEntry[]): number {
  if (entries.length === 0) return 0

  // Group entries by date
  const entriesByDate = new Map<string, ProgressEntry[]>()
  entries.forEach(entry => {
    const dateKey = format(parseISO(entry.entryDate), 'yyyy-MM-dd')
    if (!entriesByDate.has(dateKey)) {
      entriesByDate.set(dateKey, [])
    }
    entriesByDate.get(dateKey)!.push(entry)
  })

  // Calculate streak from most recent date backwards
  const sortedDates = Array.from(entriesByDate.keys()).sort().reverse()
  let streak = 0
  let currentDate = new Date()

  for (const dateKey of sortedDates) {
    const entryDate = parseISO(dateKey)
    const daysDiff = differenceInDays(currentDate, entryDate)

    if (daysDiff === streak) {
      streak++
      currentDate = entryDate
    } else if (daysDiff === streak + 1) {
      // Check if there's an entry for the previous day
      const prevDate = format(addDays(entryDate, -1), 'yyyy-MM-dd')
      if (entriesByDate.has(prevDate)) {
        streak++
        currentDate = entryDate
      } else {
        break
      }
    } else {
      break
    }
  }

  return streak
}

function calculateProjection(
  currentProgress: number,
  targetValue: number,
  averagePerDay: number,
  deadline: string,
  lastEntryDate: Date
): ProgressStats['projectedCompletion'] {
  const remainingProgress = targetValue - currentProgress
  const deadlineDate = parseISO(deadline)
  const daysRemaining = differenceInDays(deadlineDate, lastEntryDate)

  if (remainingProgress <= 0) {
    return {
      date: format(deadlineDate, 'yyyy-MM-dd'),
      daysRemaining: 0,
      confidence: 'high',
    }
  }

  if (averagePerDay <= 0) {
    return {
      date: format(deadlineDate, 'yyyy-MM-dd'),
      daysRemaining,
      confidence: 'low',
    }
  }

  const projectedDaysNeeded = Math.ceil(remainingProgress / averagePerDay)
  const projectedDate = addDays(lastEntryDate, projectedDaysNeeded)

  // Determine confidence based on how close we are to deadline
  let confidence: 'high' | 'medium' | 'low'
  if (projectedDaysNeeded <= daysRemaining * 0.7) {
    confidence = 'high'
  } else if (projectedDaysNeeded <= daysRemaining) {
    confidence = 'medium'
  } else {
    confidence = 'low'
  }

  return {
    date: format(projectedDate, 'yyyy-MM-dd'),
    daysRemaining: Math.max(0, projectedDaysNeeded),
    confidence,
  }
}

export function formatProgressValue(value: number, unit: string): string {
  if (unit === 'days' || unit === 'day') {
    return `${Math.round(value)} ${unit}`
  }
  
  if (value % 1 === 0) {
    return `${Math.round(value)} ${unit}`
  }
  
  return `${value.toFixed(2)} ${unit}`
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

