import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    
    // 添加token到请求头
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 检查响应数据结构
    if (response.data && typeof response.data === 'object') {
      const { code, message, data } = response.data
      
      // 统一处理业务状态码
      if (typeof code !== 'undefined') {
        // 如果返回的状态码为200，说明接口请求成功
        if (code === 200) {
          return response.data
        } else {
          // 否则的话抛出错误
          ElMessage.error(message || '请求失败')
          return Promise.reject(new Error(message || '请求失败'))
        }
      } else {
        // 如果没有状态码字段，直接返回数据
        return response.data
      }
    } else {
      // 响应数据格式不正确
      return response.data
    }
  },
  error => {
    const { response } = error
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          const userStore = useUserStore()
          userStore.logoutAction()
          ElMessage.error('登录已过期，请重新登录')
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default service