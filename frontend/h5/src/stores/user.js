import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('patient_token') || '')

  const setUser = (info, tokenValue) => {
    userInfo.value = info
    token.value = tokenValue
    localStorage.setItem('patient_token', tokenValue)
    localStorage.setItem('patient_info', JSON.stringify(info))
  }

  const loadUser = () => {
    const info = localStorage.getItem('patient_info')
    if (info) {
      userInfo.value = JSON.parse(info)
    }
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('patient_token')
    localStorage.removeItem('patient_info')
  }

  return {
    userInfo,
    token,
    setUser,
    loadUser,
    logout
  }
})
