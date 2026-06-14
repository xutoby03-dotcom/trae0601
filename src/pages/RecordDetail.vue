<template>
  <div class="page-container" v-if="record && device">
    <div class="page-header flex-between">
      <div>
        <el-button link :icon="ArrowLeft" @click="router.back()" style="padding: 0 0 4px 0; color: #909399;">返回记录列表</el-button>
        <h2 class="page-title" style="margin-top: 6px;">消毒记录详情</h2>
        <p class="page-desc">
          {{ record.recordDate }} · {{ TIME_SLOT_LABELS[record.timeSlot] }} · 
          {{ device.machineNo }} {{ device.name }}
        </p>
      </div>
      <div>
        <el-tag v-if="record.hasMissed" type="danger" effect="dark" size="large" style="margin-right: 8px;">存在漏做/异常</el-tag>
        <el-tag v-else type="success" effect="light" size="large">全部完成</el-tag>
        <el-tag
          :type="record.reviewStatus === 'approved' ? 'success' : record.reviewStatus === 'rectified' ? 'warning' : 'info'"
          size="large"
          effect="plain"
        >
          {{ record.reviewStatus === 'approved' ? '审核通过' : record.reviewStatus === 'rectified' ? '已整改' : '待店长审核' }}
        </el-tag>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <el-card class="card-shadow" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><CheckList /></el-icon>&nbsp;消毒步骤执行情况</span>
          </template>
          <div class="step-list">
            <div
              v-for="item in sortedItems"
              :key="item.id"
              class="step-item"
              :class="item.completed ? 'done' : 'missed'"
            >
              <div class="step-badge">
                <el-icon v-if="item.completed" color="#52c41a" :size="16"><CircleCheckFilled /></el-icon>
                <el-icon v-else color="#f5222d" :size="16"><CircleCloseFilled /></el-icon>
              </div>
              <div class="step-body">
                <div class="step-title">
                  <span class="step-order">步骤 {{ item.sortOrder }}</span>
                  <span class="step-name">{{ item.partName }}</span>
                  <el-tag size="small" effect="plain" :color="categoryColor(item.category)">
                    {{ item.category }}
                  </el-tag>
                  <el-tag v-if="!item.completed" type="danger" size="small" effect="dark">漏做</el-tag>
                </div>
                <p v-if="devicePartsMap[item.partId]?.description" class="step-desc">
                  {{ devicePartsMap[item.partId]?.description }}
                </p>

                <div class="step-photos" v-if="getItemPhotos(item.partId).length">
                  <el-image
                    v-for="(ph, idx) in getItemPhotos(item.partId)"
                    :key="idx"
                    :src="ph.url"
                    :preview-src-list="getAllPhotoUrls()"
                    :initial-index="getPhotoInitialIndex(ph.url)"
                    fit="cover"
                    class="step-photo"
                    :preview-teleported="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card v-if="abnormalPhotos.length" class="card-shadow mt-20" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><Warning /></el-icon>&nbsp;异常照片 ({{ abnormalPhotos.length }})</span>
          </template>
          <div class="photo-grid">
            <el-image
              v-for="(ph, idx) in abnormalPhotos"
              :key="idx"
              :src="ph.url"
              :preview-src-list="abnormalPhotos.map(p => p.url)"
              :initial-index="idx"
              fit="cover"
              class="grid-photo"
              :preview-teleported="true"
            >
              <div class="abnormal-badge">异常</div>
            </el-image>
          </div>
        </el-card>

        <el-card v-if="normalPhotos.length" class="card-shadow mt-20" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><Picture /></el-icon>&nbsp;完成照片 ({{ normalPhotos.length }})</span>
          </template>
          <div class="photo-grid">
            <el-image
              v-for="(ph, idx) in normalPhotos"
              :key="idx"
              :src="ph.url"
              :preview-src-list="normalPhotos.map(p => p.url)"
              :initial-index="idx"
              fit="cover"
              class="grid-photo"
              :preview-teleported="true"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="card-shadow" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><InfoFilled /></el-icon>&nbsp;基本信息</span>
          </template>
          <div class="info-list">
            <div class="info-row"><span>记录日期</span><strong>{{ record.recordDate }}</strong></div>
            <div class="info-row"><span>消毒时段</span><strong>{{ TIME_SLOT_LABELS[record.timeSlot] }}</strong></div>
            <div class="info-row"><span>设备编号</span><strong>{{ device.machineNo }}</strong></div>
            <div class="info-row"><span>设备名称</span><strong>{{ device.name }}</strong></div>
            <div class="info-row"><span>口味槽数</span><strong>{{ device.flavorSlots }} 个</strong></div>
            <div class="info-row"><span>执行员工</span><strong>{{ operatorName }}</strong></div>
            <div class="info-row"><span>开始时间</span><strong>{{ formatTime(record.startTime) }}</strong></div>
            <div class="info-row"><span>结束时间</span><strong>{{ formatTime(record.endTime) }}</strong></div>
            <div class="info-row"><span>总耗时</span><strong>{{ record.duration }} 分钟</strong></div>
          </div>
        </el-card>

        <el-card class="card-shadow mt-20" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><DataLine /></el-icon>&nbsp;执行统计</span>
          </template>
          <el-progress
            type="dashboard"
            :percentage="record.completionRate"
            :width="160"
            :stroke-width="14"
            :status="record.completionRate === 100 ? 'success' : 'exception'"
            style="margin: 20px auto; display: block;"
          />
          <div class="stat-row">
            <div class="stat-mini green">
              <div class="mini-num">{{ record.completedCount }}</div>
              <div class="mini-label">已完成</div>
            </div>
            <div class="stat-mini" :class="record.totalCount - record.completedCount > 0 ? 'red' : 'gray'">
              <div class="mini-num">{{ record.totalCount - record.completedCount }}</div>
              <div class="mini-label">未完成</div>
            </div>
            <div class="stat-mini blue">
              <div class="mini-num">{{ record.totalCount }}</div>
              <div class="mini-label">总步骤</div>
            </div>
          </div>
        </el-card>

        <el-card class="card-shadow mt-20" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><MagicStick /></el-icon>&nbsp;消毒液使用</span>
          </template>
          <div class="info-list">
            <div class="info-row"><span>消毒液型号</span><strong>{{ record.disinfectantUsed }}</strong></div>
            <div class="info-row"><span>效期状态</span>
              <el-tag :type="record.disinfectantValid ? 'success' : 'danger'" size="small">
                {{ record.disinfectantValid ? '在有效期内' : '已过期' }}
              </el-tag>
            </div>
            <div class="info-row"><span>单耗用量</span><strong>{{ disinfectantUnit }} mL</strong></div>
          </div>
        </el-card>

        <el-card v-if="record.missedReason" class="card-shadow mt-20" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><EditPen /></el-icon>&nbsp;员工说明/漏做原因</span>
          </template>
          <div class="reason-box">
            {{ record.missedReason }}
          </div>
        </el-card>

        <el-card v-if="authStore.isManager && record.reviewStatus === 'pending'" class="card-shadow mt-20" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><Stamp /></el-icon>&nbsp;店长审核</span>
          </template>
          <el-input v-model="reviewRemark" type="textarea" :rows="3" placeholder="审核备注（可选）" />
          <div class="review-actions">
            <el-button type="warning" :icon="Refresh" @click="handleRectify">标记已整改</el-button>
            <el-button type="success" :icon="Check" @click="handleApprove">审核通过</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
  <el-empty v-else description="记录不存在" />
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, List as CheckList, Warning, Picture, InfoFilled, DataLine, MagicStick,
  EditPen, Stamp, Refresh, Check, CircleCheckFilled, CircleCloseFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import type { Record as DisinfectionRecord, Device } from '@/types'
