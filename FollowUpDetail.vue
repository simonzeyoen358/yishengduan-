<template>
  <div class="followup-detail">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">随访详情</h1>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="editFollowup">编辑随访</el-button>
        <el-button type="warning" @click="sendReminder">发送提醒</el-button>
      </div>
    </div>

    <!-- 患者基本信息 -->
    <div class="info-section">
      <div class="section-title">
        <el-icon><User /></el-icon>
        患者基本信息
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label>患者姓名</label>
          <span>{{ followupData.patientName }}</span>
        </div>
        <div class="info-item">
          <label>患者ID</label>
          <span>{{ followupData.patientId }}</span>
        </div>
        <div class="info-item">
          <label>年龄</label>
          <span>{{ followupData.patientAge }}岁</span>
        </div>
        <div class="info-item">
          <label>性别</label>
          <span>{{ followupData.patientGender }}</span>
        </div>
        <div class="info-item">
          <label>联系电话</label>
          <span>{{ followupData.patientPhone }}</span>
        </div>
        <div class="info-item">
          <label>主要诊断</label>
          <span>{{ followupData.diagnosis }}</span>
        </div>
      </div>
    </div>

    <!-- 随访信息 -->
    <div class="info-section">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        随访信息
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label>随访类型</label>
          <el-tag :type="getTypeTagType(followupData.followupType)">
            {{ getTypeLabel(followupData.followupType) }}
          </el-tag>
        </div>
        <div class="info-item">
          <label>随访状态</label>
          <el-tag :type="getStatusTagType(followupData.status)">
            {{ getStatusLabel(followupData.status) }}
          </el-tag>
        </div>
        <div class="info-item">
          <label>提醒频率</label>
          <span>{{ getFrequencyLabel(followupData.frequency) }}</span>
        </div>
        <div class="info-item">
          <label>开始时间</label>
          <span>{{ formatDateTime(followupData.startDate) }}</span>
        </div>
        <div class="info-item">
          <label>结束时间</label>
          <span>{{ formatDateTime(followupData.endDate) }}</span>
        </div>
        <div class="info-item">
          <label>下次提醒</label>
          <span>{{ formatDateTime(followupData.nextReminder) }}</span>
        </div>
      </div>
    </div>

    <!-- 用药信息 -->
    <div class="info-section">
      <div class="section-title">
        <el-icon><FirstAidKit /></el-icon>
        用药信息
      </div>
      <div class="medication-list">
        <div v-for="medication in followupData.medications" :key="medication.id" class="medication-item">
          <div class="medication-header">
            <span class="medication-name">{{ medication.name }}</span>
            <span class="medication-dosage">{{ medication.dosage }}</span>
          </div>
          <div class="medication-details">
            <span>用法：{{ medication.usage }}</span>
            <span>频次：{{ medication.frequency }}</span>
            <span>依从性：{{ medication.compliance }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 随访记录 -->
    <div class="info-section">
      <div class="section-title">
        <el-icon><Clock /></el-icon>
        随访记录
      </div>
      <div class="timeline">
        <div v-for="record in followupData.records" :key="record.id" class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-time">{{ formatDateTime(record.time) }}</span>
              <el-tag :type="getRecordTypeTag(record.type)" size="small">
                {{ getRecordTypeLabel(record.type) }}
              </el-tag>
            </div>
            <div class="timeline-body">
              <p>{{ record.content }}</p>
              <div v-if="record.notes" class="timeline-notes">
                <strong>备注：</strong>{{ record.notes }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提醒内容 -->
    <div class="info-section">
      <div class="section-title">
        <el-icon><Bell /></el-icon>
        提醒内容
      </div>
      <div class="reminder-content">
        <p>{{ followupData.reminderContent }}</p>
      </div>
    </div>

    <!-- 备注信息 -->
    <div v-if="followupData.notes" class="info-section">
      <div class="section-title">
        <el-icon><Edit /></el-icon>
        备注信息
      </div>
      <div class="notes-content">
        <p>{{ followupData.notes }}</p>
      </div>
    </div>

    <!-- 编辑随访对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑随访"
      width="600px"
      :before-close="handleCloseEdit"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="随访类型">
          <el-select v-model="editForm.followupType" placeholder="请选择随访类型">
            <el-option label="用药提醒" value="medication" />
            <el-option label="复查提醒" value="recheck" />
            <el-option label="随访提醒" value="followup" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="提醒频率">
          <el-select v-model="editForm.frequency" placeholder="请选择提醒频率">
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="editForm.startDate"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="editForm.endDate"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        
        <el-form-item label="提醒内容">
          <el-input
            v-model="editForm.reminderContent"
            type="textarea"
            :rows="3"
            placeholder="请输入提醒内容"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="editForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit" :loading="editLoading">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  User,
  Document,
  FirstAidKit,
  Clock,
  Bell,
  Edit
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 随访数据
const followupData = ref({
  id: 1,
  patientName: '张明',
  patientId: 'P001',
  patientAge: 65,
  patientGender: '男',
  patientPhone: '138****1234',
  diagnosis: '高血压',
  followupType: 'medication',
  status: 'active',
  frequency: 'daily',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  nextReminder: new Date(Date.now() + 2 * 60 * 60 * 1000),
  reminderContent: '请按时服用降压药，注意监测血压变化',
  notes: '患者对药物反应良好，血压控制稳定',
  medications: [
    {
      id: 1,
      name: '氨氯地平',
      dosage: '5mg',
      usage: '口服',
      frequency: '每日一次',
      compliance: 95
    },
    {
      id: 2,
      name: '氢氯噻嗪',
      dosage: '12.5mg',
      usage: '口服',
      frequency: '每日一次',
      compliance: 90
    }
  ],
  records: [
    {
      id: 1,
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'medication',
      content: '患者按时服药，血压稳定在正常范围',
      notes: '建议继续当前用药方案'
    },
    {
      id: 2,
      time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      type: 'checkup',
      content: '电话随访，患者无不适症状',
      notes: '提醒定期测量血压'
    },
    {
      id: 3,
      time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: 'followup',
      content: '开始随访计划',
      notes: '建立用药依从性监测'
    }
  ]
})

// 编辑对话框相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editForm = ref({
  followupType: '',
  frequency: '',
  startDate: '',
  endDate: '',
  reminderContent: '',
  notes: ''
})

