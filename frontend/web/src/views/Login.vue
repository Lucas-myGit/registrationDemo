<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧品牌区 -->
      <div class="brand-section">
        <div class="brand-bg"></div>
        <div class="brand-content">
          <div class="logo">
            <el-icon :size="28" color="#fff"><FirstAidKit /></el-icon>
          </div>
          <div class="brand-text">
            <h1>智慧医院管理系统</h1>
            <p>Smart Hospital System</p>
          </div>
        </div>
        <div class="brand-hero">
          <h2>医生端数字化工作台</h2>
          <p>高效联通医患，精准管理数据。2026年最新升级版，赋能医疗专业协作。</p>
        </div>
        <div class="brand-footer">
          <span>当前日期: {{ currentDate }}</span>
          <span>版本号 v4.2.0</span>
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="login-section">
        <div class="login-form-wrapper">
          <div class="login-header">
            <h2>欢迎登录</h2>
            <p>请登录您的医生工作账号</p>
          </div>

          <div class="login-tabs">
            <div
              class="tab"
              :class="{ active: loginType === 'account' }"
              @click="loginType = 'account'"
            >账号密码</div>
            <div
              class="tab"
              :class="{ active: loginType === 'mobile' }"
              @click="loginType = 'mobile'"
            >手机验证码</div>
          </div>

          <el-form :model="form" class="login-form">
            <el-form-item>
              <el-input
                v-model="form.username"
                placeholder="请输入您的工号或手机号"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>

            <el-form-item v-if="loginType === 'account'">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>

            <el-form-item v-else>
              <el-input
                v-model="form.code"
                placeholder="6位验证码"
                prefix-icon="Key"
                size="large"
              >
                <template #append>
                  <el-button>获取验证码</el-button>
                </template>
              </el-input>
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住账号</el-checkbox>
              <a href="#" class="forgot-link">忘记密码?</a>
            </div>

            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              进入工作台
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </el-form>

          <p class="terms">
            登录即代表您同意
            <a href="#">《医生端服务协议》</a>
            和
            <a href="#">《个人信息保护政策》</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FirstAidKit, ArrowRight } from '@element-plus/icons-vue'
import { doctorLogin } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginType = ref('account')
const loading = ref(false)
const rememberMe = ref(false)

const form = ref({
  username: 'admin',
  password: '123',
  code: ''
})

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`
})

const handleLogin = async () => {
  if (!form.value.username) {
    ElMessage.warning('请输入工号或手机号')
    return
  }
  if (loginType.value === 'account' && !form.value.password) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    const res = await doctorLogin({
      username: form.value.username,
      password: form.value.password
    })

    if (res.code === 200) {
      userStore.setUser(res.data.userInfo, res.data.token)
      ElMessage.success('登录成功')
      router.push('/workbench')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-container {
  width: 100%;
  max-width: 1200px;
  height: 720px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  display: flex;
  overflow: hidden;
}

.brand-section {
  width: 50%;
  background: linear-gradient(135deg, #3b82f6, #4f46e5);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.brand-bg {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23fff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.logo {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.brand-text h1 {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.brand-text p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.brand-hero {
  position: relative;
  z-index: 1;
}

.brand-hero h2 {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 16px;
}

.brand-hero p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.brand-footer {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 1;
}

.login-section {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 380px;
}

.login-header {
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #64748b;
}

.login-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 32px;
}

.tab {
  padding: 12px 24px;
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.login-form {
  margin-bottom: 24px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-link {
  font-size: 14px;
  color: #3b82f6;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
}

.terms {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 40px;
}

.terms a {
  color: #64748b;
  text-decoration: underline;
}
</style>
