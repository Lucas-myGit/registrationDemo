import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('patient_token')
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

// 患者登录
export const patientLogin = (data) => api.post('/patient/login', data)

// 获取医生列表
export const getDoctors = () => api.get('/doctors')

// 挂号
export const createRegistration = (data) => api.post('/registration', data)

// 获取挂号记录
export const getRegistrations = () => api.get('/patient/registrations')

// 获取挂号详情
export const getRegistrationDetail = (id) => api.get(`/registration/${id}`)

export default api