// 获取类型标签样式
const getTypeTagType = (type) => {
  const typeMap = {
    medication: 'success',
    checkup: 'warning',
    followup: 'primary'
  }
  return typeMap[type] || 'info'
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  const typeMap = {
    medication: '用药提醒',
    checkup: '复查提醒',
    followup: '随访提醒'
  }
  return typeMap[type] || type
}

// 获取状态标签样式
const getStatusTagType = (status) => {
  const statusMap = {
    active: 'success',
    completed: 'info',
    paused: 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const statusMap = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return statusMap[status] || status
}

// 获取频率标签文本
const getFrequencyLabel = (frequency) => {
  const frequencyMap = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    custom: '自定义'
  }
  return frequencyMap[frequency] || frequency
}

// 获取记录类型标签样式
const getRecordTypeTag = (type) => {
  const typeMap = {
    medication: 'success',
    checkup: 'warning',
    followup: 'primary'
  }
  return typeMap[type] || 'info'
}

// 获取记录类型标签文本
const getRecordTypeLabel = (type) => {
  const typeMap = {
    medication: '用药记录',
    checkup: '复查记录',
    followup: '随访记录'
  }
  return typeMap[type] || type
}

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 编辑随访
const editFollowup = () => {
  // 填充编辑表单数据
  editForm.value = {
    followupType: followupData.value.followupType,
    frequency: followupData.value.frequency,
    startDate: followupData.value.startDate,
    endDate: followupData.value.endDate,
    reminderContent: followupData.value.reminderContent,
    notes: followupData.value.notes
  }
  
  // 打开编辑对话框
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  editLoading.value = true
  
  try {
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新随访数据
    followupData.value.followupType = editForm.value.followupType
    followupData.value.frequency = editForm.value.frequency
    followupData.value.startDate = editForm.value.startDate
    followupData.value.endDate = editForm.value.endDate
    followupData.value.reminderContent = editForm.value.reminderContent
    followupData.value.notes = editForm.value.notes
    
    // 关闭对话框
    editDialogVisible.value = false
    
    ElMessage.success('随访信息更新成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    editLoading.value = false
  }
}

// 关闭编辑对话框
const handleCloseEdit = () => {
  editDialogVisible.value = false
}

// 发送提醒
const sendReminder = () => {
  ElMessage.success('提醒发送成功')
}

onMounted(() => {
  console.log('随访详情页面已加载')
  console.log('路由参数:', route.params)
  console.log('查询参数:', route.query)
})
</script>

<style lang="scss" scoped>
.followup-detail {
  padding: 20px;
  background: #F5F7FA;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .back-btn {
      padding: 8px 16px;
    }
    
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #333333;
      margin: 0;
    }
  }
  
  .header-right {
    display: flex;
    gap: 12px;
  }
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #EBEEF5;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    label {
      font-size: 14px;
      color: #666666;
      font-weight: 500;
    }
    
    span {
      font-size: 16px;
      color: #333333;
      font-weight: 600;
    }
  }
}

.medication-list {
  .medication-item {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    border-left: 4px solid #409eff;
    
    .medication-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .medication-name {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
      }
      
      .medication-dosage {
        font-size: 14px;
        color: #666666;
        background: #e3f2fd;
        padding: 4px 8px;
        border-radius: 4px;
      }
    }
    
    .medication-details {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: #666666;
      
      span {
        padding: 4px 8px;
        background: white;
        border-radius: 4px;
      }
    }
  }
}

.timeline {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e0e0e0;
  }
  
  .timeline-item {
    position: relative;
    margin-bottom: 24px;
    padding-left: 40px;
    
    .timeline-dot {
      position: absolute;
      left: 6px;
      top: 6px;
      width: 12px;
      height: 12px;
      background: #409eff;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #409eff;
    }
    
    .timeline-content {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
      
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .timeline-time {
          font-size: 14px;
          color: #666666;
        }
      }
      
      .timeline-body {
        p {
          margin: 0 0 8px 0;
          color: #333333;
          line-height: 1.5;
        }
        
        .timeline-notes {
          font-size: 14px;
          color: #666666;
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          margin-top: 8px;
        }
      }
    }
  }
}

.reminder-content,
.notes-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  
  p {
    margin: 0;
    color: #333333;
    line-height: 1.6;
  }
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .medication-details {
    flex-direction: column;
    gap: 8px;
  }
}

// 编辑对话框样式
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-select),
:deep(.el-date-editor),
:deep(.el-textarea__inner) {
  width: 100%;
}
</style>
