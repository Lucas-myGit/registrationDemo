<template>
  <div class="home-page">
    <!-- 顶部 -->
    <div class="header">
      <div class="header-left">
        <el-icon :size="24" color="#3b82f6"><FirstAidKit /></el-icon>
        <span class="title">智慧医院</span>
      </div>
      <el-icon :size="22" color="#666"><Bell /></el-icon>
    </div>

    <!-- 内容区 -->
    <div class="content">
      <!-- Banner -->
      <div class="banner">
        <div class="banner-content">
          <h3>2026年健康关怀</h3>
          <p>守护您和家人的每一刻健康</p>
          <button class="banner-btn" @click="$router.push('/register')">立即预约</button>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-actions">
        <div class="action-item" @click="$router.push('/register')">
          <div class="action-icon" style="background: #eff6ff; color: #3b82f6;">
            <el-icon :size="24"><Calendar /></el-icon>
          </div>
          <span>预约挂号</span>
        </div>
        <div class="action-item" @click="$router.push('/records')">
          <div class="action-icon" style="background: #ecfdf5; color: #10b981;">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <span>就诊记录</span>
        </div>
        <div class="action-item">
          <div class="action-icon" style="background: #fff7ed; color: #f97316;">
            <el-icon :size="24"><Tickets /></el-icon>
          </div>
          <span>报告查询</span>
        </div>
        <div class="action-item">
          <div class="action-icon" style="background: #faf5ff; color: #a855f7;">
            <el-icon :size="24"><ChatDotRound /></el-icon>
          </div>
          <span>智能导诊</span>
        </div>
      </div>

      <!-- 就诊进度 -->
      <div class="card" v-if="latestRecord">
        <div class="card-header">
          <span class="card-title">就诊进度</span>
          <span class="card-tag">实时更新</span>
        </div>
        <div class="progress-card" @click="$router.push(`/record/${latestRecord.id}`)">
          <div class="progress-icon">
            <el-icon :size="20" color="#3b82f6"><User /></el-icon>
          </div>
          <div class="progress-info">
            <p class="progress-title">{{ latestRecord.doctor_name }} - {{ latestRecord.department }}</p>
            <p class="progress-desc">
              {{ getStatusText(latestRecord.status) }}
              <span v-if="latestRecord.status === 2"> - 点击查看诊断结果</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 健康资讯 -->
      <div class="news-section">
        <div class="section-header">
          <span class="section-title">健康资讯</span>
          <span class="section-more">查看更多</span>
        </div>
        <div class="news-card">
          <img src="https://picsum.photos/200/200?random=1" alt="news" class="news-img" />
          <div class="news-content">
            <p class="news-title">专家解读：2026年春季流感预防指南</p>
            <div class="news-meta">
              <span>发布时间 2026-01-29</span>
              <span>1.2W 阅读</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="tab-bar">
      <div class="tab-item active">
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
      <div class="tab-item" @click="$router.push('/mine')">
        <el-icon :size="24"><User /></el-icon>
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HomeFilled, Calendar, Document, User, Bell, FirstAidKit, Tickets, ChatDotRound } from '@element-plus/icons-vue'
import { getRegistrations } from '@/api'

const latestRecord = ref(null)

const getStatusText = (status) => {
  const statusMap = {
    0: '待诊',
    1: '诊中',
    2: '已诊',
    3: '已取消'
  }
  return statusMap[status] || '未知'
}

const loadLatestRecord = async () => {
  try {
    const res = await getRegistrations()
    if (res.code === 200 && res.data.length > 0) {
      latestRecord.value = res.data[0]
    }
  } catch (error) {
    console.error('获取记录失败', error)
  }
}

onMounted(() => {
  loadLatestRecord()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.header {
  height: 56px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.content {
  padding: 16px;
}

.banner {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
  margin-bottom: 20px;
}

.banner h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.banner p {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.banner-btn {
  background: #fff;
  color: #3b82f6;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-item span {
  font-size: 12px;
  color: #666;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.card-tag {
  font-size: 10px;
  background: #eff6ff;
  color: #3b82f6;
  padding: 2px 8px;
  border-radius: 4px;
}

.progress-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.progress-icon {
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-info {
  flex: 1;
}

.progress-title {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.progress-desc {
  font-size: 10px;
  color: #999;
}

.news-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.section-more {
  font-size: 12px;
  color: #999;
}

.news-card {
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  gap: 12px;
}

.news-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.news-content {
  flex: 1;
  padding: 4px 0;
}

.news-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-bottom: 12px;
}

.news-meta {
  display: flex;
  gap: 12px;
  font-size: 10px;
  color: #999;
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
