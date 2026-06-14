<template>
  <el-container class="main-layout">
    <el-aside :width="collapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo-area">
        <div class="logo-icon">
          <el-icon :size="24" color="#ffc53d"><IceCreamRound /></el-icon>
        </div>
        <span v-show="!collapsed" class="logo-text">消毒管理系统</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        router
        background-color="transparent"
        text-color="rgba(255,255,255,0.75)"
        active-text-color="#40a9ff"
        class="side-menu"
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item v-if="!item.children" :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
          <el-sub-menu v-else :index="item.path">
            <template #title>
              <el-icon><component :is="item.children[0].icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
              :disabled="child.roles && !child.roles.includes(currentRole)"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>

      <div class="collapse-btn" @click="collapsed = !collapsed">
        <el-icon :size="18"><component :is="collapsed ? 'ArrowRight' : 'ArrowLeft'" /></el-icon>
      </div>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(item, idx) in breadcrumbs" :key="idx">
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-popover
            placement="bottom-end"
            :width="380"
            trigger="click"
            popper-class="notify-popover"
            @show="handleNotifyShow"
          >
            <template #reference>
              <el-badge :value="appStore.unreadNotificationCount" :max="99" class="notify-badge">
                <el-button text class="header-icon-btn">
                  <el-icon :size="20"><Bell /></el-icon>
                </el-button>
              </el-badge>
            </template>
            <div class="notify-panel">
              <div class="notify-header">
                <span>消息通知</span>
                <el-link type="primary" :underline="false" @click="clearAllNotify">全部已读</el-link>
              </div>
              <div class="notify-list" v-if="appStore.notifications.length">
                <div
                  v-for="n in appStore.notifications.slice(0, 8)"
                  :key="n.id"
                  class="notify-item"
                  :class="{ unread: !n.read, missed: n.type === 'missed', abnormal: n.type === 'abnormal' }"
                  @click="openNotify(n)"
                >
                  <div class="notify-icon">
                    <el-icon v-if="n.type === 'missed'" color="#f5222d"><WarningFilled /></el-icon>
                    <el-icon v-else-if="n.type === 'abnormal'" color="#fa8c16"><Warning /></el-icon>
                    <el-icon v-else color="#1890ff"><InfoFilled /></el-icon>
                  </div>
                  <div class="notify-content">
                    <p class="notify-title">{{ n.title }}</p>
                    <p class="notify-desc text-truncate">{{ n.content }}</p>
                    <p class="notify-time">{{ formatTime(n.createdAt) }}</p>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无通知消息" :image-size="80" />
            </div>
          </el-popover>

          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="34" :style="{ background: userAvatarBg }">
                {{ authStore.currentUser?.name?.charAt(0) }}
              </el-avatar>
              <div class="user-detail">
                <span class="user-name">{{ authStore.currentUser?.name }}</span>
                <span class="user-role">{{ roleLabel }}</span>
              </div>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <el-icon><User /></el-icon>&nbsp; 账号：{{ authStore.currentUser?.username }}
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>&nbsp; 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import type { Notification } from '@/types'
import {
  IceCreamRound, ArrowLeft, ArrowRight, Bell, ArrowDown,
  HomeFilled, List, Document, DataAnalysis, Clock, MagicStick, User
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const collapsed = ref(false)

const currentRole = computed(() => authStore.currentUser?.role || '')
const roleLabel = computed(() => currentRole.value === 'manager' ? '店长' : '员工')
const userAvatarBg = computed(() => currentRole.value === 'manager'
  ? 'linear-gradient(135deg, #ff7a45, #fa8c16)'
  : 'linear-gradient(135deg, #1890ff, #40a9ff)')

const activeMenu = computed(() => route.path)

interface MenuItem {
  path: string
  title: string
  icon?: string
  roles?: string[]
  children?: MenuItem[]
}

const menuItems = computed<MenuItem[]>(() => {
  const all: MenuItem[] = [
    { path: '/dashboard', title: '工作台', icon: 'HomeFilled', roles: ['manager', 'staff'] },
    { path: '/devices', title: '设备档案', icon: 'IceCreamSquare', roles: ['manager', 'staff'] },
    { path: '/tasks', title: '消毒任务', icon: 'List', roles: ['manager', 'staff'] },
    { path: '/records', title: '消毒记录', icon: 'Document', roles: ['manager', 'staff'] }
  ]
  if (currentRole.value === 'manager') {
    all.push({
      path: '/statistics', title: '统计报表', icon: 'DataAnalysis', roles: ['manager']
    })
    all.push({
      path: '/settings', title: '系统配置',
      children: [
        { path: '/settings/shifts', title: '班次配置', icon: 'Clock', roles: ['manager'] },
        { path: '/settings/disinfectant', title: '消毒液管理', icon: 'MagicStick', roles: ['manager'] },
        { path: '/settings/notification', title: '提醒设置', icon: 'Bell', roles: ['manager'] },
        { path: '/settings/users', title: '员工管理', icon: 'User', roles: ['manager'] }
      ]
    })
  }
  return all.filter(item => {
    if (item.roles && item.roles.length && !item.roles.includes(currentRole.value)) return false
    return true
  })
})

const breadcrumbs = computed(() => {
  const meta = route.meta
  const crumbs = ['首页']
  if (meta.parent) crumbs.push(meta.parent as string)
  if (meta.title) crumbs.push(meta.title as string)
  return crumbs
})

function formatTime(s: string) {
  return dayjs(s).format('MM-DD HH:mm')
}

function handleNotifyShow() {
  // do nothing, leave for individual click
}

function clearAllNotify() {
  appStore.markAllNotificationsRead()
}

function openNotify(n: Notification) {
  if (!n.read) appStore.markNotificationRead(n.id)
  if (n.relatedType === 'record' && n.relatedId) {
    router.push(`/records/${n.relatedId}`)
  }
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    authStore.logout()
    router.replace('/login')
  }).catch(() => {})
}
</script>

