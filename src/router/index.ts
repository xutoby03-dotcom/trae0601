import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/pages/Dashboard.vue'), meta: { title: '工作台', icon: 'HomeFilled' } },
      { path: 'devices', name: 'Devices', component: () => import('@/pages/Devices.vue'), meta: { title: '设备档案', icon: 'IceCreamSquare', roles: ['manager', 'staff'] } },
      { path: 'tasks', name: 'Tasks', component: () => import('@/pages/Tasks.vue'), meta: { title: '消毒任务', icon: 'List', roles: ['manager', 'staff'] } },
      { path: 'tasks/:id/execute', name: 'TaskExecute', component: () => import('@/pages/TaskExecute.vue'), meta: { title: '执行消毒', hidden: true, roles: ['manager', 'staff'] } },
      { path: 'records', name: 'Records', component: () => import('@/pages/Records.vue'), meta: { title: '消毒记录', icon: 'Document', roles: ['manager', 'staff'] } },
      { path: 'records/:id', name: 'RecordDetail', component: () => import('@/pages/RecordDetail.vue'), meta: { title: '记录详情', hidden: true, roles: ['manager', 'staff'] } },
      { path: 'statistics', name: 'Statistics', component: () => import('@/pages/Statistics.vue'), meta: { title: '统计报表', icon: 'DataAnalysis', roles: ['manager'] } },
      { path: 'settings', redirect: '/settings/shifts' },
      { path: 'settings/shifts', name: 'SettingsShifts', component: () => import('@/pages/settings/Shifts.vue'), meta: { title: '班次配置', parent: '系统配置', icon: 'Clock', roles: ['manager'] } },
      { path: 'settings/disinfectant', name: 'SettingsDisinfectant', component: () => import('@/pages/settings/Disinfectant.vue'), meta: { title: '消毒液管理', parent: '系统配置', icon: 'MagicStick', roles: ['manager'] } },
      { path: 'settings/notification', name: 'SettingsNotification', component: () => import('@/pages/settings/Notification.vue'), meta: { title: '提醒设置', parent: '系统配置', icon: 'Bell', roles: ['manager'] } },
      { path: 'settings/users', name: 'SettingsUsers', component: () => import('@/pages/settings/Users.vue'), meta: { title: '员工管理', parent: '系统配置', icon: 'User', roles: ['manager'] } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.public) {
    if (to.path === '/login' && auth.isLoggedIn) {
      next('/dashboard')
    } else {
      next()
    }
    return
  }
  if (!auth.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  const roles = to.meta.roles as string[] | undefined
  if (roles && roles.length && !roles.includes(auth.currentUser!.role)) {
    next('/dashboard')
    return
  }
  next()
})

export default router
