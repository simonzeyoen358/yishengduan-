<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">系统仪表盘</h1>
      <p class="page-subtitle">欢迎使用舟山分岛医疗管理系统</p>
    </div>
    
    <div class="welcome-card">
      <div class="welcome-content">
        <h2>欢迎使用医疗管理系统</h2>
        <p v-if="!userStore.isLoggedIn">请先登录系统</p>
        <p v-else-if="!userStore.userRole">请选择您的角色进入对应的工作台</p>
        <p v-else>您的角色是{{ userStore.isDoctor ? '医生' : '药师' }}，正在为您跳转到工作台...</p>
        
        <div class="role-buttons" v-if="userStore.isLoggedIn && !userStore.userRole">
          <el-button type="primary" size="large" @click="goToDoctor">
            <el-icon><UserFilled /></el-icon>
            医师工作台
          </el-button>
          <el-button type="success" size="large" @click="goToPharmacist">
            <el-icon><User /></el-icon>
            药师工作台
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { UserFilled, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const goToDoctor = () => {
  router.push('/doctor-dashboard')
}

const goToPharmacist = () => {
  router.push('/pharmacist-dashboard')
}

// 组件挂载时检查用户角色
onMounted(() => {
  console.log('Dashboard组件已挂载，当前用户角色:', userStore.userRole)
  
  // 如果用户已经有角色，自动跳转到对应的工作台
  if (userStore.isLoggedIn && userStore.userRole) {
    console.log('用户已有角色，自动跳转到对应的工作台')
    if (userStore.isDoctor) {
      goToDoctor()
    } else if (userStore.isPharmacist) {
      goToPharmacist()
    }
  }
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  background: var(--bg-secondary);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .page-subtitle {
    font-size: 16px;
    color: var(--text-secondary);
  }
}

.welcome-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 40px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-light);
  text-align: center;
  
  .welcome-content {
    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    
    p {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 32px;
    }
    
    .role-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      
      .el-button {
        padding: 16px 32px;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

@media (max-width: 768px) {
  .welcome-card .welcome-content .role-buttons {
    flex-direction: column;
    align-items: center;
    
    .el-button {
      width: 200px;
    }
  }
}
</style>

















