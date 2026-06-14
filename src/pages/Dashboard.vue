<template>
  <div class="dashboard page-container">
    <div class="page-header">
      <h2 class="page-title">工作台</h2>
      <p class="page-desc">今日是 {{ todayStr }}，欢迎回来，{{ authStore.currentUser?.name }}！</p>
    </div>

    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card gradient-blue card-hover">
          <div class="flex-between">
            <el-icon class="stat-icon"><CircleCheck /></el-icon>
            <span class="trend up">{{ completionRate }}%</span>
          </div>
          <div class="stat-number">{{ appStore.completedTaskCount }}/{{ totalTodayTasks }}</div>
          <div class="stat-label">今日任务完成</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card gradient-orange card-hover">
          <div class="flex-between">
            <el-icon class="stat-icon"><Timer /></el-icon>
            <span class="trend" :class="appStore.pendingTaskCount > 0 ? 'down' : 'up'">{{ appStore.pendingTaskCount }} 待办</span>
          </div>
          <div class="stat-number">{{ appStore.pendingTaskCount }}</div>
          <div class="stat-label">待执行任务</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card gradient-red card-hover" v-if="abnormalCount > 0">
          <div class="flex-between">
            <el-icon class="stat-icon"><Warning /></el-icon>
            <span class="trend down">{{ abnormalCount }} 条</span>
          </div>
          <div class="stat-number">{{ abnormalCount }}</div>
          <div class="stat-label">异常/漏做记录</div>
        </div>
        <div class="stat-card gradient-green card-hover" v-else>
          <div class="flex-between">
            <el-icon class="stat-icon"><CircleCheckFilled /></el-icon>
            <span class="trend up">一切正常</span>
          </div>
          <div class="stat-number">0</div>
          <div class="stat-label">异常/漏做记录</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card" :class="warningDisinfectantCount > 0 ? 'gradient-orange card-hover' : 'gradient-green card-hover'">
          <div class="flex-between">
            <el-icon class="stat-icon"><MagicStick /></el-icon>
            <span class="trend" :class="warningDisinfectantCount > 0 ? 'down' : 'up'">{{ warningDisinfectantCount }} 预警</span>
          </div>
          <div class="stat-number">{{ totalDisinfectantStock.toFixed(1) }}</div>
          <div class="stat-label">消毒液库存 (L)</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="16">
        <el-card class="task-progress-card card-shadow" shadow="never">
          <template #header>
            <div class="flex-between">
              <span class="card-title"><el-icon><List /></el-icon>&nbsp;今日消毒任务进度</span>
              <el-button type="primary" link @click="router.push('/tasks')">查看全部 →</el-button>
            </div>
          </template>

          <el-steps :active="progressStep" finish-status="success" process-status="process" simple class="time-steps">
            <el-step title="开店前" :description="`${getShiftTaskCount('opening')}台机器`" />
            <el-step title="午间" :description="`${getShiftTaskCount('midday')}台机器`" />
            <el-step title="打烊" :description="`${getShiftTaskCount('closing')}台机器`" />
          </el-steps>

          <div class="time-slot-sections">
            <div v-for="slot in timeSlots" :key="slot.type" class="time-slot-block">
              <div class="slot-header">
                <div class="slot-title">
                  <span class="slot-tag" :style="{ background: slot.color }">{{ slot.label }}</span>
                  <span class="slot-time">{{ slot.timeRange }}</span>
                </div>
                <el-tag :type="getStatusTagType(slot.status)" effect="light">{{ slot.statusText }}</el-tag>
              </div>
              <div class="task-mini-list">
                <div
                  v-for="task in getSlotTasks(slot.type)"
                  :key="task.id"
                  class="task-mini-item"
                  @click="openTask(task)"
                >
                  <div class="task-mini-left">
                    <el-tag :type="task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'primary' : task.status === 'expired' ? 'danger' : 'info'" size="small" effect="dark">
                      {{ statusLabels[task.status] }}
                    </el-tag>
                    <span class="task-machine">{{ getDeviceNo(task.deviceId) }}</span>
                    <span class="task-assignee" v-if="task.assigneeId">{{ getUser(task.assigneeId)?.name }}</span>
                  </div>
                  <div class="task-mini-right">
                    <span v-if="task.status === 'pending' && (authStore.isStaff || authStore.isManager)" class="action-link">
                      <el-icon><VideoPlay /></el-icon> 执行
                    </span>
                    <el-icon v-if="task.status === 'completed'" color="#52c41a"><CircleCheckFilled /></el-icon>
                  </div>
                </div>
                <el-empty v-if="!getSlotTasks(slot.type).length" description="暂无任务" :image-size="60" />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card class="card-shadow quick-card" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><Lightning /></el-icon>&nbsp;快捷操作</span>
          </template>
          <div class="quick-grid">
            <div class="quick-item" @click="router.push('/tasks')">
              <div class="quick-icon blue"><el-icon :size="22"><VideoPlay /></el-icon></div>
              <span>执行消毒</span>
            </div>
            <div class="quick-item" @click="router.push('/devices')">
              <div class="quick-icon green"><el-icon :size="22"><IceCreamSquare /></el-icon></div>
              <span>设备档案</span>
            </div>
            <div class="quick-item" @click="router.push('/records')">
              <div class="quick-icon orange"><el-icon :size="22"><Document /></el-icon></div>
              <span>消毒记录</span>
            </div>
            <div class="quick-item" v-if="authStore.isManager" @click="router.push('/statistics')">
              <div class="quick-icon purple"><el-icon :size="22"><DataAnalysis /></el-icon></div>
              <span>统计报表</span>
            </div>
          </div>
        </el-card>

        <el-card class="card-shadow warning-card" shadow="never">
          <template #header>
            <div class="flex-between">
              <span class="card-title"><el-icon><Bell /></el-icon>&nbsp;最新提醒</span>
              <el-badge :value="appStore.unreadNotificationCount" :max="99" class="header-badge" />
            </div>
          </template>
          <div class="recent-notifies">
            <div
              v-for="n in recentNotifies"
              :key="n.id"
              class="recent-notify-item"
              :class="{ unread: !n.read }"
              @click="openNotify(n)"
            >
              <div class="rn-icon" :class="n.type">
                <el-icon v-if="n.type === 'missed'"><WarningFilled /></el-icon>
                <el-icon v-else-if="n.type === 'abnormal'"><Warning /></el-icon>
                <el-icon v-else><InfoFilled /></el-icon>
              </div>
              <div class="rn-body">
                <p class="rn-title text-truncate">{{ n.title }}</p>
                <p class="rn-time">{{ formatTime(n.createdAt) }}</p>
              </div>
            </div>
            <el-empty v-if="!recentNotifies.length" description="暂无提醒" :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20" v-if="weekTrend.length">
      <el-col :span="24">
        <el-card class="card-shadow" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><TrendCharts /></el-icon>&nbsp;近7日消毒完成率趋势</span>
          </template>
          <div ref="chartRef" style="height: 280px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import type { Task, Notification, ShiftType, TaskStatus } from '@/types'
