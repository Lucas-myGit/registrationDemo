<template>
  <div class="records-page">
    <!-- 顶部 -->
    <div class="header">
      <el-icon :size="20" class="back-icon" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="header-title">就诊记录</span>
    </div>

    <!-- 记录列表 -->
    <div class="content">
      <div
        v-for="record in records"
        :key="record.id"
        class="record-card"
        @click="$router.push(`/record/${record.id}`)"
      >
        <div class="record-header">
          <span class="status-tag" :class="getStatusClass(record.status)">
            {{ getStatusText(record.status) }}
          </span>
          <span class="record-date">{{ formatDate(record.reg_date) }}</span>
        </div>
        <div class="record-body">
          <p class="record-doctor">{{ record.doctor_name }} {{ record.doctor_title }}</p>
          <p class="record-dept">{{ record.department }}</p>
          <p class="record-queue" v-if="record.queue_no">排队号：{{ record.queue_no }}</p>
        </div>
        <div class="record-footer" v-if="record.status === 2 && record.diagnosis">
          <p class="diagnosis-label">诊断结果：</p>
          <p class="diagnosis-text">{{ record.diagnosis }}</p>
        </div>
      </div>

      <el-empty v-if="records.length === 0 && !loading" description="暂无就诊记录" />
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
      <div class="tab-item active">
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
import { ArrowLeft, HomeFilled, Calendar, Document, User } from '@element-plus/icons-vue'
import { getRegistrations } from '@/api'

const records = ref([])
const loading = ref(false)

const getStatusText = (status) => {
  const statusMap = {
    0: '待诊',
    1: '诊中',
    2: '已诊',
    3: '已取消'
  }
  return statusMap[status] || '未知'
}

const getStatusClass = (status) => {
  const classMap = {
    0: 'waiting',
    1: 'in-progress',
    2: 'completed',
    3: 'cancelled'
  }
  return classMap[status] || ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const loadRecords = async () => {
  loading.value = true
  try {
    const res = await getRegistrations()
    if (res.code === 200) {
      records.value = res.data
    }
  } catch (error) {
    console.error('获取记录失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.records-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.header {
  height: 56px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid #eee;
}

.back-icon {
  position: absolute;
  left: 16px;
  cursor: pointer;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.content {
  padding: 16px;
}

.record-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.status-tag.waiting {
  background: #fef3c7;
  color: #d97706;
}

.status-tag.in-progress {
  background: #dbeafe;
  color: #2563eb;
}

.status-tag.completed {
  background: #d1fae5;
  color: #059669;
}

.status-tag.cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

.record-date {
  font-size: 12px;
  color: #999;
}

.record-body {
  margin-bottom: 12px;
}

.record-doctor {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.record-dept {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.record-queue {
  font-size: 12px;
  color: #3b82f6;
}

.record-footer {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
}

.diagnosis-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.diagnosis-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
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
