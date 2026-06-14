<template>
  <div class="execute-page page-container" v-if="task && device">
    <div class="page-header flex-between">
      <div>
        <el-button link :icon="ArrowLeft" @click="router.back()" style="padding: 0 0 4px 0; color: #909399;">返回任务列表</el-button>
        <h2 class="page-title" style="margin-top: 6px;">执行消毒 · {{ task.name }}</h2>
        <p class="page-desc">
          设备：{{ device.machineNo }} {{ device.name }} | 
          时段：{{ TIME_SLOT_LABELS[task.timeSlot] }} |
          班次时间：{{ getShiftRange(task.shiftId) }}
        </p>
      </div>
      <div class="header-right">
        <el-tag :type="checkRes.valid ? (checkRes.warning ? 'warning' : 'success') : 'danger'" effect="light" size="large">
          <el-icon style="margin-right: 4px;"><MagicStick /></el-icon>
          消毒液：{{ disinfectant?.name }} 
          <span v-if="!checkRes.valid">已过期</span>
          <span v-else-if="checkRes.warning">即将过期（剩{{ checkRes.daysLeft }}天）</span>
          <span v-else>在效期内（剩{{ checkRes.daysLeft }}天）</span>
        </el-tag>
        <div class="elapsed-time">
          <el-icon><Timer /></el-icon>
          已用时 {{ elapsedTimeStr }}
        </div>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <el-card class="steps-card card-shadow" shadow="never">
          <template #header>
            <div class="flex-between">
              <span class="card-title">
                <el-icon><List /></el-icon>&nbsp;逐项消毒确认
                <span style="color: #909399; font-size: 13px; font-weight: 400; margin-left: 8px;">
                  已完成 {{ completedCount }} / {{ device.parts.length }} 项
                </span>
              </span>
              <el-progress :percentage="completionRate" :status="completionRate === 100 ? 'success' : undefined" style="width: 200px;" />
            </div>
          </template>

          <div class="parts-list">
            <div
              v-for="part in device.parts"
              :key="part.id"
              class="part-item"
              :class="{ active: activePartId === part.id, done: isPartDone(part.id) }"
              @click="activePartId = part.id"
            >
              <div class="part-index">
                <div class="index-badge" :class="isPartDone(part.id) ? 'done' : ''">
                  <el-icon v-if="isPartDone(part.id)" :size="14"><Check /></el-icon>
                  <span v-else>{{ part.sortOrder }}</span>
                </div>
              </div>
              <div class="part-body">
                <div class="part-main">
                  <div class="part-title">
                    <span class="part-name">{{ part.name }}</span>
                    <el-tag size="small" effect="plain" :color="categoryColor(part.category)" style="margin-left: 8px;">
                      {{ part.category }}
                    </el-tag>
                    <el-tag v-if="part.required" type="danger" size="small" effect="dark" style="margin-left: 6px;">必检</el-tag>
                  </div>
                  <p class="part-desc" v-if="part.description">{{ part.description }}</p>
                </div>

                <div class="part-check" @click.stop="togglePart(part.id)">
                  <el-checkbox
                    :model-value="isPartDone(part.id)"
                    size="large"
                    style="--el-checkbox-size: 24px;"
                  />
                </div>
              </div>

              <div class="part-upload" v-show="activePartId === part.id">
                <div class="upload-header">
                  <span><el-icon><Camera /></el-icon>&nbsp;上传照片</span>
                  <span style="color: #909399; font-size: 12px;">(可选，上传完成/异常情况照片)</span>
                </div>
                <el-upload
                  list-type="picture-card"
                  :auto-upload="false"
                  :show-file-list="true"
                  :file-list="getPartPhotos(part.id)"
                  :on-change="createPhotoHandler('change', part.id)"
                  :on-remove="createPhotoHandler('remove', part.id)"
                  accept="image/*"
                  multiple
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="card-shadow info-card" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><InfoFilled /></el-icon>&nbsp;执行信息</span>
          </template>
          <div class="info-block">
            <div class="info-row"><span>执行人</span><strong>{{ authStore.currentUser?.name }}</strong></div>
            <div class="info-row"><span>执行开始</span><strong>{{ startTimeStr }}</strong></div>
            <div class="info-row"><span>消毒液型号</span><strong>{{ disinfectant?.model }}</strong></div>
            <div class="info-row"><span>生产厂家</span><strong>{{ disinfectant?.manufacturer }}</strong></div>
            <div class="info-row"><span>有效期至</span>
              <strong :style="{ color: !checkRes.valid ? '#f5222d' : checkRes.warning ? '#fa8c16' : undefined }">
                {{ disinfectant?.expireDate }}
              </strong>
            </div>
            <div class="info-row"><span>预计用量</span><strong>{{ disinfectant?.unitConsumption }} mL</strong></div>
          </div>
        </el-card>

        <el-card class="card-shadow submit-card" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><EditPen /></el-icon>&nbsp;备注说明</span>
          </template>
          <el-input
            v-model="remark"
            type="textarea" :rows="4" maxlength="300" show-word-limit
            placeholder="如有漏做步骤、异常情况请详细说明..."
          />
        </el-card>
      </el-col>
    </el-row>

    <div class="submit-bar">
      <div class="submit-tip">
        <template v-if="!checkRes.valid">
          <el-icon color="#f5222d"><CircleCloseFilled /></el-icon>
          <span style="color: #f5222d; font-weight: 600;">消毒液已过期，请更换消毒液后再提交！</span>
        </template>
        <template v-else-if="completionRate < 100">
          <el-icon color="#fa8c16"><Warning /></el-icon>
          <span>尚有 <strong>{{ device.parts.length - completedCount }}</strong> 项未完成，提交后将记录漏做并通知店长</span>
        </template>
        <template v-else>
          <el-icon color="#52c41a"><CircleCheckFilled /></el-icon>
          <span>所有项目已完成，可以提交记录</span>
        </template>
      </div>
      <div class="submit-actions">
        <el-button size="large" @click="router.back()">暂存返回</el-button>
        <el-button
          type="primary" size="large"
          :loading="submitting"
          :disabled="!checkRes.valid"
          :icon="Check"
          @click="handleSubmit"
        >
          提交消毒记录
        </el-button>
      </div>
    </div>
  </div>
  <el-empty v-else description="任务不存在或已删除" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Timer, MagicStick, List, Check, Camera, Plus, InfoFilled, EditPen,
  Warning, CircleCheckFilled, CircleCloseFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { genId } from '@/services/storage'
