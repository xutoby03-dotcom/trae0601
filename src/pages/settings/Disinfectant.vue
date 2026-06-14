<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <div>
        <h2 class="page-title">消毒液管理</h2>
        <p class="page-desc">管理消毒液的型号、库存、有效期，系统将自动校验过期情况</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增消毒液</el-button>
    </div>

    <el-card class="card-shadow" shadow="never">
      <el-table :data="appStore.disinfectants" border stripe>
        <el-table-column prop="model" label="型号" width="140" />
        <el-table-column prop="name" label="名称" width="130" />
        <el-table-column prop="manufacturer" label="生产厂家" min-width="120" />
        <el-table-column label="有效期" width="140">
          <template #default="{ row }">
            <span :style="{ color: getStatusInfo(row.id).color, fontWeight: 600 }">
              {{ row.expireDate }}
            </span>
            <el-tag v-if="!getStatusInfo(row.id).valid" type="danger" size="small" effect="dark" style="margin-left: 6px;">
              已过期
            </el-tag>
            <el-tag v-else-if="getStatusInfo(row.id).warning" type="warning" size="small" effect="light" style="margin-left: 6px;">
              剩{{ getStatusInfo(row.id).daysLeft }}天
            </el-tag>
            <el-tag v-else type="success" size="small" effect="plain" style="margin-left: 6px;">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="库存 (L)" width="140">
          <template #default="{ row }">
            <el-progress
              type="dashboard"
              :percentage="Math.min(100, Math.round(row.stock / 50 * 100))"
              :width="60"
              :stroke-width="10"
              :show-text="false"
              style="float: left; margin-right: 10px;"
            />
            <div style="padding-top: 12px;">
              <div style="font-weight: 600;">{{ row.stock.toFixed(1) }} L</div>
              <div style="font-size: 11px; color: #909399;">单次使用 {{ row.unitConsumption }}mL</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="!getStatusInfo(row.id).valid ? 'danger' : row.stock < 5 ? 'warning' : 'success'" size="small">
              {{ !getStatusInfo(row.id).valid ? '已过期' : row.stock < 5 ? '库存低' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="success" link size="small" :icon="Plus" @click="openPurchase(row)">采购入库</el-button>
            <el-button type="primary" link size="small" :icon="Edit" @click="openDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="card-shadow mt-20" shadow="never">
      <template #header>
        <div class="flex-between">
          <span class="card-title"><el-icon><Document /></el-icon>&nbsp;变动记录</span>
          <el-tag type="info" effect="plain">最近 50 条</el-tag>
        </div>
      </template>
      <el-table :data="recentLogs" border stripe size="small">
        <el-table-column label="时间" width="160">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'purchase' ? 'success' : 'warning'" size="small" effect="light">
              {{ row.type === 'purchase' ? '采购入库' : '消耗' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="消毒液" width="140">
          <template #default="{ row }">{{ getDisName(row.disinfectantId) }}</template>
        </el-table-column>
        <el-table-column label="数量(mL)" width="100" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.type === 'purchase' ? '#52c41a' : '#fa8c16', fontWeight: 600 }">
              {{ row.type === 'purchase' ? '+' : '-' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" width="100">
          <template #default="{ row }">{{ appStore.getUser(row.operatorId)?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="form.id ? '编辑消毒液' : '新增消毒液'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="消毒液型号" prop="model">
          <el-input v-model="form.model" placeholder="例如：D-84-500" />
        </el-form-item>
        <el-form-item label="消毒液名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：84消毒液" />
        </el-form-item>
        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="form.manufacturer" placeholder="例如：利康日化" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="有效期至" prop="expireDate">
              <el-date-picker v-model="form.expireDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="初始库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :step="1" :precision="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="单次用量(ml)" prop="unitConsumption">
          <el-input-number v-model="form.unitConsumption" :min="1" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="purchaseVisible" title="消毒液采购入库" width="420px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="消毒液">
          <el-input :value="purchaseDis?.name + ' (' + purchaseDis?.model + ')'" disabled />
        </el-form-item>
        <el-form-item label="采购数量(L)">
          <el-input-number v-model="purchaseQty" :min="1" :step="1" :precision="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="purchaseRemark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="purchaseVisible = false">取消</el-button>
        <el-button type="success" @click="submitPurchase">确认入库</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Document } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { genId } from '@/services/storage'
import type { Disinfectant } from '@/types'

const appStore = useAppStore()
const authStore = useAuthStore()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const createEmptyForm = () => ({
  id: '', model: '', name: '', manufacturer: '', expireDate: '',
  stock: 20, unitConsumption: 50, status: 'active' as Disinfectant['status']
})
const form = reactive<Partial<Disinfectant>>(createEmptyForm())
const rules: FormRules = {
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入厂家', trigger: 'blur' }],
  expireDate: [{ required: true, message: '请选择有效期', trigger: 'change' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'change' }],
  unitConsumption: [{ required: true, message: '请输入用量', trigger: 'change' }]
}

function getStatusInfo(id: string) {
  const r = appStore.checkDisinfectantValid(id)
  let color = '#52c41a'
  if (!r.valid) color = '#f5222d'
  else if (r.warning) color = '#fa8c16'
  return { ...r, color }
}

function openDialog(row?: Disinfectant) {
  if (row) Object.assign(form, row)
  else Object.assign(form, createEmptyForm())
  visible.value = true
}
async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(v => {
    if (!v) return
    submitting.value = true
    try {
      if (form.id) {
        appStore.updateDisinfectant(form.id, {
          model: form.model, name: form.name, manufacturer: form.manufacturer,
          expireDate: form.expireDate!, stock: form.stock!, unitConsumption: form.unitConsumption!
        })
        ElMessage.success('已更新')
      } else {
        appStore.addDisinfectant({
          model: form.model!, name: form.name!, manufacturer: form.manufacturer!,
          expireDate: form.expireDate!, stock: form.stock!, unitConsumption: form.unitConsumption!, status: 'active'
        })
        ElMessage.success('已创建')
      }
      visible.value = false
    } finally {
      submitting.value = false
    }
  })
}

const recentLogs = computed(() => [...appStore.disinfectantLogs].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()).slice(0, 50))
function formatTime(s: string) { return dayjs(s).format('YYYY-MM-DD HH:mm:ss') }
function getDisName(id: string) { return appStore.getDisinfectant(id)?.name + ' (' + appStore.getDisinfectant(id)?.model + ')' || id }

const purchaseVisible = ref(false)
const purchaseDis = ref<Disinfectant | null>(null)
const purchaseQty = ref(10)
const purchaseRemark = ref('')
function openPurchase(row: Disinfectant) {
  purchaseDis.value = row
  purchaseQty.value = 10
  purchaseRemark.value = ''
  purchaseVisible.value = true
}
function submitPurchase() {
  if (!purchaseDis.value) return
  appStore.updateDisinfectant(purchaseDis.value.id, { stock: purchaseDis.value.stock + purchaseQty.value })
  appStore.disinfectantLogs.push({
    id: genId(), disinfectantId: purchaseDis.value.id, type: 'purchase',
    quantity: purchaseQty.value * 1000,
    operatorId: authStore.currentUser!.id,
    remark: purchaseRemark.value || '采购入库',
    createdAt: new Date().toISOString()
  })
  appStore.persist()
  ElMessage.success(`入库成功，当前库存 ${(purchaseDis.value.stock).toFixed(1)} L`)
  purchaseVisible.value = false
}
</script>

<style scoped lang="css">
.mt-20 { margin-top: 20px; }
.card-title { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
</style>
