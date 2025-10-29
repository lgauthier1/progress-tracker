<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <!-- Total Goals -->
    <div class="bg-card rounded-lg border p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Total Goals</p>
          <p class="text-2xl font-bold">{{ totalGoals }}</p>
        </div>
        <div class="text-2xl">🎯</div>
      </div>
    </div>

    <!-- Active Goals -->
    <div class="bg-card rounded-lg border p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Active Goals</p>
          <p class="text-2xl font-bold text-primary">{{ activeGoals }}</p>
        </div>
        <div class="text-2xl">🔥</div>
      </div>
    </div>

    <!-- Completed Goals -->
    <div class="bg-card rounded-lg border p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Completed</p>
          <p class="text-2xl font-bold text-green-600">{{ completedGoals }}</p>
        </div>
        <div class="text-2xl">✅</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Goal } from '../../types/goals.types'

interface Props {
  goals: Goal[]
}

const props = defineProps<Props>()

const totalGoals = computed(() => props.goals.length)
const activeGoals = computed(() => props.goals.filter(g => g.status === 'ACTIVE').length)
const completedGoals = computed(() => props.goals.filter(g => g.status === 'COMPLETED').length)
</script>

