<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <div>
        <h2 class="page-title">班次配置</h2>
        <p class="page-desc">配置消毒班次的时间段，系统将按班次自动生成消毒任务</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增班次</el-button>
    </div>

    <el-card class="card-shadow" shadow="never">
      <el-table :data="appStore.shifts" border stripe>
        <el-table-column prop="name" label="班次名称" width="140" />
        <el-table-column label="时段类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'opening' ? 'primary' : row.type === 'midday' ? 'success' : 'info'" effect="light">
              {{ row.type === 'opening' ? '开店前' : row.type === 'midday' ? '午间' : '打烊' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间段" width="200">
          <template #default="{ row }">
            <el-icon><Timer /></el-icon>&nbsp;
            <strong>{{ row.startTime }}</strong> ~ <strong>{{ row.endTime }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明描述" />
        <el-table-column label="关联设备" min-width="180">
          <template #default="{ row }">
            <div v-if="getDevicesByShift(row.id).length">
              <el-tag v-for="d in getDevicesByShift(row.id)" :key="d.id" size="small" effect="plain" style="margin: 2px 4px 2px 0;">
                {{ d.machineNo.slice(-6) }}
              </el-tag>
            </div>
            <span style="color: #c0c4cc;" v-else>暂无设备</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="Edit" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" :icon="Delete" @click="removeShift(row)" :disabled="getDevicesByShift(row.id).length > 0">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="form.id ? '编辑班次' : '新增班次'" width="460px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="班次名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：开店前消毒班次" />
        </el-form-item>
        <el-form-item label="时段类型" prop="type">
          <el-select v-model="form.type" style="width: 100%;">
            <el-option label="开店前（早晨）" value="opening" />
            <el-option label="午间（中午）" value="midday" />
            <el-option label="打烊（夜间）" value="closing" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker v-model="form.startTime" format="HH:mm" value-format="HH:mm" placeholder="选择开始时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker v-model="form.endTime" format="HH:mm" value-format="HH:mm" placeholder="选择结束时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="说明描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="班次描述说明（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, Timer } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import type { Shift } from '@/types'

const appStore = useAppStore()
const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<Partial<Shift>>({
  id: '', name: '', type: 'opening', startTime: '08:00', endTime: '09:00', description: ''
})
const rules: FormRules = {
  name: [{ required: true, message: '请输入班次名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择时段类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

function getDevicesByShift(sid: string) {
  return appStore.devices.filter(d => d.shiftIds.includes(sid))
}

function openDialog(row?: Shift) {
  if (row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, { id: '', name: '', type: 'opening', startTime: '08:00', endTime: '09:00', description: '' })
  }
  visible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(v => {
    if (!v) return
    submitting.value = true
    try {
      if (form.id) {
        appStore.updateShift(form.id, { name: form.name, type: form.type as Shift['type'], startTime: form.startTime!, endTime: form.endTime!, description: form.description })
        ElMessage.success('班次已更新')
      } else {
        appStore.addShift({ name: form.name!, type: form.type as Shift['type'], startTime: form.startTime!, endTime: form.endTime!, description: form.description })
        ElMessage.success('班次已创建')
      }
      visible.value = false
    } finally {
      submitting.value = false
    }
  })
}

function removeShift(row: Shift) {
  ElMessageBox.confirm(`确认删除班次【${row.name}】吗？`, '确认', { type: 'warning' })
    .then(() => {
      appStore.deleteShift(row.id)
      ElMessage.success('已删除')
    }).catch(() => {})
}
</script>
