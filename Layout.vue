<template>
  <div class="layout-container">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="header-left">
        <div class="logo">
          <el-icon size="24" color="var(--brand-primary)">
            <FirstAidKit />
          </el-icon>
          <span class="logo-text">医疗管理系统</span>
        </div>
        
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" :src="userStore.userInfo.avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
            <span class="username">{{ userStore.userInfo.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><UserFilled /></el-icon>
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                系统设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    
    <!-- 内容区域 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
    
    <!-- 底部导航栏 -->
    <el-footer class="bottom-nav">
      <el-menu
        :default-active="activeMenu"
        :unique-opened="true"
        router
        mode="horizontal"
        class="bottom-nav-menu"
        :collapse="false"
        :horizontal-collapse-transition="false"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
          :class="{ 'is-active': activeMenu === item.path }"
          @click="handleMenuClick(item)"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  FirstAidKit,
  DataBoard,
  User,
  Document,
  ChatDotRound,
  UserFilled,
  Fold,
  Expand,
  ArrowDown,
  Setting,
  SwitchButton,
  Monitor,
  Bell
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 底部导航栏不需要折叠状态

// 菜单项
const menuItems = computed(() => {
  const items = []
  
  console.log('当前用户角色:', userStore.userRole)
  console.log('isDoctor:', userStore.isDoctor)
  console.log('isPharmacist:', userStore.isPharmacist)
  
  // 根据用户角色显示不同菜单
  if (userStore.isDoctor) {
    console.log('显示医师菜单')
    items.push(
      {
        path: '/workbench',
        title: '工单工作台',
        icon: 'Monitor'
      },
      {
        path: '/doctor-dashboard',
        title: '医师工作台',
        icon: 'DataBoard'
      },
      {
        path: '/patients',
        title: '患者管理',
        icon: 'User'
      },
      {
        path: '/prescriptions',
        title: '处方管理',
        icon: 'Document'
      }
    )
  } else if (userStore.isPharmacist) {
    console.log('显示药师菜单')
    items.push(
      {
        path: '/workbench',
        title: '工单工作台',
        icon: 'Monitor'
      },
      {
        path: '/pharmacist-dashboard',
        title: '药师工作台',
        icon: 'DataBoard'
      },
      {
        path: 'chat',
        title: '患者对话',
        icon: 'ChatDotRound'
      },
      {
        path: '/followup',
        title: '随访管理',
        icon: 'Bell'
      },
      {
        path: '/patients',
        title: '患者管理',
        icon: 'User'
      }
    )
  } else {
    console.log('显示默认菜单')
    // 默认菜单
    items.push(
      {
        path: '/workbench',
        title: '工单工作台',
        icon: 'Monitor'
      },
      {
        path: '/dashboard',
        title: '仪表盘',
        icon: 'DataBoard'
      },
      {
        path: '/patients',
        title: '患者管理',
        icon: 'User'
      },
      {
        path: '/prescriptions',
        title: '处方管理',
        icon: 'Document'
      },
      {
        path: '/workorders',
        title: '工作订单',
        icon: 'List'
      },
      {
        path: 'chat',
        title: '聊天系统',
        icon: 'ChatDotRound'
      }
    )
  }
  
  return items
})

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前页面标题
const currentPageTitle = computed(() => {
  const currentRoute = menuItems.value.find(item => item.path === route.path)
  return currentRoute ? currentRoute.title : '页面'
})

// 底部导航栏不需要折叠功能

// 处理菜单点击
const handleMenuClick = (item) => {
  console.log('菜单点击:', item)
  try {
    router.push(item.path).then(() => {
      console.log('路由跳转成功:', item.path)
    }).catch((error) => {
      console.error('路由跳转失败:', error)
      ElMessage.error(`跳转到${item.title}失败`)
    })
  } catch (error) {
    console.error('菜单点击错误:', error)
    ElMessage.error(`点击${item.title}时发生错误`)
  }
}

// 处理下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await userStore.logoutAction()
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .logo-text {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
  
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: background 0.3s;
      
      &:hover {
        background: var(--brand-secondary);
      }
      
      .username {
        font-size: 14px;
        color: var(--text-primary);
      }
    }
  }
}

.main-content {
  flex: 1;
  background: #f5f7fa;
  padding: 20px 20px 80px; /* 底部padding确保内容不会被底部导航栏遮挡 */
  overflow-y: auto;
  box-sizing: border-box;
}

// 底部导航栏样式
.bottom-nav {
  background: white;
  border-top: 1px solid var(--border-light);
  padding: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08); /* 添加阴影效果 */
  
  .bottom-nav-menu {
    border: none;
    height: 100%;
    width: 100%;
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-around;
    margin: 0;
    padding: 0;
    
    :deep(.el-menu-item) {
      height: 60px;
      line-height: 60px;
      flex: 1;
      text-align: center;
      border-top: 3px solid transparent;
      font-size: 14px;
      padding: 0;
      margin: 0;
      
      &.is-active {
        background: var(--brand-secondary);
        color: var(--brand-primary);
        border-top: 3px solid var(--brand-primary);
      }
      
      &:hover {
        background: var(--brand-secondary);
        color: var(--brand-primary);
      }
      
      .el-icon {
        font-size: 20px;
        margin-bottom: 4px;
        display: block;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .header {
    padding: 0 15px;
    height: 56px;
    
    .header-left {
      gap: 15px;
      
      .logo-text {
        font-size: 14px;
      }
    }
    
    .breadcrumb {
      font-size: 14px;
    }
  }
  
  .main-content {
    padding: 15px 15px 76px; /* 调整底部padding以适应导航栏高度 */
  }
  
  .bottom-nav {
    height: 56px;
    
    .bottom-nav-menu {
      :deep(.el-menu-item) {
        height: 56px;
        line-height: 56px;
        font-size: 12px;
        padding: 0;
        margin: 0;
        
        .el-icon {
          font-size: 18px;
          margin-bottom: 2px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 10px;
  }
  
  .user-info .username {
    display: none;
  }
  
  .main-content {
    padding: 10px 10px 76px; /* 调整底部padding以适应导航栏高度 */
  }
  
  .bottom-nav-menu {
    :deep(.el-menu-item) {
      font-size: 12px;
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
}
</style>


