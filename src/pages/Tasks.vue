<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <div>
        <h2 class="page-title">消毒任务中心</h2>
        <p class="page-desc">按开店前、午间、打烊三个时段执行冰淇淋机消毒任务</p>
      </div>
      <div>
        <el-date-picker
          v-model="selectedDate" type="date" :clearable="false"
          value-format="YYYY-MM-DD" style="width: 180px;"
        />
      </div>
    </div>

    <el-radio-group v-model="filterStatus" class="status-tabs" size="large">
      <el-radio-button label="all">全部 ({{ dayTasks.length }})</el-radio-button>
      <el-radio-button label="pending">待执行 ({{ getStatusCount('pending') }})</el-radio-button>
      <el-radio-button label="in_progress">进行中 ({{ getStatusCount('in_progress') }})</el-radio-button>
      <el-radio-button label="completed">已完成 ({{ getStatusCount('completed') }})</el-radio-button>
      <el-radio-button label="expired">已逾期 ({{ getStatusCount('expired') }})</el-radio-button>
    </el-radio-group>

    <div class="timeline-wrap">
      <div v-for="slot in timeSlots" :key="slot.type" class="time-group">
        <div class="time-group-header">
          <div class="slot-badge" :style="{ background: slot.color }">
            <el-icon :size="16"><component :is="slot.icon" /></el-icon>
            <span>{{ slot.label }}</span>
          </div>
          <span class="slot-range">{{ slot.range }}</span>
          <el-divider class="slot-divider" />
        </div>

        <el-row :gutter="16" v-if="getSlotTasks(slot.type).length">
          <el-col v-for="task in getSlotTasks(slot.type)" :key="task.id" :xs="24" :sm="12" :lg="8">
            <el-card class="task-card card-shadow card-hover" shadow="never"
              :class="`status-${task.status}`">
              <div class="task-top">
                <div class="task-title">
                  <el-tag :type="getStatusTag(task.status)" effect="dark" size="small">
                    {{ TASK_STATUS_LABELS[task.status] }}
                  </el-tag>
                </div>
                <span class="task-time">{{ task.scheduledTime }}</span>
              </div>

              <h3 class="task-machine">{{ getDevice(task.deviceId)?.machineNo }}</h3>
              <p class="task-sub">{{ getDevice(task.deviceId)?.name }}</p>

              <el-progress
                :percentage="getStatusPercentage(task)" :stroke-width="8"
                :status="task.status === 'completed' ? 'success' : task.status === 'expired' ? 'exception' : undefined"
                :show-text="task.status === 'completed'"
                style="margin: 14px 0;"
              />

              <div class="task-meta">
                <div class="meta-item">
                  <el-icon :size="14"><User /></el-icon>
                  <span>{{ task.assigneeId ? getUser(task.assigneeId)?.name || '未指派' : '未指派' }}</span>
                </div>
                <div class="meta-item">
                  <el-icon :size="14"><Setting /></el-icon>
                  <span>{{ getDevice(task.deviceId)?.parts.length }} 零件</span>
                </div>
              </div>

              <div class="task-actions" style="margin-top: 14px;">
                <template v-if="task.status === 'pending' || task.status === 'in_progress'">
                  <el-button type="primary" size="small" :icon="VideoPlay" @click="executeTask(task)">
                    {{ task.status === 'pending' ? '开始执行' : '继续执行' }}
                  </el-button>
                </template>
                <template v-else-if="task.status === 'completed' && task.recordId">
                  <el-button type="success" size="small" plain :icon="View" @click="viewRecord(task.recordId!)">
                    查看记录
                  </el-button>
                </template>
                <template v-else-if="task.status === 'expired'">
                  <el-button type="warning" size="small" plain :icon="Refresh" @click="reExecute(task)" v-if="authStore.isManager">
                    重新执行
                  </el-button>
                  <el-tag type="danger" effect="light" size="small" v-else>已逾期</el-tag>
                </template>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-else description="此时段暂无任务" :image-size="70" style="margin: 20px 0;" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { VideoPlay, View, Refresh, User, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { genId } from '@/services/storage'
import type { Task, TaskStatus, ShiftType } from '@/types'
import { TASK_STATUS_LABELS } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const filterStatus = ref<TaskStatus | 'all'>('all')

const timeSlots = [
  { type: 'opening' as ShiftType, label: '开店前消毒', range: '07:30 - 08:30', color: 'linear-gradient(135deg, #1890ff, #40a9ff)', icon: 'Sunrise' },
  { type: 'midday' as ShiftType, label: '午间消毒', range: '12:30 - 13:30', color: 'linear-gradient(135deg, #13c2c2, #36cfc9)', icon: 'Sunny' },
  { type: 'closing' as ShiftType, label: '打烊消毒', range: '22:00 - 23:00', color: 'linear-gradient(135deg, #722ed1, #9254de)', icon: 'Moon' }
]

const dayTasks = computed(() => appStore.tasks.filter(t => t.taskDate === selectedDate.value))

function getSlotTasks(type: ShiftType) {
  let list = dayTasks.value.filter(t => t.timeSlot === type)
  if (filterStatus.value !== 'all') list = list.filter(t => t.status === filterStatus.value)
  return list
}

function getStatusCount(status: TaskStatus) {
  return dayTasks.value.filter(t => t.status === status).length
}

function getStatusTag(s: TaskStatus) {
  return s === 'completed' ? 'success' : s === 'pending' ? 'info' : s === 'in_progress' ? 'primary' : 'danger'
}

function getStatusPercentage(task: Task) {
  if (task.status === 'completed') return 100
  if (task.status === 'expired') return 0
  return task.status === 'in_progress' ? 40 : 0
}

function getDevice(id: string) { return appStore.getDevice(id) }
function getUser(id: string) { return appStore.getUser(id) }

function executeTask(task: Task) {
  router.push(`/tasks/${task.id}/execute`)
}
function viewRecord(rid: string) {
  router.push(`/records/${rid}`)
}

function reExecute(task: Task) {
  const newId = genId()
  const today = dayjs().format('YYYY-MM-DD')
  const isToday = task.taskDate === today
  const shift = appStore.getShift(task.shiftId)
  appStore.tasks.push({
    id: newId, deviceId: task.deviceId, shiftId: task.shiftId, disinfectantId: task.disinfectantId,
    name: `${getDevice(task.deviceId)?.machineNo} - ${shift?.name || ''}补消毒`,
    taskDate: isToday ? today : task.taskDate,
    timeSlot: task.timeSlot, scheduledTime: dayjs().format('HH:mm'),
    assigneeId: authStore.currentUser?.id,
    status: 'pending', createdAt: new Date().toISOString()
  })
  appStore.persist()
  ElMessage.success('已创建新的补消毒任务')
  if (!isToday) selectedDate.value = task.taskDate
}
</script>

<style scoped lang="css">
.status-tabs { margin-bottom: 24px; }

.timeline-wrap { display: flex; flex-direction: column; gap: 24px; }

.time-group-header {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 14px;
}

.slot-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 18px; border-radius: 22px;
  color: white; font-weight: 600; font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.slot-range {
  color: #909399; font-size: 13px;
}

.slot-divider {
  flex: 1; margin: 0;
}

.task-card {
  border-radius: 12px;
  padding: 6px;
  transition: all 0.25s;
  margin-bottom: 16px;
  border-top: 3px solid transparent;
}
.task-card.status-completed { border-top-color: #52c41a; }
.task-card.status-pending { border-top-color: #909399; }
.task-card.status-in_progress { border-top-color: #1890ff; }
.task-card.status-expired { border-top-color: #f5222d; }

.task-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
}

.task-time {
  font-size: 13px; color: #909399; font-weight: 500;
}

.task-machine {
  font-size: 18px; font-weight: 700; margin: 8px 0 2px;
}

.task-sub {
  font-size: 12px; color: var(--text-secondary); margin: 0;
}

.task-meta {
  display: flex; gap: 16px;
  font-size: 12px; color: #606266;
}
.meta-item { display: flex; align-items: center; gap: 4px; }
</style>
