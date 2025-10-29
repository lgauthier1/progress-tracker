<template>
  <div class="bg-card rounded-lg border p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">Activity Calendar</h3>
      <div class="flex gap-2">
        <Button @click="previousMonth" variant="outline" size="sm">
          ←
        </Button>
        <span class="text-sm font-medium min-w-[120px] text-center">
          {{ format(currentDate, 'MMMM yyyy') }}
        </span>
        <Button @click="nextMonth" variant="outline" size="sm">
          →
        </Button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="text-muted-foreground">Loading calendar...</div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="text-destructive">Error loading calendar: {{ error }}</div>
    </div>

    <div v-else class="space-y-2">
      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-1">
        <!-- Day headers -->
        <div v-for="day in dayHeaders" :key="day" class="text-xs text-muted-foreground text-center py-1">
          {{ day }}
        </div>
        
        <!-- Calendar cells -->
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="aspect-square rounded-sm border border-border flex items-center justify-center text-xs cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          :class="getDayClass(day)"
          @click="handleDayClick(day)"
        >
          {{ day.dayNumber }}
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-sm bg-muted"></div>
          <span>No activity</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-sm bg-green-200"></div>
          <span>1 day</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-sm bg-green-400"></div>
          <span>2-3 days</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-sm bg-green-600"></div>
          <span>4+ days</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, parseISO } from 'date-fns'
import Button from '../ui/Button.vue'

interface Props {
  habitId: string
  calendarData: Record<string, number>
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: undefined,
})

const emit = defineEmits<{
  dayClick: [date: string]
  monthChange: [year: number, month: number]
}>()

const currentDate = ref(new Date())

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const calendarDays = computed(() => {
  const start = startOfMonth(currentDate.value)
  const end = endOfMonth(currentDate.value)
  
  // Get all days in the month
  const days = eachDayOfInterval({ start, end })
  
  // Add empty cells for days before the month starts
  const startDay = getDay(start)
  const emptyDays = Array.from({ length: startDay }, (_, i) => ({
    date: '',
    dayNumber: '',
    isCurrentMonth: false,
    activity: 0,
  }))
  
  // Map days to calendar format
  const monthDays = days.map(day => ({
    date: format(day, 'yyyy-MM-dd'),
    dayNumber: day.getDate(),
    isCurrentMonth: true,
    activity: props.calendarData[format(day, 'yyyy-MM-dd')] || 0,
  }))
  
  return [...emptyDays, ...monthDays]
})

const getDayClass = (day: any) => {
  if (!day.isCurrentMonth) return 'bg-muted/20'
  if (day.activity === 0) return 'bg-muted/50 hover:bg-muted'
  
  // Color intensity based on activity
  if (day.activity === 1) return 'bg-green-200 hover:bg-green-300'
  if (day.activity <= 3) return 'bg-green-400 hover:bg-green-500'
  return 'bg-green-600 hover:bg-green-700 text-white'
}

const handleDayClick = (day: any) => {
  if (day.isCurrentMonth && day.date) {
    emit('dayClick', day.date)
  }
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  emitMonthChange()
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  emitMonthChange()
}

const emitMonthChange = () => {
  emit('monthChange', currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

// Watch for external month changes
watch(() => [props.habitId], () => {
  emitMonthChange()
}, { immediate: true })
</script>