<style scoped lang="css">
.main-layout {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.sidebar {
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  transition: width 0.25s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.logo-area {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  color: white;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.side-menu {
  flex: 1;
  border-right: none;
  padding-top: 8px;
}

.side-menu :deep(.el-menu-item),
.side-menu :deep(.el-sub-menu__title) {
  height: 46px;
  line-height: 46px;
  margin: 2px 8px;
  border-radius: 8px;
}

.side-menu :deep(.el-menu-item:hover),
.side-menu :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.06);
}

.side-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(24, 144, 255, 0.22) 0%, rgba(24, 144, 255, 0.04) 100%);
  color: #69c0ff !important;
}

.collapse-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}

.collapse-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.04);
}

.header {
  height: 64px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon-btn {
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
}

.header-icon-btn:hover {
  background: var(--bg-body);
  color: var(--primary-color);
}

.notify-badge :deep(.el-badge__content) {
  border: none;
  transform: translateX(-4px) translateY(4px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 4px;
  border-radius: 32px;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--text-secondary);
  font-size: 13px;
}

.user-info:hover {
  background: var(--bg-body);
}

.user-detail {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 13px;
}

.user-role {
  font-size: 11px;
  color: var(--text-placeholder);
}

.main-content {
  padding: 0;
  background: var(--bg-body);
  overflow: auto;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.notify-popover :deep(.el-popover__content) {
  padding: 0;
  max-height: 460px;
  overflow: hidden;
}

.notify-panel {
  max-height: 460px;
  display: flex;
  flex-direction: column;
}

.notify-header {
  padding: 14px 18px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.notify-list {
  flex: 1;
  overflow: auto;
  max-height: 380px;
}

.notify-item {
  display: flex;
  gap: 12px;
  padding: 12px 18px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.notify-item:hover {
  background: #f9fafc;
}

.notify-item.unread {
  background: #e6f4ff;
}

.notify-item.missed .notify-title { color: var(--error-color); }
.notify-item.abnormal .notify-title { color: var(--warning-color); }

.notify-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notify-content {
  flex: 1;
  min-width: 0;
}

.notify-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 4px;
}

.notify-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 4px;
}

.notify-time {
  font-size: 11px;
  color: var(--text-placeholder);
  margin: 0;
}
</style>
