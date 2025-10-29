<template>
  <div style="padding: 20px; background: white; min-height: 100vh;">
    <h1 style="color: black;">Habit Detail Test</h1>
    <p style="color: black;">This is working!</p>
    <p style="color: black;">Route params: {{ $route.params }}</p>
    <button @click="goBack" style="padding: 10px; background: blue; color: white; border: none; cursor: pointer;">Go Back</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

console.log('HabitDetailTest component loaded!')

const router = useRouter()

const goBack = () => {
  console.log('Going back to habits')
  router.push('/habits')
}
</script>
