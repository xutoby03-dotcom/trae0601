<template>
  <div class="login-page">
    <div class="left-panel">
      <div class="brand-area">
        <div class="logo-box">
          <el-icon :size="56" color="#ffc53d"><IceCreamRound /></el-icon>
        </div>
        <h1 class="brand-title">冰淇淋机消毒管理系统</h1>
        <p class="brand-slogan">标准化消毒流程 · 确保食品安全 · 责任清晰可追溯</p>
      </div>
      <div class="features-grid">
        <div class="feature-item">
          <el-icon :size="24"><CircleCheckFilled /></el-icon>
          <span>标准化步骤</span>
        </div>
        <div class="feature-item">
          <el-icon :size="24"><Picture /></el-icon>
          <span>照片留痕</span>
        </div>
        <div class="feature-item">
          <el-icon :size="24"><Warning /></el-icon>
          <span>漏做提醒</span>
        </div>
        <div class="feature-item">
          <el-icon :size="24"><DataLine /></el-icon>
          <span>数据统计</span>
        </div>
      </div>
      <div class="demo-tips">
        <p>演示账号：</p>
        <p>店长：manager / 123456</p>
        <p>员工：staff01 / 123456</p>
      </div>
    </div>

    <div class="right-panel">
      <div class="login-card card-shadow">
        <el-tabs v-model="activeRole" class="role-tabs">
          <el-tab-pane label="店长登录" name="manager">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleLogin">
              <el-form-item label="账号" prop="username">
                <el-input v-model="form.username" size="large" placeholder="请输入店长账号" :prefix-icon="User" clearable />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" size="large" type="password" show-password placeholder="请输入密码" :prefix-icon="Lock" @keyup.enter="handleLogin" />
              </el-form-item>
              <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
                <el-icon><Right /></el-icon>
                店长登录
              </el-button>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="员工登录" name="staff">
            <el-form ref="formRef2" :model="form" :rules="rules" label-position="top" @submit.prevent="handleLogin">
              <el-form-item label="账号" prop="username">
                <el-input v-model="form.username" size="large" placeholder="请输入员工账号" :prefix-icon="User" clearable />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" size="large" type="password" show-password placeholder="请输入密码" :prefix-icon="Lock" @keyup.enter="handleLogin" />
              </el-form-item>
              <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
                <el-icon><Right /></el-icon>
                员工登录
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <div class="login-footer">
          <p>© 2025 冰淇淋机消毒管理系统</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Right } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { initMockData } from '@/services/storage'

initMockData()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeRole = ref<'manager' | 'staff'>('staff')
const loading = ref(false)
const formRef = ref<FormInstance>()
const formRef2 = ref<FormInstance>()
const form = reactive({ username: '', password: '' })
const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  const ref = activeRole.value === 'manager' ? formRef.value : formRef2.value
  if (!ref) return
  await ref.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const user = authStore.login(form.username, form.password)
      if (user) {
        if (user.role !== activeRole.value) {
          ElMessage.error(`该账号为${user.role === 'manager' ? '店长' : '员工'}账号，请切换登录入口`)
          loading.value = false
          return
        }
        ElMessage.success(`欢迎回来，${user.name}！`)
        const redirect = (route.query.redirect as string) || '/dashboard'
        router.replace(redirect)
      } else {
        ElMessage.error('账号或密码错误')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="css">
.login-page {
  height: 100vh;
  width: 100%;
  display: flex;
  background: var(--bg-body);
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #001529 0%, #003a70 50%, #0050b3 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px;
  position: relative;
  overflow: hidden;
}

.left-panel::before {
  content: '';
  position: absolute;
  right: -100px;
  top: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(24, 144, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
}

.left-panel::after {
  content: '';
  position: absolute;
  left: -50px;
  bottom: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(19, 194, 194, 0.25) 0%, transparent 70%);
  border-radius: 50%;
}

.brand-area {
  position: relative;
  z-index: 1;
  margin-bottom: 60px;
}

.logo-box {
  width: 88px;
  height: 88px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #fff 0%, #91caff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-slogan {
  font-size: 15px;
  opacity: 0.75;
  margin: 0;
  letter-spacing: 0.5px;
}

.features-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 60px;
  max-width: 400px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 14px;
  opacity: 0.9;
}

.demo-tips {
  position: relative;
  z-index: 1;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  max-width: 400px;
}

.demo-tips p {
  margin: 4px 0;
  font-size: 13px;
  opacity: 0.8;
}

.demo-tips p:first-child {
  opacity: 1;
  font-weight: 600;
  margin-bottom: 8px;
}

.right-panel {
  width: 520px;
  background: var(--bg-body);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 36px 28px;
  background: white;
}

.role-tabs :deep(.el-tabs__header) {
  margin-bottom: 28px;
}

.role-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 600;
  height: 48px;
}

.role-tabs :deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 2px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 12px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
}

.login-footer {
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.login-footer p {
  margin: 0;
  font-size: 12px;
  color: var(--text-placeholder);
}

@media (max-width: 960px) {
  .left-panel {
    display: none;
  }
  .right-panel {
    width: 100%;
  }
}
</style>
