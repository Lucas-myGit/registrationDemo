<template>
  <div class="detail-page">
    <!-- 顶部 -->
    <div class="header">
      <el-icon :size="20" class="back-icon" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="header-title">就诊详情</span>
    </div>

    <div class="content" v-if="record">
      <!-- 状态卡片 -->
      <div class="status-card" :class="getStatusClass(record.status)">
        <div class="status-icon">
          <el-icon :size="32"><CircleCheck v-if="record.status === 2" /><Clock v-else /></el-icon>
        </div>
        <div class="status-info">
          <p class="status-text">{{ getStatusText(record.status) }}</p>
          <p class="status-desc" v-if="record.status === 0">请按时到达医院候诊</p>
          <p class="status-desc" v-else-if="record.status === 2">诊断已完成，请查看诊断结果</p>
        </div>
      </div>

      <!-- 挂号信息 -->
      <div class="info-card">
        <h3 class="card-title">挂号信息</h3>
        <div class="info-item">
          <span class="label">就诊医生</span>
          <span class="value">{{ record.doctor_name }} {{ record.doctor_title }}</span>
        </div>
        <div class="info-item">
          <span class="label">就诊科室</span>
          <span class="value">{{ record.department }}</span>
        </div>
        <div class="info-item">
          <span class="label">就诊日期</span>
          <span class="value">{{ formatDate(record.reg_date) }}</span>
        </div>
        <div class="info-item">
          <span class="label">排队号</span>
          <span class="value highlight">{{ record.queue_no }}</span>
        </div>
      </div>

      <!-- 诊断结果 -->
      <div class="info-card" v-if="record.status === 2 && record.diagnosis">
        <h3 class="card-title">诊断结果</h3>

        <div class="diagnosis-section" v-if="record.chief_complaint">
          <p class="section-label">主诉</p>
          <p class="section-content">{{ record.chief_complaint }}</p>
        </div>

        <div class="diagnosis-section">
          <p class="section-label">诊断</p>
          <p class="section-content">{{ record.diagnosis }}</p>
        </div>

        <div class="diagnosis-section" v-if="record.treatment">
          <p class="section-label">治疗建议</p>
          <p class="section-content">{{ record.treatment }}</p>
        </div>

        <div class="diagnosis-section" v-if="record.prescription">
          <p class="section-label">处方</p>
          <p class="section-content">{{ record.prescription }}</p>
        </div>
      </div>

      <!-- 等待诊断提示 -->
      <div class="waiting-card" v-if="record.status !== 2">
        <el-icon :size="48" color="#3b82f6"><Timer /></el-icon>
        <p class="waiting-text">等待医生诊断</p>
        <p class="waiting-desc">诊断完成后，您可以在此查看诊断结果</p>
      </div>
    </div>

    <el-empty v-else-if="!loading" description="记录不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, CircleCheck, Clock, Timer } from '@element-plus/icons-vue'
import { getRegistrationDetail } from '@/api'

const route = useRoute()
const record = ref(null)
const loading = ref(false)

const getStatusText = (status) => {
  const statusMap = {
    0: '待诊',
    1: '诊中',
    2: '已完成',
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

const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getRegistrationDetail(route.params.id)
    if (res.code === 200) {
      record.value = res.data
    }
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f7fa;
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

.status-card {
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #fff;
}

.status-card.waiting {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.status-card.in-progress {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.status-card.completed {
  background: linear-gradient(135deg, #10b981, #059669);
}

.status-card.cancelled {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.status-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-text {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.status-desc {
  font-size: 14px;
  opacity: 0.9;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f8f8f8;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #999;
  font-size: 14px;
}

.info-item .value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.info-item .value.highlight {
  color: #3b82f6;
  font-weight: 600;
}

.diagnosis-section {
  margin-bottom: 16px;
}

.diagnosis-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.section-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
}

.waiting-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
}

.waiting-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 8px;
}

.waiting-desc {
  font-size: 14px;
  color: #999;
}
</style>