import { TIME_SLOT_LABELS } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const recordId = route.params.id as string
const record = ref<DisinfectionRecord | null>(appStore.getRecord(recordId) || null)
const device = computed<Device | null>(() => (record.value ? appStore.getDevice(record.value.deviceId) : null) || null)
const operatorName = computed(() => record.value ? appStore.getUser(record.value.operatorId)?.name : '-')
const disinfectantUnit = computed(() => device.value ? appStore.getDisinfectant(device.value.disinfectantId)?.unitConsumption || 0 : 0)

const sortedItems = computed(() => record.value?.items ? [...record.value.items].sort((a, b) => a.sortOrder - b.sortOrder) : [])
const devicePartsMap = computed(() => {
  const map: { [key: string]: any } = {}
  device.value?.parts.forEach(p => { map[p.id] = p })
  return map
})

function categoryColor(cat: string) {
  const map: { [key: string]: string } = { '缸体': '#bae7ff', '出料': '#d9f7be', '搅拌': '#ffd591', '接水': '#ffe7ba', '外壳': '#e0e0e0' }
  return map[cat] || '#f0f0f0'
}
function formatTime(s: string) { return dayjs(s).format('YYYY-MM-DD HH:mm:ss') }

const photosByPart = computed(() => {
  const map: { [key: string]: any[] } = {}
  record.value?.photos.forEach(p => {
    if (p.partId) {
      if (!map[p.partId]) map[p.partId] = []
      map[p.partId].push(p)
    }
  })
  return map
})
function getItemPhotos(pid: string) { return photosByPart.value[pid] || [] }

