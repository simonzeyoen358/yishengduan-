<template>
  <div class="patients">
    <div class="page-header">
      <h1 class="page-title">患者管理</h1>
      <p class="page-subtitle">管理患者信息和健康档案</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-blue)">
            <User />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.totalPatients }}</div>
          <div class="stats-label">总患者数</div>
          <div class="stats-trend up">+5%</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-green)">
            <UserFilled />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.activePatients }}</div>
          <div class="stats-label">活跃患者</div>
          <div class="stats-trend up">+8%</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-yellow)">
            <Document />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.completeProfiles }}</div>
          <div class="stats-label">完整档案</div>
          <div class="stats-trend up">+12%</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-red)">
            <Warning />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.highRiskPatients }}</div>
          <div class="stats-label">高风险患者</div>
          <div class="stats-trend urgent">需要关注</div>
        </div>
      </div>
    </div>
    
    <div class="medical-card">
      <div class="card-header">
        <div class="title">患者列表</div>
        <div class="subtitle">所有患者的基本信息</div>
      </div>
      <div class="card-body">
        <!-- 筛选和搜索 -->
        <div class="filter-bar">
          <el-select v-model="filterLevel" placeholder="档案等级" size="small" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="核心必填" value="1" />
            <el-option label="次要关键" value="2" />
            <el-option label="一般完善" value="3" />
          </el-select>
          
          <el-select v-model="filterStatus" placeholder="状态筛选" size="small" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
          </el-select>
          
          <el-input
            v-model="searchKeyword"
            placeholder="搜索患者姓名或ID"
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
          
          <el-button type="success" size="small" @click="addPatient">
            <el-icon><Plus /></el-icon>
            添加患者
          </el-button>
        </div>

        <!-- 患者表格 -->
        <div class="table-section">
          <el-table
            :data="filteredPatients"
            v-loading="loading"
            element-loading-text="加载中..."
            @row-click="viewPatientDetail"
            :row-class-name="getRowClassName"
            height="500"
          >
            <el-table-column prop="id" label="患者ID" width="80" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="age" label="年龄" width="80" />
            <el-table-column prop="gender" label="性别" width="80" />
            <el-table-column prop="phone" label="联系电话" width="120" />
            <el-table-column prop="profileLevel" label="档案等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.profileLevel)" size="small">
                  {{ getLevelText(row.profileLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastVisit" label="最后就诊" width="120">
              <template #default="{ row }">
                {{ formatTime(row.lastVisit) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="totalPatients"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 患者详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="患者详情"
      width="70%"
      :before-close="handleCloseDetail"
    >
      <div v-if="selectedPatient" class="patient-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">患者ID：</span>
              <span class="value">#{{ selectedPatient.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">姓名：</span>
              <span class="value">{{ selectedPatient.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄：</span>
              <span class="value">{{ selectedPatient.age }}岁</span>
            </div>
            <div class="info-item">
              <span class="label">性别：</span>
              <span class="value">{{ selectedPatient.gender }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话：</span>
              <span class="value">{{ selectedPatient.phone }}</span>
            </div>
            <div class="info-item">
              <span class="label">身份证号：</span>
              <span class="value">{{ selectedPatient.idCard || '未填写' }}</span>
            </div>
            <div class="info-item">
              <span class="label">档案等级：</span>
              <span class="value">
                <el-tag :type="getLevelType(selectedPatient.profileLevel)" size="small">
                  {{ getLevelText(selectedPatient.profileLevel) }}
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="label">注册时间：</span>
              <span class="value">{{ formatDateTime(selectedPatient.registerTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 健康信息 -->
        <div class="detail-section">
          <h3 class="section-title">健康信息</h3>
          <div class="health-info">
            <div class="info-item">
              <span class="label">过敏史：</span>
              <span class="value">{{ selectedPatient.allergies || '无' }}</span>
            </div>
            <div class="info-item">
              <span class="label">既往病史：</span>
              <span class="value">{{ selectedPatient.medicalHistory || '无' }}</span>
            </div>
            <div class="info-item">
              <span class="label">家族史：</span>
              <span class="value">{{ selectedPatient.familyHistory || '无' }}</span>
            </div>
            <div class="info-item">
              <span class="label">当前用药：</span>
              <span class="value">{{ selectedPatient.currentMedications || '无' }}</span>
            </div>
            <div class="info-item">
              <span class="label">主要诊断：</span>
              <span class="value">{{ selectedPatient.mainDiagnosis || '无' }}</span>
            </div>
          </div>
        </div>

        <!-- 就诊记录 -->
        <div class="detail-section">
          <h3 class="section-title">最近就诊记录</h3>
          <div class="visit-records">
            <div
              v-for="record in selectedPatient.visitRecords"
              :key="record.id"
              class="visit-record"
            >
              <div class="record-header">
                <span class="visit-date">{{ formatDateTime(record.date) }}</span>
                <span class="visit-type">{{ record.type }}</span>
              </div>
              <div class="record-content">
                <div class="record-item">
                  <span class="label">诊断：</span>
                  <span class="value">{{ record.diagnosis }}</span>
                </div>
                <div class="record-item">
                  <span class="label">处方：</span>
                  <span class="value">{{ record.prescription }}</span>
                </div>
                <div class="record-item">
                  <span class="label">医生：</span>
                  <span class="value">{{ record.doctor }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="editPatient(selectedPatient)">
            编辑患者
          </el-button>
          <el-button type="success" @click="viewHealthRecord(selectedPatient)">
            查看档案
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑患者对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="selectedPatient ? '编辑患者' : '添加患者'"
      width="60%"
      :before-close="handleCloseEdit"
    >
      <div class="patient-edit">
        <el-form :model="editForm" label-width="100px" :rules="editRules" ref="editFormRef">
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            <div class="form-row">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="editForm.name" placeholder="请输入患者姓名" />
              </el-form-item>
              <el-form-item label="年龄" prop="age">
                <el-input-number v-model="editForm.age" :min="0" :max="120" />
              </el-form-item>
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="editForm.gender">
                  <el-radio value="男">男</el-radio>
                  <el-radio value="女">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="身份证号" prop="idCard">
                <el-input v-model="editForm.idCard" placeholder="请输入身份证号" />
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">健康信息</h3>
            <div class="form-row">
              <el-form-item label="过敏史">
                <el-input v-model="editForm.allergies" type="textarea" :rows="2" placeholder="请输入过敏史" />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="既往病史">
                <el-input v-model="editForm.medicalHistory" type="textarea" :rows="2" placeholder="请输入既往病史" />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="家族史">
                <el-input v-model="editForm.familyHistory" type="textarea" :rows="2" placeholder="请输入家族史" />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="当前用药">
                <el-input v-model="editForm.currentMedications" type="textarea" :rows="2" placeholder="请输入当前用药" />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="主要诊断">
                <el-input v-model="editForm.mainDiagnosis" type="textarea" :rows="2" placeholder="请输入主要诊断" />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePatient">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 健康档案对话框 -->
    <el-dialog
      v-model="recordDialogVisible"
      title="健康档案"
      width="80%"
      :before-close="handleCloseRecord"
    >
      <div v-if="selectedPatient" class="health-record">
        <div class="record-header">
          <div class="patient-info">
            <el-avatar :size="48" :src="selectedPatient.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="patient-details">
              <h3>{{ selectedPatient.name }}</h3>
              <p>{{ selectedPatient.age }}岁 · {{ selectedPatient.gender }}</p>
            </div>
          </div>
          <div class="record-actions">
            <el-button type="primary" @click="exportRecord">
              <el-icon><Download /></el-icon>
              导出档案
            </el-button>
            <el-button type="success" @click="printRecord">
              <el-icon><Printer /></el-icon>
              打印档案
            </el-button>
          </div>
        </div>

        <div class="record-content">
          <div class="record-section">
            <h3 class="section-title">基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">患者ID：</span>
                <span class="value">#{{ selectedPatient.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">姓名：</span>
                <span class="value">{{ selectedPatient.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">年龄：</span>
                <span class="value">{{ selectedPatient.age }}岁</span>
              </div>
              <div class="info-item">
                <span class="label">性别：</span>
                <span class="value">{{ selectedPatient.gender }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ selectedPatient.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">身份证号：</span>
                <span class="value">{{ selectedPatient.idCard || '未填写' }}</span>
              </div>
            </div>
          </div>

          <div class="record-section">
            <h3 class="section-title">健康档案</h3>
            <div class="health-info">
              <div class="info-item">
                <span class="label">过敏史：</span>
                <span class="value">{{ selectedPatient.allergies || '无' }}</span>
              </div>
              <div class="info-item">
                <span class="label">既往病史：</span>
                <span class="value">{{ selectedPatient.medicalHistory || '无' }}</span>
              </div>
              <div class="info-item">
                <span class="label">家族史：</span>
                <span class="value">{{ selectedPatient.familyHistory || '无' }}</span>
              </div>
              <div class="info-item">
                <span class="label">当前用药：</span>
                <span class="value">{{ selectedPatient.currentMedications || '无' }}</span>
              </div>
              <div class="info-item">
                <span class="label">主要诊断：</span>
                <span class="value">{{ selectedPatient.mainDiagnosis || '无' }}</span>
              </div>
            </div>
          </div>

          <div class="record-section">
            <h3 class="section-title">就诊记录</h3>
            <div class="visit-timeline">
              <div
                v-for="record in selectedPatient.visitRecords"
                :key="record.id"
                class="timeline-item"
              >
                <div class="timeline-marker">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="visit-date">{{ formatDateTime(record.date) }}</span>
                    <span class="visit-type">{{ record.type }}</span>
                  </div>
                  <div class="timeline-details">
                    <div class="detail-item">
                      <span class="label">诊断：</span>
                      <span class="value">{{ record.diagnosis }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">处方：</span>
                      <span class="value">{{ record.prescription }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">医生：</span>
                      <span class="value">{{ record.doctor }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </div>
    </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recordDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="editPatient(selectedPatient)">
            编辑档案
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
  User,
  UserFilled,
  Document,
  Warning,
  Search,
  Refresh,
  Plus,
  Download,
  Printer
} from '@element-plus/icons-vue'

// 统计数据
const stats = reactive({
  totalPatients: 156,
  activePatients: 89,
  completeProfiles: 134,
  highRiskPatients: 12
})

// 筛选条件
const filterLevel = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalPatients = ref(0)

// 加载状态
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const recordDialogVisible = ref(false)
const selectedPatient = ref(null)

// 编辑表单
const editForm = reactive({
  name: '',
  age: null,
  gender: '男',
  phone: '',
  idCard: '',
  allergies: '',
  medicalHistory: '',
  familyHistory: '',
  currentMedications: '',
  mainDiagnosis: ''
})

// 表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入患者姓名', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入患者年龄', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择患者性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 表单引用
const editFormRef = ref(null)

// 患者列表
const patients = ref([
  {
    id: 1,
    name: '张明',
    age: 65,
    gender: '男',
    phone: '138****1234',
    idCard: '330123195801011234',
    profileLevel: 1,
    status: 'active',
    allergies: '青霉素过敏',
    medicalHistory: '高血压病史10年，糖尿病病史5年',
    familyHistory: '父亲有高血压病史',
    currentMedications: '氨氯地平 5mg, 二甲双胍 500mg',
    mainDiagnosis: '高血压，2型糖尿病',
    registerTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    visitRecords: [
      {
        id: 1,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        type: '复诊',
        diagnosis: '高血压控制良好',
        prescription: '氨氯地平 5mg 继续服用',
        doctor: '李医生'
      },
      {
        id: 2,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        type: '初诊',
        diagnosis: '高血压，2型糖尿病',
        prescription: '氨氯地平 5mg, 二甲双胍 500mg',
        doctor: '王医生'
      }
    ]
  },
  {
    id: 2,
    name: '王丽',
    age: 58,
    gender: '女',
    phone: '139****5678',
    idCard: '330123196501015678',
    profileLevel: 2,
    status: 'active',
    allergies: '无',
    medicalHistory: '糖尿病病史3年',
    familyHistory: '母亲有糖尿病病史',
    currentMedications: '二甲双胍 500mg',
    mainDiagnosis: '2型糖尿病',
    registerTime: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    visitRecords: [
      {
        id: 1,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        type: '复诊',
        diagnosis: '血糖控制良好',
        prescription: '二甲双胍 500mg 继续服用',
        doctor: '赵医生'
      }
    ]
  },
  {
    id: 3,
    name: '李华',
    age: 72,
    gender: '男',
    phone: '137****9012',
    idCard: '330123195201019012',
    profileLevel: 1,
    status: 'active',
    allergies: '无',
    medicalHistory: '冠心病病史8年',
    familyHistory: '无',
    currentMedications: '阿司匹林 100mg',
    mainDiagnosis: '冠心病',
    registerTime: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000),
    lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    visitRecords: [
      {
        id: 1,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        type: '急诊',
        diagnosis: '心绞痛',
        prescription: '硝酸甘油 0.5mg 舌下含服',
        doctor: '刘医生'
      }
    ]
  },
  {
    id: 4,
    name: '陈芳',
    age: 45,
    gender: '女',
    phone: '136****3456',
    idCard: '330123197801013456',
    profileLevel: 3,
    status: 'inactive',
    allergies: '无',
    medicalHistory: '无',
    familyHistory: '无',
    currentMedications: '无',
    mainDiagnosis: '无',
    registerTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastVisit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    visitRecords: []
  }
])

// 筛选后的患者列表
const filteredPatients = computed(() => {
  let filtered = patients.value

  // 档案等级筛选
  if (filterLevel.value) {
    filtered = filtered.filter(patient => patient.profileLevel.toString() === filterLevel.value)
  }

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(patient => patient.status === filterStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(patient => 
      patient.name.toLowerCase().includes(keyword) ||
      patient.id.toString().includes(keyword) ||
      patient.phone.includes(keyword)
    )
  }

  totalPatients.value = filtered.length
  return filtered
})

// 获取等级类型
const getLevelType = (level) => {
  const levelMap = {
    1: 'danger',
    2: 'warning',
    3: 'info'
  }
  return levelMap[level] || 'info'
}

// 获取等级文本
const getLevelText = (level) => {
  const levelMap = {
    1: '核心必填',
    2: '次要关键',
    3: '一般完善'
  }
  return levelMap[level] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    active: 'success',
    inactive: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '活跃',
    inactive: '非活跃'
  }
  return statusMap[status] || '未知'
}

// 获取行样式
const getRowClassName = ({ row }) => {
  if (selectedPatient.value?.id === row.id) {
    return 'selected-row'
  }
  return ''
}

// 格式化时间
const formatTime = (time) => {
  const now = new Date()
  const diff = now - time
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    const weeks = Math.floor(days / 7)
    return `${weeks}周前`
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

// 查看患者详情
const viewPatientDetail = (row) => {
  selectedPatient.value = row
  detailDialogVisible.value = true
}

// 关闭详情对话框
const handleCloseDetail = () => {
  detailDialogVisible.value = false
  selectedPatient.value = null
}

// 编辑患者
const editPatient = (row) => {
  selectedPatient.value = row
  if (row) {
    // 编辑模式：填充现有数据
    Object.assign(editForm, {
      name: row.name,
      age: row.age,
      gender: row.gender,
      phone: row.phone,
      idCard: row.idCard || '',
      allergies: row.allergies || '',
      medicalHistory: row.medicalHistory || '',
      familyHistory: row.familyHistory || '',
      currentMedications: row.currentMedications || '',
      mainDiagnosis: row.mainDiagnosis || ''
    })
  } else {
    // 添加模式：重置表单
    Object.assign(editForm, {
      name: '',
      age: null,
      gender: '男',
      phone: '',
      idCard: '',
      allergies: '',
      medicalHistory: '',
      familyHistory: '',
      currentMedications: '',
      mainDiagnosis: ''
    })
  }
  editDialogVisible.value = true
}

// 查看健康档案
const viewHealthRecord = (row) => {
  selectedPatient.value = row
  recordDialogVisible.value = true
}

// 添加患者
const addPatient = () => {
  selectedPatient.value = null
  editDialogVisible.value = true
}

// 保存患者
const savePatient = async () => {
  try {
    // 表单验证
    await editFormRef.value.validate()
    
    if (selectedPatient.value) {
      // 编辑模式：更新现有患者
      Object.assign(selectedPatient.value, editForm)
      ElMessage.success('患者信息更新成功')
    } else {
      // 添加模式：创建新患者
      const newPatient = {
        id: Date.now(),
        ...editForm,
        profileLevel: 3, // 默认一般完善
        status: 'active',
        registerTime: new Date(),
        lastVisit: new Date(),
        visitRecords: []
      }
      
      patients.value.unshift(newPatient)
      stats.totalPatients++
      stats.activePatients++
      ElMessage.success('患者添加成功')
    }
    
    editDialogVisible.value = false
    refreshData()
    
  } catch (error) {
    console.error('保存患者失败:', error)
  }
}

// 关闭编辑对话框
const handleCloseEdit = () => {
  editDialogVisible.value = false
  selectedPatient.value = null
}

// 关闭档案对话框
const handleCloseRecord = () => {
  recordDialogVisible.value = false
  selectedPatient.value = null
}

// 导出档案
const exportRecord = () => {
  if (!selectedPatient.value) {
    ElMessage.warning('请先选择患者')
    return
  }
  
  try {
    // 生成档案数据
    const recordData = {
      patientInfo: {
        id: selectedPatient.value.id,
        name: selectedPatient.value.name,
        age: selectedPatient.value.age,
        gender: selectedPatient.value.gender,
        phone: selectedPatient.value.phone,
        idCard: selectedPatient.value.idCard
      },
      healthInfo: {
        allergies: selectedPatient.value.allergies,
        medicalHistory: selectedPatient.value.medicalHistory,
        familyHistory: selectedPatient.value.familyHistory,
        currentMedications: selectedPatient.value.currentMedications,
        mainDiagnosis: selectedPatient.value.mainDiagnosis
      },
      visitRecords: selectedPatient.value.visitRecords,
      exportTime: new Date().toLocaleString('zh-CN')
    }
    
    // 创建JSON文件
    const dataStr = JSON.stringify(recordData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedPatient.value.name}_健康档案_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('档案导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('档案导出失败')
  }
}

// 打印档案
const printRecord = () => {
  if (!selectedPatient.value) {
    ElMessage.warning('请先选择患者')
    return
  }
  
  try {
    // 创建打印内容
    const printContent = `
      <html>
        <head>
          <title>${selectedPatient.value.name} - 健康档案</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #2979FF; border-bottom: 2px solid #2979FF; padding-bottom: 5px; }
            .info-item { margin-bottom: 8px; }
            .label { font-weight: bold; }
            .visit-record { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
            .visit-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .visit-type { background: #2979FF; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>健康档案</h1>
            <h2>${selectedPatient.value.name} (${selectedPatient.value.age}岁 ${selectedPatient.value.gender})</h2>
            <p>导出时间: ${new Date().toLocaleString('zh-CN')}</p>
          </div>
          
          <div class="section">
            <h3>基本信息</h3>
            <div class="info-item"><span class="label">患者ID:</span> #${selectedPatient.value.id}</div>
            <div class="info-item"><span class="label">姓名:</span> ${selectedPatient.value.name}</div>
            <div class="info-item"><span class="label">年龄:</span> ${selectedPatient.value.age}岁</div>
            <div class="info-item"><span class="label">性别:</span> ${selectedPatient.value.gender}</div>
            <div class="info-item"><span class="label">联系电话:</span> ${selectedPatient.value.phone}</div>
            <div class="info-item"><span class="label">身份证号:</span> ${selectedPatient.value.idCard || '未填写'}</div>
          </div>
          
          <div class="section">
            <h3>健康档案</h3>
            <div class="info-item"><span class="label">过敏史:</span> ${selectedPatient.value.allergies || '无'}</div>
            <div class="info-item"><span class="label">既往病史:</span> ${selectedPatient.value.medicalHistory || '无'}</div>
            <div class="info-item"><span class="label">家族史:</span> ${selectedPatient.value.familyHistory || '无'}</div>
            <div class="info-item"><span class="label">当前用药:</span> ${selectedPatient.value.currentMedications || '无'}</div>
            <div class="info-item"><span class="label">主要诊断:</span> ${selectedPatient.value.mainDiagnosis || '无'}</div>
          </div>
          
          <div class="section">
            <h3>就诊记录</h3>
            ${selectedPatient.value.visitRecords.map(record => `
              <div class="visit-record">
                <div class="visit-header">
                  <span>${new Date(record.date).toLocaleString('zh-CN')}</span>
                  <span class="visit-type">${record.type}</span>
                </div>
                <div class="info-item"><span class="label">诊断:</span> ${record.diagnosis}</div>
                <div class="info-item"><span class="label">处方:</span> ${record.prescription}</div>
                <div class="info-item"><span class="label">医生:</span> ${record.doctor}</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `
    
    // 打开新窗口打印
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    
    // 等待内容加载完成后打印
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
    
    ElMessage.success('正在准备打印...')
  } catch (error) {
    console.error('打印失败:', error)
    ElMessage.error('档案打印失败')
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

onMounted(() => {
  // 初始化数据
  console.log('患者管理页面已加载')
})
</script>

<style lang="scss" scoped>
.patients {
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

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.table-section {
    :deep(.el-table) {
      border: none;
      
      .el-table__header-wrapper {
        .el-table__header {
          th {
            background-color: var(--bg-primary);
            border-bottom: 2px solid var(--border-light);
            font-weight: 600;
            color: var(--text-primary);
          }
        }
      }
      
      .el-table__body-wrapper {
        .el-table__body {
          tr {
            background-color: var(--bg-primary);
            border-bottom: 1px solid var(--border-light);
            transition: all 0.3s ease;
            
            &:hover {
              background-color: var(--brand-secondary);
              transform: translateY(-1px);
              box-shadow: var(--shadow-medium);
            }
            
            &.selected-row {
              background-color: var(--brand-secondary);
              border-color: var(--brand-primary);
            }
            
            td {
              border-bottom: 1px solid var(--border-light);
            }
          }
        }
      }
      
      .el-table__empty-block {
        background-color: var(--bg-primary);
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 6px;
      align-items: center;
      width: 100%;
      
      :deep(.el-button) {
        flex: 0 0 auto;
        max-width: 80px;
        min-width: 60px;
        padding: 4px 10px;
        font-size: 12px;
        white-space: nowrap;
      }
    }
    
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: center;
    }
  }

.patient-detail {
  .detail-section {
    margin-bottom: 24px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
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
      }
    }
  }
  
  .health-info {
    .info-item {
      display: flex;
      margin-bottom: 8px;
      
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
  
  .visit-records {
    .visit-record {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      
      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .visit-date {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .visit-type {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          background: var(--brand-secondary);
          color: var(--brand-primary);
        }
      }
      
      .record-content {
        .record-item {
          display: flex;
          margin-bottom: 4px;
          
          .label {
            font-size: 14px;
            color: var(--text-secondary);
            min-width: 60px;
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
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.patient-edit {
  .form-section {
    margin-bottom: 24px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--brand-primary);
    }
    
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .patients {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .patients {
    padding: 12px;
  }
  
  .page-header {
    .page-title {
      font-size: 24px;
    }
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .table-section {
    :deep(.el-table) {
      .el-table__header-wrapper {
        .el-table__header {
          th {
            padding: 8px 4px;
            font-size: 12px;
          }
        }
      }
      
      .el-table__body-wrapper {
        .el-table__body {
          tr {
            td {
              padding: 10px 4px;
              font-size: 12px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 4px;
      
      :deep(.el-button) {
        width: 100%;
        max-width: none;
        font-size: 11px;
        padding: 3px 8px;
      }
    }
  }
  
  .pagination {
    :deep(.el-pagination) {
      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
      
      .el-pagination__total {
        font-size: 12px;
      }
    }
  }
}

.health-record {
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-light);
    margin-bottom: 24px;
    
    .patient-info {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .patient-details {
        h3 {
          font-size: 20px;
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
    
    .record-actions {
      display: flex;
      gap: 12px;
      
      :deep(.el-button) {
        max-width: 120px;
        padding: 8px 16px;
        font-size: 14px;
      }
    }
  }
  
  .record-content {
    .record-section {
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
    
    .visit-timeline {
      position: relative;
      
      .timeline-item {
        position: relative;
        padding-left: 40px;
        margin-bottom: 24px;
        
        &:not(:last-child)::after {
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
            margin-bottom: 8px;
            
            .visit-date {
              font-size: 16px;
              font-weight: 600;
              color: var(--text-primary);
            }
            
            .visit-type {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              background: var(--brand-secondary);
              color: var(--brand-primary);
            }
          }
          
          .timeline-details {
            .detail-item {
              display: flex;
              margin-bottom: 4px;
              
              .label {
                font-size: 14px;
                color: var(--text-secondary);
                min-width: 60px;
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
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .patients {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header .page-title {
    font-size: 24px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
    
    :deep(.el-button) {
      width: 100%;
    }
  }
  
  // 健康档案响应式
  .health-record {
    .record-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .record-actions {
        width: 100%;
        flex-direction: column;
        gap: 8px;
        
        :deep(.el-button) {
          width: 100%;
          max-width: none;
          font-size: 13px;
          padding: 6px 12px;
        }
      }
    }
  }
}
</style>