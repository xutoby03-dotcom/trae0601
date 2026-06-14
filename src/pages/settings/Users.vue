<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <div>
        <h2 class="page-title">员工管理</h2>
        <p class="page-desc">管理门店员工账号、角色权限和负责班次</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增员工</el-button>
    </div>

    <el-card class="card-shadow" shadow="never">
      <el-table :data="appStore.users" border stripe>
        <el-table-column label="账号信息" width="200">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-avatar :size="38" :style="{ background: row.role === 'manager' ? 'linear-gradient(135deg, #ff7a45, #fa8c16)' : 'linear-gradient(135deg, #1890ff, #40a9ff)' }">
                {{ row.name?.charAt(0) }}
              </el-avatar>
              <div>
                <div style="font-weight: 600;">{{ row.name }}</div>
                <div style="font-size: 12px; color: #909399;">{{ row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色权限" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.role === 'manager' ? 'warning' : 'primary'" effect="dark" size="small">
              {{ row.role === 'manager' ? '店长' : '员工' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属班次" min-width="200">
          <template #default="{ row }">
            <template v-if="row.shiftId">
              <el-tag type="success" effect="plain" size="small">
                {{ appStore.getShift(row.shiftId)?.name }}
                <span style="color: #909399; margin-left: 6px;">
                  {{ appStore.getShift(row.shiftId)?.startTime }}-{{ appStore.getShift(row.shiftId)?.endTime }}
                </span>
              </el-tag>
            </template>
            <span style="color: #c0c4cc;" v-else>未分配</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" effect="light" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="本月完成消毒" width="120" align="center">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #1890ff;">{{ getMonthCount(row.id) }}</span>
            <span style="color: #909399; font-size: 12px;"> 次</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="Edit" @click="openDialog(row)">编辑</el-button>
            <el-button type="warning" link size="small" v-if="row.id !== authStore.currentUser?.id" @click="toggleStatus(row)">
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="form.id ? '编辑员工' : '新增员工'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="员工真实姓名" />
        </el-form-item>
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="登录用账号" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="6位以上密码" />
          <div v-if="form.id" style="color: #909399; font-size: 12px; margin-top: 4px;">不修改请留空</div>
        </el-form-item>
        <el-form-item label="角色权限" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio label="manager">店长</el-radio>
            <el-radio label="staff">员工</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属班次">
          <el-select v-model="form.shiftId" placeholder="选择班次（可选）" clearable style="width: 100%;">
            <el-option
              v-for="s in appStore.shifts"
              :key="s.id"
              :label="`${s.name} (${s.startTime}-${s.endTime})`"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
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
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import type { User } from '@/types'

const appStore = useAppStore()
const authStore = useAuthStore()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const createEmptyForm = () => ({
  id: '', name: '', username: '', password: '123456',
  role: 'staff' as User['role'], shiftId: '', status: 'active' as User['status']
})
const form = reactive<Partial<User> & { password?: string }>(createEmptyForm())
const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }, { min: 3, message: '账号至少3位' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

function getMonthCount(uid: string) {
  return appStore.records.filter(r => r.operatorId === uid && r.recordDate.startsWith(dayjs().format('YYYY-MM'))).length
}

function openDialog(row?: User) {
  if (row) {
    Object.assign(form, { ...row, password: '' })
  } else {
    Object.assign(form, createEmptyForm())
  }
  visible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  const isEdit = !!form.id
  const submitRules = { ...rules }
  if (isEdit) {
    submitRules.password = [{ min: 6, message: '密码至少6位' }]
  }
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit) {
        const update: Partial<User> = { name: form.name!, role: form.role as User['role'], shiftId: form.shiftId, status: form.status as User['status'] }
        if (form.password) update.password = form.password
        appStore.updateUser(form.id!, update)
        ElMessage.success('员工信息已更新')
      } else {
        if (appStore.users.some(u => u.username === form.username)) {
          ElMessage.error('该账号已存在')
          return
        }
        appStore.addUser({
          username: form.username!, password: form.password!,
          name: form.name!, role: form.role as User['role'],
          shiftId: form.shiftId, status: form.status as User['status']
        })
        ElMessage.success('员工账号已创建')
      }
      visible.value = false
    } finally {
      submitting.value = false
    }
  })
}

function toggleStatus(row: User) {
  appStore.updateUser(row.id, { status: row.status === 'active' ? 'inactive' : 'active' })
  ElMessage.success(`已${row.status === 'active' ? '停用' : '启用'}`)
}
</script>