import { TASK_STATUS_LABELS, TIME_SLOT_LABELS } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const todayStr = computed(() => dayjs().format('YYYY年MM月DD日 dddd'))
const totalTodayTasks = computed(() => appStore.todayTasks.length)
const completionRate = computed(() => totalTodayTasks.value ? Math.round((appStore.completedTaskCount / totalTodayTasks.value) * 100) : 0)
const abnormalCount = computed(() => appStore.abnormalRecords.filter(r => dayjs(r.recordDate).isSame(dayjs(), 'day')).length + appStore.expiredTaskCount)
const totalDisinfectantStock = computed(() => appStore.disinfectants.reduce((s, d) => s + d.stock, 0))
const warningDisinfectantCount = computed(() => appStore.disinfectants.filter(d => {
  const r = appStore.checkDisinfectantValid(d.id)
  return !r.valid || r.warning
}).length)

const statusLabels: { [k in TaskStatus]: string } = TASK_STATUS_LABELS

const timeSlots = computed(() => ([
  { type: 'opening' as ShiftType, label: TIME_SLOT_LABELS.opening, timeRange: '07:30 - 08:30', color: '#1890ff', status: getSlotStatus('opening'), statusText: getSlotStatusText('opening') },
  { type: 'midday' as ShiftType, label: TIME_SLOT_LABELS.midday, timeRange: '12:30 - 13:30', color: '#13c2c2', status: getSlotStatus('midday'), statusText: getSlotStatusText('midday') },
  { type: 'closing' as ShiftType, label: TIME_SLOT_LABELS.closing, timeRange: '22:00 - 23:00', color: '#722ed1', status: getSlotStatus('closing'), statusText: getSlotStatusText('closing') }
]))

