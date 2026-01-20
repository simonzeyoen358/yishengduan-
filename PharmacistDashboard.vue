<template>
  <div class="pharmacist-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">药师工作台</h1>
      <p class="page-subtitle">工单处理 · 用药建议 · 随访提醒</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-red)">
            <Bell />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.pendingOrders }}</div>
          <div class="stats-label">待处理工单</div>
          <div class="stats-trend urgent">需要处理</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-blue)">
            <Document />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.todayProcessed }}</div>
          <div class="stats-label">今日已处理</div>
          <div class="stats-trend up">+8%</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-green)">
            <ChatDotRound />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.activeChats }}</div>
          <div class="stats-label">进行中对话</div>
          <div class="stats-trend up">3个</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-yellow)">
            <Clock />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.avgResponseTime }}</div>
          <div class="stats-label">平均响应时间</div>
          <div class="stats-trend down">-2分钟</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：工单列表 -->
      <div class="left-panel">
        <div class="medical-card">
          <div class="card-header">
            <div class="title">工单列表</div>
            <div class="subtitle">患者提交的咨询和开药请求</div>
          </div>
          <div class="card-body">
            <div class="filter-bar">
              <el-select v-model="filterStatus" placeholder="状态筛选" size="small" style="width: 120px">
                <el-option label="全部" value="" />
                <el-option label="待处理" value="pending" />
                <el-option label="处理中" value="processing" />
                <el-option label="已完成" value="completed" />
                <el-option label="待医生" value="waiting_doctor" />
              </el-select>
              
              <el-select v-model="filterType" placeholder="类型筛选" size="small" style="width: 120px">
                <el-option label="全部" value="" />
                <el-option label="便民开药" value="便民开药" />
                <el-option label="用药咨询" value="用药咨询" />
              </el-select>
              
              <el-input
                v-model="searchKeyword"
                placeholder="搜索患者姓名或工单ID"
                size="small"
                style="width: 200px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              
              <el-button type="primary" size="small" @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>

            <div class="work-order-list">
              <div 
                v-for="order in filteredWorkOrders" 
                :key="order.id"
                class="work-order-item"
                @click="selectWorkOrder(order)"
                :class="{ active: selectedWorkOrder?.id === order.id }"
              >
                <div class="work-order-header">
                  <div class="patient-info">
                    <span class="patient-name">{{ order.patientName }}</span>
                    <span class="patient-age">{{ order.patientAge }}岁</span>
                    <span class="patient-level" :class="`level-${order.patientLevel}`">
                      {{ getLevelText(order.patientLevel) }}
                    </span>
                  </div>
                  <div class="work-order-status" :class="order.status">
                    {{ getStatusText(order.status) }}
                  </div>
                </div>
                
                <div class="work-order-content">
                  <div class="request-type">
                    <span class="label">请求类型：</span>
                    <span class="value">{{ order.requestType }}</span>
                  </div>
                  <div class="symptoms">
                    <span class="label">症状：</span>
                    <span class="value">{{ order.symptoms }}</span>
                  </div>
                </div>
                
                <div class="work-order-footer">
                  <div class="time-info">
                    <span class="submit-time">{{ formatTime(order.submitTime) }}</span>
                  </div>
                  <div class="priority" v-if="order.priority === 'high'">
                    <el-icon color="var(--medical-red)"><Warning /></el-icon>
                    <span>高优先级</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：工单详情和处理 -->
      <div class="right-panel">
        <div v-if="selectedWorkOrder" class="medical-card">
          <div class="card-header">
            <div class="title">工单处理</div>
            <div class="subtitle">{{ selectedWorkOrder.patientName }} - {{ selectedWorkOrder.requestType }}</div>
          </div>
          <div class="card-body">
            <!-- 患者信息 -->
            <div class="section">
              <h3 class="section-title">患者信息</h3>
              <div class="patient-details">
                <div class="detail-row">
                  <span class="label">姓名：</span>
                  <span class="value">{{ selectedWorkOrder.patientName }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">年龄：</span>
                  <span class="value">{{ selectedWorkOrder.patientAge }}岁</span>
                </div>
                <div class="detail-row">
                  <span class="label">性别：</span>
                  <span class="value">{{ selectedWorkOrder.patientGender }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">档案等级：</span>
                  <span class="patient-level" :class="`level-${selectedWorkOrder.patientLevel}`">
                    {{ getLevelText(selectedWorkOrder.patientLevel) }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">过敏史：</span>
                  <span class="value">{{ selectedWorkOrder.allergies || '无' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">当前用药：</span>
                  <span class="value">{{ selectedWorkOrder.currentMedications || '无' }}</span>
                </div>
              </div>
            </div>

            <!-- 症状描述 -->
            <div class="section">
              <h3 class="section-title">症状描述</h3>
              <div class="symptoms-details">
                <div class="detail-row">
                  <span class="label">主要症状：</span>
                  <span class="value">{{ selectedWorkOrder.symptoms }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">症状持续时间：</span>
                  <span class="value">{{ selectedWorkOrder.duration }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">严重程度：</span>
                  <span class="value">{{ selectedWorkOrder.severity }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">其他描述：</span>
                  <span class="value">{{ selectedWorkOrder.description || '无' }}</span>
                </div>
              </div>
            </div>

            <!-- 用药建议 -->
            <div class="section">
              <h3 class="section-title">用药建议</h3>
              <div class="medication-suggestion">
                <el-form :model="suggestionForm" label-width="80px">
                  <el-form-item label="建议类型">
                    <el-radio-group v-model="suggestionForm.type">
                      <el-radio value="otc">OTC药品</el-radio>
                      <el-radio value="prescription">处方药</el-radio>
                      <el-radio value="consultation">仅咨询</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <el-form-item label="推荐药品">
                    <el-input
                      v-model="suggestionForm.medications"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入推荐的药品名称、用法用量..."
                    />
                  </el-form-item>
                  
                  <el-form-item label="用药指导">
                    <el-input
                      v-model="suggestionForm.instructions"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入用药指导、注意事项..."
                    />
                  </el-form-item>
                  
                  <el-form-item label="随访建议">
                    <el-input
                      v-model="suggestionForm.followup"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入随访建议..."
                    />
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="section">
              <h3 class="section-title">处理操作</h3>
              <div class="action-buttons">
                <el-button 
                  type="success" 
                  @click="handleComplete"
                  :loading="processingLoading"
                >
                  <el-icon><Check /></el-icon>
                  完成处理
                </el-button>
                <el-button 
                  type="primary" 
                  @click="handleChat"
                  :loading="processingLoading"
                >
                  <el-icon><ChatDotRound /></el-icon>
                  开始对话
                </el-button>
                <el-button 
                  type="info" 
                  @click="handleSaveDraft"
                  :loading="processingLoading"
                >
                  <el-icon><Document /></el-icon>
                  保存草稿
                </el-button>
                <el-button 
                  type="warning" 
                  @click="handleEscalate"
                  :loading="processingLoading"
                >
                  <el-icon><ArrowUp /></el-icon>
                  转给医生
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-icon size="64" color="var(--text-secondary)">
            <List />
          </el-icon>
          <p class="empty-text">请选择左侧工单进行处理</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// 在组件顶层调用 useRouter
const router = useRouter()
import {
  Bell,
  Document,
  ChatDotRound,
  Clock,
  Refresh,
  Check,
  ArrowUp,
  List,
  Warning,
  Search
} from '@element-plus/icons-vue'

// 统计数据
const stats = reactive({
  pendingOrders: 12,
  todayProcessed: 18,
  activeChats: 3,
  avgResponseTime: '8分钟'
})

// 筛选条件
const filterStatus = ref('')
const filterType = ref('')
const searchKeyword = ref('')

// 选中的工单
const selectedWorkOrder = ref(null)

// 建议表单
const suggestionForm = reactive({
  type: 'otc',
  medications: '',
  instructions: '',
  followup: ''
})

// 处理加载状态
const processingLoading = ref(false)

// 筛选后的工单列表
const filteredWorkOrders = computed(() => {
  let filtered = workOrders.value

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(order => order.status === filterStatus.value)
  }

  // 类型筛选
  if (filterType.value) {
    filtered = filtered.filter(order => order.requestType === filterType.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.patientName.toLowerCase().includes(keyword) ||
      order.id.toString().includes(keyword)
    )
  }

  return filtered
})

// 工单列表
const workOrders = ref([
  {
    id: 1,
    patientName: '张明',
    patientAge: 65,
    patientGender: '男',
    patientLevel: 1,
    requestType: '便民开药',
    symptoms: '头晕、心悸',
    duration: '3天',
    severity: '中等',
    description: '最近血压不稳定',
    allergies: '青霉素过敏',
    currentMedications: '氨氯地平 5mg',
    status: 'pending',
    priority: 'high',
    submitTime: new Date(Date.now() - 20 * 60 * 1000), // 20分钟前
  },
  {
    id: 2,
    patientName: '王丽',
    patientAge: 58,
    patientGender: '女',
    patientLevel: 2,
    requestType: '用药咨询',
    symptoms: '多饮、多尿',
    duration: '1周',
    severity: '轻微',
    description: '血糖控制咨询',
    allergies: '无',
    currentMedications: '二甲双胍 500mg',
    status: 'processing',
    priority: 'normal',
    submitTime: new Date(Date.now() - 45 * 60 * 1000), // 45分钟前
  },
  {
    id: 3,
    patientName: '李华',
    patientAge: 72,
    patientGender: '男',
    patientLevel: 1,
    requestType: '便民开药',
    symptoms: '咳嗽、发热',
    duration: '2天',
    severity: '中等',
    description: '感冒症状',
    allergies: '无',
    currentMedications: '无',
    status: 'pending',
    priority: 'normal',
    submitTime: new Date(Date.now() - 60 * 60 * 1000), // 1小时前
  }
])

// 获取等级文本
const getLevelText = (level) => {
  const levelMap = {
    1: '核心必填',
    2: '次要关键',
    3: '一般完善'
  }
  return levelMap[level] || '未知'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  }
  return statusMap[status] || '未知'
}

// 格式化时间
const formatTime = (time) => {
  const now = new Date()
  const diff = now - time
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else {
    const hours = Math.floor(minutes / 60)
    return `${hours}小时前`
  }
}

// 选择工单
const selectWorkOrder = (order) => {
  selectedWorkOrder.value = order
  
  // 如果有草稿，加载草稿内容
  if (order.draft) {
    suggestionForm.type = order.draft.type || 'otc'
    suggestionForm.medications = order.draft.medications || ''
    suggestionForm.instructions = order.draft.instructions || ''
    suggestionForm.followup = order.draft.followup || ''
  } else {
    // 重置建议表单
    suggestionForm.type = 'otc'
    suggestionForm.medications = ''
    suggestionForm.instructions = ''
    suggestionForm.followup = ''
  }
}

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据已刷新')
}

// 完成处理
const handleComplete = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要完成此处方建议吗？',
      '确认完成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    processingLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('工单处理完成')
    
    // 更新工单状态
    const order = workOrders.value.find(o => o.id === selectedWorkOrder.value.id)
    if (order) {
      order.status = 'completed'
    }
    
    stats.pendingOrders--
    stats.todayProcessed++
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('处理失败，请重试')
    }
  } finally {
    processingLoading.value = false
  }
}

// 开始对话
const handleChat = () => {
  if (selectedWorkOrder.value) {
    // 跳转到患者对话页面，并传递患者信息
    router.push({
      path: 'chat',
      query: {
        patientId: selectedWorkOrder.value.id,
        patientName: selectedWorkOrder.value.patientName
      }
    })
  } else {
    ElMessage.warning('请先选择一个工单')
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!selectedWorkOrder.value) {
    ElMessage.warning('请先选择一个工单')
    return
  }
  
  try {
    processingLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 保存草稿到工单
    const order = workOrders.value.find(o => o.id === selectedWorkOrder.value.id)
    if (order) {
      order.draft = {
        type: suggestionForm.type,
        medications: suggestionForm.medications,
        instructions: suggestionForm.instructions,
        followup: suggestionForm.followup,
        savedAt: new Date()
      }
      order.status = 'draft'
    }
    
    ElMessage.success('草稿保存成功')
    
  } catch (error) {
    ElMessage.error('保存草稿失败，请重试')
  } finally {
    processingLoading.value = false
  }
}

// 转给医生
const handleEscalate = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将此工单转给医生处理吗？',
      '确认转派',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    processingLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('工单已转给医生')
    
    // 移除已转派的工单
    const index = workOrders.value.findIndex(o => o.id === selectedWorkOrder.value.id)
    if (index > -1) {
      workOrders.value.splice(index, 1)
    }
    
    selectedWorkOrder.value = null
    stats.pendingOrders--
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('转派失败，请重试')
    }
  } finally {
    processingLoading.value = false
  }
}

