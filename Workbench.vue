<template>
  <div class="workbench">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">工单工作台</h1>
        <p class="page-subtitle">{{ currentRole === 'pharmacist' ? '药师首诊 · 工单处理 · 用药建议' : '医生终审 · 处方审核 · 电子签名' }}</p>
      </div>
      <div class="header-right">
        <div class="role-indicator">
          <el-icon><component :is="currentRole === 'pharmacist' ? 'User' : 'UserFilled'" /></el-icon>
          <span>{{ currentRole === 'pharmacist' ? '药师工作台' : '医生工作台' }}</span>
        </div>
      </div>
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
          <div class="stats-label">{{ currentRole === 'pharmacist' ? '待认领工单' : '待审核工单' }}</div>
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
          <div class="stats-trend up">+12%</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-green)">
            <Clock />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.avgResponseTime }}</div>
          <div class="stats-label">平均响应时间</div>
          <div class="stats-trend down">-3分钟</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-yellow)">
            <TrendCharts />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.completionRate }}%</div>
          <div class="stats-label">完成率</div>
          <div class="stats-trend up">+5%</div>
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
            <div class="subtitle">{{ currentRole === 'pharmacist' ? '患者提交的咨询和开药请求' : '药师提交的处方审核请求' }}</div>
          </div>
          <div class="card-body">
            <!-- 筛选栏 -->
            <div class="filter-bar">
              <el-select v-model="filterStatus" placeholder="状态筛选" size="small" style="width: 120px">
                <el-option label="全部" value="" />
                <el-option label="待认领" value="pending" />
                <el-option label="处理中" value="processing" />
                <el-option label="待医生" value="waiting_doctor" />
                <el-option label="已完成" value="completed" />
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

            <!-- 工单卡片列表 -->
            <div class="work-order-list">
              <el-skeleton :rows="3" animated v-if="loading" />
              <div 
                v-for="(order, index) in filteredWorkOrders" 
                :key="order.id"
                class="work-order-card"
                :class="{ 'selected': selectedWorkOrder?.id === order.id }"
                @click="selectWorkOrder(order)"
              >
                <div class="card-header">
                  <div class="order-id">工单 #{{ order.id }}</div>
                  <el-tag :type="getStatusType(order.status)" size="small">
                    {{ getStatusText(order.status) }}
                  </el-tag>
                </div>
                
                <div class="card-content">
                  <div class="patient-info">
                    <span class="patient-name">{{ order.patientName }}</span>
                    <span class="request-type">{{ order.requestType }}</span>
                  </div>
                  
                  <div class="symptoms">{{ order.symptoms }}</div>
                  
                  <div class="order-meta">
                    <span class="submit-time">{{ formatTime(order.submitTime) }}</span>
                    <div class="action-buttons">
                      <el-button
                        v-if="currentRole === 'pharmacist' && order.status === 'pending'"
                        type="primary"
                        size="small"
                        @click.stop="handleClaim(order)"
                      >
                        认领
                      </el-button>
                      <el-button
                        v-if="currentRole === 'pharmacist' && order.status === 'processing'"
                        type="warning"
                        size="small"
                        @click.stop="handleEscalate(order)"
                      >
                        升级
                      </el-button>
                      <el-button
                        v-if="currentRole === 'doctor' && order.status === 'waiting_doctor'"
                        type="success"
                        size="small"
                        @click.stop="handleApprove(order)"
                      >
                        审核通过
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 空状态 -->
              <div v-if="!loading && filteredWorkOrders.length === 0" class="empty-list">
                <el-icon size="48" color="var(--text-secondary)">
                  <List />
                </el-icon>
                <p>暂无工单</p>
              </div>

              <!-- 分页 -->
              <div class="pagination">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="totalOrders"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：工单详情抽屉 -->
      <div class="right-panel">
        <OrderDrawer
          v-model:visible="drawerVisible"
          :work-order="selectedWorkOrder"
          :current-role="currentRole"
          @close="drawerVisible = false"
          @refresh="refreshData"
        />
        
        <!-- 空状态 -->
        <div v-if="!selectedWorkOrder" class="empty-state">
          <el-icon size="64" color="var(--text-secondary)">
            <List />
          </el-icon>
          <p class="empty-text">请选择左侧工单查看详情</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Document,
  Clock,
  TrendCharts,
  Refresh,
  Search,
  List,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import OrderDrawer from '@/components/OrderDrawer.vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 当前角色（从用户状态获取）
