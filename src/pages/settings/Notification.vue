<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">提醒设置</h2>
      <p class="page-desc">配置店长提醒规则，确保漏做步骤和异常情况能及时通知</p>
    </div>

    <el-card class="card-shadow" shadow="never">
      <el-form :model="form" label-width="180px" size="large">
        <el-divider content-position="left">消息通知开关</el-divider>

        <el-form-item label="漏做步骤提醒店长">
          <el-switch v-model="form.missedEnabled" active-text="开启" inactive-text="关闭" />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            员工消毒记录存在漏做步骤时，自动给店长发送消息通知
          </div>
        </el-form-item>

        <el-form-item label="任务逾期提醒店长">
          <el-switch v-model="form.taskExpiredEnabled" active-text="开启" inactive-text="关闭" />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            超过班次结束时间仍未完成消毒任务时，自动提醒店长
          </div>
        </el-form-item>

        <el-form-item label="异常照片自动提醒">
          <el-switch v-model="form.abnormalEnabled" active-text="开启" inactive-text="关闭" />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            记录中标记为异常类型的照片，自动汇总并提醒店长查看
          </div>
        </el-form-item>

        <el-divider content-position="left">预警参数配置</el-divider>

        <el-form-item label="消毒液过期预警天数">
          <el-input-number
            v-model="form.disinfectantWarningDays"
            :min="1" :max="60" :step="1"
          />&nbsp; 天前提醒
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            消毒液到期前 N 天开始显示黄色预警，提醒及时采购更换
          </div>
        </el-form-item>

        <el-divider content-position="left">通知预览</el-divider>
        <div class="preview-box">
          <div class="preview-item missed">
            <div class="pv-icon"><el-icon color="#f5222d"><WarningFilled /></el-icon></div>
            <div class="pv-body">
              <p class="pv-title">【漏做提醒】ICM-A001 打烊消毒</p>
              <p class="pv-content">执行员工：李员工。未完成零件：出料口总成、搅拌轴×3。</p>
              <p class="pv-time">刚刚</p>
            </div>
          </div>
          <div class="preview-item warn">
            <div class="pv-icon"><el-icon color="#fa8c16"><MagicStick /></el-icon></div>
            <div class="pv-body">
              <p class="pv-title">消毒液即将过期</p>
              <p class="pv-content">84消毒液 (D-84-500) 剩余 {{ form.disinfectantWarningDays }} 天到期，请及时采购更换。</p>
              <p class="pv-time">10 分钟前</p>
            </div>
          </div>
        </div>

        <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
          <el-button type="primary" size="large" :icon="Check" @click="saveSettings">保存设置</el-button>
          <el-button size="large" @click="resetSettings">恢复默认</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, WarningFilled, MagicStick } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import type { NotificationSettings } from '@/types'

const appStore = useAppStore()
const form = reactive<NotificationSettings>({ ...appStore.notificationSettings })

function saveSettings() {
  appStore.updateNotificationSettings({ ...form })
  ElMessage.success('提醒设置已保存')
}

function resetSettings() {
  Object.assign(form, {
    missedEnabled: true,
    disinfectantWarningDays: 7,
    taskExpiredEnabled: true,
    abnormalEnabled: true
  })
  ElMessage.info('已恢复默认配置，记得点击保存')
}
</script>

<style scoped lang="css">
.preview-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}
.preview-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: #fafbfc;
}
.preview-item.missed { border-color: #ffa39e; background: #fff1f0; }
.preview-item.warn { border-color: #ffd591; background: #fff7e6; }
.pv-icon {
  width: 36px; height: 36px;
  background: white;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}
.pv-body { flex: 1; min-width: 0; }
.pv-title { margin: 0 0 4px; font-weight: 600; font-size: 13px; }
.pv-content { margin: 0 0 4px; font-size: 12px; color: #606266; line-height: 1.5; }
.pv-time { margin: 0; font-size: 11px; color: #909399; }
</style>
