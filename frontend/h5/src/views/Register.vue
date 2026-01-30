<template>
  <div class="register-page">
    <!-- 顶部 -->
    <div class="header">
      <el-icon :size="20" class="back-icon" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="header-title">快捷挂号</span>
    </div>

    <!-- 提示 -->
    <div class="tip-bar">
      <el-icon :size="20" color="#3b82f6"><InfoFilled /></el-icon>
      <div class="tip-content">
        <p class="tip-title">请选择医生</p>
        <p class="tip-desc">当前时间：{{ currentDate }}</p>
      </div>
    </div>

    <!-- 日期选择 -->
    <div class="date-picker">
      <div
        v-for="(date, index) in dates"
        :key="index"
        class="date-item"
        :class="{ active: selectedDate === date.value }"
        @click="selectedDate = date.value"
      >
        <span class="date-week">{{ date.week }}</span>
        <span class="date-day">{{ date.day }}</span>
      </div>
    </div>

    <!-- 医生列表 -->
    <div class="doctor-list">
      <div
        v-for="doctor in doctors"
        :key="doctor.id"
        class="doctor-card"
        @click="selectDoctor(doctor)"
      >
        <div class="doctor-avatar">
          <el-icon :size="32" color="#3b82f6"><User /></el-icon>
        </div>
        <div class="doctor-info">
          <div class="doctor-header">
            <span class="doctor-name">{{ doctor.name }}</span>
            <span class="doctor-title">{{ doctor.title }}</span>
          </div>
          <p class="doctor-dept">{{ doctor.department }}</p>
          <p class="doctor-specialty">擅长：{{ doctor.specialty }}</p>
        </div>
        <div class="doctor-action">
          <span class="doctor-fee">¥{{ doctor.fee }}</span>
          <el-button type="primary" size="small" round>预约</el-button>
        </div>
      </div>

      <el-empty v-if="doctors.length === 0" description="暂无可预约医生" />
    </div>

    <!-- 确认弹窗 -->
    <el-dialog
      v-model="showConfirm"
      title="确认挂号"
      width="85%"
      :show-close="false"
    >
      <div class="confirm-content" v-if="selectedDoctor">
        <div class="confirm-item">
          <span class="label">就诊医生</span>
          <span class="value">{{ selectedDoctor.name }} {{ selectedDoctor.title }}</span>
        </div>
        <div class="confirm-item">
          <span class="label">就诊科室</span>
          <span class="value">{{ selectedDoctor.department }}</span>
        </div>
        <div class="confirm-item">
          <span class="label">就诊日期</span>
          <span class="value">{{ selectedDate }}</span>
        </div>
        <div class="confirm-item">
          <span class="label">挂号费用</span>
          <span class="value price">¥{{ selectedDoctor.fee }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showConfirm = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmRegister">确认挂号</el-button>
      </template>
    </el-dialog>

    <!-- 底部导航 -->
    <div class="tab-bar">
      <div class="tab-item" @click="$router.push('/home')">
        <el-icon :size="24"><HomeFilled /></el-icon>
        <span>首页</span>
      </div>
      <div class="tab-item active">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, InfoFilled, User, HomeFilled, Calendar, Document } from '@element-plus/icons-vue'
import { getDoctors, createRegistration } from '@/api'

const router = useRouter()

const doctors = ref([])
const selectedDoctor = ref(null)
const selectedDate = ref('')
const showConfirm = ref(false)
const submitting = ref(false)

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`
})

// 生成未来7天日期
const dates = computed(() => {
  const result = []
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    result.push({
      week: i === 0 ? '今天' : weekDays[date.getDay()],
      day: `${date.getMonth() + 1}-${date.getDate()}`,
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    })
  }
  return result
})

const loadDoctors = async () => {
  try {
    const res = await getDoctors()
    if (res.code === 200) {
      doctors.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取医生列表失败')
  }
}

const selectDoctor = (doctor) => {
  if (!selectedDate.value) {
    ElMessage.warning('请先选择就诊日期')
    return
  }
  selectedDoctor.value = doctor
  showConfirm.value = true
}

const confirmRegister = async () => {
  submitting.value = true
  try {
    const res = await createRegistration({
      doctorId: selectedDoctor.value.id,
      regDate: selectedDate.value
    })

    if (res.code === 200) {
      ElMessage.success(`挂号成功！您的排队号是 ${res.data.queueNo}`)
      showConfirm.value = false
      router.push('/records')
    } else {
      ElMessage.error(res.message || '挂号失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  selectedDate.value = dates.value[0].value
  loadDoctors()
})
</script>

<style scoped>
.register-page {
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

.tip-bar {
  background: #eff6ff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tip-title {
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
}

.tip-desc {
  font-size: 10px;
  color: #3b82f6;
}

.date-picker {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  border-bottom: 1px solid #eee;
}

.date-item {
  min-width: 56px;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  background: #f8fafc;
}

.date-item.active {
  background: #3b82f6;
  color: #fff;
}

.date-week {
  font-size: 12px;
}

.date-day {
  font-size: 14px;
  font-weight: 600;
}

.doctor-list {
  padding: 16px;
}

.doctor-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.doctor-avatar {
  width: 56px;
  height: 56px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doctor-info {
  flex: 1;
  min-width: 0;
}

.doctor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.doctor-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.doctor-title {
  font-size: 12px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.doctor-dept {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.doctor-specialty {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doctor-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.doctor-fee {
  font-size: 16px;
  font-weight: 600;
  color: #f97316;
}

.confirm-content {
  padding: 8px 0;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.confirm-item:last-child {
  border-bottom: none;
}

.confirm-item .label {
  color: #999;
  font-size: 14px;
}

.confirm-item .value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.confirm-item .value.price {
  color: #f97316;
  font-weight: 600;
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