import type { Task, Device, Disinfectant, RecordItem, RecordPhoto } from '@/types'
import { TIME_SLOT_LABELS } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const taskId = route.params.id as string
const task = ref<Task | null>(null)
const device = ref<Device | null>(null)
const disinfectant = ref<Disinfectant | null>(null)
const startTime = ref(dayjs())
const elapsedSeconds = ref(0)
let timer: number | null = null

const completedParts = reactive<Set<string>>(new Set())
const photosMap = reactive<Record<string, { url: string; name: string }[]>>({})
const activePartId = ref('')
const remark = ref('')
const submitting = ref(false)

const elapsedTimeStr = computed(() => {
  const h = Math.floor(elapsedSeconds.value / 3600)
  const m = Math.floor((elapsedSeconds.value % 3600) / 60)
  const s = elapsedSeconds.value % 60
  return `${h ? h + '时' : ''}${m}分${s}秒`
})
const startTimeStr = computed(() => startTime.value.format('YYYY-MM-DD HH:mm:ss'))

const completedCount = computed(() => completedParts.size)
const completionRate = computed(() => device.value ? Math.round((completedCount.value / device.value.parts.length) * 100) : 0)
const checkRes = computed(() => disinfectant.value ? appStore.checkDisinfectantValid(disinfectant.value.id) : { valid: false, warning: true, daysLeft: -1 })

function getShiftRange(sid: string) {
  const s = appStore.getShift(sid)
  return s ? `${s.startTime} ~ ${s.endTime}` : '-'
}
function categoryColor(cat: string) {
  const map: Record<string, string> = { '缸体': '#bae7ff', '出料': '#d9f7be', '搅拌': '#ffd591', '接水': '#ffe7ba', '外壳': '#e0e0e0' }
  return map[cat] || '#f0f0f0'
}

