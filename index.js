import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/workbench',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'DataBoard' }
      },
      {
        path: 'doctor-dashboard',
        name: 'DoctorDashboard',
        component: () => import('@/views/DoctorDashboard.vue'),
        meta: { title: '医师工作台', icon: 'UserFilled', role: 'doctor' }
      },
      {
        path: 'pharmacist-dashboard',
        name: 'PharmacistDashboard',
        component: () => import('@/views/PharmacistDashboard.vue'),
        meta: { title: '药师工作台', icon: 'UserFilled', role: 'pharmacist' }
      },
      {
        path: 'patients',
        name: 'Patients',
        component: () => import('@/views/Patients.vue'),
        meta: { title: '患者管理', icon: 'User' }
      },
      {
        path: 'prescriptions',
        name: 'Prescriptions',
        component: () => import('@/views/Prescriptions.vue'),
        meta: { title: '处方管理', icon: 'Document' }
      },
      {
        path: 'workbench',
        name: 'Workbench',
        component: () => import('@/views/Workbench.vue'),
        meta: { title: '工单工作台', icon: 'Monitor' }
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/Chat.vue'),
        meta: { title: '聊天系统', icon: 'ChatDotRound' }
      },
      {
        path: 'followup',
        name: 'FollowUp',
        component: () => import('@/views/FollowUp.vue'),
        meta: { title: '随访管理', icon: 'Bell' }
      },
      {
        path: 'followup/:id',
        name: 'FollowUpDetail',
        component: () => import('@/views/FollowUpDetail.vue'),
        meta: { title: '随访详情', icon: 'Document' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人资料', icon: 'UserFilled' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 舟山分岛医疗系统` : '舟山分岛医疗系统'
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    // 已登录用户访问登录页，根据角色重定向到对应的工作台
    console.log('已登录用户访问登录页，根据角色重定向到对应的工作台')
    if (userStore.isDoctor) {
      next('/doctor-dashboard')
    } else if (userStore.isPharmacist) {
      next('/pharmacist-dashboard')
    } else {
      next('/workbench')
    }
  } else if (to.path === '/' && userStore.isLoggedIn) {
    // 根路径根据角色重定向到对应的工作台
    if (userStore.isDoctor) {
      next('/doctor-dashboard')
    } else if (userStore.isPharmacist) {
      next('/pharmacist-dashboard')
    } else {
      next('/workbench')
    }
  } else if (to.path === '/dashboard' && userStore.isLoggedIn) {
    // 如果访问dashboard但已登录，根据角色重定向到对应的工作台
    console.log('访问dashboard，根据角色重定向到对应的工作台')
    if (userStore.isDoctor) {
      next('/doctor-dashboard')
    } else if (userStore.isPharmacist) {
      next('/pharmacist-dashboard')
    } else {
      next('/workbench')
    }
  } else if (to.meta.role && to.meta.role !== userStore.userRole) {
    // 检查角色权限 - 如果角色不匹配，重定向到对应的工作台
    console.log('角色权限检查:', to.meta.role, userStore.userRole)
    if (userStore.isDoctor) {
      next('/doctor-dashboard')
    } else if (userStore.isPharmacist) {
      next('/pharmacist-dashboard')
    } else {
      next('/workbench')
    }
  } else {
    next()
  }
})

export default router


