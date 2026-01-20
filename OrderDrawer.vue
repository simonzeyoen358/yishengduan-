<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="工单详情"
    direction="rtl"
    size="50%"
    :before-close="handleClose"
  >
    <div v-if="workOrder" class="order-drawer">
      <!-- 工单基本信息 -->
      <div class="section">
        <h3 class="section-title">工单信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">工单ID：</span>
            <span class="value">#{{ workOrder.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">请求类型：</span>
            <span class="value">{{ workOrder.requestType }}</span>
          </div>
          <div class="info-item">
            <span class="label">提交时间：</span>
            <span class="value">{{ formatDateTime(workOrder.submitTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">优先级：</span>
            <span class="value" :class="`priority-${workOrder.priority}`">
              {{ getPriorityText(workOrder.priority) }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">机构来源：</span>
            <span class="value institution-badge" :class="getInstitutionClass(workOrder.institution)">
              {{ workOrder.institution }}
            </span>
          </div>
        </div>
      </div>

      <!-- 患者基本信息概览 -->
      <div class="section">
        <h3 class="section-title">患者基本信息</h3>
        <div class="patient-overview">
          <div class="patient-header">
            <div class="patient-avatar">
              <el-icon size="24"><User /></el-icon>
            </div>
            <div class="patient-info">
              <div class="patient-name">{{ workOrder.patientName }}</div>
              <div class="patient-details">
                {{ workOrder.patientAge }}岁 · {{ workOrder.patientGender }}
                <span class="patient-level" :class="`level-${workOrder.patientLevel}`">
                  {{ getLevelText(workOrder.patientLevel) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="patient-medical-info">
            <div class="medical-item">
              <span class="label">过敏史：</span>
              <span class="value">{{ workOrder.allergies || '无' }}</span>
            </div>
            <div class="medical-item">
              <span class="label">当前用药：</span>
              <span class="value">{{ workOrder.currentMedications || '无' }}</span>
            </div>
            <div class="medical-item">
              <span class="label">症状描述：</span>
              <span class="value">{{ workOrder.symptoms }}</span>
            </div>
            <div class="medical-item">
              <span class="label">持续时间：</span>
              <span class="value">{{ workOrder.duration }}</span>
            </div>
            <div class="medical-item">
              <span class="label">严重程度：</span>
              <span class="value">{{ workOrder.severity }}</span>
            </div>
            <div class="medical-item" v-if="workOrder.description">
              <span class="label">其他描述：</span>
              <span class="value">{{ workOrder.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline 时间线 -->
      <div class="section">
        <h3 class="section-title">处理时间线</h3>
        <div class="timeline">
          <div
            v-for="(event, index) in sortedTimeline"
            :key="event.id"
            class="timeline-item"
            :class="{ 'is-last': index === sortedTimeline.length - 1 }"
          >
            <div class="timeline-marker">
              <el-icon :color="getTimelineIconColor(event.action)">
                <component :is="getTimelineIcon(event.action)" />
              </el-icon>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">{{ event.description }}</span>
                <span class="timeline-time">{{ formatDateTime(event.timestamp) }}</span>
              </div>
              <div class="timeline-operator">
                操作人：{{ event.operator }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="section">
        <h3 class="section-title">操作</h3>
        <div class="action-buttons">
          <el-button
            v-if="currentRole === 'pharmacist' && workOrder.status === 'pending'"
            type="primary"
            @click="handleClaim"
            :loading="actionLoading"
          >
            <el-icon><User /></el-icon>
            认领工单
          </el-button>
          
          <el-button
            v-if="currentRole === 'pharmacist' && workOrder.status === 'processing'"
            type="warning"
            @click="handleEscalate"
            :loading="actionLoading"
          >
            <el-icon><ArrowUp /></el-icon>
            升级给医生
          </el-button>
          
          <el-button
            v-if="currentRole === 'doctor' && workOrder.status === 'waiting_doctor'"
            type="success"
            @click="handleApprove"
            :loading="actionLoading"
          >
            <el-icon><Check /></el-icon>
            审核通过
          </el-button>
          
          <el-button
            type="info"
            @click="handleChat"
            :loading="actionLoading"
            :disabled="!props.workOrder"
          >
            <el-icon><ChatDotRound /></el-icon>
            开始对话
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  ArrowUp,
  Check,
  ChatDotRound,
  Clock,
  Document,
  Warning,
  SuccessFilled
} from '@element-plus/icons-vue'

// 在组件顶层调用 useRouter
const router = useRouter()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  workOrder: {
    type: Object,
    default: null
  },
  currentRole: {
    type: String,
    default: 'pharmacist'
  }
})

const emit = defineEmits(['close', 'refresh', 'update:visible'])

const actionLoading = ref(false)

// 排序后的时间线
const sortedTimeline = computed(() => {
  if (!props.workOrder?.timeline) return []
  return [...props.workOrder.timeline].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// 获取等级文本
const getLevelText = (level) => {
  const levelMap = {
    1: '核心必填',
    2: '次要关键',
    3: '一般完善'
  }
  return levelMap[level] || '未知'
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const priorityMap = {
    high: '高优先级',
    normal: '普通',
    low: '低优先级'
  }
  return priorityMap[priority] || '普通'
}

// 获取机构样式类
const getInstitutionClass = (institution) => {
  if (institution === '三甲医院') {
    return 'institution-hospital'
  } else if (institution === '社区医院') {
    return 'institution-community'
  }
  return 'institution-default'
}

// 获取时间线图标
const getTimelineIcon = (action) => {
  const iconMap = {
    patient_submit: Document,
    pharmacist_claim: User,
    pharmacist_escalate: ArrowUp,
    doctor_approve: Check,
    chat_start: ChatDotRound
  }
  return iconMap[action] || Clock
}

// 获取时间线图标颜色
const getTimelineIconColor = (action) => {
  const colorMap = {
    patient_submit: '#2979FF',
    pharmacist_claim: '#2979FF',
    pharmacist_escalate: '#FFA500',
    doctor_approve: '#52C41A',
    chat_start: '#2979FF'
  }
  return colorMap[action] || '#556C8A'
}

// 格式化日期时间
const formatDateTime = (date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 关闭抽屉
const handleClose = () => {
  emit('close')
}

// 认领工单
const handleClaim = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要认领工单 #${props.workOrder.id} 吗？`,
      '确认认领',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'primary'
      }
    )
    
    actionLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('工单认领成功')
    emit('refresh')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('认领失败，请重试')
    }
  } finally {
    actionLoading.value = false
  }
}

// 升级工单
const handleEscalate = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要将工单 #${props.workOrder.id} 升级给医生处理吗？`,
      '确认升级',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    actionLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('工单已升级给医生')
    emit('refresh')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('升级失败，请重试')
    }
  } finally {
    actionLoading.value = false
  }
}

// 审核通过
const handleApprove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要审核通过工单 #${props.workOrder.id} 吗？`,
      '确认审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    actionLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('工单审核通过')
    emit('refresh')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审核失败，请重试')
    }
  } finally {
    actionLoading.value = false
  }
}