const currentRole = computed(() => userStore.userRole || 'pharmacist')

// 统计数据
const stats = reactive({
  pendingOrders: 8,
  todayProcessed: 24,
  avgResponseTime: '6分钟',
  completionRate: 95
})

// 筛选条件
const filterStatus = ref('')
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(0)

// 加载状态
const loading = ref(false)

// 选中的工单
const selectedWorkOrder = ref(null)
const drawerVisible = ref(false)

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
    submitTime: new Date(Date.now() - 20 * 60 * 1000),
    institution: '社区医院',
    timeline: [
      {
        id: 1,
        action: 'patient_submit',
        description: '患者提交工单',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        operator: '张明'
      }
    ]
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
    submitTime: new Date(Date.now() - 45 * 60 * 1000),
    institution: '三甲医院',
    timeline: [
      {
        id: 1,
        action: 'patient_submit',
        description: '患者提交工单',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        operator: '王丽'
      },
      {
        id: 2,
        action: 'pharmacist_claim',
        description: '药师认领工单',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        operator: '李药师'
      }
    ]
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
    status: 'waiting_doctor',
    priority: 'normal',
    submitTime: new Date(Date.now() - 60 * 60 * 1000),
    institution: '社区医院',
    timeline: [
      {
        id: 1,
        action: 'patient_submit',
        description: '患者提交工单',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        operator: '李华'
      },
      {
        id: 2,
        action: 'pharmacist_claim',
        description: '药师认领工单',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        operator: '王药师'
      },
      {
        id: 3,
        action: 'pharmacist_escalate',
        description: '药师升级工单',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        operator: '王药师'
      }
    ]
  },
  {
    id: 4,
    patientName: '陈芳',
    patientAge: 45,
    patientGender: '女',
    patientLevel: 2,
    requestType: '用药咨询',
    symptoms: '失眠、焦虑',
    duration: '2周',
    severity: '轻微',
    description: '睡眠质量差',
    allergies: '无',
    currentMedications: '无',
    status: 'completed',
    priority: 'normal',
    submitTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    institution: '三甲医院',
    timeline: [
      {
        id: 1,
        action: 'patient_submit',
        description: '患者提交工单',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        operator: '陈芳'
      },
      {
        id: 2,
        action: 'pharmacist_claim',
        description: '药师认领工单',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        operator: '赵药师'
      },
      {
        id: 3,
        action: 'pharmacist_escalate',
        description: '药师升级工单',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        operator: '赵药师'
      },
      {
        id: 4,
        action: 'doctor_approve',
        description: '医生审核通过',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        operator: '刘医生'
      }
    ]
  }
])

// 筛选后的工单列表
const filteredWorkOrders = computed(() => {
  let filtered = workOrders.value

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(order => order.status === filterStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.patientName.toLowerCase().includes(keyword) ||
      order.id.toString().includes(keyword)
    )
  }

  // 根据角色筛选
  if (currentRole.value === 'pharmacist') {
    filtered = filtered.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    )
  } else if (currentRole.value === 'doctor') {
    filtered = filtered.filter(order => 
      order.status === 'waiting_doctor' || order.status === 'completed'
    )
  }

  totalOrders.value = filtered.length
  return filtered
})

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    processing: 'primary',
    waiting_doctor: 'info',
    completed: 'success'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待认领',
    processing: '处理中',
    waiting_doctor: '待医生',
    completed: '已完成'
  }
  return statusMap[status] || '未知'
}

// 获取行样式 - 已改为卡片式选择，不再需要此函数

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
const selectWorkOrder = (row) => {
  selectedWorkOrder.value = row
  drawerVisible.value = true
}

// 角色切换功能已移除，现在根据登录状态自动显示对应内容

