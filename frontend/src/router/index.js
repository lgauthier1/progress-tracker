/**
 * Vue Router Configuration
 *
 * Application routing with authentication guards.
 *
 * Constitution: TypeScript Strict Mode
 */
import { createRouter, createWebHistory } from 'vue-router';
const routes = [
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
        path: '/goals/:id',
        name: 'GoalDetail',
        component: () => import('../views/GoalDetail.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/habits',
        name: 'Habits',
        component: () => import('../views/Habits.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/habits/:id',
        name: 'HabitDetail',
        component: () => import('../views/HabitDetail.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/test-charts',
        name: 'ChartTest',
        component: () => import('../components/charts/ChartTest.vue'),
        meta: { requiresAuth: true },
    },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});
// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
    const hasToken = localStorage.getItem('accessToken');
    const requiresAuth = to.meta.requiresAuth;
    if (requiresAuth && !hasToken) {
        // Redirect to login if route requires auth and user is not authenticated
        next('/login');
    }
    else if (!requiresAuth && hasToken && (to.path === '/login' || to.path === '/register')) {
        // Redirect to dashboard if already logged in and trying to access login/register
        next('/');
    }
    else {
        next();
    }
});
export default router;
//# sourceMappingURL=index.js.map