// 开始对话
const handleChat = () => {
  console.log('开始对话按钮被点击')
  console.log('当前工单:', props.workOrder)
  
  if (props.workOrder) {
    // 跳转到患者对话页面，并传递患者信息
    const patientId = props.workOrder.id
    const patientName = props.workOrder.patientName || props.workOrder.patient?.name || '未知患者'
    
    console.log('跳转到患者对话页面:', {
      patientId,
      patientName
    })
    
    // 显示加载状态
    actionLoading.value = true
    
    try {
      console.log('准备跳转到聊天页面，参数:', {
        path: 'chat',
        query: { patientId, patientName }
      })
      
      router.push({
        path: 'chat',
        query: {
          patientId: patientId,
          patientName: patientName
        }
      }).then(() => {
        console.log('路由跳转成功')
        ElMessage.success(`正在跳转到患者 ${patientName} 的对话页面...`)
        actionLoading.value = false
      }).catch((error) => {
        console.error('路由跳转失败:', error)
        ElMessage.error(`跳转失败: ${error.message || '未知错误'}`)
        actionLoading.value = false
      })
    } catch (error) {
      console.error('路由跳转异常:', error)
      ElMessage.error(`路由跳转异常: ${error.message || '未知错误'}`)
      actionLoading.value = false
    }
  } else {
    ElMessage.warning('请先选择一个工单')
  }
}
</script>

<style lang="scss" scoped>
.order-drawer {
  padding: 0 20px;
}

.section {
  margin-bottom: 32px;
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--brand-primary);
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  
  .info-item {
    display: flex;
    align-items: center;
    
    .label {
      font-size: 14px;
      color: var(--text-secondary);
      margin-right: 8px;
      min-width: 80px;
    }
    
    .value {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 500;
      
      &.priority-high {
        color: var(--medical-red);
        font-weight: 600;
      }
      
      &.priority-normal {
        color: var(--text-primary);
      }
      
      &.priority-low {
        color: var(--text-secondary);
      }
    }
  }
}

.patient-overview {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-light);
  
  .patient-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    
    .patient-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--brand-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .patient-info {
      flex: 1;
      
      .patient-name {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
      }
      
      .patient-details {
        font-size: 14px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 8px;
        
        .patient-level {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
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
    }
  }
  
  .patient-medical-info {
    .medical-item {
      display: flex;
      margin-bottom: 12px;
      
      .label {
        font-size: 14px;
        color: var(--text-secondary);
        min-width: 80px;
        margin-right: 8px;
      }
      
      .value {
        font-size: 14px;
        color: var(--text-primary);
        flex: 1;
      }
    }
  }
}

.institution-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  &.institution-hospital {
    background: rgba(82, 196, 26, 0.1);
    color: var(--medical-green);
  }
  
  &.institution-community {
    background: rgba(24, 144, 255, 0.1);
    color: var(--medical-blue);
  }
  
  &.institution-default {
    background: rgba(140, 140, 140, 0.1);
    color: var(--text-secondary);
  }
}

.timeline {
  position: relative;
  
  .timeline-item {
    position: relative;
    padding-left: 40px;
    margin-bottom: 24px;
    
    &:not(.is-last)::after {
      content: '';
      position: absolute;
      left: 19px;
      top: 32px;
      width: 2px;
      height: calc(100% + 8px);
      background: var(--border-light);
    }
    
    .timeline-marker {
      position: absolute;
      left: 0;
      top: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-primary);
      border: 2px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
    
    .timeline-content {
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        
        .timeline-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .timeline-time {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
      
      .timeline-operator {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }
  }
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
  .el-button {
    flex: 1;
    min-width: 120px;
  }
}

// 响应式
@media (max-width: 768px) {
  .order-drawer {
    padding: 0 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .patient-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .action-buttons {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