// 认领工单
const handleClaim = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要认领工单 #${row.id} 吗？`,
      '确认认领',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'primary'
      }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新工单状态
    row.status = 'processing'
    row.timeline.push({
      id: row.timeline.length + 1,
      action: 'pharmacist_claim',
      description: '药师认领工单',
      timestamp: new Date(),
      operator: '当前药师'
    })
    
    ElMessage.success('工单认领成功')
    stats.pendingOrders--
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('认领失败，请重试')
    }
  }
}

// 升级工单
const handleEscalate = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要将工单 #${row.id} 升级给医生处理吗？`,
      '确认升级',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新工单状态
    row.status = 'waiting_doctor'
    row.timeline.push({
      id: row.timeline.length + 1,
      action: 'pharmacist_escalate',
      description: '药师升级工单',
      timestamp: new Date(),
      operator: '当前药师'
    })
    
    ElMessage.success('工单已升级给医生')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('升级失败，请重试')
    }
  }
}

// 审核通过
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要审核通过工单 #${row.id} 吗？`,
      '确认审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新工单状态
    row.status = 'completed'
    row.timeline.push({
      id: row.timeline.length + 1,
      action: 'doctor_approve',
      description: '医生审核通过',
      timestamp: new Date(),
      operator: '当前医生'
    })
    
    ElMessage.success('工单审核通过')
    stats.todayProcessed++
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审核失败，请重试')
    }
  }
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 1000)
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  refreshData()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  refreshData()
}

// 根据角色更新统计数据
const updateStatsByRole = () => {
  if (currentRole.value === 'pharmacist') {
    stats.pendingOrders = workOrders.value.filter(o => o.status === 'pending').length
  } else {
    stats.pendingOrders = workOrders.value.filter(o => o.status === 'waiting_doctor').length
  }
}

onMounted(() => {
  // 初始化数据
  console.log('工单工作台已加载')
  console.log('当前用户角色:', currentRole.value)
  
  // 根据角色更新统计数据
  updateStatsByRole()
})
</script>

<style lang="scss" scoped>
.workbench {
  padding: 20px;
  background: var(--bg-secondary);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .header-left {
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
  
  .header-right {
    .role-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: var(--brand-secondary);
      border-radius: 8px;
      color: var(--brand-primary);
      font-size: 14px;
      font-weight: 500;
    }
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
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  min-height: calc(100vh - 300px);
  padding-bottom: 80px; /* 增加底部内边距，避免与导航栏重叠 */
}

.left-panel {
  .medical-card {
    height: 100%;
    
    .card-body {
      min-height: calc(100% - 60px);
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
  }
  
  .work-order-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--brand-primary) var(--border-light);
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--border-light);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--brand-primary);
      border-radius: 3px;
    }
    
    .work-order-card {
      background: var(--bg-primary);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-light);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--brand-primary);
        box-shadow: var(--shadow-medium);
        transform: translateY(-2px);
      }
      
      &.selected {
        border-color: var(--brand-primary);
        background-color: var(--brand-secondary);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .order-id {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
      }
      
      .card-content {
        
        .patient-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .patient-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
          }
          
          .request-type {
            font-size: 14px;
            color: var(--text-secondary);
            padding: 4px 12px;
            background: var(--bg-secondary);
            border-radius: 16px;
          }
        }
        
        .symptoms {
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 12px;
          line-height: 1.5;
          word-break: break-word;
          max-height: 60px;
          overflow-y: auto;
        }
        
        .order-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .submit-time {
            font-size: 12px;
            color: var(--text-secondary);
          }
        }
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: center;
    }
    
    .empty-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-secondary);
      
      p {
        margin-top: 12px;
        font-size: 14px;
      }
    }
  }
}

.right-panel {
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
  .workbench {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header .page-title {
    font-size: 24px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .work-order-list {
    .work-order-card {
      padding: 14px;
      margin-bottom: 10px;
      
      .card-content {
        .patient-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        
        .order-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          
          .action-buttons {
            width: 100%;
            justify-content: space-between;
          }
        }
      }
    }
  }
  
  .action-buttons {
    width: 100%;
  }
}
</style>