function getShiftTaskCount(type: ShiftType) {
  return appStore.todayTasks.filter(t => t.timeSlot === type).length
}
function getSlotTasks(type: ShiftType) {
  return appStore.todayTasks.filter(t => t.timeSlot === type)
}
function getSlotStatus(type: ShiftType) {
  const tasks = getSlotTasks(type)
  if (!tasks.length) return 'empty'
  if (tasks.every(t => t.status === 'completed')) return 'completed'
  if (tasks.some(t => t.status === 'in_progress' || t.status === 'pending')) return 'process'
  return 'wait'
}
function getSlotStatusText(type: ShiftType) {
  const s = getSlotStatus(type)
  return s === 'completed' ? '已完成' : s === 'process' ? '进行中' : s === 'wait' ? '待开始' : '无任务'
}
function getStatusTagType(s: string) {
  return s === 'completed' ? 'success' : s === 'process' ? 'primary' : 'info'
}

const progressStep = computed(() => {
  let step = 0
  if (getSlotStatus('opening') === 'completed') step = 1
  if (getSlotStatus('opening') === 'completed' && (getSlotStatus('midday') === 'completed' || getSlotStatus('midday') === 'process')) step = 2
  if (getSlotStatus('opening') === 'completed' && getSlotStatus('midday') === 'completed') step = 3
  return step
})

function getDeviceNo(id: string) { return appStore.getDevice(id)?.machineNo || id }
function getUser(id: string) { return appStore.getUser(id) }

function openTask(task: Task) {
  if (task.status === 'pending' || task.status === 'in_progress') {
    router.push(`/tasks/${task.id}/execute`)
  } else if (task.recordId) {
    router.push(`/records/${task.recordId}`)
  }
}

const recentNotifies = computed(() => appStore.notifications.slice(0, 5))
function formatTime(s: string) { return dayjs(s).format('MM-DD HH:mm') }
function openNotify(n: Notification) {
  if (!n.read) appStore.markNotificationRead(n.id)
  if (n.relatedType === 'record' && n.relatedId) router.push(`/records/${n.relatedId}`)
}

const weekTrend = computed(() => {
  const arr = []
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    const tasks = appStore.tasks.filter(t => t.taskDate === d)
    const completed = tasks.filter(t => t.status === 'completed').length
    const rate = tasks.length ? Math.round((completed / tasks.length) * 100) : (i === 0 ? 0 : 100)
    arr.push({ date: dayjs(d).format('MM/DD'), rate, completed, total: tasks.length })
  }
  return arr
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

function renderChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category', data: weekTrend.value.map(w => w.date),
      axisLine: { lineStyle: { color: '#e4e7ed' } }, axisLabel: { color: '#606266' }
    },
    yAxis: {
      type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: '#606266' },
      splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } }
    },
    series: [{
      name: '完成率', type: 'line', smooth: true, symbol: 'circle', symbolSize: 10,
      data: weekTrend.value.map(w => w.rate),
      lineStyle: { width: 3, color: '#1890ff' },
      itemStyle: { color: '#1890ff', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 144, 255, 0.35)' },
          { offset: 1, color: 'rgba(24, 144, 255, 0.02)' }
        ])
      },
      label: { show: true, formatter: '{c}%', color: '#1890ff', fontWeight: 600, fontSize: 12, position: 'top' }
    }]
  })
}

