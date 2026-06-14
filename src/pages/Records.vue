<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">消毒记录查询</h2>
      <p class="page-desc">查看历史消毒记录、执行详情和异常情况</p>
    </div>

    <el-card class="filter-card card-shadow" shadow="never">
      <el-form :inline="true" :model="filter" size="default">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filter.dateRange" type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
            style="width: 280px;"
          />
        </el-form-item>
        <el-form-item label="设备">
          <el-select v-model="filter.deviceId" placeholder="全部设备" clearable style="width: 180px;">
            <el-option v-for="d in appStore.devices" :key="d.id" :label="`${d.machineNo} ${d.name}`" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="时段">
          <el-select v-model="filter.timeSlot" placeholder="全部时段" clearable style="width: 130px;">
            <el-option label="开店前" value="opening" />
            <el-option label="午间" value="midday" />
            <el-option label="打烊" value="closing" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="filter.operatorId" placeholder="全部员工" clearable style="width: 140px;">
            <el-option v-for="u in appStore.users" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="完成情况">
          <el-select v-model="filter.hasMissed" placeholder="全部" clearable style="width: 140px;">
            <el-option label="全部完成" value="no" />
            <el-option label="存在漏做" value="yes" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">查询</el-button>
          <el-button :icon="RefreshRight" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="card-shadow mt-20" shadow="never">
      <div class="table-top">
        <div>
          <el-tag type="info" effect="plain">共 {{ filteredRecords.length }} 条记录</el-tag>
          <el-tag v-if="abnormalInList" type="danger" effect="light" style="margin-left: 8px;">
            {{ abnormalInList }} 条异常
          </el-tag>
        </div>
      </div>
      <el-table
        :data="pagedRecords"
        stripe border
        style="width: 100%;"
        :row-class-name="rowClass"
        @row-click="(r: any) => openDetail(r.id)"
      >
        <el-table-column type="index" label="#" width="55" align="center" />
        <el-table-column prop="recordDate" label="日期" width="110" sortable />
        <el-table-column label="时段" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.timeSlot === 'opening' ? 'primary' : row.timeSlot === 'midday' ? 'success' : 'info'" effect="plain">
              {{ TIME_SLOT_LABELS[row.timeSlot as ShiftType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="设备" min-width="160">
          <template #default="{ row }">
            <div style="font-weight: 600;">{{ getDevice(row.deviceId)?.machineNo }}</div>
            <div style="font-size: 12px; color: #909399;">{{ getDevice(row.deviceId)?.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="执行人" width="100">
          <template #default="{ row }">{{ getUser(row.operatorId)?.name }}</template>
        </el-table-column>
        <el-table-column label="完成率" width="120" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.completionRate"
              :stroke-width="10"
              :status="row.completionRate === 100 ? 'success' : row.hasMissed ? 'exception' : undefined"
            />
          </template>
        </el-table-column>
        <el-table-column label="完成" width="80" align="center">
          <template #default="{ row }">
            <span style="font-weight: 600;">
              <span :style="{ color: row.completedCount === row.totalCount ? '#52c41a' : '#f5222d' }">
                {{ row.completedCount }}
              </span>
              <span style="color: #c0c4cc;"> / {{ row.totalCount }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <template v-if="row.hasMissed || row.hasAbnormal">
              <el-tag type="danger" effect="dark" size="small">异常/漏做</el-tag>
            </template>
            <template v-else>
              <el-tag type="success" effect="plain" size="small">全部完成</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="审核" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.reviewStatus === 'approved' ? 'success' : row.reviewStatus === 'rectified' ? 'warning' : 'info'" size="small" effect="plain">
              {{ row.reviewStatus === 'approved' ? '已通过' : row.reviewStatus === 'rectified' ? '已整改' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="90" align="center">
          <template #default="{ row }">{{ row.duration }} 分钟</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="View" @click.stop="openDetail(row.id)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page.current"
        v-model:page-size="page.size"
        :page-sizes="[10, 20, 50]"
        :total="filteredRecords.length"
        layout="total, sizes, prev, pager, next, jumper"
        style="justify-content: flex-end; margin-top: 20px;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { Search, RefreshRight, View } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import type { Record, ShiftType } from '@/types'
import { TIME_SLOT_LABELS } from '@/types'

const router = useRouter()
const appStore = useAppStore()

const filter = reactive({
  dateRange: [] as string[],
  deviceId: '',
  timeSlot: '' as ShiftType | '',
  operatorId: '',
  hasMissed: '' as 'yes' | 'no' | ''
})

const appliedFilter = reactive({ ...filter })
const page = reactive({ current: 1, size: 10 })

function search() {
  Object.assign(appliedFilter, filter)
  page.current = 1
}

function resetFilter() {
  filter.dateRange = []
  filter.deviceId = ''
  filter.timeSlot = ''
  filter.operatorId = ''
  filter.hasMissed = ''
  search()
}

const filteredRecords = computed(() => {
  let list = [...appStore.records].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
  if (appliedFilter.dateRange && appliedFilter.dateRange.length === 2) {
    const [s, e] = appliedFilter.dateRange
    const start = dayjs(s).startOf('day')
    const end = dayjs(e).endOf('day')
    list = list.filter(r => {
      const d = dayjs(r.recordDate)
      return (d.isSame(start) || d.isAfter(start)) && (d.isSame(end) || d.isBefore(end))
    })
  }
  if (appliedFilter.deviceId) list = list.filter(r => r.deviceId === appliedFilter.deviceId)
  if (appliedFilter.timeSlot) list = list.filter(r => r.timeSlot === appliedFilter.timeSlot)
  if (appliedFilter.operatorId) list = list.filter(r => r.operatorId === appliedFilter.operatorId)
  if (appliedFilter.hasMissed === 'yes') list = list.filter(r => r.hasMissed)
  if (appliedFilter.hasMissed === 'no') list = list.filter(r => !r.hasMissed)
  return list
})

const pagedRecords = computed(() => {
  const start = (page.current - 1) * page.size
  return filteredRecords.value.slice(start, start + page.size)
})

const abnormalInList = computed(() => filteredRecords.value.filter(r => r.hasMissed || r.hasAbnormal).length)

function getDevice(id: string) { return appStore.getDevice(id) }
function getUser(id: string) { return appStore.getUser(id) }
function rowClass({ row }: { row: Record }) {
  return row.hasMissed ? 'row-abnormal' : ''
}
function openDetail(id: string) {
  router.push(`/records/${id}`)
}
</script>

<style scoped lang="css">
.filter-card { border-radius: 12px; }
.mt-20 { margin-top: 20px; }
.table-top { margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
:deep(.el-table .row-abnormal) { background: #fff2f0 !important; }
:deep(.el-table .row-abnormal:hover > td) { background: #fff1f0 !important; }
:deep(.el-table__row) { cursor: pointer; }
</style>