const abnormalPhotos = computed(() => record.value?.photos.filter(p => p.type === 'abnormal') || [])
const normalPhotos = computed(() => record.value?.photos.filter(p => p.type !== 'abnormal') || [])
function getAllPhotoUrls() { return (record.value?.photos || []).map(p => p.url) }
function getPhotoInitialIndex(url: string) { return getAllPhotoUrls().findIndex(u => u === url) }

const reviewRemark = ref('')
function handleApprove() {
  if (!record.value) return
  appStore.updateRecord(record.value.id, { reviewStatus: 'approved', reviewRemark: reviewRemark.value, reviewerId: authStore.currentUser?.id, reviewedAt: new Date().toISOString() })
  const updated = appStore.getRecord(recordId)
  if (updated) record.value = updated
  ElMessage.success('审核通过')
}
function handleRectify() {
  if (!record.value) return
  appStore.updateRecord(record.value.id, { reviewStatus: 'rectified', reviewRemark: reviewRemark.value, reviewerId: authStore.currentUser?.id, reviewedAt: new Date().toISOString() })
  const updated = appStore.getRecord(recordId)
  if (updated) record.value = updated
  ElMessage.success('已标记为整改完成')
}
</script>

<style scoped lang="css">
.card-title { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.mt-20 { margin-top: 20px; }

.step-list { display: flex; flex-direction: column; gap: 10px; }
.step-item {
  display: flex; gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color);
  background: white;
}
.step-item.done { border-color: #95de64; background: #fcfff5; }
.step-item.missed { border-color: #ffa39e; background: #fff1f0; }

.step-badge {
  width: 28px; height: 28px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

.step-name { font-size: 15px; font-weight: 600; margin-right: 8px; }
.step-order { color: #909399; font-size: 12px; margin-right: 10px; }
.step-desc { margin: 6px 0 0; font-size: 12px; color: #606266; }

.step-photos {
  margin-top: 10px;
  display: flex; flex-wrap: wrap; gap: 8px;
}
.step-photo {
  width: 90px; height: 90px;
  border-radius: 6px; overflow: hidden;
  border: 1px solid var(--border-color);
  cursor: zoom-in;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.grid-photo {
  width: 100%; height: 120px;
  border-radius: 8px;
  position: relative;
  cursor: zoom-in;
}
.abnormal-badge {
  position: absolute; top: 4px; right: 4px;
  background: #f5222d; color: white;
  padding: 1px 8px; border-radius: 10px;
  font-size: 10px; font-weight: 600;
  z-index: 2;
}

.info-list { padding: 4px 0; }
.info-row {
  display: flex; justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f2f5;
  font-size: 13px;
  align-items: center;
}
.info-row:last-child { border-bottom: none; }
.info-row span { color: #909399; }

.stat-row {
  display: flex; gap: 8px; padding: 8px 0;
}
.stat-mini {
  flex: 1; padding: 12px 8px; text-align: center;
  border-radius: 8px;
}
.stat-mini.green { background: #f6ffed; }
.stat-mini.red { background: #fff1f0; }
.stat-mini.blue { background: #e6f7ff; }
.stat-mini.gray { background: #fafafa; }
.mini-num { font-size: 22px; font-weight: 700; }
.stat-mini.green .mini-num { color: #52c41a; }
.stat-mini.red .mini-num { color: #f5222d; }
.stat-mini.blue .mini-num { color: #1890ff; }
.stat-mini.gray .mini-num { color: #909399; }
.mini-label { font-size: 11px; color: #606266; margin-top: 2px; }

.reason-box {
  padding: 12px; background: #fafafa;
  border-radius: 8px;
  font-size: 13px; line-height: 1.7;
  color: #333;
}

.review-actions {
  margin-top: 12px;
  display: flex; justify-content: flex-end; gap: 10px;
}
</style>
