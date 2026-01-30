<template>
  <div class="workbench">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <el-icon :size="24" color="#fff"><FirstAidKit /></el-icon>
        </div>
        <h1 class="title">智慧医院医生工作台</h1>
        <el-tag type="success" size="small">在线诊断中</el-tag>
      </div>
      <div class="header-right">
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">今日接诊</span>
            <span class="stat-value">{{ stats.todayDiagnosed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">待诊</span>
            <span class="stat-value warning">{{ stats.waiting }}</span>
          </div>
        </div>
        <el-badge :value="3" class="notification">
          <el-icon :size="22"><Bell /></el-icon>
        </el-badge>
        <div class="user-info">
          <div class="user-text">
            <span class="user-name">{{ userInfo?.name }} {{ userInfo?.title }}</span>
            <span class="user-dept">{{ userInfo?.department }}</span>
          </div>
          <el-dropdown @command="handleCommand">
            <el-avatar :size="40" :icon="User" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main">
      <!-- 左侧：患者队列 -->
      <aside class="queue-panel">
        <div class="panel-header">
          <h2>
            <el-icon color="#3b82f6"><User /></el-icon>
            就诊队列 ({{ registrations.length }})
          </h2>
          <el-tag size="small" type="primary">自动叫号</el-tag>
        </div>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索患者姓名/ID"
            prefix-icon="Search"
            clearable
          />
        </div>
        <div class="queue-list">
          <div
            v-for="item in filteredRegistrations"
            :key="item.id"
            class="queue-item"
            :class="{
              active: currentPatient?.id === item.id,
              completed: item.status === 2
            }"
            @click="selectPatient(item)"
          >
            <div class="queue-item-header">
              <span class="patient-name">
                {{ item.patient_name }}
                <span class="patient-info">{{ item.patient_gender }} | {{ item.patient_age }}岁</span>
              </span>
              <el-tag :type="getStatusType(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </el-tag>
            </div>
            <p class="queue-no">就诊号: {{ item.queue_no }} | {{ item.diagnosis_id ? '复诊' : '初诊' }}</p>
          </div>
          <el-empty v-if="filteredRegistrations.length === 0" description="暂无患者" />
        </div>
      </aside>

      <!-- 中间：病历书写区 -->
      <section class="emr-panel" v-if="currentPatient">
        <div class="patient-header">
          <div class="patient-basic">
            <el-icon :size="20" color="#3b82f6"><User /></el-icon>
            <span class="name">{{ currentPatient.patient_name }}</span>
            <span class="info">{{ currentPatient.patient_age }}岁 / {{ currentPatient.patient_gender }}</span>
          </div>
          <div class="patient-extra">
            <span>联系电话: {{ currentPatient.patient_phone }}</span>
          </div>
          <div class="patient-actions">
            <el-button size="small">历史就诊记录</el-button>
            <el-button size="small">过敏史 (0)</el-button>
          </div>
        </div>

        <div class="emr-form">
          <div class="form-group">
            <label>主诉</label>
            <el-input
              v-model="diagnosisForm.chiefComplaint"
              type="textarea"
              :rows="3"
              placeholder="请输入患者主诉内容..."
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>现病史</label>
              <el-input
                v-model="diagnosisForm.presentIllness"
                type="textarea"
                :rows="4"
                placeholder="现病史"
              />
            </div>
            <div class="form-group">
              <label>既往史</label>
              <el-input
                v-model="diagnosisForm.pastHistory"
                type="textarea"
                :rows="4"
                placeholder="既往史"
              />
            </div>
          </div>

          <div class="form-group">
            <label>初步诊断</label>
            <el-input
              v-model="diagnosisForm.diagnosis"
              type="textarea"
              :rows="3"
              placeholder="请输入诊断结果..."
            />
          </div>

          <div class="form-group">
            <label>治疗建议</label>
            <el-input
              v-model="diagnosisForm.treatment"
              type="textarea"
              :rows="3"
              placeholder="请输入治疗建议..."
            />
          </div>
        </div>

        <div class="emr-footer">
          <div class="footer-left">
            <el-button>
              <el-icon><Document /></el-icon>
              引用模板
            </el-button>
          </div>
          <div class="footer-right">
            <el-button size="large">暂存病历</el-button>
            <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
              确认诊断
            </el-button>
          </div>
        </div>
      </section>

      <section class="emr-panel empty" v-else>
        <el-empty description="请从左侧选择患者开始诊断" />
      </section>

      <!-- 右侧：处方与医嘱 -->
      <aside class="order-panel">
        <div class="order-card">
          <div class="card-header">
            <h3>
              <el-icon color="#10b981"><FirstAidKit /></el-icon>
              处方与医嘱
            </h3>
            <el-tag size="small" type="success">常用成方</el-tag>
          </div>
          <div class="order-list">
            <div class="form-group">
              <label>处方</label>
              <el-input
                v-model="diagnosisForm.prescription"
                type="textarea"
                :rows="6"
                placeholder="请输入处方内容..."
              />
            </div>
          </div>
          <div class="order-footer">
            <div class="order-total">
              <span>预估费用合计</span>
              <span class="price">¥ 0.00</span>
            </div>
            <el-button type="success" class="order-btn">
              <el-icon><Check /></el-icon>
              开立处方
            </el-button>
          </div>
        </div>

        <div class="tools-card">
          <h4>排班与随访</h4>
          <div class="tools-grid">
            <div class="tool-item">
              <el-icon :size="24" color="#6366f1"><Calendar /></el-icon>
              <p class="tool-name">排班管理</p>
              <p class="tool-desc">下周门诊已排</p>
            </div>
            <div class="tool-item">
              <el-icon :size="24" color="#ec4899"><Heart /></el-icon>
              <p class="tool-name">随访提醒</p>
              <p class="tool-desc">3名患者待跟踪</p>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FirstAidKit, Bell, User, Document, Check, Calendar, Heart
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getRegistrations, getStats, submitDiagnosis, getRegistrationDetail } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const registrations = ref([])
const currentPatient = ref(null)
const searchKeyword = ref('')
const submitting = ref(false)

