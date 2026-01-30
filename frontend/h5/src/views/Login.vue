<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo">
        <el-icon :size="40" color="#fff"><FirstAidKit /></el-icon>
      </div>
      <h1>欢迎来到智慧医院</h1>
      <p>提供专业、便捷、高效的医疗健康服务</p>
    </div>

    <div class="login-form">
      <div class="tabs">
        <div
          class="tab"
          :class="{ active: loginType === 'password' }"
          @click="loginType = 'password'"
        >账号登录</div>
        <div
          class="tab"
          :class="{ active: loginType === 'code' }"
          @click="loginType = 'code'"
        >验证码登录</div>
      </div>

      <el-form :model="form" class="form">
        <el-form-item>
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
            prefix-icon="Phone"
            size="large"
          />
        </el-form-item>

        <el-form-item v-if="loginType === 'password'">
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
            placeholder="请输入验证码"
            prefix-icon="Key"
            size="large"
          >
            <template #append>
              <el-button>获取验证码</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          立即登录
        </el-button>
      </el-form>

      <div class="agreement">
        <el-checkbox v-model="agreed" />
        <span>我已阅读并同意<a href="#">《用户服务协议》</a>和<a href="#">《隐私政策》</a></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FirstAidKit } from '@element-plus/icons-vue'
import { patientLogin } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginType = ref('password')
const loading = ref(false)
const agreed = ref(false)

const form = ref({
  phone: '13333333333',
  password: '123',
  code: ''
})

const handleLogin = async () => {
  if (!form.value.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  if (loginType.value === 'password' && !form.value.password) {
    ElMessage.warning('请输入密码')
    return
  }
  if (!agreed.value) {
    ElMessage.warning('请先同意用户协议')
    return
  }

  loading.value = true
  try {
    const res = await patientLogin({
      phone: form.value.phone,
      password: form.value.password
    })

    if (res.code === 200) {
      userStore.setUser(res.data.userInfo, res.data.token)
      ElMessage.success('登录成功')
      router.push('/home')
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
  background: #fff;
}

.login-header {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  padding: 60px 24px 40px;
  color: #fff;
}

.logo {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.9;
}

.login-form {
  padding: 24px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.tab {
  padding: 12px 0;
  margin-right: 24px;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.form {
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
  margin-top: 16px;
}

.agreement {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.agreement a {
  color: #3b82f6;
  text-decoration: none;
}
</style>
