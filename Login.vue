<template>
  <div class="login-container gradient-bg">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <el-icon size="48" color="var(--brand-primary)">
            <FirstAidKit />
          </el-icon>
        </div>
        <h1 class="title">医疗管理系统</h1>
        <p class="subtitle">药师/医生端</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="role">
          <el-select
            v-model="loginForm.role"
            placeholder="请选择角色"
            size="large"
            style="width: 100%"
          >
            <el-option label="医生" value="doctor" />
            <el-option label="药师" value="pharmacist" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p class="tips">请使用您的工号和密码登录系统</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { User, Lock, FirstAidKit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  role: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 处理登录
const handleLogin = async () => {
  try {
    // 表单验证
    await loginFormRef.value.validate()
    
    loading.value = true
    
    // 调用登录接口
    const success = await userStore.loginAction({
      username: loginForm.username,
      password: loginForm.password,
      role: loginForm.role
    })
    
    if (success) {
      // 登录成功，根据角色跳转到对应工作台
      console.log('登录成功，准备跳转...')
      console.log('用户名:', loginForm.username)
      console.log('角色:', loginForm.role)
      
      // 等待一下确保状态更新完成
      setTimeout(() => {
        if (loginForm.role === 'pharmacist' || loginForm.username.toLowerCase().includes('pharmacist') || 
            loginForm.username.toLowerCase().includes('药师') || loginForm.username.toLowerCase().includes('pharmacy') ||
            loginForm.username.toLowerCase().includes('yaoshi')) {
          console.log('跳转到药师工作台')
          router.push('/pharmacist-dashboard').then(() => {
            console.log('跳转完成')
          }).catch(err => {
            console.error('跳转失败:', err)
          })
        } else {
          console.log('跳转到医师工作台')
          router.push('/doctor-dashboard').then(() => {
            console.log('跳转完成')
          }).catch(err => {
            console.error('跳转失败:', err)
          })
        }
      }, 100)
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-medium);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .logo {
    margin-bottom: 16px;
  }
  
  .title {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .subtitle {
    font-size: 16px;
    color: var(--text-secondary);
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: var(--brand-primary);
    border: none;
    
    &:hover {
      background: #1E5ACC;
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  
  .tips {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

// 响应式
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
  
  .login-header .title {
    font-size: 24px;
  }
}
</style>