onMounted(() => {
  // 初始化数据
  console.log('药师工作台已加载')
})
</script>

<style lang="scss" scoped>
.pharmacist-dashboard {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  
  .stats-card {
    background: var(--bg-primary);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow-light);
    border: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: var(--brand-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stats-content {
      flex: 1;
      
      .stats-number {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 4px;
      }
      
      .stats-label {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }
      
      .stats-trend {
        font-size: 12px;
        font-weight: 500;
        
        &.up {
          color: var(--medical-green);
        }
        
        &.down {
          color: var(--medical-red);
        }
        
        &.urgent {
          color: var(--medical-red);
        }
      }
    }
  }
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: calc(100vh - 300px);
}

.left-panel {
  .medical-card {
    height: 100%;
    
    .card-body {
      height: calc(100% - 60px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  }
  
  .filter-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-light);
    flex-wrap: wrap;
  }
  
  .work-order-list {
    flex: 1;
    overflow-y: auto;
    
    .work-order-item {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--brand-primary);
        box-shadow: var(--shadow-light);
      }
      
      &.active {
        border-color: var(--brand-primary);
        background: var(--brand-secondary);
      }
      
      .work-order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .patient-info {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .patient-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
          }
          
          .patient-age {
            font-size: 14px;
            color: var(--text-secondary);
          }
          
          .patient-level {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            
            &.level-1 {
              background: rgba(255, 71, 87, 0.1);
              color: var(--medical-red);
            }
            
            &.level-2 {
              background: rgba(255, 165, 2, 0.1);
              color: var(--medical-yellow);
            }
            
            &.level-3 {
              background: rgba(55, 66, 250, 0.1);
              color: var(--medical-blue);
            }
          }
        }
        
        .work-order-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          
          &.pending {
            background: rgba(255, 165, 2, 0.1);
            color: var(--medical-yellow);
          }
          
          &.processing {
            background: rgba(55, 66, 250, 0.1);
            color: var(--medical-blue);
          }
          
          &.completed {
            background: rgba(46, 213, 115, 0.1);
            color: var(--medical-green);
          }
        }
      }
      
      .work-order-content {
        margin-bottom: 12px;
        
        .request-type, .symptoms {
          display: flex;
          margin-bottom: 4px;
          
          .label {
            font-size: 14px;
            color: var(--text-secondary);
            min-width: 80px;
          }
          
          .value {
            font-size: 14px;
            color: var(--text-primary);
            flex: 1;
          }
        }
      }
      
      .work-order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .time-info {
          .submit-time {
            font-size: 12px;
            color: var(--text-secondary);
          }
        }
        
        .priority {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--medical-red);
        }
      }
    }
  }
}

.right-panel {
  .medical-card {
    height: 100%;
    
    .card-body {
      height: calc(100% - 60px);
      overflow-y: auto;
    }
  }
  
  .section {
    margin-bottom: 24px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-light);
    }
  }
  
  .patient-details, .symptoms-details {
    .detail-row {
      display: flex;
      margin-bottom: 8px;
      
      .label {
        font-size: 14px;
        color: var(--text-secondary);
        min-width: 80px;
      }
      
      .value {
        font-size: 14px;
        color: var(--text-primary);
        flex: 1;
      }
    }
  }
  
  .medication-suggestion {
    .el-form-item {
      margin-bottom: 16px;
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
    
    .el-button {
      flex: 1;
    }
  }
  
  .empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 1px solid var(--border-light);
    
    .empty-text {
      font-size: 16px;
      color: var(--text-secondary);
      margin-top: 16px;
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .right-panel {
    margin-top: 24px;
  }
}

@media (max-width: 768px) {
  .pharmacist-dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header .page-title {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>