onMounted(() => {
  nextTick(() => setTimeout(renderChart, 100))
  window.addEventListener('resize', () => chart?.resize())
})

watch(weekTrend, () => nextTick(renderChart), { deep: true })
</script>

<style scoped lang="css">
.stat-row { margin-bottom: 4px; }
.stat-card {
  padding: 20px 22px;
  border-radius: 12px;
  color: #fff;
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
  min-height: 120px;
}

.stat-card::after {
  content: '';
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.trend {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}
.trend.up { background: rgba(82, 196, 26, 0.25); }
.trend.down { background: rgba(245, 34, 45, 0.25); }

.stat-number {
  font-size: 34px;
  font-weight: 700;
  margin: 10px 0 4px;
  line-height: 1.1;
}
.stat-label { font-size: 13px; opacity: 0.9; }

.mt-20 { margin-top: 20px; }

.card-title {
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-steps { padding: 12px 10px 20px; }

.time-slot-sections { display: flex; flex-direction: column; gap: 12px; }

.time-slot-block {
  padding: 14px 16px;
  background: #fafbfc;
  border-radius: 10px;
  border: 1px solid #f0f2f5;
}

.slot-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
}

.slot-title { display: flex; align-items: center; gap: 10px; }
.slot-tag {
  color: white; padding: 2px 12px; border-radius: 12px;
  font-size: 12px; font-weight: 600;
}
.slot-time { color: #909399; font-size: 12px; }

.task-mini-list { display: flex; flex-direction: column; gap: 8px; }

.task-mini-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; background: white; border-radius: 8px;
  border: 1px solid var(--border-color); cursor: pointer;
  transition: all 0.2s;
}
.task-mini-item:hover { border-color: var(--primary-color); box-shadow: 0 2px 8px rgba(24, 144, 255, 0.12); }

.task-mini-left { display: flex; align-items: center; gap: 10px; }
.task-machine { font-weight: 600; font-size: 13px; }
.task-assignee { color: #606266; font-size: 12px; }

.action-link {
  color: var(--primary-color); font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 2px;
}

.quick-card { margin-bottom: 16px; }
.quick-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
}
.quick-item {
  padding: 16px; border-radius: 10px; border: 1px solid var(--border-color);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  cursor: pointer; transition: all 0.25s; background: #fafbfc;
}
.quick-item:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); background: white; }

.quick-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; color: white;
}
.quick-icon.blue { background: linear-gradient(135deg, #1890ff, #69c0ff); }
.quick-icon.green { background: linear-gradient(135deg, #52c41a, #95de64); }
.quick-icon.orange { background: linear-gradient(135deg, #fa8c16, #ffc069); }
.quick-icon.purple { background: linear-gradient(135deg, #722ed1, #b37feb); }

.warning-card .header-badge :deep(.el-badge__content) { border: none; transform: translateX(-20px) translateY(-4px); }

.recent-notifies { display: flex; flex-direction: column; }
.recent-notify-item {
  display: flex; gap: 10px; padding: 10px 0;
  border-bottom: 1px solid #f0f2f5; cursor: pointer;
}
.recent-notify-item:last-child { border-bottom: none; }
.recent-notify-item.unread { background: rgba(24, 144, 255, 0.04); margin: 0 -12px; padding: 10px 12px; border-radius: 6px; }

.rn-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: white;
}
.rn-icon.missed { background: #ffccc7; color: #f5222d; }
.rn-icon.abnormal { background: #ffe7ba; color: #fa8c16; }
.rn-icon.info, .rn-icon { background: #bae7ff; color: #1890ff; }

.rn-title { margin: 0; font-size: 13px; font-weight: 500; }
.rn-time { margin: 2px 0 0; font-size: 11px; color: #909399; }
</style>
