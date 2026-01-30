import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('doctor_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

// 医生登录
export const doctorLogin = (data) => api.post('/doctor/login', data)

// 获取挂号列表
export const getRegistrations = (params) => api.get('/doctor/registrations', { params })

// 获取挂号详情
export const getRegistrationDetail = (id) => api.get(`/registration/${id}`)

// 更新挂号状态
export const updateRegistrationStatus = (id, status) => api.put(`/registration/${id}/status`, { status })

// 提交诊断
export const submitDiagnosis = (data) => api.post('/diagnosis', data)

// 获取统计数据
export const getStats = () => api.get('/doctor/stats')

export default api
