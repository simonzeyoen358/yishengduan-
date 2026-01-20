<template>
  <div class="settings">
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
      <p class="page-subtitle">管理系统配置和偏好设置</p>
    </div>

    <div class="settings-content">
      <!-- 通知设置 -->
      <div class="medical-card">
        <div class="card-header">
          <div class="title">通知设置</div>
          <div class="subtitle">管理消息通知偏好</div>
        </div>
        <div class="card-body">
          <div class="settings-section">
            <div class="setting-item">
              <div class="setting-info">
                <h4>工单通知</h4>
                <p>接收新工单和工单状态变更通知</p>
              </div>
              <el-switch v-model="settings.notifications.workOrder" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>患者消息</h4>
                <p>接收患者发送的消息通知</p>
              </div>
              <el-switch v-model="settings.notifications.patientMessage" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>系统公告</h4>
                <p>接收系统维护和重要公告通知</p>
              </div>
              <el-switch v-model="settings.notifications.systemAnnouncement" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>邮件通知</h4>
                <p>通过邮件接收重要通知</p>
              </div>
              <el-switch v-model="settings.notifications.email" />
            </div>
          </div>
        </div>
      </div>

      <!-- 界面设置 -->
      <div class="medical-card">
        <div class="card-header">
          <div class="title">界面设置</div>
          <div class="subtitle">自定义界面显示偏好</div>
        </div>
        <div class="card-body">
          <div class="settings-section">
            <div class="setting-item">
              <div class="setting-info">
                <h4>主题模式</h4>
                <p>选择界面主题模式</p>
              </div>
              <el-select v-model="settings.theme.mode" style="width: 120px">
                <el-option label="浅色" value="light" />
                <el-option label="深色" value="dark" />
                <el-option label="自动" value="auto" />
              </el-select>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>侧边栏折叠</h4>
                <p>默认折叠侧边栏</p>
              </div>
              <el-switch v-model="settings.sidebar.collapsed" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>页面动画</h4>
                <p>启用页面切换动画效果</p>
              </div>
              <el-switch v-model="settings.animations.enabled" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>语言设置</h4>
                <p>选择界面显示语言</p>
              </div>
              <el-select v-model="settings.language" style="width: 120px">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <!-- 工作设置 -->
      <div class="medical-card">
        <div class="card-header">
          <div class="title">工作设置</div>
          <div class="subtitle">配置工作相关偏好</div>
        </div>
        <div class="card-body">
          <div class="settings-section">
            <div class="setting-item">
              <div class="setting-info">
                <h4>自动接单</h4>
                <p>自动接收分配给您的工单</p>
              </div>
              <el-switch v-model="settings.work.autoAccept" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>工单提醒间隔</h4>
                <p>设置工单提醒的时间间隔</p>
              </div>
              <el-select v-model="settings.work.reminderInterval" style="width: 120px">
                <el-option label="5分钟" value="5" />
                <el-option label="10分钟" value="10" />
                <el-option label="15分钟" value="15" />
                <el-option label="30分钟" value="30" />
              </el-select>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>工作状态</h4>
                <p>设置当前工作状态</p>
              </div>
              <el-select v-model="settings.work.status" style="width: 120px">
                <el-option label="在线" value="online" />
                <el-option label="忙碌" value="busy" />
                <el-option label="离线" value="offline" />
              </el-select>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>最大接单数</h4>
                <p>设置同时处理的最大工单数量</p>
              </div>
              <el-input-number v-model="settings.work.maxOrders" :min="1" :max="20" />
            </div>
          </div>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="medical-card">
        <div class="card-header">
          <div class="title">安全设置</div>
          <div class="subtitle">管理账户安全选项</div>
        </div>
        <div class="card-body">
          <div class="settings-section">
            <div class="setting-item">
              <div class="setting-info">
                <h4>自动登出</h4>
                <p>设置无操作自动登出的时间</p>
              </div>
              <el-select v-model="settings.security.autoLogout" style="width: 120px">
                <el-option label="30分钟" value="30" />
                <el-option label="1小时" value="60" />
                <el-option label="2小时" value="120" />
                <el-option label="4小时" value="240" />
                <el-option label="不自动登出" value="0" />
              </el-select>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>登录验证</h4>
                <p>启用双重验证登录</p>
              </div>
              <el-switch v-model="settings.security.twoFactorAuth" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>登录日志</h4>
                <p>记录登录和操作日志</p>
              </div>
              <el-switch v-model="settings.security.loginLog" />
            </div>
          </div>
        </div>
      </div>

      <!-- 数据设置 -->
      <div class="medical-card">
        <div class="card-header">
          <div class="title">数据设置</div>
          <div class="subtitle">管理数据存储和备份</div>
        </div>
        <div class="card-body">
          <div class="settings-section">
            <div class="setting-item">
              <div class="setting-info">
                <h4>数据缓存</h4>
                <p>启用本地数据缓存</p>
              </div>
              <el-switch v-model="settings.data.cache" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>自动备份</h4>
                <p>定期自动备份重要数据</p>
              </div>
              <el-switch v-model="settings.data.autoBackup" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>数据保留期</h4>
                <p>设置数据保留时间</p>
              </div>
              <el-select v-model="settings.data.retentionPeriod" style="width: 120px">
                <el-option label="3个月" value="3" />
                <el-option label="6个月" value="6" />
                <el-option label="1年" value="12" />
                <el-option label="2年" value="24" />
              </el-select>
            </div>
          </div>
          
          <div class="data-actions">
            <el-button @click="clearCache">
              <el-icon><Delete /></el-icon>
              清理缓存
            </el-button>
            <el-button @click="exportData">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button @click="importData">
              <el-icon><Upload /></el-icon>
              导入数据
            </el-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="settings-actions">
        <el-button @click="resetSettings">重置设置</el-button>
        <el-button type="primary" @click="saveSettings" :loading="saving">
          保存设置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Download, Upload } from '@element-plus/icons-vue'

