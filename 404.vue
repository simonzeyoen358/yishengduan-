<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-icon">
        <el-icon size="120" color="var(--text-secondary)">
          <Warning />
        </el-icon>
      </div>
      <h1 class="error-title">404</h1>
      <p class="error-message">页面未找到</p>
      <p class="error-description">抱歉，您访问的页面不存在或已被移除</p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Warning, HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  
  .error-icon {
    margin-bottom: 24px;
  }
  
  .error-title {
    font-size: 72px;
    font-weight: 700;
    color: var(--brand-primary);
    margin-bottom: 16px;
    line-height: 1;
  }
  
  .error-message {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  
  .error-description {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 32px;
    line-height: 1.5;
  }
  
  .error-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    
    .el-button {
      padding: 12px 24px;
      font-size: 16px;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .not-found-content {
    .error-title {
      font-size: 48px;
    }
    
    .error-message {
      font-size: 20px;
    }
    
    .error-actions {
      flex-direction: column;
      align-items: center;
      
      .el-button {
        width: 200px;
      }
    }
  }
}
</style>