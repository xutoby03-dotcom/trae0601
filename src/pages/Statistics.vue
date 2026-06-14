<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <div>
        <h2 class="page-title">统计报表中心</h2>
        <p class="page-desc">设备完成率、漏做零件分析、异常照片、消毒液消耗等综合数据</p>
      </div>
      <div>
        <el-date-picker
          v-model="dateRange" type="month"
          value-format="YYYY-MM"
          placeholder="选择月份"
          style="width: 180px;"
          @change="renderAllCharts"
        />
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="6">
        <div class="stat-card gradient-blue">
          <div class="stat-icon"><el-icon><DataLine /></el-icon></div>
          <div class="stat-num">{{ overallRate }}%</div>
          <div class="stat-label">综合完成率</div>
        </div>
      </el-col>
      <el-col :xs="6">
        <div class="stat-card gradient-green">
          <div class="stat-icon"><el-icon><DocumentChecked /></el-icon></div>
          <div class="stat-num">{{ periodRecordCount }}</div>
          <div class="stat-label">消毒记录数</div>
        </div>
      </el-col>
      <el-col :xs="6">
        <div class="stat-card gradient-orange">
          <div class="stat-icon"><el-icon><Warning /></el-icon></div>
          <div class="stat-num">{{ periodMissedCount }}</div>
          <div class="stat-label">漏做次数</div>
        </div>
      </el-col>
      <el-col :xs="6">
        <div class="stat-card gradient-purple">
          <div class="stat-icon"><el-icon><MagicStick /></el-icon></div>
          <div class="stat-num">{{ disinfectantConsume }}<small>L</small></div>
          <div class="stat-label">消毒液消耗</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :md="14">
        <el-card class="card-shadow chart-card" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><BarChart /></el-icon>&nbsp;各设备月度完成率</span>
          </template>
          <div ref="chart1Ref" style="height: 320px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="10">
        <el-card class="card-shadow chart-card" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><PieChart /></el-icon>&nbsp;漏做零件占比分布</span>
          </template>
          <div ref="chart2Ref" style="height: 320px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :md="14">
        <el-card class="card-shadow chart-card" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><TrendCharts /></el-icon>&nbsp;日消毒完成率趋势</span>
          </template>
          <div ref="chart3Ref" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="10">
        <el-card class="card-shadow chart-card" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><Trophy /></el-icon>&nbsp;漏做零件 Top10 排行</span>
          </template>
          <div class="rank-list">
            <div
              v-for="(item, idx) in topMissedParts"
              :key="idx"
              class="rank-item"
            >
              <div class="rank-num" :class="`rank-${idx + 1}`">{{ idx + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name text-truncate">{{ item.name }}</div>
                <el-progress
                  :percentage="Math.min(100, Math.round(item.count * 100 / Math.max(1, topMissedParts[0]?.count || 1)))"
                  :show-text="false"
                  :stroke-width="6"
                  :color="idx < 3 ? '#f5222d' : idx < 6 ? '#fa8c16' : '#faad14'"
                  style="margin-top: 4px;"
                />
              </div>
              <div class="rank-count">
                <span style="color: #f5222d; font-weight: 700;">{{ item.count }}</span>
                <span style="color: #909399; font-size: 11px;">次</span>
              </div>
            </div>
            <el-empty v-if="!topMissedParts.length" description="暂无漏做数据" :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow chart-card" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><Picture /></el-icon>&nbsp;异常照片墙 ({{ abnormalPhotos.length }})</span>
          </template>
          <div class="photo-wall">
            <div
              v-for="(ph, idx) in abnormalPhotos"
              :key="idx"
              class="wall-item"
              @click="openAbnormalDetail(ph)"
            >
              <el-image
                :src="ph.url"
                fit="cover"
                class="wall-photo"
                :preview-src-list="abnormalPhotos.map(p => p.url)"
                :initial-index="idx"
                :preview-teleported="true"
              />
              <div class="wall-info">
                <span class="wall-date">{{ formatDate(ph.uploadedAt) }}</span>
                <el-tag size="small" type="danger" effect="dark">异常</el-tag>
              </div>
            </div>
            <el-empty v-if="!abnormalPhotos.length" description="暂无异常照片" :image-size="80" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow chart-card" shadow="never">
          <template #header>
            <span class="card-title"><el-icon><Histogram /></el-icon>&nbsp;本月消毒液消耗统计</span>
          </template>
          <div ref="chart4Ref" style="height: 320px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { useAppStore } from '@/stores/app'
import type { RecordPhoto } from '@/types'

const appStore = useAppStore()
const dateRange = ref(dayjs().format('YYYY-MM'))

const periodRecords = computed(() => {
  return appStore.records.filter(r => r.recordDate.startsWith(dateRange.value))
})
const periodRecordCount = computed(() => periodRecords.value.length)
const periodMissedCount = computed(() => periodRecords.value.reduce((s, r) => s + (r.totalCount - r.completedCount), 0))
const overallRate = computed(() => {
  const t = periodRecords.value.reduce((s, r) => s + r.totalCount, 0)
  const c = periodRecords.value.reduce((s, r) => s + r.completedCount, 0)
  return t ? Math.round((c / t) * 100) : 0
})

const disinfectantConsume = computed(() => {
  return (appStore.disinfectantLogs
    .filter(l => l.type === 'consume' && l.createdAt.startsWith(dateRange.value))
    .reduce((s, l) => s + l.quantity, 0) / 1000).toFixed(1)
})

const topMissedParts = computed(() => {
  const map: Record<string, { name: string; count: number }> = {}
  periodRecords.value.forEach(r => {
    r.items.filter(i => !i.completed).forEach(i => {
      if (!map[i.partName]) map[i.partName] = { name: i.partName, count: 0 }
      map[i.partName].count++
    })
  })
  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10)
})

const abnormalPhotos = computed<RecordPhoto[]>(() => {
  const arr: RecordPhoto[] = []
  periodRecords.value.forEach(r => arr.push(...r.photos.filter(p => p.type === 'abnormal')))
  return arr
})

function formatDate(s: string) { return dayjs(s).format('MM/DD HH:mm') }
function openAbnormalDetail(ph: RecordPhoto) {
  // preview handled by el-image
}

const chart1Ref = ref<HTMLElement>()
const chart2Ref = ref<HTMLElement>()
const chart3Ref = ref<HTMLElement>()
const chart4Ref = ref<HTMLElement>()
let charts: echarts.ECharts[] = []

function renderAllCharts() {
  nextTick(() => {
    charts.forEach(c => c.dispose())
    charts = []
    renderChart1()
    renderChart2()
    renderChart3()
    renderChart4()
  })
}

function renderChart1() {
  if (!chart1Ref.value) return
  const c = echarts.init(chart1Ref.value)
  const devices = appStore.devices
  const xData = devices.map(d => d.machineNo.slice(-8))
  const data = devices.map(d => {
    const rs = periodRecords.value.filter(r => r.deviceId === d.id)
    const t = rs.reduce((s, r) => s + r.totalCount, 0)
    const cc = rs.reduce((s, r) => s + r.completedCount, 0)
    return t ? Math.round((cc / t) * 100) : (rs.length ? 0 : 100)
  })
  c.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}<br/>完成率: {c}%' },
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: xData, axisLabel: { rotate: 0, interval: 0, color: '#606266' } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: '#606266' }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
    series: [{
      type: 'bar', data,
      barWidth: '40%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#69c0ff' }, { offset: 1, color: '#1890ff' }
        ])
      },
      label: { show: true, position: 'top', formatter: '{c}%', color: '#1890ff', fontWeight: 600 }
    }]
  })
  charts.push(c)
}

