<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <div>
        <h2 class="page-title">设备档案</h2>
        <p class="page-desc">管理冰淇淋机的基础信息、零件清单和照片资料</p>
      </div>
      <el-button type="primary" :icon="Plus" v-if="authStore.isManager" @click="openCreateDialog">
        新增设备
      </el-button>
    </div>

    <div class="filter-bar card-shadow">
      <el-input v-model="searchKeyword" placeholder="搜索机器编号/名称" :prefix-icon="Search" clearable style="width: 260px;" />
      <el-select v-model="filterShift" placeholder="班次筛选" clearable style="width: 160px;">
        <el-option v-for="s in appStore.shifts" :key="s.id" :label="s.name" :value="s.id" />
      </el-select>
      <el-tag type="info" effect="plain">共 {{ filteredDevices.length }} 台设备</el-tag>
    </div>

    <el-row v-if="filteredDevices.length" :gutter="16">
      <el-col v-for="dev in filteredDevices" :key="dev.id" :xs="24" :sm="12" :lg="8" :xl="6">
        <el-card class="device-card card-shadow card-hover" shadow="never">
          <div class="device-header">
            <div class="device-icon-wrap">
              <el-icon :size="32" color="#fff"><IceCreamSquare /></el-icon>
            </div>
            <el-tag :type="dev.status === 'active' ? 'success' : 'warning'" effect="dark" size="small">
              {{ dev.status === 'active' ? '运行中' : dev.status === 'maintenance' ? '维护中' : '停用' }}
            </el-tag>
          </div>

          <div class="machine-no">{{ dev.machineNo }}</div>
          <div class="device-name">{{ dev.name }}</div>

          <div class="device-info-list">
            <div class="info-row">
              <span class="info-label">口味槽</span>
              <span class="info-value">
                <el-icon v-for="i in dev.flavorSlots" :key="i" color="#fa8c16"><IceCreamRound /></el-icon>
                &nbsp;{{ dev.flavorSlots }}个
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">消毒液</span>
              <span class="info-value">{{ getDisinfectantName(dev.disinfectantId) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">零件数</span>
              <span class="info-value">{{ dev.parts.length }} 个必检零件</span>
            </div>
            <div class="info-row">
              <span class="info-label">负责班次</span>
              <span class="info-value shift-tags">
                <el-tag v-for="sid in dev.shiftIds" :key="sid" size="small" effect="plain"
                  :color="getShiftColor(sid)" style="margin-right: 4px;">
                  {{ getShiftName(sid) }}
                </el-tag>
              </span>
            </div>
            <div class="info-row" v-if="dev.location">
              <span class="info-label">位置</span>
              <span class="info-value">{{ dev.location }}</span>
            </div>
          </div>

          <div class="device-actions">
            <el-button type="primary" link :icon="View" @click="openDetailDialog(dev)">详情</el-button>
            <el-button type="primary" link :icon="Edit" v-if="authStore.isManager" @click="openEditDialog(dev)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" v-if="authStore.isManager" @click="removeDevice(dev)">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-else description="暂无设备档案，请先添加设备" />

    <el-dialog v-model="detailVisible" :title="`设备详情 - ${currentDevice?.machineNo}`" width="680px" destroy-on-close>
      <el-descriptions v-if="currentDevice" :column="2" border size="default">
        <el-descriptions-item label="机器编号">{{ currentDevice.machineNo }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentDevice.name }}</el-descriptions-item>
        <el-descriptions-item label="口味槽数">{{ currentDevice.flavorSlots }}</el-descriptions-item>
        <el-descriptions-item label="消毒液型号">{{ getDisinfectantName(currentDevice.disinfectantId) }}</el-descriptions-item>
        <el-descriptions-item label="负责班次">{{ currentDevice.shiftIds.map(s => getShiftName(s)).join('、') }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentDevice.status === 'active' ? '运行中' : '停用' }}</el-descriptions-item>
        <el-descriptions-item label="安装位置" :span="2">{{ currentDevice.location || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">零件清单（按消毒顺序）</el-divider>
      <el-table v-if="currentDevice" :data="currentDevice.parts" size="small" border stripe>
        <el-table-column prop="sortOrder" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="零件名称" width="140" />
        <el-table-column prop="category" label="分类" width="90">
          <template #default="{ row }">
            <el-tag size="small" :color="categoryColor(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="required" label="必检" width="70" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.required" color="#52c41a"><CircleCheckFilled /></el-icon>
            <el-icon v-else color="#c0c4cc"><CircleClose /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作说明" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="formVisible" :title="formMode === 'create' ? '新增设备' : '编辑设备'" width="760px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="机器编号" prop="machineNo">
              <el-input v-model="form.machineNo" placeholder="例如: ICM-2025-A001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="form.name" placeholder="例如: 软质冰淇淋机1号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="口味槽数" prop="flavorSlots">
              <el-input-number v-model="form.flavorSlots" :min="1" :max="6" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消毒液" prop="disinfectantId">
              <el-select v-model="form.disinfectantId" placeholder="选择消毒液" style="width: 100%;">
                <el-option v-for="d in appStore.disinfectants" :key="d.id" :label="`${d.name} (${d.model})`" :value="d.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="负责班次" prop="shiftIds">
              <el-checkbox-group v-model="form.shiftIds">
                <el-checkbox v-for="s in appStore.shifts" :key="s.id" :label="s.id">
                  {{ s.name }} ({{ s.startTime }}-{{ s.endTime }})
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装位置">
              <el-input v-model="form.location" placeholder="例如: 前台左侧" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备状态" prop="status">
              <el-select v-model="form.status" style="width: 100%;">
                <el-option label="运行中" value="active" />
                <el-option label="维护中" value="maintenance" />
                <el-option label="停用" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          零件清单
          <el-button type="primary" link size="small" style="margin-left: 12px;" :icon="Plus" @click="addPart">添加零件</el-button>
        </el-divider>
        <el-table :data="form.parts" border size="small">
          <el-table-column label="顺序" width="60" align="center">
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="零件名称" min-width="130">
            <template #default="{ row }">
              <el-input v-model="row.name" size="small" placeholder="零件名称" />
            </template>
          </el-table-column>
          <el-table-column label="分类" width="110">
            <template #default="{ row }">
              <el-select v-model="row.category" size="small">
                <el-option label="缸体" value="缸体" />
                <el-option label="出料" value="出料" />
                <el-option label="搅拌" value="搅拌" />
                <el-option label="接水" value="接水" />
                <el-option label="外壳" value="外壳" />
                <el-option label="其他" value="其他" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="必检" width="60" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.required" />
            </template>
          </el-table-column>
          <el-table-column label="操作说明" min-width="180">
            <template #default="{ row }">
              <el-input v-model="row.description" size="small" placeholder="操作说明" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" :icon="Delete" @click="removePart($index)" :disabled="form.parts.length <= 1">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, View, Edit, Delete, IceCreamSquare, IceCreamRound } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { genId } from '@/services/storage'
import type { Device, Part } from '@/types'

const authStore = useAuthStore()
const appStore = useAppStore()

const searchKeyword = ref('')
const filterShift = ref('')

const filteredDevices = computed(() => {
  let list = appStore.devices
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(d => d.machineNo.toLowerCase().includes(kw) || d.name.toLowerCase().includes(kw))
  }
  if (filterShift.value) list = list.filter(d => d.shiftIds.includes(filterShift.value))
  return list
})

function getShiftName(id: string) { return appStore.getShift(id)?.name || id }
function getShiftColor(id: string) {
  const s = appStore.getShift(id)
  if (!s) return '#e6f7ff'
  if (s.type === 'opening') return '#e6f7ff'
  if (s.type === 'midday') return '#e6fffb'
  return '#f9f0ff'
}
function getDisinfectantName(id: string) {
  const d = appStore.getDisinfectant(id)
  return d ? `${d.name} (${d.model})` : id
}
function categoryColor(cat: string) {
  const map: Record<string, string> = { '缸体': '#bae7ff', '出料': '#d9f7be', '搅拌': '#ffd591', '接水': '#ffe7ba', '外壳': '#e0e0e0' }
  return map[cat] || '#f0f0f0'
}

const detailVisible = ref(false)
const currentDevice = ref<Device | null>(null)
function openDetailDialog(dev: Device) {
  currentDevice.value = dev
  detailVisible.value = true
}

const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingId = ref('')
const submitting = ref(false)
const formRef = ref<FormInstance>()

const createEmptyForm = () => ({
  machineNo: '', name: '', flavorSlots: 3, disinfectantId: appStore.disinfectants[0]?.id || '',
  shiftIds: [], location: '', status: 'active' as Device['status'],
  parts: [
    { name: '', category: '缸体', required: true, description: '', sortOrder: 1 },
    { name: '', category: '出料', required: true, description: '', sortOrder: 2 },
    { name: '', category: '搅拌', required: true, description: '', sortOrder: 3 },
    { name: '', category: '接水', required: true, description: '', sortOrder: 4 },
    { name: '', category: '外壳', required: true, description: '', sortOrder: 5 }
  ] as Omit<Part, 'id' | 'deviceId'>[]
})

const form = reactive(createEmptyForm())
const rules: FormRules = {
  machineNo: [{ required: true, message: '请输入机器编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  flavorSlots: [{ required: true, message: '请输入口味槽数', trigger: 'change' }],
  disinfectantId: [{ required: true, message: '请选择消毒液', trigger: 'change' }],
  shiftIds: [{ type: 'array', required: true, min: 1, message: '请至少选择一个班次', trigger: 'change' }]
}

function resetForm() {
  Object.assign(form, createEmptyForm())
}

function openCreateDialog() {
  resetForm()
  formMode.value = 'create'
  editingId.value = ''
  formVisible.value = true
}

function openEditDialog(dev: Device) {
  formMode.value = 'edit'
  editingId.value = dev.id
  Object.assign(form, {
    machineNo: dev.machineNo, name: dev.name, flavorSlots: dev.flavorSlots,
    disinfectantId: dev.disinfectantId, shiftIds: [...dev.shiftIds],
    location: dev.location || '', status: dev.status,
    parts: dev.parts.map(p => ({ name: p.name, category: p.category, required: p.required, description: p.description || '', sortOrder: p.sortOrder }))
  })
  formVisible.value = true
}

function addPart() {
  form.parts.push({ name: '', category: '其他', required: false, description: '', sortOrder: form.parts.length + 1 })
}
function removePart(idx: number) {
  form.parts.splice(idx, 1)
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (!valid) return
    const invalidParts = form.parts.filter(p => !p.name.trim())
    if (invalidParts.length) {
      ElMessage.warning('请完善所有零件名称')
      return
    }
    submitting.value = true
    try {
      const parts = form.parts.map((p, i) => ({ ...p, sortOrder: i + 1, id: genId(), deviceId: formMode.value === 'edit' ? editingId.value : '' }))
      if (formMode.value === 'create') {
        appStore.addDevice({
          machineNo: form.machineNo, name: form.name, flavorSlots: form.flavorSlots,
          disinfectantId: form.disinfectantId, shiftIds: form.shiftIds,
          location: form.location, status: form.status,
          parts: form.parts.map((p, i) => ({ ...p, sortOrder: i + 1 }))
        })
        ElMessage.success('设备档案创建成功')
      } else {
        appStore.updateDevice(editingId.value, {
          machineNo: form.machineNo, name: form.name, flavorSlots: form.flavorSlots,
          disinfectantId: form.disinfectantId, shiftIds: form.shiftIds,
          location: form.location, status: form.status,
          parts
        })
        ElMessage.success('设备档案已更新')
      }
      formVisible.value = false
    } finally {
      submitting.value = false
    }
  })
}

function removeDevice(dev: Device) {
  ElMessageBox.confirm(`确认删除设备【${dev.machineNo} ${dev.name}】吗？相关历史消毒记录将保留。`, '确认删除', {
    type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消'
  }).then(() => {
    appStore.deleteDevice(dev.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}
</script>

<style scoped lang="css">
.filter-bar {
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.device-card {
  margin-bottom: 16px;
  padding: 8px;
  overflow: hidden;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.device-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1890ff, #69c0ff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.machine-no {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.device-name {
  color: var(--text-secondary);
  font-size: 13px;
  margin: 2px 0 14px;
}

.device-info-list {
  padding: 12px;
  background: #fafbfc;
  border-radius: 8px;
  margin-bottom: 14px;
}

.info-row {
  display: flex;
  padding: 5px 0;
  font-size: 13px;
}

.info-label {
  color: #909399;
  width: 70px;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

.shift-tags { display: flex; flex-wrap: wrap; }

.device-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px dashed var(--border-color);
}
</style>
