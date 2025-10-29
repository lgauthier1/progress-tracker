<template>
  <div class="habit-calendar" :style="{ '--day-size': daySize + 'px' }">
    <!-- Controls -->
    <div class="flex items-center justify-between mb-4">
      <button 
        @click="previousMonth" 
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        :disabled="isLoading"
      >
        ←
      </button>
      <div class="text-lg font-semibold">{{ headerRange }}</div>
      <button 
        @click="nextMonth" 
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        :disabled="isLoading || !canGoNext"
      >
        →
      </button>
    </div>

    <!-- Months Grid -->
    <div class="months-grid">
      <div 
        v-for="m in monthsToRender" 
        :key="`${m.year}-${m.month}`"
        class="month"
      >
        <div class="month-title">{{ m.name }} {{ m.year }}</div>

        <!-- Day Headers -->
        <div class="day-headers">
          <div v-for="day in dayNames" :key="day" class="day-header">
            {{ day }}
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
          <div 
            v-for="day in getCalendarDaysFor(m.year, m.month)" 
            :key="day.key"
            :class="getDayClass(day)"
            @click="handleDayClick(day)"
          >
            <div class="day-number">{{ day.day }}</div>
            <div v-if="day.hasCompletion" class="completion-indicator">
              ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHabits } from '../../composables/useHabits'

interface Props {
  habitId: string
  // number of months to display ending at current month
  monthsToShow?: number
  // day square size in px (height/width)
  daySizePx?: number
}

const props = defineProps<Props>()
const { fetchHabitCalendar } = useHabits()

const calendarData = ref<Record<string, number>>({})
const isLoading = ref(false)
const currentDate = ref(new Date())

const monthsToShow = computed(() => props.monthsToShow ?? 3)
const daySize = computed(() => props.daySizePx ?? 56)

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December']
const currentMonthName = computed(() => monthNames[currentMonth.value])

const today = new Date()
const canGoNext = computed(() => {
  const nextMonth = new Date(currentDate.value)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return nextMonth <= today
})

function getCalendarDaysFor(year: number, monthOneBased: number) {
  const monthZero = monthOneBased - 1
  const days: any[] = []
  const firstDay = new Date(year, monthZero, 1)
  const lastDay = new Date(year, monthZero + 1, 0)
  const startDate = new Date(firstDay)
  const startDayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - startDayOfWeek)
  const endDate = new Date(lastDay)
  const endDayOfWeek = endDate.getDay()
  endDate.setDate(endDate.getDate() + (6 - endDayOfWeek))
  const currentDay = new Date(startDate)
  while (currentDay <= endDate) {
    // Format date as YYYY-MM-DD using local date components to match backend format
    const year = currentDay.getFullYear()
    const month = String(currentDay.getMonth() + 1).padStart(2, '0')
    const day = String(currentDay.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const count = calendarData.value[dateStr] || 0
    const isInCurrentMonth = currentDay.getMonth() === monthZero
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const isToday = dateStr === todayStr
    const isPast = currentDay < today
    days.push({
      key: `${year}-${monthOneBased}-${dateStr}`,
      date: dateStr,
      day: currentDay.getDate(),
      count,
      hasCompletion: count > 0,
      isInCurrentMonth,
      isToday,
      isPast,
      dateObj: new Date(currentDay)
    })
    currentDay.setDate(currentDay.getDate() + 1)
  }
  return days
}

const monthsToRender = computed(() => {
  // Build array of months ending at current month, showing monthsToShow
  const items: { year: number; month: number; name: string }[] = []
  const base = new Date(currentYear.value, currentMonth.value, 1)
  for (let i = monthsToShow.value - 1; i >= 0; i--) {
    const d = new Date(base)
    d.setMonth(base.getMonth() - i)
    items.push({ year: d.getFullYear(), month: d.getMonth() + 1, name: monthNames[d.getMonth()] })
  }
  return items
})

const headerRange = computed(() => {
  const items = monthsToRender.value
  if (items.length === 1) return `${items[0].name} ${items[0].year}`
  const first = items[0]
  const last = items[items.length - 1]
  return `${first.name} ${first.year} – ${last.name} ${last.year}`
})

const getDayClass = (day: any) => {
  const baseClass = 'calendar-day flex flex-col items-center justify-start p-2 border border-gray-200 rounded-lg cursor-pointer transition-all hover:bg-gray-50'
  
  if (!day.isInCurrentMonth) {
    return `${baseClass} bg-gray-50 text-gray-400`
  }
  
  if (day.isToday) {
    return `${baseClass} bg-blue-50 border-blue-300 font-semibold`
  }
  
  if (day.hasCompletion) {
    return `${baseClass} bg-green-50 border-green-300`
  }
  
  return `${baseClass} bg-white`
}

const handleDayClick = (day: any) => {
  if (!day.isInCurrentMonth || !day.isPast) return
  // Emit event to parent to log completion for this date
  console.log('Clicked on date:', day.date)
}

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - monthsToShow.value, 1)
  loadCalendarData()
}

const nextMonth = () => {
  if (!canGoNext.value) return
  currentDate.value = new Date(currentYear.value, currentMonth.value + monthsToShow.value, 1)
  loadCalendarData()
}

const loadCalendarData = async () => {
  try {
    isLoading.value = true
    const merged: Record<string, number> = {}
    const months = monthsToRender.value
    for (const m of months) {
      const response = await fetchHabitCalendar(props.habitId, m.year, m.month)
      Object.assign(merged, response.calendarData)
    }
    calendarData.value = merged
  } catch (error) {
    console.error('Failed to load calendar data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCalendarData()
})
</script>

<style scoped>
.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.month-title {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 14px;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 8px;
}

.day-header {
  text-align: center;
  font-weight: 600;
  font-size: 11px;
  color: #6b7280;
  padding: 6px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  min-height: var(--day-size);
  aspect-ratio: 1;
  padding: 4px;
  box-sizing: border-box;
  overflow: hidden;
}

.day-number {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
  line-height: 1;
}

.completion-indicator {
  color: #10b981;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .months-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .calendar-day {
    min-height: 40px;
    padding: 2px;
  }
  
  .day-number {
    font-size: 11px;
  }
  
  .completion-indicator {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .calendar-day {
    min-height: 32px;
    padding: 1px;
  }
  
  .day-number {
    font-size: 10px;
  }
  
  .completion-indicator {
    font-size: 9px;
  }
}
</style>