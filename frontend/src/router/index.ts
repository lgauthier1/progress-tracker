/**
 * Vue Router Configuration
 * 
 * Application routing with authentication guards.
 * 
 * Constitution: TypeScript Strict Mode
 */

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('../views/HabitDetailTest.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/goals',
    name: 'Goals',
    component: () => import('../views/Goals.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/goals/:id',
    name: 'GoalDetail',
    component: () => import('../views/GoalDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/habits/:id',
    name: 'HabitDetail',
    component: () => import('../views/HabitDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/habits',
    name: 'Habits',
    component: () => import('../views/Habits.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/test-charts',
    name: 'ChartTest',
    component: () => import('../components/charts/ChartTest.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

console.log('Router created with routes:', routes.map(r => r.path))
console.log('Router has routes:', router.getRoutes().map(r => r.path))


// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  console.log('Router guard: navigating to', to.path, 'requiresAuth:', to.meta.requiresAuth)
  // Temporarily disable auth guard to test routing
  next()
})

export default router

