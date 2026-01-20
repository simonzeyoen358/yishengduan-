<template>
  <div class="followup">
    <div class="page-header">
      <h1 class="page-title">用药随访与提醒</h1>
      <p class="page-subtitle">管理患者用药随访和健康提醒</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ stats.activeFollowups }}</div>
        <div class="stat-label">进行中随访</div>
        <div class="stat-change">+3 本周</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.dueReminders }}</div>
        <div class="stat-label">待发送提醒</div>
        <div class="stat-change">+5 今日</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.completedFollowups }}</div>
        <div class="stat-label">已完成随访</div>
        <div class="stat-change">+12 本月</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.complianceRate }}%</div>
        <div class="stat-label">用药依从性</div>
        <div class="stat-change">+2% 提升</div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-bar">
      <div class="filter-group">
        <el-select v-model="filterStatus" placeholder="随访状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="进行中" value="active" />
          <el-option label="已完成" value="completed" />
          <el-option label="已暂停" value="paused" />
        </el-select>
        
        <el-select v-model="filterType" placeholder="提醒类型" clearable>
          <el-option label="全部" value="" />
          <el-option label="用药提醒" value="medication" />
          <el-option label="复查提醒" value="checkup" />
          <el-option label="随访提醒" value="followup" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="患者姓名或ID"
          style="width: 200px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
      <div class="action-group">
        <el-button type="success" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          新建随访
        </el-button>
      </div>
    </div>

    <!-- 随访列表 -->
    <div class="followup-list">
      <el-table :data="filteredFollowups" v-loading="loading" stripe>
        <el-table-column prop="patientName" label="患者姓名" width="120">
          <template #default="{ row }">
            <a @click="goToDetail(row)" class="patient-link">{{ row.patientName }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="patientId" label="患者ID" width="100">
          <template #default="{ row }">
            <a @click="goToDetail(row)" class="patient-link">{{ row.patientId }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="followupType" label="随访类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.followupType)">
              {{ getTypeLabel(row.followupType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nextReminder" label="下次提醒" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.nextReminder) }}
          </template>
        </el-table-column>
        <el-table-column prop="compliance" label="依从性" width="100">
          <template #default="{ row }">
            <span :class="getComplianceClass(row.compliance)">
              {{ row.compliance }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" type="danger" @click="deleteFollowup(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新建/编辑随访对话框 -->
    <el-dialog
      v-model="followupDialogVisible"
      :title="isEdit ? '编辑随访' : '新建随访'"
      width="600px"
    >
      <el-form :model="followupForm" :rules="followupRules" ref="followupFormRef" label-width="100px">
        <el-form-item label="患者" prop="patientId">
          <el-select v-model="followupForm.patientId" placeholder="选择患者" style="width: 100%">
            <el-option
              v-for="patient in patients"
              :key="patient.id"
              :label="patient.name"
              :value="patient.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="随访类型" prop="followupType">
          <el-radio-group v-model="followupForm.followupType">
            <el-radio label="medication">用药提醒</el-radio>
            <el-radio label="checkup">复查提醒</el-radio>
            <el-radio label="followup">随访提醒</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="提醒频率" prop="frequency">
          <el-select v-model="followupForm.frequency" placeholder="选择频率">
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="followupForm.startDate"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker
            v-model="followupForm.endDate"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="提醒内容" prop="reminderContent">
          <el-input
            v-model="followupForm.reminderContent"
            type="textarea"
            :rows="3"
            placeholder="请输入提醒内容"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="followupForm.notes"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="followupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFollowup" :loading="saveLoading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>


  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete
} from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const stats = reactive({
  activeFollowups: 24,
  dueReminders: 8,
  completedFollowups: 156,
  complianceRate: 87
})

// 筛选条件
const filterStatus = ref('')
const filterType = ref('')
const searchKeyword = ref('')
const loading = ref(false)

// 对话框状态
const followupDialogVisible = ref(false)
const isEdit = ref(false)
const saveLoading = ref(false)

// 随访表单
const followupForm = reactive({
  patientId: '',
  followupType: 'medication',
  frequency: 'daily',
  startDate: '',
  endDate: '',
  reminderContent: '',
  notes: ''
})

// 表单验证规则
const followupRules = {
  patientId: [{ required: true, message: '请选择患者', trigger: 'change' }],
  followupType: [{ required: true, message: '请选择随访类型', trigger: 'change' }],
  frequency: [{ required: true, message: '请选择提醒频率', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  reminderContent: [{ required: true, message: '请输入提醒内容', trigger: 'blur' }]
}

// 患者列表
const patients = ref([
  { id: 1, name: '张明' },
  { id: 2, name: '王丽' },
  { id: 3, name: '李强' },
  { id: 4, name: '赵敏' }
])

// 随访列表
const followups = ref([
  {
    id: 1,
    patientName: '张明',
    patientId: 'P001',
    followupType: 'medication',
    status: 'active',
    nextReminder: new Date(Date.now() + 2 * 60 * 60 * 1000),
    compliance: 95,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    patientName: '王丽',
    patientId: 'P002',
    followupType: 'checkup',
    status: 'active',
    nextReminder: new Date(Date.now() + 24 * 60 * 60 * 1000),
    compliance: 88,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    patientName: '李强',
    patientId: 'P003',
    followupType: 'followup',
    status: 'completed',
    nextReminder: null,
    compliance: 92,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  }
])

// 计算属性：过滤后的随访列表
const filteredFollowups = computed(() => {
  let result = followups.value
  
  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value)
  }
  
  if (filterType.value) {
    result = result.filter(item => item.followupType === filterType.value)
  }
  
  if (searchKeyword.value) {
    result = result.filter(item => 
      item.patientName.includes(searchKeyword.value) ||
      item.patientId.includes(searchKeyword.value)
    )
  }
  
  return result
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

// 获取依从性样式
const getComplianceClass = (compliance) => {
  if (compliance >= 90) return 'compliance-high'
  if (compliance >= 70) return 'compliance-medium'
  return 'compliance-low'
}

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 1000)
}

// 显示新建对话框
const showCreateDialog = () => {
  isEdit.value = false
  Object.assign(followupForm, {
    patientId: '',
    followupType: 'medication',
    frequency: 'daily',
    startDate: '',
    endDate: '',
    reminderContent: '',
    notes: ''
  })
  followupDialogVisible.value = true
}

// 跳转到随访详情页面
const goToDetail = (row) => {
  try {
    // 跳转到随访详情页面
    router.push({
      name: 'FollowUpDetail',
      params: { id: row.id }
    }).then(() => {
      console.log('路由跳转成功')
    }).catch((error) => {
      console.error('路由跳转失败:', error)
      ElMessage.error('跳转到详情页面失败')
    })
  } catch (error) {
    console.error('路由跳转异常:', error)
    ElMessage.error('路由跳转异常')
  }
}

// 删除随访
const deleteFollowup = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除患者 ${row.patientName} 的随访记录吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    // 模拟删除
    const index = followups.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      followups.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 保存随访
const saveFollowup = async () => {
  try {
    saveLoading.value = true
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEdit.value) {
      ElMessage.success('随访记录已更新')
    } else {
      ElMessage.success('随访记录已创建')
    }
    
    followupDialogVisible.value = false
    
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

onMounted(() => {
  console.log('随访管理页面已加载')
})
</script>

<style lang="scss" scoped>
.followup {
  padding: 20px;
  background: #F5F7FA;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 8px;
  }
  
  .page-subtitle {
    font-size: 16px;
    color: #556C8A;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  
  .stat-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid #EBEEF5;
    
    .stat-number {
      font-size: 32px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #666666;
      margin-bottom: 4px;
    }
    
    .stat-change {
      font-size: 12px;
      color: #4caf50;
    }
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  
  .filter-group {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .action-group {
    display: flex;
    gap: 8px;
  }
}

.followup-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  .action-buttons {
    display: flex;
    gap: 4px;
    flex-wrap: nowrap;
    justify-content: flex-start;
    
    .el-button {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 4px 6px;
      font-size: 11px;
      min-width: auto;
      flex-shrink: 0;
      
      .el-icon {
        font-size: 12px;
      }
    }
  }
}

.compliance-high {
  color: #4caf50;
  font-weight: 600;
}

.compliance-medium {
  color: #ff9800;
  font-weight: 600;
}

.compliance-low {
  color: #f44336;
  font-weight: 600;
}

.patient-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}

.patient-link:hover {
  color: #66b1ff;
}

// 响应式
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .followup-list {
    .action-buttons {
      flex-wrap: wrap;
      gap: 2px;
      
      .el-button {
        padding: 2px 4px;
        font-size: 10px;
        min-width: auto;
        
        .el-icon {
          font-size: 10px;
        }
      }
    }
  }
}
</style>