function isPartDone(pid: string) { return completedParts.has(pid) }
function togglePart(pid: string) {
  if (completedParts.has(pid)) completedParts.delete(pid)
  else completedParts.add(pid)
}
function getPartPhotos(pid: string) {
  return photosMap[pid] || []
}
interface UploadFile { name: string; raw: File; url?: string }
function createPhotoHandler(type: 'change' | 'remove', partId: string) {
  return (file: UploadFile) => {
    if (type === 'change') handlePhotoChange(partId, file)
    else handlePhotoRemove(partId, file)
  }
}
function handlePhotoChange(pid: string, file: UploadFile) {
  const reader = new FileReader()
  reader.onload = (e: ProgressEvent<FileReader>) => {
    if (!photosMap[pid]) photosMap[pid] = []
    photosMap[pid].push({ url: e.target?.result as string, name: file.name })
  }
  reader.readAsDataURL(file.raw)
}
function handlePhotoRemove(pid: string, file: UploadFile) {
  const arr = photosMap[pid]
  if (!arr) return
  const idx = arr.findIndex(p => p.name === file.name)
  if (idx >= 0) arr.splice(idx, 1)
}

async function handleSubmit() {
  if (!task.value || !device.value || !disinfectant.value) return
  if (!checkRes.value.valid) { ElMessage.error('消毒液已过期，无法提交'); return }

  const hasMissed = completionRate.value < 100
  const confirmMsg = hasMissed
    ? `当前完成率 ${completionRate.value}%，尚有 ${device.value.parts.length - completedCount.value} 项未完成。\n提交后系统将记录漏做情况并自动通知店长，是否确认？`
    : '确认提交本次消毒记录？提交后不可修改。'

  try {
    await ElMessageBox.confirm(confirmMsg, hasMissed ? '存在未完成项' : '提交确认', {
      type: hasMissed ? 'warning' : 'info',
      confirmButtonText: hasMissed ? '确认提交并通知店长' : '确认提交',
      cancelButtonText: '取消'
    })
  } catch { return }

  submitting.value = true
  try {
    const endTime = dayjs()
    const items: Omit<RecordItem, 'id' | 'recordId'>[] = device.value.parts.map(p => ({
      partId: p.id, partName: p.name, category: p.category,
      completed: isPartDone(p.id),
      sortOrder: p.sortOrder
    }))
    const doneItems = items.filter(i => i.completed).length
    const allPhotos: Omit<RecordPhoto, 'id' | 'recordId'>[] = []
    Object.entries(photosMap).forEach(([pid, arr]) => {
      arr.forEach(p => {
        allPhotos.push({
          partId: pid, url: p.url, type: hasMissed && !isPartDone(pid) ? 'abnormal' : 'completion',
          description: p.name, uploadedAt: new Date().toISOString()
        })
      })
    })
    const finishedItems = device.value.parts.filter(p => !isPartDone(p.id))
    const missedPartNames = finishedItems.map(p => `${p.name}`).join('、')

    const recordId = appStore.addRecord({
      taskId: task.value.id, deviceId: task.value.deviceId,
      operatorId: authStore.currentUser!.id, shiftId: task.value.shiftId,
      recordDate: dayjs().format('YYYY-MM-DD'), timeSlot: task.value.timeSlot,
      completedCount: doneItems, totalCount: items.length,
      completionRate: doneItems === 0 ? 0 : Math.round((doneItems / items.length) * 100),
      hasMissed, hasAbnormal: hasMissed,
      missedReason: (hasMissed ? ('未完成：' + missedPartNames + '；') : '') + (remark.value || ''),
      disinfectantUsed: disinfectant.value.model,
      disinfectantValid: checkRes.value.valid,
      startTime: startTime.value.toISOString(),
      endTime: endTime.toISOString(),
      duration: Math.max(1, Math.round(elapsedSeconds.value / 60)),
      reviewStatus: hasMissed ? 'pending' : 'approved',
      items: items.map(i => ({ ...i, id: genId(), recordId: 'temp' })) as any,
      photos: allPhotos.map(p => ({ ...p, id: genId(), recordId: 'temp' })) as any
    })

    appStore.completeTask(task.value.id, recordId)
    appStore.consumeDisinfectant(disinfectant.value.id, disinfectant.value.unitConsumption, authStore.currentUser!.id,
      `${device.value.machineNo} ${TIME_SLOT_LABELS[task.value.timeSlot]}消毒`)

    if (hasMissed) {
      appStore.addNotification({
        type: 'missed',
        title: `【漏做提醒】${device.value.machineNo} ${TIME_SLOT_LABELS[task.value.timeSlot]}消毒`,
        content: `执行员工：${authStore.currentUser!.name}。未完成零件：${missedPartNames || '无'}。员工备注：${remark.value || '无'}`,
        relatedId: recordId, relatedType: 'record'
      })
    }
    if (checkRes.value.warning) {
      appStore.addNotification({
        type: 'disinfectant_expire',
        title: `消毒液即将过期`,
        content: `${disinfectant.value.name} (${disinfectant.value.model}) 剩余 ${checkRes.value.daysLeft} 天到期，请及时采购更换。`,
        relatedId: disinfectant.value.id, relatedType: 'disinfectant'
      })
    }
    const rec = appStore.getRecord(recordId)
    if (rec) {
      rec.items = rec.items.map(i => ({ ...i, recordId })) as any
      rec.photos = rec.photos.map(p => ({ ...p, recordId })) as any
      appStore.persist()
    }
    ElMessage.success('消毒记录已提交' + (hasMissed ? '，已通知店长' : ''))
    setTimeout(() => router.replace(`/records/${recordId}`), 600)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  task.value = appStore.getTask(taskId) || null
  if (task.value) {
    device.value = appStore.getDevice(task.value.deviceId) || null
    disinfectant.value = appStore.getDisinfectant(task.value.disinfectantId) || null
    if (task.value.status === 'pending') appStore.startTask(taskId)
    if (task.value.startedAt) startTime.value = dayjs(task.value.startedAt)
    elapsedSeconds.value = dayjs().diff(startTime.value, 'second')
    timer = window.setInterval(() => { elapsedSeconds.value++ }, 1000)
    if (device.value && device.value.parts.length) activePartId.value = device.value.parts[0].id
  }
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="css">
.header-right { display: flex; align-items: center; gap: 16px; }
.elapsed-time {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; background: #e6f7ff; border-radius: 20px;
  color: #1890ff; font-weight: 600; font-size: 13px;
}

.steps-card { padding: 4px 0 16px; }
.card-title { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; }

.parts-list { display: flex; flex-direction: column; gap: 10px; padding: 4px 8px; }

.part-item {
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.25s;
  background: white;
}
.part-item:hover { border-color: #91caff; background: #fafcff; }
.part-item.active { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.12); }
.part-item.done { border-color: #95de64; background: #f6ffed; }

.part-index { display: flex; align-items: flex-start; padding-right: 12px; }
.part-item { display: flex; align-items: flex-start; }

.index-badge {
  width: 32px; height: 32px; border-radius: 50%;
  background: #f0f2f5; color: #606266;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
  transition: all 0.2s;
}
.index-badge.done {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: white;
}

.part-body {
  flex: 1; display: flex; justify-content: space-between;
  align-items: flex-start; gap: 12px;
}

.part-name { font-size: 15px; font-weight: 600; }
.part-desc { margin: 6px 0 0; font-size: 12px; color: #606266; line-height: 1.6; }

.part-check {
  padding-top: 2px; cursor: pointer;
  flex-shrink: 0;
}

.part-upload {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--border-color);
  grid-column: 1 / -1;
}

.upload-header {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 10px; font-weight: 600; font-size: 13px; color: var(--text-primary);
}

.info-card, .submit-card { margin-bottom: 20px; }
.info-block { padding: 4px 0; }
.info-row {
  display: flex; justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f2f5;
  font-size: 13px;
}
.info-row:last-child { border-bottom: none; }
.info-row span { color: #909399; }

.submit-bar {
  position: sticky; bottom: 0;
  background: white;
  border-top: 1px solid var(--border-color);
  padding: 14px 24px;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
  border-radius: 12px 12px 0 0;
  margin: 20px -20px -20px;
  z-index: 100;
}

.submit-tip {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: #606266;
}

.submit-actions { display: flex; gap: 10px; }
</style>
