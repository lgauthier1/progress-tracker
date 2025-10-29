<template>
  <div style="padding: 20px;">
    <h1>Habit Detail (Simple)</h1>
    <p>This is a test page</p>
    <p>Route params: {{ $route.params }}</p>
    <button @click="goBack">Go Back</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

console.log('HabitDetailSimple component loaded!')

const router = useRouter()

const goBack = () => {
  console.log('Going back to habits')
  router.push('/habits')
}
</script>
