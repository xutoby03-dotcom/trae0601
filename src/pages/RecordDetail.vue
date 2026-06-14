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
      <div class="header-right-tags">
        <el-tag v-if="abnormalPhotos.length" type="danger" effect="dark" size="large" style="margin-right: 8px; cursor: pointer;" @click="scrollToAbnormal">
          <el-icon style="margin-right: 4px;"><WarningFilled /></el-icon>
          异常照片 {{ abnormalPhotos.length }} 张
          <span v-if="unreviewedAbnormalCount > 0" style="margin-left: 6px; padding: 1px 8px; background: #fff; color: #f5222d; border-radius: 10px; font-size: 12px;">
            {{ unreviewedAbnormalCount }} 待核查
          </span>
          <span style="margin-left: 4px;">→</span>
        </el-tag>
        <el-tag v-if="record.hasMissed" type="danger" effect="light" size="large" style="margin-right: 8px;">存在漏做/异常</el-tag>
        <el-tag v-else type="success" effect="light" size="large" style="margin-right: 8px;">全部完成</el-tag>
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
                  <div
                    v-for="(ph, idx) in getItemPhotos(item.partId)"
                    :key="idx"
                    class="step-photo-wrap"
                    @click="openPreview(ph)"
                  >
                    <el-image
                      :src="ph.url"
                      fit="cover"
                      class="step-photo"
                      :preview-src-list="[]"
                      :initial-index="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card v-if="abnormalPhotos.length" id="abnormal-photos-anchor" class="card-shadow mt-20 abnormal-card" shadow="never">
          <template #header>
            <div class="abnormal-header">
              <div class="abnormal-header-left">
                <span class="card-title"><el-icon><WarningFilled /></el-icon>&nbsp;异常照片 ({{ abnormalPhotos.length }})</span>
                <el-tag v-if="unreviewedAbnormalCount > 0" type="danger" effect="dark" size="small" style="margin-left: 10px;">
                  {{ unreviewedAbnormalCount }} 张待核查
                </el-tag>
                <el-tag v-else type="success" effect="light" size="small" style="margin-left: 10px;">
                  <el-icon><CircleCheckFilled /></el-icon>&nbsp;全部已核查
                </el-tag>
              </div>
              <span style="color: #f5222d; font-size: 12px; font-weight: 400;">店长：请逐张核查并标记</span>
            </div>
          </template>
          <div class="photo-grid">
            <div
              v-for="(ph, idx) in abnormalPhotos"
              :key="ph.id"
              class="photo-card abnormal"
              :class="{ reviewed: ph.reviewed }"
              @click="openPreview(ph)"
            >
              <div class="photo-img-wrap">
                <el-image
                  :src="ph.url"
                  fit="cover"
                  class="card-img"
                  :preview-src-list="[]"
                  :initial-index="0"
                />
                <div class="abnormal-corner">异常</div>
                <div v-if="ph.reviewed" class="reviewed-badge">
                  <el-icon><CircleCheckFilled /></el-icon>
                  已核查
                </div>
              </div>
              <div class="photo-meta">
                <div class="photo-part" :title="getPartName(ph.partId)">
                  <el-icon size="12"><Tools /></el-icon>
                  <span>{{ getPartName(ph.partId) }}</span>
                </div>
                <div class="photo-time">
                  <el-icon size="12"><Clock /></el-icon>
                  <span>{{ formatTime(ph.uploadedAt) }}</span>
                </div>
              </div>

              <div class="review-section" @click.stop v-if="authStore.isManager">
                <template v-if="ph.reviewed">
                  <div class="reviewed-info">
                    <div class="reviewed-row">
                      <el-icon size="12" color="#52c41a"><UserFilled /></el-icon>
                      <span>{{ getReviewerName(ph.reviewedBy) }}</span>
                      <span class="review-dot">·</span>
                      <el-icon size="12" color="#909399"><Clock /></el-icon>
                      <span>{{ formatTime(ph.reviewedAt) }}</span>
                    </div>
                    <div class="reviewed-remark" v-if="ph.reviewRemark">
                      {{ ph.reviewRemark }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <el-input
                    v-model="reviewRemarks[ph.id]"
                    size="small"
                    placeholder="核查备注（可选）"
                    maxlength="100"
                    class="review-input"
                    @click.stop
                  />
                  <el-button
                    type="success"
                    size="small"
                    :icon="CircleCheckFilled"
                    class="review-btn"
                    @click.stop="handleReviewPhoto(ph)"
                  >
                    标记已核查
                  </el-button>
                </template>
              </div>
            </div>
          </div>
        </el-card>

        <el-card v-if="normalPhotos.length" class="card-shadow mt-20" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><Picture /></el-icon>&nbsp;完成照片 ({{ normalPhotos.length }})</span>
          </template>
          <div class="photo-grid">
            <div
              v-for="(ph, idx) in normalPhotos"
              :key="idx"
              class="photo-card"
              @click="openPreview(ph)"
            >
              <div class="photo-img-wrap">
                <el-image
                  :src="ph.url"
                  fit="cover"
                  class="card-img"
                  :preview-src-list="[]"
                  :initial-index="0"
                />
              </div>
              <div class="photo-meta">
                <div class="photo-part" :title="getPartName(ph.partId)">
                  <el-icon size="12"><Tools /></el-icon>
                  <span>{{ getPartName(ph.partId) }}</span>
                </div>
                <div class="photo-time">
                  <el-icon size="12"><Clock /></el-icon>
                  <span>{{ formatTime(ph.uploadedAt) }}</span>
                </div>
              </div>
            </div>
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

    <el-dialog
      v-model="previewVisible"
      :title="''"
      width="auto"
      align-center
      destroy-on-close
      class="photo-lightbox-dialog"
      :show-close="false"
      top="5vh"
    >
      <div class="lightbox-wrap" v-if="previewPhoto">
        <div class="lightbox-close" @click="previewVisible = false">
          <el-icon :size="20"><Close /></el-icon>
        </div>
        <div class="lightbox-nav lightbox-prev" @click="navigatePhoto(-1)" v-if="previewList.length > 1">
          <el-icon :size="28"><ArrowLeft /></el-icon>
        </div>
        <div class="lightbox-nav lightbox-next" @click="navigatePhoto(1)" v-if="previewList.length > 1">
          <el-icon :size="28"><ArrowRight /></el-icon>
        </div>
        <div class="lightbox-img">
          <img :src="previewPhoto.url" :alt="getPartName(previewPhoto.partId)" />
        </div>
        <div class="lightbox-info">
          <div class="lightbox-info-left">
            <el-tag :type="previewPhoto.type === 'abnormal' ? 'danger' : 'success'" effect="dark" size="small" style="margin-right: 10px;">
              {{ previewPhoto.type === 'abnormal' ? '异常照片' : '完成照片' }}
            </el-tag>
            <span class="lightbox-part">
              <el-icon><Tools /></el-icon>&nbsp;零件：{{ getPartName(previewPhoto.partId) }}
            </span>
            <el-tag v-if="previewPhoto.type === 'abnormal' && previewPhoto.reviewed" type="success" effect="light" size="small" style="margin-left: 10px;">
              <el-icon><CircleCheckFilled /></el-icon>&nbsp;已核查
            </el-tag>
            <el-tag v-else-if="previewPhoto.type === 'abnormal'" type="warning" effect="light" size="small" style="margin-left: 10px;">
              待核查
            </el-tag>
          </div>
          <div class="lightbox-info-right">
            <el-icon><Clock /></el-icon>&nbsp;上传时间：{{ formatTime(previewPhoto.uploadedAt) }}
            <span class="lightbox-counter" v-if="previewList.length > 1">&nbsp;&nbsp;{{ previewIndex + 1 }} / {{ previewList.length }}</span>
          </div>
        </div>
        <div v-if="previewPhoto.type === 'abnormal' && previewPhoto.reviewed" class="lightbox-review-info">
          <div class="lightbox-review-row">
            <el-icon color="#52c41a"><UserFilled /></el-icon>&nbsp;核查人：{{ getReviewerName(previewPhoto.reviewedBy) }}
            <span class="review-dot">·</span>
            <el-icon color="#909399"><Clock /></el-icon>&nbsp;核查时间：{{ formatTime(previewPhoto.reviewedAt) }}
          </div>
          <div v-if="previewPhoto.reviewRemark" class="lightbox-review-remark">
            📝 核查备注：{{ previewPhoto.reviewRemark }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
  <el-empty v-else description="记录不存在" />
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, List as CheckList, WarningFilled, Warning, Picture, InfoFilled, DataLine, MagicStick,
  EditPen, Stamp, Refresh, Check, CircleCheckFilled, CircleCloseFilled, Tools, Clock, Close, ArrowRight, UserFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import type { Record as DisinfectionRecord, Device, RecordPhoto } from '@/types'
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

const previewVisible = ref(false)
const previewIndex = ref(0)
const previewList = ref<RecordPhoto[]>([])
const previewPhoto = computed<RecordPhoto | null>(() => previewList.value[previewIndex.value] || null)

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
function formatTime(s?: string) { return s ? dayjs(s).format('YYYY-MM-DD HH:mm:ss') : '-' }

function getPartName(pid?: string) {
  if (!pid || !record.value) return '未关联零件'
  const item = record.value.items.find(i => i.partId === pid)
  if (item) return item.partName
  const p = device.value?.parts.find(pp => pp.id === pid)
  return p?.name || '未知零件'
}

function scrollToAbnormal() {
  const el = document.getElementById('abnormal-photos-anchor')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openPreview(photo: RecordPhoto) {
  if (!record.value) return
  previewList.value = record.value.photos
  const idx = previewList.value.findIndex(p => p.url === photo.url)
  previewIndex.value = idx >= 0 ? idx : 0
  previewVisible.value = true
}
function navigatePhoto(delta: number) {
  if (!previewList.value.length) return
  previewIndex.value = (previewIndex.value + delta + previewList.value.length) % previewList.value.length
}

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
const unreviewedAbnormalCount = computed(() => abnormalPhotos.value.filter(p => !p.reviewed).length)
const reviewRemarks = reactive<{ [pid: string]: string }>({})

function getReviewerName(uid?: string) {
  if (!uid) return '-'
  return appStore.getUser(uid)?.name || '未知核查人'
}

function handleReviewPhoto(photo: RecordPhoto) {
  if (!record.value || !authStore.currentUser) return
  const updatedPhotos = record.value.photos.map(p => {
    if (p.id !== photo.id) return p
    return {
      ...p,
      reviewed: true,
      reviewedBy: authStore.currentUser!.id,
      reviewedAt: new Date().toISOString(),
      reviewRemark: reviewRemarks[p.id] || ''
    }
  })
  appStore.updateRecord(record.value.id, { photos: updatedPhotos })
  const updated = appStore.getRecord(recordId)
  if (updated) record.value = updated
  delete reviewRemarks[photo.id]
  ElMessage.success('已标记为核查完成')
}

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
.header-right-tags { display: flex; align-items: center; }

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
.step-photo-wrap {
  width: 90px; height: 90px;
  border-radius: 6px; overflow: hidden;
  border: 1px solid var(--border-color);
  cursor: zoom-in;
  transition: all 0.2s;
}
.step-photo-wrap:hover { transform: scale(1.03); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.step-photo {
  width: 100%; height: 100%;
  display: block;
}

.abnormal-card {
  border: 1.5px solid #ffa39e;
  background: linear-gradient(to bottom, #fff2f0, #fff);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px;
}
.photo-card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  overflow: hidden;
  background: white;
  cursor: zoom-in;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}
.photo-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
}
.photo-card.abnormal {
  border-color: #ffccc7;
}
.photo-card.abnormal:hover {
  border-color: #f5222d;
}
.photo-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  background: #fafafa;
}
.card-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: block;
}
.abnormal-corner {
  position: absolute; top: 6px; right: 6px;
  background: #f5222d; color: white;
  padding: 2px 10px; border-radius: 10px;
  font-size: 11px; font-weight: 600;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(245, 34, 45, 0.4);
}
.photo-meta {
  padding: 8px 10px 10px;
  background: white;
  border-top: 1px solid #f5f5f5;
}
.photo-part {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 600; color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.photo-time {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: #909399;
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

:deep(.photo-lightbox-dialog) {
  max-width: 95vw;
  background: transparent;
  box-shadow: none;
  --el-dialog-bg-color: transparent;
  --el-dialog-box-shadow: none;
}
:deep(.photo-lightbox-dialog .el-dialog__body) {
  padding: 0;
}
.lightbox-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 95vw;
}
.lightbox-close {
  position: absolute;
  top: -36px; right: 0;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}
.lightbox-close:hover { background: rgba(0, 0, 0, 0.85); transform: scale(1.1); }
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  user-select: none;
}
.lightbox-nav:hover { background: rgba(0, 0, 0, 0.85); transform: translateY(-50%) scale(1.1); }
.lightbox-prev { left: -60px; }
.lightbox-next { right: -60px; }
.lightbox-img {
  max-width: 90vw;
  max-height: 75vh;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
  background: #1a1a1a;
}
.lightbox-img img {
  max-width: 90vw;
  max-height: 75vh;
  display: block;
  object-fit: contain;
}
.lightbox-info {
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 8px;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  font-size: 13px;
}
.lightbox-info-left {
  display: flex; align-items: center;
}
.lightbox-part {
  display: flex; align-items: center; gap: 4px;
  font-weight: 500; color: var(--text-primary);
}
.lightbox-info-right {
  display: flex; align-items: center;
  color: #606266;
}
.lightbox-counter {
  color: #909399;
  font-size: 12px;
  padding-left: 10px;
  border-left: 1px solid #e4e7ed;
  margin-left: 8px;
}
.lightbox-review-info {
  margin-top: 10px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 10px 16px;
  min-width: 500px;
  font-size: 13px;
  color: #389e0d;
}
.lightbox-review-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.lightbox-review-remark {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #d9f7be;
  color: #52c41a;
}

.abnormal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.abnormal-header-left {
  display: flex;
  align-items: center;
}
.review-dot {
  margin: 0 4px;
  color: #d0d0d0;
}

.photo-card.reviewed {
  border-color: #b7eb8f;
}
.photo-card.reviewed:hover {
  border-color: #52c41a;
}
.reviewed-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  background: #52c41a;
  color: white;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(82, 196, 26, 0.4);
}

.review-section {
  padding: 10px 10px 12px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  cursor: default;
}
.review-input {
  margin-bottom: 8px;
}
.review-btn {
  width: 100%;
}
.reviewed-info {
  font-size: 12px;
}
.reviewed-row {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #606266;
  margin-bottom: 4px;
}
.reviewed-row span:first-of-type {
  font-weight: 600;
  color: #52c41a;
  margin-right: 2px;
}
.reviewed-remark {
  background: #f6ffed;
  padding: 6px 8px;
  border-radius: 4px;
  color: #389e0d;
  font-size: 12px;
  line-height: 1.5;
}
</style>
