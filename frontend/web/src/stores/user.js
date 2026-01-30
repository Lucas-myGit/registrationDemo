import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('doctor_token') || '')

  const setUser = (info, tokenValue) => {
    userInfo.value = info
    token.value = tokenValue
    localStorage.setItem('doctor_token', tokenValue)
    localStorage.setItem('doctor_info', JSON.stringify(info))
  }

  const loadUser = () => {
    const info = localStorage.getItem('doctor_info')
    if (info) {
      userInfo.value = JSON.parse(info)
    }
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('doctor_token')
    localStorage.removeItem('doctor_info')
  }

  return {
    userInfo,
    token,
    setUser,
    loadUser,
    logout
  }
})
