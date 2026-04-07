import { createRouter, createWebHashHistory } from 'vue-router' 
import { useAuthStore } from '../store/auth'

const router = createRouter({
  history: createWebHashHistory(), 
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/attendance',
      name: 'attendance',
      component: () => import('../views/Attendance.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/fitness-test',
      name: 'fitnessTest',
      component: () => import('../views/FitnessTest.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/Statistics.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('../views/Schedule.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/student-profile',
      name: 'studentProfile',
      component: () => import('../views/StudentProfile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/coach-management',
      name: 'coachManagement',
      component: () => import('../views/CoachManagement.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/super-admin',
      name: 'superAdmin',
      component: () => import('../views/SuperAdmin.vue'),
      meta: { requiresAuth: true, requiresSuperAdmin: true }
    }
  ]
})

// 路由守卫代码保持不变
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiresSuperAdmin = to.matched.some(record => record.meta.requiresSuperAdmin)

  if (requiresAuth && !authStore.isAuthenticated()) {
    next('/login')
  } else if (requiresSuperAdmin && !authStore.isSuperAdmin()) {
    next('/')
  } else if (requiresAdmin && !authStore.isAdmin()) {
    next('/')
  } else if (authStore.isSuperAdmin() && to.path === '/') {
    // 超级管理员访问首页时，重定向到超级管理页面
    next('/super-admin')
  } else {
    next()
  }
})

export default router