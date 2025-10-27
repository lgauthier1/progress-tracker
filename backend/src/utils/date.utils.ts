/**
 * Date and Time Utilities
 * 
 * Utilities for date handling, streak calculations, and timezone management.
 * Uses date-fns for all date operations.
 * 
 * Constitution: TypeScript Strict Mode
 */

import {
  format,
  parseISO,
  differenceInCalendarDays,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  isEqual,
  subDays,
} from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Parse ISO date string to Date
 */
export function parseDate(dateString: string): Date {
  return parseISO(dateString)
}

/**
 * Get start of day in user's timezone
 */
export function getStartOfDay(date: Date, timezone: string = 'UTC'): Date {
  const zonedDate = utcToZonedTime(date, timezone)
  const start = startOfDay(zonedDate)
  return zonedTimeToUtc(start, timezone)
}

/**
 * Get end of day in user's timezone
 */
export function getEndOfDay(date: Date, timezone: string = 'UTC'): Date {
  const zonedDate = utcToZonedTime(date, timezone)
  const end = endOfDay(zonedDate)
  return zonedTimeToUtc(end, timezone)
}

/**
 * Calculate days remaining until deadline
 * Returns negative number if deadline has passed
 */
export function getDaysRemaining(deadline: Date): number {
  const today = startOfDay(new Date())
  const deadlineStart = startOfDay(deadline)
  return differenceInCalendarDays(deadlineStart, today)
}

/**
 * Calculate days elapsed since start date
 */
export function getDaysElapsed(startDate: Date): number {
  const today = startOfDay(new Date())
  const start = startOfDay(startDate)
  return differenceInCalendarDays(today, start)
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return isEqual(startOfDay(date1), startOfDay(date2))
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * Calculate streak from completion dates
 * Returns the number of consecutive days/periods completed
 * 
 * @param completionDates - Array of completion dates (most recent first)
 * @returns Current streak count
 */
export function calculateStreak(
  completionDates: Date[]
): number {
  if (completionDates.length === 0) {
    return 0
  }

  // Sort dates in descending order (most recent first)
  const sortedDates = completionDates
    .map((d) => startOfDay(d))
    .sort((a, b) => b.getTime() - a.getTime())

  const today = startOfDay(new Date())
  const yesterday = startOfDay(subDays(today, 1))

  // Check if most recent completion was today or yesterday
  const mostRecent = sortedDates[0]!
  if (isAfter(mostRecent, today)) {
    // Future date - invalid
    return 0
  }
  if (isBefore(mostRecent, yesterday)) {
    // Streak broken (more than 1 day gap)
    return 0
  }

  // Calculate consecutive days
  let streak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const current = sortedDates[i]!
    const previous = sortedDates[i - 1]!

    const daysBetween = differenceInCalendarDays(previous, current)

    if (daysBetween === 1) {
      streak++
    } else {
      // Gap found - stop counting
      break
    }
  }

  return streak
}

/**
 * Check if a date falls within a date range
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const target = startOfDay(date)
  const start = startOfDay(startDate)
  const end = startOfDay(endDate)

  return (isEqual(target, start) || isAfter(target, start)) && 
         (isEqual(target, end) || isBefore(target, end))
}