const stats = ref({
  todayDiagnosed: 0,
  waiting: 0
})

const diagnosisForm = ref({
  chiefComplaint: '',
  presentIllness: '',
  pastHistory: '',
  diagnosis: '',
  treatment: '',
  prescription: ''
})

const filteredRegistrations = computed(() => {
  if (!searchKeyword.value) return registrations.value
  return registrations.value.filter(item =>
    item.patient_name?.includes(searchKeyword.value) ||
    item.queue_no?.includes(searchKeyword.value)
  )
})

const getStatusText = (status) => {
  const statusMap = {
    0: '候诊',
    1: '诊中',
    2: '已诊',
    3: '已取消'
  }
  return statusMap[status] || '未知'
}

const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'info'
  }
  return typeMap[status] || 'info'
}

const loadRegistrations = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const res = await getRegistrations({ date: today })
    if (res.code === 200) {
      registrations.value = res.data
    }
  } catch (error) {
    console.error('获取挂号列表失败', error)
  }
}

const loadStats = async () => {
  try {
    const res = await getStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

const selectPatient = async (patient) => {
  currentPatient.value = patient

  // 加载详情
  try {
    const res = await getRegistrationDetail(patient.id)
    if (res.code === 200) {
      const data = res.data
      diagnosisForm.value = {
        chiefComplaint: data.chief_complaint || '',
        presentIllness: data.present_illness || '',
        pastHistory: data.past_history || '',
        diagnosis: data.diagnosis || '',
        treatment: data.treatment || '',
        prescription: data.prescription || ''
      }
    }
  } catch (error) {
    console.error('获取详情失败', error)
  }
}

const handleSubmit = async () => {
  if (!diagnosisForm.value.diagnosis) {
    ElMessage.warning('请填写诊断结果')
    return
  }

  submitting.value = true
  try {
    const res = await submitDiagnosis({
      registrationId: currentPatient.value.id,
      ...diagnosisForm.value
    })

    if (res.code === 200) {
      ElMessage.success('诊断提交成功')
      loadRegistrations()
      loadStats()
      currentPatient.value.status = 2
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
    }).catch(() => {})
  }
}

onMounted(() => {
  userStore.loadUser()
  loadRegistrations()
  loadStats()
})
</script>

<style scoped>
.workbench {
  min-height: 100vh;
  background: #f4f7fa;
  min-width: 1440px;
}

.header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 32px;
}

.stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.stat-value.warning {
  color: #f59e0b;
}

.notification {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 24px;
  border-left: 1px solid #e2e8f0;
}

.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.user-dept {
  font-size: 12px;
  color: #64748b;
}

.main {
  display: flex;
  height: calc(100vh - 64px);
  padding: 16px;
  gap: 16px;
}

.queue-panel {
  width: 320px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box {
  padding: 12px 16px;
}

.queue-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.queue-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  border-left: 4px solid transparent;
  transition: all 0.2s;
}

.queue-item:hover {
  background: #f8fafc;
}

.queue-item.active {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.queue-item.completed {
  opacity: 0.6;
}

.queue-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.patient-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.patient-info {
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  margin-left: 8px;
}

.queue-no {
  font-size: 12px;
  color: #64748b;
}

.emr-panel {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.emr-panel.empty {
  align-items: center;
  justify-content: center;
}

.patient-header {
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 24px;
}

.patient-basic {
  display: flex;
  align-items: center;
  gap: 8px;
}

.patient-basic .name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.patient-basic .info {
  font-size: 14px;
  color: #64748b;
}

.patient-extra {
  font-size: 14px;
  color: #64748b;
  padding-left: 24px;
  border-left: 1px solid #e2e8f0;
}

.patient-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.emr-form {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.emr-footer {
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-right {
  display: flex;
  gap: 12px;
}

.order-panel {
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.order-footer {
  padding: 16px;
  background: #ecfdf5;
  border-top: 1px solid #d1fae5;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #047857;
}

.order-total .price {
  font-size: 18px;
  font-weight: 700;
}

.order-btn {
  width: 100%;
}

.tools-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 16px;
}

.tools-card h4 {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tool-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.tool-item:hover {
  background: #f1f5f9;
}

.tool-name {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  margin: 8px 0 4px;
}

.tool-desc {
  font-size: 10px;
  color: #94a3b8;
}
</style>
