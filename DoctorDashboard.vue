<template>
  <div class="doctor-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">医生工作台</h1>
      <p class="page-subtitle">处方审核 · 电子签名 · 患者管理 · 工单处理</p>
    </div>
    

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-red)">
            <Document />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.pendingPrescriptions }}</div>
          <div class="stats-label">待审核处方</div>
          <div class="stats-trend urgent">需要处理</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-blue)">
            <Check />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.todayReviewed }}</div>
          <div class="stats-label">今日已审核</div>
          <div class="stats-trend up">+15%</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-green)">
            <SuccessFilled />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.approvalRate }}%</div>
          <div class="stats-label">审核通过率</div>
          <div class="stats-trend up">+3%</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-yellow)">
            <Clock />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.avgReviewTime }}</div>
          <div class="stats-label">平均审核时间</div>
          <div class="stats-trend down">-5分钟</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：处方审核列表 -->
      <div class="left-panel">
        <div class="medical-card">
          <div class="card-header">
            <div class="title">处方审核列表</div>
            <div class="subtitle">药师提交的处方建议</div>
          </div>
          <div class="card-body">
            <div class="filter-bar">
              <el-select v-model="filterStatus" placeholder="状态筛选" size="small" style="width: 120px">
                <el-option label="全部" value="" />
                <el-option label="待审核" value="pending" />
                <el-option label="审核中" value="reviewing" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
                <el-option label="高风险" value="high_risk" />
                <el-option label="紧急" value="urgent" />
              </el-select>
              
              <el-select v-model="filterType" placeholder="类型筛选" size="small" style="width: 120px">
                <el-option label="全部" value="" />
                <el-option label="高血压处方" value="高血压处方" />
                <el-option label="糖尿病处方" value="糖尿病处方" />
                <el-option label="感冒处方" value="感冒处方" />
              </el-select>
              
              <el-input
                v-model="searchKeyword"
                placeholder="搜索患者姓名或处方ID"
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

            <div class="prescription-list">
              <div 
                v-for="prescription in filteredPrescriptions" 
                :key="prescription.id"
                class="prescription-item"
                @click="selectPrescription(prescription)"
                :class="{ 
                  active: selectedPrescription?.id === prescription.id,
                  'high-risk': prescription.riskLevel === 'high',
                  'urgent': prescription.priority === 'urgent'
                }"
              >
                <div class="prescription-header">
                  <div class="patient-info">
                    <span class="patient-name">{{ prescription.patientName }}</span>
                    <span class="patient-age">{{ prescription.patientAge }}岁</span>
                    <span class="prescription-type">{{ prescription.type }}</span>
                    <el-tag v-if="prescription.riskLevel === 'high'" type="danger" size="small">高风险</el-tag>
                    <el-tag v-if="prescription.priority === 'urgent'" type="warning" size="small">紧急</el-tag>
                  </div>
                  <div class="prescription-status" :class="prescription.status">
                    {{ getStatusText(prescription.status) }}
                  </div>
                </div>
                
                <div class="prescription-content">
                  <div class="medications">
                    <span class="label">药品：</span>
                    <span class="value">{{ prescription.medications }}</span>
                  </div>
                  <div class="pharmacist">
                    <span class="label">提交药师：</span>
                    <span class="value">{{ prescription.pharmacistName }}</span>
                  </div>
                </div>
                
                <div class="prescription-footer">
                  <div class="time-info">
                    <span class="submit-time">{{ formatTime(prescription.submitTime) }}</span>
                  </div>
                  <div class="priority" v-if="prescription.priority === 'high'">
                    <el-icon color="var(--medical-red)"><Warning /></el-icon>
                    <span>高优先级</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：处方详情和审核 -->
      <div class="right-panel">
        <div v-if="selectedPrescription" class="medical-card">
          <div class="card-header">
            <div class="title">处方审核</div>
            <div class="subtitle">{{ selectedPrescription.patientName }} - {{ selectedPrescription.type }}</div>
          </div>
          <div class="card-body">
            <!-- 患者信息 -->
            <div class="section">
              <h3 class="section-title">患者信息</h3>
              <div class="patient-details">
                <div class="detail-row">
                  <span class="label">姓名：</span>
                  <span class="value">{{ selectedPrescription.patientName }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">年龄：</span>
                  <span class="value">{{ selectedPrescription.patientAge }}岁</span>
                </div>
                <div class="detail-row">
                  <span class="label">性别：</span>
                  <span class="value">{{ selectedPrescription.patientGender }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">过敏史：</span>
                  <span class="value">{{ selectedPrescription.allergies || '无' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">当前用药：</span>
                  <span class="value">{{ selectedPrescription.currentMedications || '无' }}</span>
                </div>
              </div>
            </div>

            <!-- 处方详情 -->
            <div class="section">
              <h3 class="section-title">处方详情</h3>
              <div class="prescription-details">
                <div class="detail-row">
                  <span class="label">处方类型：</span>
                  <span class="value">{{ selectedPrescription.type }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">药品清单：</span>
                  <span class="value">{{ selectedPrescription.medications }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">用法用量：</span>
                  <span class="value">{{ selectedPrescription.dosage }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">用药指导：</span>
                  <span class="value">{{ selectedPrescription.instructions }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">提交药师：</span>
                  <span class="value">{{ selectedPrescription.pharmacistName }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">提交时间：</span>
                  <span class="value">{{ formatDateTime(selectedPrescription.submitTime) }}</span>
                </div>
              </div>
            </div>

            <!-- 审核意见 -->
            <div class="section">
              <h3 class="section-title">审核意见</h3>
              <div class="review-form">
                <el-form :model="reviewForm" label-width="80px">
                  <el-form-item label="审核结果">
                    <el-radio-group v-model="reviewForm.result">
                      <el-radio value="approved">通过</el-radio>
                      <el-radio value="rejected">拒绝</el-radio>
                      <el-radio value="modify">需要修改</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <el-form-item label="审核意见">
                    <el-input
                      v-model="reviewForm.comment"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入审核意见..."
                    />
                  </el-form-item>
                  
                  <el-form-item label="修改建议" v-if="reviewForm.result === 'modify'">
                    <el-input
                      v-model="reviewForm.suggestions"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入修改建议..."
                    />
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="section">
              <h3 class="section-title">审核操作</h3>
              <div class="action-buttons">
                <el-button 
                  type="success" 
                  @click="handleApprove"
                  :loading="processingLoading"
                >
                  <el-icon><Check /></el-icon>
                  审核通过
                </el-button>
                <el-button 
                  type="danger" 
                  @click="handleReject"
                  :loading="processingLoading"
                >
                  <el-icon><Close /></el-icon>
                  拒绝处方
                </el-button>
                <el-button 
                  type="warning" 
                  @click="handleModify"
                  :loading="processingLoading"
                >
                  <el-icon><Edit /></el-icon>
                  需要修改
                </el-button>
                <el-button 
                  type="primary" 
                  @click="handleSignature"
                  :loading="processingLoading"
                >
                  <el-icon><Document /></el-icon>
                  电子签名
                </el-button>
                <el-button 
                  v-if="selectedPrescription?.riskLevel === 'high'"
                  type="danger" 
                  @click="handleDirectTakeover"
                  :loading="processingLoading"
                >
                  <el-icon><Warning /></el-icon>
                  直接接手
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-icon size="64" color="var(--text-secondary)">
            <Document />
          </el-icon>
          <p class="empty-text">请选择左侧处方进行审核</p>
        </div>
      </div>
    </div>

    <!-- 电子签名对话框 -->
    <el-dialog
      v-model="signatureDialogVisible"
      title="电子签名"
      width="500px"
      :before-close="handleCloseSignature"
    >
      <div class="signature-dialog">
        <div class="signature-info">
          <h3>处方信息</h3>
          <div v-if="selectedPrescription" class="prescription-summary">
            <p><strong>患者：</strong>{{ selectedPrescription.patientName }}</p>
            <p><strong>处方类型：</strong>{{ selectedPrescription.type }}</p>
            <p><strong>药品：</strong>{{ selectedPrescription.medications }}</p>
            <p><strong>提交药师：</strong>{{ selectedPrescription.pharmacistName }}</p>
          </div>
        </div>

        <div class="signature-form">
          <h3>身份验证</h3>
          <el-form :model="signatureForm" label-width="100px">
            <el-form-item label="短信验证码">
              <div class="otp-input-group">
                <el-input
                  v-model="signatureForm.otpCode"
                  placeholder="请输入6位验证码"
                  maxlength="6"
                  style="width: 200px"
                />
                <el-button 
                  type="primary" 
                  @click="sendOTP"
                  :disabled="otpCountdown > 0"
                  style="margin-left: 10px"
                >
                  {{ otpCountdown > 0 ? `${otpCountdown}s后重发` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item label="医生密码">
              <el-input
                v-model="signatureForm.password"
                type="password"
                placeholder="请输入医生密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="电子签名">
              <el-input
                v-model="signatureForm.signature"
                placeholder="请输入您的电子签名"
                maxlength="50"
              />
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="signatureForm.agreeTerms">
                我确认以上处方信息无误，同意进行电子签名
              </el-checkbox>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="signatureDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmSignature"
            :loading="signatureLoading"
            :disabled="!canConfirmSignature"
          >
            确认签名
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Check,
  SuccessFilled,
  Clock,
  Refresh,
  Warning,
  Close,
  Edit,
  Search
} from '@element-plus/icons-vue'

// 统计数据
const stats = reactive({
  pendingPrescriptions: 6,
  todayReviewed: 22,
  approvalRate: 92,
  avgReviewTime: '12分钟',
  highRiskCases: 3,
  urgentCases: 1
})

// 筛选条件
const filterStatus = ref('')
const filterType = ref('')
const searchKeyword = ref('')

// 选中的处方
const selectedPrescription = ref(null)

// 审核表单
const reviewForm = reactive({
  result: 'approved',
  comment: '',
  suggestions: ''
})

// 处理加载状态
const processingLoading = ref(false)

// 电子签名相关状态
const signatureDialogVisible = ref(false)
const signatureForm = reactive({
  otpCode: '',
  password: '',
  signature: '',
  agreeTerms: false
})
const signatureLoading = ref(false)
const otpCountdown = ref(0)

// 计算属性：是否可以确认签名
const canConfirmSignature = computed(() => {
  return signatureForm.otpCode.length === 6 &&
         signatureForm.password.length >= 6 &&
         signatureForm.signature.length >= 2 &&
         signatureForm.agreeTerms
})

// 筛选后的处方列表
const filteredPrescriptions = computed(() => {
  let filtered = prescriptions.value

  // 状态筛选
  if (filterStatus.value) {
    if (filterStatus.value === 'high_risk') {
      filtered = filtered.filter(prescription => prescription.riskLevel === 'high')
    } else if (filterStatus.value === 'urgent') {
      filtered = filtered.filter(prescription => prescription.priority === 'urgent')
    } else {
      filtered = filtered.filter(prescription => prescription.status === filterStatus.value)
    }
  }

  // 类型筛选
  if (filterType.value) {
    filtered = filtered.filter(prescription => prescription.type === filterType.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(prescription => 
      prescription.patientName.toLowerCase().includes(keyword) ||
      prescription.id.toString().includes(keyword)
    )
  }

  return filtered
})

// 处方列表
const prescriptions = ref([
  {
    id: 1,
    patientName: '张明',
    riskLevel: 'normal',
    patientAge: 65,
    patientGender: '男',
    type: '高血压处方',
    medications: '氨氯地平 5mg, 氢氯噻嗪 12.5mg',
    dosage: '每日一次，晨服',
    instructions: '定期监测血压，注意低血压反应',
    pharmacistName: '李药师',
    status: 'pending',
    priority: 'high',
    allergies: '青霉素过敏',
    currentMedications: '无',
    submitTime: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
  },
  {
    id: 2,
    patientName: '王丽',
    riskLevel: 'high',
    patientAge: 58,
    patientGender: '女',
    type: '糖尿病处方',
    medications: '二甲双胍 500mg',
    dosage: '每日两次，餐后服用',
    instructions: '定期监测血糖，注意胃肠道反应',
    pharmacistName: '赵药师',
    status: 'reviewing',
    priority: 'normal',
    allergies: '无',
    currentMedications: '无',
    submitTime: new Date(Date.now() - 60 * 60 * 1000), // 1小时前
  },
  {
    id: 3,
    patientName: '李华',
    patientAge: 72,
    patientGender: '男',
    type: '感冒处方',
    medications: '布洛芬 200mg, 复方甘草片',
    dosage: '每日三次，饭后服用',
    instructions: '多饮水，注意休息',
    pharmacistName: '王药师',
    status: 'pending',
    priority: 'normal',
    allergies: '无',
    currentMedications: '无',
    submitTime: new Date(Date.now() - 90 * 60 * 1000), // 1.5小时前
  }
])

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已拒绝'
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

// 选择处方
const selectPrescription = (prescription) => {
  selectedPrescription.value = prescription
  // 重置审核表单
  reviewForm.result = 'approved'
  reviewForm.comment = ''
  reviewForm.suggestions = ''
}

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据已刷新')
}

// 审核通过
const handleApprove = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要审核通过此处方吗？',
      '确认审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    processingLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('处方审核通过')
    
    // 更新处方状态
    const prescription = prescriptions.value.find(p => p.id === selectedPrescription.value.id)
    if (prescription) {
      prescription.status = 'approved'
    }
    
    stats.pendingPrescriptions--
    stats.todayReviewed++
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审核失败，请重试')
    }
  } finally {
    processingLoading.value = false
  }
}

// 拒绝处方
const handleReject = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要拒绝此处方吗？',
      '确认拒绝',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    processingLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('处方已拒绝')
    
    // 更新处方状态
    const prescription = prescriptions.value.find(p => p.id === selectedPrescription.value.id)
    if (prescription) {
      prescription.status = 'rejected'
    }
    
    stats.pendingPrescriptions--
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('拒绝失败，请重试')
    }
  } finally {
    processingLoading.value = false
  }
}

// 需要修改
const handleModify = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将此处方标记为需要修改吗？',
      '确认修改',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    processingLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('处方已标记为需要修改')
    
    // 更新处方状态
    const prescription = prescriptions.value.find(p => p.id === selectedPrescription.value.id)
    if (prescription) {
      prescription.status = 'reviewing'
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请重试')
    }
  } finally {
    processingLoading.value = false
  }
}

// 电子签名
const handleSignature = async () => {
  if (!selectedPrescription.value) {
    ElMessage.warning('请先选择一个处方')
    return
  }
  
  try {
    // 显示电子签名对话框
    signatureDialogVisible.value = true
  } catch (error) {
    console.error('电子签名失败:', error)
    ElMessage.error('电子签名失败')
  }
}

// 发送OTP验证码
const sendOTP = async () => {
  try {
    // 模拟发送OTP
    ElMessage.success('验证码已发送到您的手机')
    
    // 开始倒计时
    otpCountdown.value = 60
    const timer = setInterval(() => {
      otpCountdown.value--
      if (otpCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
  } catch (error) {
    ElMessage.error('发送验证码失败')
  }
}

// 确认电子签名
const confirmSignature = async () => {
  try {
    signatureLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 验证OTP和密码（模拟）
    if (signatureForm.otpCode !== '123456') {
      ElMessage.error('验证码错误')
      return
    }
    
    if (signatureForm.password !== 'doctor123') {
      ElMessage.error('医生密码错误')
      return
    }
    
    // 更新处方状态
    const prescription = prescriptions.value.find(p => p.id === selectedPrescription.value.id)
    if (prescription) {
      prescription.status = 'approved'
      prescription.signature = signatureForm.signature
      prescription.signatureTime = new Date()
    }
    
    ElMessage.success('电子签名成功！处方已生效')
    signatureDialogVisible.value = false
    
    // 重置表单
    Object.assign(signatureForm, {
      otpCode: '',
      password: '',
      signature: '',
      agreeTerms: false
    })
    
    // 更新统计数据
    stats.pendingPrescriptions--
    stats.todayReviewed++
    
  } catch (error) {
    ElMessage.error('电子签名失败')
  } finally {
    signatureLoading.value = false
  }
}

// 关闭电子签名对话框
const handleCloseSignature = () => {
  signatureDialogVisible.value = false
  // 重置表单
  Object.assign(signatureForm, {
    otpCode: '',
    password: '',
    signature: '',
    agreeTerms: false
  })
}

// 直接接手高风险病例
const handleDirectTakeover = async () => {
  if (!selectedPrescription.value) {
    ElMessage.warning('请先选择一个处方')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要直接接手患者 ${selectedPrescription.value.patientName} 的高风险病例吗？\n\n这将跳过药师处理环节，直接由医生负责。`,
      '确认直接接手',
      {
        confirmButtonText: '确定接手',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    processingLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 更新处方状态
    const prescription = prescriptions.value.find(p => p.id === selectedPrescription.value.id)
    if (prescription) {
      prescription.status = 'doctor_taken_over'
      prescription.doctorTakeoverTime = new Date()
      prescription.doctorNotes = '医生直接接手高风险病例'
    }
    
    ElMessage.success('高风险病例已直接接手，请立即处理')
    
    // 更新统计数据
    stats.highRiskCases--
    stats.urgentCases--
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('接手失败，请重试')
    }
  } finally {
    processingLoading.value = false
  }
}

onMounted(() => {
  try {
    // 初始化数据
    console.log('医生工作台已加载')
    console.log('统计数据:', stats)
    console.log('处方列表:', prescriptions.value)
    console.log('页面标题:', document.title)
    console.log('当前URL:', window.location.href)
  } catch (error) {
    console.error('医生工作台加载错误:', error)
  }
})
</script>

<style lang="scss" scoped>
.doctor-dashboard {
  padding: 20px;
  background: #F5F7FA; /* 直接使用颜色值作为备用 */
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #333333; /* 直接使用颜色值作为备用 */
    margin-bottom: 8px;
  }
  
  .page-subtitle {
    font-size: 16px;
    color: #556C8A; /* 直接使用颜色值作为备用 */
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  
  .stats-card {
    background: #FFFFFF; /* 直接使用颜色值作为备用 */
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 直接使用阴影值作为备用 */
    border: 1px solid #EBEEF5; /* 直接使用边框颜色作为备用 */
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: #DBEAFF; /* 直接使用颜色值作为备用 */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stats-content {
      flex: 1;
      
      .stats-number {
        font-size: 24px;
        font-weight: 700;
        color: #333333; /* 直接使用颜色值作为备用 */
        margin-bottom: 4px;
      }
      
      .stats-label {
        font-size: 14px;
        color: #556C8A; /* 直接使用颜色值作为备用 */
        margin-bottom: 4px;
      }
      
      .stats-trend {
        font-size: 12px;
        font-weight: 500;
        
        &.up {
          color: #2ED573; /* 直接使用颜色值作为备用 */
        }
        
        &.down {
          color: #FF4757; /* 直接使用颜色值作为备用 */
        }
        
        &.urgent {
          color: #FF4757; /* 直接使用颜色值作为备用 */
        }
      }
    }
  }
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
    flex-wrap: wrap;
  }
  
  .prescription-list {
    flex: 1;
    overflow-y: auto;
    
    .prescription-item {
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
      
      &.high-risk {
        border-color: #f56c6c;
        background: #fef0f0;
        
        &:hover {
          background: #fde2e2;
        }
      }
      
      &.urgent {
        border-color: #e6a23c;
        background: #fdf6ec;
        
        &:hover {
          background: #faecd8;
        }
      }
      
      .prescription-header {
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
          
          .prescription-type {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            background: rgba(55, 66, 250, 0.1);
            color: var(--medical-blue);
          }
        }
        
        .prescription-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          
          &.pending {
            background: rgba(255, 165, 2, 0.1);
            color: var(--medical-yellow);
          }
          
          &.reviewing {
            background: rgba(55, 66, 250, 0.1);
            color: var(--medical-blue);
          }
          
          &.approved {
            background: rgba(46, 213, 115, 0.1);
            color: var(--medical-green);
          }
          
          &.rejected {
            background: rgba(255, 71, 87, 0.1);
            color: var(--medical-red);
          }
        }
      }
      
      .prescription-content {
        margin-bottom: 12px;
        
        .medications, .pharmacist {
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
      
      .prescription-footer {
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
      min-height: calc(100% - 60px);
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
  
  .patient-details, .prescription-details {
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
  
  .review-form {
    .el-form-item {
      margin-bottom: 16px;
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
  .doctor-dashboard {
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

.signature-dialog {
  .signature-info {
    margin-bottom: 24px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
    
    .prescription-summary {
      p {
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--text-primary);
        
        strong {
          color: var(--text-secondary);
        }
      }
    }
  }
  
  .signature-form {
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    
    .otp-input-group {
      display: flex;
      align-items: center;
    }
  }
}
</style>
