<template>
  <div class="mine-page">
    <!-- 头部 -->
    <div class="profile-header">
      <div class="profile-info">
        <div class="avatar">
          <el-icon :size="32" color="#3b82f6"><User /></el-icon>
        </div>
        <div class="user-info">
          <h3>{{ userInfo?.name || '用户' }}</h3>
          <p>{{ userInfo?.phone }}</p>
        </div>
      </div>
      <el-icon :size="20" color="#fff"><Setting /></el-icon>
    </div>

    <!-- 统计 -->
    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">就诊档案</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.completed }}</span>
        <span class="stat-label">已完成</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.waiting }}</span>
        <span class="stat-label">待诊</span>
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list">
      <div class="menu-item" @click="$router.push('/records')">
        <div class="menu-left">
          <el-icon :size="20" color="#3b82f6"><Document /></el-icon>
          <span>就诊记录</span>
        </div>
        <el-icon :size="16" color="#ccc"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item">
        <div class="menu-left">
          <el-icon :size="20" color="#10b981"><Tickets /></el-icon>
          <span>缴费记录</span>
        </div>
        <el-icon :size="16" color="#ccc"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item">
        <div class="menu-left">
          <el-icon :size="20" color="#f59e0b"><Star /></el-icon>
          <span>我的收藏</span>
        </div>
        <el-icon :size="16" color="#ccc"><ArrowRight /></el-icon>
      </div>
    </div>

    <div class="menu-list">
      <div class="menu-item">
        <div class="menu-left">
          <el-icon :size="20" color="#6b7280"><QuestionFilled /></el-icon>
          <span>帮助中心</span>
        </div>
        <el-icon :size="16" color="#ccc"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="handleLogout">
        <div class="menu-left">
          <el-icon :size="20" color="#ef4444"><SwitchButton /></el-icon>
          <span>退出登录</span>
        </div>
        <el-icon :size="16" color="#ccc"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="tab-bar">
      <div class="tab-item" @click="$router.push('/home')">
        <el-icon :size="24"><HomeFilled /></el-icon>
        <span>首页</span>
      </div>
      <div class="tab-item" @click="$router.push('/register')">
        <el-icon :size="24"><Calendar /></el-icon>
        <span>挂号</span>
      </div>
      <div class="tab-item" @click="$router.push('/records')">
        <el-icon :size="24"><Document /></el-icon>
        <span>记录</span>
      </div>
      <div class="tab-item active">
        <el-icon :size="24"><User /></el-icon>
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  User, Setting, Document, Tickets, Star, QuestionFilled, SwitchButton,
  ArrowRight, HomeFilled, Calendar
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getRegistrations } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const stats = ref({
  total: 0,
  completed: 0,
  waiting: 0
})

const loadStats = async () => {
  try {
    const res = await getRegistrations()
    if (res.code === 200) {
      const records = res.data
      stats.value.total = records.length
      stats.value.completed = records.filter(r => r.status === 2).length
      stats.value.waiting = records.filter(r => r.status === 0 || r.status === 1).length
    }
  } catch (error) {
    console.error('获取统计失败', error)
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
  }).catch(() => {})
}

onMounted(() => {
  userStore.loadUser()
  loadStats()
})
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.profile-header {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  padding: 40px 20px 60px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.user-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.stats-card {
  background: #fff;
  border-radius: 16px;
  margin: -30px 16px 16px;
  padding: 20px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.menu-list {
  background: #fff;
  border-radius: 12px;
  margin: 0 16px 16px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f8f8f8;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-left span {
  font-size: 14px;
  color: #333;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 10px;
  cursor: pointer;
}

.tab-item.active {
  color: #3b82f6;
}
</style>