// 加载状态
const saving = ref(false)

// 设置数据
const settings = reactive({
  notifications: {
    workOrder: true,
    patientMessage: true,
    systemAnnouncement: false,
    email: false
  },
  theme: {
    mode: 'light'
  },
  sidebar: {
    collapsed: false
  },
  animations: {
    enabled: true
  },
  language: 'zh-CN',
  work: {
    autoAccept: false,
    reminderInterval: '10',
    status: 'online',
    maxOrders: 5
  },
  security: {
    autoLogout: '120',
    twoFactorAuth: false,
    loginLog: true
  },
  data: {
    cache: true,
    autoBackup: true,
    retentionPeriod: '12'
  }
})

// 默认设置
const defaultSettings = {
  notifications: {
    workOrder: true,
    patientMessage: true,
    systemAnnouncement: false,
    email: false
  },
  theme: {
    mode: 'light'
  },
  sidebar: {
    collapsed: false
  },
  animations: {
    enabled: true
  },
  language: 'zh-CN',
  work: {
    autoAccept: false,
    reminderInterval: '10',
    status: 'online',
    maxOrders: 5
  },
  security: {
    autoLogout: '120',
    twoFactorAuth: false,
    loginLog: true
  },
  data: {
    cache: true,
    autoBackup: true,
    retentionPeriod: '12'
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    saving.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 保存到本地存储
    localStorage.setItem('userSettings', JSON.stringify(settings))
    
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('设置保存失败')
  } finally {
    saving.value = false
  }
}

// 重置设置
const resetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有设置吗？这将恢复默认配置。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 重置为默认设置
    Object.assign(settings, JSON.parse(JSON.stringify(defaultSettings)))
    
    // 清除本地存储
    localStorage.removeItem('userSettings')
    
    ElMessage.success('设置已重置')
  } catch {
    // 用户取消
  }
}

// 清理缓存
const clearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清理缓存吗？这将清除所有临时数据。',
      '确认清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟清理缓存
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('缓存清理完成')
  } catch {
    // 用户取消
  }
}

// 导出数据
const exportData = async () => {
  try {
    // 模拟导出数据
    const exportData = {
      settings: settings,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `医疗系统设置_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('数据导出失败')
  }
}

// 导入数据
const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      if (importData.settings) {
        Object.assign(settings, importData.settings)
        ElMessage.success('数据导入成功')
      } else {
        ElMessage.error('无效的数据文件')
      }
    } catch (error) {
      ElMessage.error('数据导入失败')
    }
  }
  
  input.click()
}

// 加载设置
const loadSettings = () => {
  const savedSettings = localStorage.getItem('userSettings')
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings)
      Object.assign(settings, parsedSettings)
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
}

onMounted(() => {
  // 加载保存的设置
  loadSettings()
  console.log('系统设置页面已加载')
})
</script>

<style lang="scss" scoped>
.settings {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-light);
    
    &:last-child {
      border-bottom: none;
    }
    
    .setting-info {
      flex: 1;
      
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
      }
      
      p {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }
  }
}

.data-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid var(--border-light);
}

// 响应式
@media (max-width: 768px) {
  .settings {
    padding: 16px;
  }
  
  .page-header .page-title {
    font-size: 24px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .data-actions {
    flex-direction: column;
  }
  
  .settings-actions {
    flex-direction: column;
  }
}
</style>
