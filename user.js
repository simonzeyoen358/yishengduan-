import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getUserInfo } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({})
  const userRole = ref('') // doctor, pharmacist

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isDoctor = computed(() => userRole.value === 'doctor')
  const isPharmacist = computed(() => userRole.value === 'pharmacist')

  // 方法
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    userRole.value = info.role || ''
    // 保存用户信息到localStorage
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const loginAction = async (loginData) => {
    try {
      // 根据用户名自动识别角色
      let userRole = 'doctor' // 默认医生
      let userName = '张医生'
      
      // 优先使用用户手动选择的角色
      if (loginData.role) {
        userRole = loginData.role
        userName = loginData.role === 'pharmacist' ? '李药师' : '张医生'
      } else if (loginData.username.toLowerCase().includes('pharmacist') || 
                 loginData.username.toLowerCase().includes('药师') ||
                 loginData.username.toLowerCase().includes('pharmacy') ||
                 loginData.username.toLowerCase().includes('yaoshi')) {
        userRole = 'pharmacist'
        userName = '李药师'
      } else if (loginData.username.toLowerCase().includes('doctor') || 
                 loginData.username.toLowerCase().includes('医生') ||
                 loginData.username.toLowerCase().includes('yisheng')) {
        userRole = 'doctor'
        userName = '张医生'
      }
      
      console.log('最终角色:', userRole)
      console.log('最终用户名:', userName)
      
      const mockToken = 'mock-token-' + Date.now()
      const mockUser = {
        id: 1,
        name: userName,
        role: userRole,
        avatar: ''
      }
      
      setToken(mockToken)
      setUserInfo(mockUser)
      
      ElMessage.success('登录成功')
      return true
    } catch (error) {
      ElMessage.error(error.message || '登录失败')
      return false
    }
  }

  const logoutAction = async () => {
    try {
      // 模拟登出，不调用真实API
      console.log('模拟登出')
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除本地数据
      token.value = ''
      userInfo.value = {}
      userRole.value = ''
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      ElMessage.success('已退出登录')
    }
  }

  const initUserInfo = async () => {
    if (token.value) {
      try {
        // 首先尝试从localStorage获取保存的用户信息
        const savedUserInfo = localStorage.getItem('userInfo')
        if (savedUserInfo) {
          console.log('从localStorage获取用户信息:', savedUserInfo)
          setUserInfo(JSON.parse(savedUserInfo))
        } else {
          // 如果localStorage中没有保存的用户信息，则使用默认值
          const mockUser = {
            id: 1,
            name: '演示用户',
            role: 'doctor',
            avatar: ''
          }
          setUserInfo(mockUser)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 清除无效token和用户信息
        logoutAction()
      }
    }
  }

  const updateUserInfo = (newInfo) => {
    setUserInfo({ ...userInfo.value, ...newInfo })
  }

  const setUserRole = (role) => {
    userRole.value = role
    if (userInfo.value) {
      userInfo.value.role = role
    }
  }

  return {
    // 状态
    token,
    userInfo,
    userRole,
    
    // 计算属性
    isLoggedIn,
    isDoctor,
    isPharmacist,
    
    // 方法
    setToken,
    setUserInfo,
    setUserRole,
    loginAction,
    logoutAction,
    initUserInfo,
    updateUserInfo
  }
})