function renderChart2() {
  if (!chart2Ref.value) return
  const c = echarts.init(chart2Ref.value)
  const data = topMissedParts.value.slice(0, 8).map(p => ({ name: p.name, value: p.count }))
  c.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}次 ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['45%', '72%'], center: ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: data.length ? data : [{ name: '暂无数据', value: 1, itemStyle: { color: '#f0f0f0' } }],
      color: ['#f5222d', '#fa8c16', '#faad14', '#fadb14', '#a0d911', '#52c41a', '#13c2c2', '#1890ff']
    }]
  })
  charts.push(c)
}

function renderChart3() {
  if (!chart3Ref.value) return
  const c = echarts.init(chart3Ref.value)
  const [y, m] = dateRange.value.split('-').map(Number)
  const daysInMonth = dayjs(`${y}-${m}`).daysInMonth()
  const days = Array.from({ length: daysInMonth }, (_, i) => `${String(i + 1).padStart(2, '0')}`)
  const xData = days.map(d => `${m}/${d}`)
  const data = days.map(d => {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${d}`
    const rs = periodRecords.value.filter(r => r.recordDate === dateStr)
    const t = rs.reduce((s, r) => s + r.totalCount, 0)
    const cc = rs.reduce((s, r) => s + r.completedCount, 0)
    return t ? Math.round((cc / t) * 100) : (rs.length ? 0 : null as any)
  })
  c.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: xData, axisLabel: { color: '#606266', fontSize: 11 }, axisLine: { lineStyle: { color: '#e4e7ed' } } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: '#606266' }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
    series: [{
      type: 'line', smooth: true, connectNulls: true,
      data,
      symbol: 'circle', symbolSize: 6,
      lineStyle: { width: 3, color: '#13c2c2' },
      itemStyle: { color: '#13c2c2', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(19, 194, 194, 0.35)' }, { offset: 1, color: 'rgba(19, 194, 194, 0.02)' }
        ])
      }
    }]
  })
  charts.push(c)
}

function renderChart4() {
  if (!chart4Ref.value) return
  const c = echarts.init(chart4Ref.value)
  const dis = appStore.disinfectants
  const names = dis.map(d => d.name)
  const consumed = dis.map(d => {
    const total = appStore.disinfectantLogs
      .filter(l => l.type === 'consume' && l.disinfectantId === d.id && l.createdAt.startsWith(dateRange.value))
      .reduce((s, l) => s + l.quantity, 0) / 1000
    return Number(total.toFixed(2))
  })
  const stock = dis.map(d => d.stock)
  c.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['已消耗(L)', '剩余库存(L)'], top: 0 },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: names, axisLabel: { color: '#606266' } },
    yAxis: { type: 'value', axisLabel: { color: '#606266' }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
    series: [
      { name: '已消耗(L)', type: 'bar', stack: 'total', data: consumed, itemStyle: { color: '#fa8c16', borderRadius: [0, 0, 0, 0] }, barWidth: '36%' },
      { name: '剩余库存(L)', type: 'bar', stack: 'total', data: stock, itemStyle: { color: '#52c41a', borderRadius: [6, 6, 0, 0] }, label: { show: true, position: 'top', formatter: '总{p|{c}}L', rich: { p: { color: '#1890ff', fontWeight: 600 } } } }
    ]
  })
  charts.push(c)
}

onMounted(() => {
  setTimeout(renderAllCharts, 150)
  window.addEventListener('resize', () => charts.forEach(c => c.resize()))
})
</script>

<style scoped lang="css">
.stat-card {
  padding: 20px;
  border-radius: 12px;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 120px;
}
.gradient-blue { background: linear-gradient(135deg, #1890ff, #69c0ff); }
.gradient-green { background: linear-gradient(135deg, #52c41a, #95de64); }
.gradient-orange { background: linear-gradient(135deg, #fa8c16, #ffc069); }
.gradient-purple { background: linear-gradient(135deg, #722ed1, #b37feb); }

.stat-card::after {
  content: '';
  position: absolute; right: -30px; bottom: -30px;
  width: 120px; height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.stat-icon { font-size: 28px; opacity: 0.9; }
.stat-num { font-size: 36px; font-weight: 700; margin: 8px 0 4px; line-height: 1; }
.stat-num small { font-size: 18px; margin-left: 2px; font-weight: 400; opacity: 0.9; }
.stat-label { font-size: 13px; opacity: 0.9; }

.card-title { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.chart-card { border-radius: 12px; }

.rank-list { padding: 6px 4px; }
.rank-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 6px;
  border-bottom: 1px solid #f5f5f5;
}
.rank-item:last-child { border-bottom: none; }

.rank-num {
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px;
  background: #f0f0f0; color: #606266;
  flex-shrink: 0;
}
.rank-1 { background: linear-gradient(135deg, #f5222d, #ff7875); color: white; }
.rank-2 { background: linear-gradient(135deg, #fa8c16, #ffc069); color: white; }
.rank-3 { background: linear-gradient(135deg, #faad14, #ffe58f); color: white; }

.rank-info { flex: 1; min-width: 0; }
.rank-name { font-weight: 600; font-size: 13px; }
.rank-count { min-width: 40px; text-align: right; flex-shrink: 0; font-size: 14px; }

.photo-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  max-height: 340px;
  overflow: auto;
}
.wall-item {
  border-radius: 8px; overflow: hidden;
  background: #fafafa;
  cursor: pointer;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}
.wall-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); }
.wall-photo { width: 100%; height: 90px; display: block; }
.wall-info {
  padding: 6px 8px;
  display: flex; justify-content: space-between; align-items: center;
  background: white;
}
.wall-date { font-size: 11px; color: #909399; }
</style>
