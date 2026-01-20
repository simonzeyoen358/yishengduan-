<template>
  <div class="prescriptions">
    <div class="page-header">
      <h1 class="page-title">处方管理</h1>
      <p class="page-subtitle">所有处方的详细信息</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-blue)">
            <Document />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.totalPrescriptions }}</div>
          <div class="stats-label">总处方数</div>
          <div class="stats-trend up">+8%</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-green)">
            <Check />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.activePrescriptions }}</div>
          <div class="stats-label">有效处方</div>
          <div class="stats-trend up">+12%</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-yellow)">
            <Clock />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.expiringSoon }}</div>
          <div class="stats-label">即将过期</div>
          <div class="stats-trend urgent">需要关注</div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-icon">
          <el-icon size="24" color="var(--medical-red)">
            <Warning />
          </el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ stats.expiredPrescriptions }}</div>
          <div class="stats-label">已过期</div>
          <div class="stats-trend urgent">需要处理</div>
        </div>
      </div>
    </div>
    
    <div class="medical-card">
      <div class="card-header">
        <div class="title">处方列表</div>
        <div class="subtitle">所有处方的详细信息</div>
      </div>
      <div class="card-body">
        <!-- 筛选和搜索 -->
        <div class="filter-section">
          <div class="filter-row">
            <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="有效" value="active" />
              <el-option label="即将过期" value="expiring" />
              <el-option label="已过期" value="expired" />
            </el-select>
            
            <el-select v-model="filterType" placeholder="类型筛选" style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="高血压处方" value="高血压处方" />
              <el-option label="糖尿病处方" value="糖尿病处方" />
              <el-option label="感冒处方" value="感冒处方" />
            </el-select>
            
            <el-input
              v-model="searchKeyword"
              placeholder="搜索患者姓名或处方ID"
              style="width: 200px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-button type="primary" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            
            <el-button type="success" @click="generatePrescription">
              <el-icon><Plus /></el-icon>
              生成处方
            </el-button>
          </div>
        </div>

        <!-- 处方表格 -->
        <div class="table-section">
          <el-table
            :data="filteredPrescriptions"
            v-loading="loading"
            element-loading-text="加载中..."
            @row-click="viewPrescriptionDetail"
            :row-class-name="getRowClassName"
            height="500"
          >
            <el-table-column prop="id" label="处方ID" width="80" />
            <el-table-column prop="patientName" label="患者" width="100" />
            <el-table-column prop="type" label="处方类型" width="120" />
            <el-table-column prop="medications" label="药品清单" min-width="200" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="doctorName" label="医生" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="120">
              <template #default="{ row }">
                {{ formatTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="expireTime" label="有效期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.expireTime) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="totalPrescriptions"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 生成处方对话框 -->
    <el-dialog
      v-model="generateDialogVisible"
      title="生成新处方"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="generateFormRef"
        :model="generateForm"
        :rules="generateRules"
        label-width="100px"
      >
        <el-form-item label="患者姓名" prop="patientName">
          <el-input v-model="generateForm.patientName" placeholder="请输入患者姓名" />
        </el-form-item>
        
        <el-form-item label="患者ID" prop="patientId">
          <el-input v-model="generateForm.patientId" placeholder="请输入患者ID" />
        </el-form-item>
        
        <el-form-item label="处方类型" prop="prescriptionType">
          <el-select v-model="generateForm.prescriptionType" placeholder="请选择处方类型" style="width: 100%">
            <el-option label="高血压处方" value="高血压处方" />
            <el-option label="糖尿病处方" value="糖尿病处方" />
            <el-option label="感冒处方" value="感冒处方" />
            <el-option label="其他处方" value="其他处方" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="药品清单" prop="medications">
          <div v-for="(medication, index) in generateForm.medications" :key="index" class="medication-item">
            <el-input
              v-model="generateForm.medications[index]"
              placeholder="请输入药品名称和剂量"
              style="margin-bottom: 8px"
            />
            <el-button
              type="danger"
              size="small"
              @click="removeMedication(index)"
              style="margin-left: 8px"
            >
              删除
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="addMedication">
            <el-icon><Plus /></el-icon>
            添加药品
          </el-button>
        </el-form-item>
        
        <el-form-item label="用法用量">
          <el-input v-model="generateForm.dosage" placeholder="请输入用法用量" />
        </el-form-item>
        
        <el-form-item label="服用频次">
          <el-input v-model="generateForm.frequency" placeholder="如：每日3次" />
        </el-form-item>
        
        <el-form-item label="疗程">
          <el-input v-model="generateForm.duration" placeholder="如：7天" />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="generateForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="generateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveGeneratedPrescription">生成处方</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看处方详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="处方详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentPrescription" class="prescription-detail">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">处方ID:</span>
              <span class="value">{{ currentPrescription.id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">患者姓名:</span>
              <span class="value">{{ currentPrescription.patientName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">处方类型:</span>
              <span class="value">{{ currentPrescription.type }}</span>
            </div>
            <div class="detail-item">
              <span class="label">医生:</span>
              <span class="value">{{ currentPrescription.doctorName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDate(currentPrescription.createTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">有效期至:</span>
              <span class="value">{{ formatDate(currentPrescription.expireTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">状态:</span>
              <el-tag :type="getStatusType(currentPrescription.status)" size="small">
                {{ getStatusText(currentPrescription.status) }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>药品清单</h3>
          <div class="medication-list">
            {{ currentPrescription.medications }}
      </div>
    </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="success" @click="downloadPrescription(currentPrescription)">下载</el-button>
          <el-button type="warning" @click="printPrescription(currentPrescription)">打印</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  Check,
  Clock,
  Warning,
  Search,
  Refresh,
  Plus
} from '@element-plus/icons-vue'

// 统计数据
const stats = reactive({
  totalPrescriptions: 156,
  activePrescriptions: 134,
  expiringSoon: 8,
  expiredPrescriptions: 14
})

// 筛选条件
const filterStatus = ref('')
const filterType = ref('')
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalPrescriptions = ref(0)

// 加载状态
const loading = ref(false)

// 处方列表
const prescriptions = ref([
  {
    id: 1,
    patientName: '张明',
    type: '高血压处方',
    medications: '氨氯地平 5mg, 氢氯噻嗪 12.5mg',
    status: 'active',
    doctorName: '李医生',
    createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    expireTime: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    patientName: '王丽',
    type: '糖尿病处方',
    medications: '二甲双胍 500mg',
    status: 'active',
    doctorName: '赵医生',
    createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expireTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    patientName: '李华',
    type: '感冒处方',
    medications: '布洛芬 200mg, 复方甘草片',
    status: 'expiring',
    doctorName: '王医生',
    createTime: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    expireTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    patientName: '陈芳',
    type: '高血压处方',
    medications: '氨氯地平 5mg',
    status: 'expired',
    doctorName: '刘医生',
    createTime: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    expireTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  }
])

// 筛选后的处方列表
const filteredPrescriptions = computed(() => {
  let filtered = prescriptions.value

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(prescription => prescription.status === filterStatus.value)
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

  totalPrescriptions.value = filtered.length
  return filtered
})

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    active: 'success',
    expiring: 'warning',
    expired: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '有效',
    expiring: '即将过期',
    expired: '已过期'
  }
  return statusMap[status] || '未知'
}

// 获取行样式
const getRowClassName = ({ row }) => {
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

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 查看处方详情
const viewDialogVisible = ref(false)
const currentPrescription = ref(null)

const viewPrescriptionDetail = (row) => {
  currentPrescription.value = row
  viewDialogVisible.value = true
}

// 下载处方
const downloadPrescription = (row) => {
  try {
    // 生成处方PDF内容
    const prescriptionData = {
      id: row.id,
      patientName: row.patientName,
      type: row.type,
      medications: row.medications,
      doctorName: row.doctorName,
      createTime: formatDate(row.createTime),
      expireTime: formatDate(row.expireTime),
      status: getStatusText(row.status)
    }
    
    // 创建下载内容
    const content = `
处方详情
========
处方ID: ${prescriptionData.id}
患者姓名: ${prescriptionData.patientName}
处方类型: ${prescriptionData.type}
药品清单: ${prescriptionData.medications}
医生: ${prescriptionData.doctorName}
创建时间: ${prescriptionData.createTime}
有效期至: ${prescriptionData.expireTime}
状态: ${prescriptionData.status}

生成时间: ${new Date().toLocaleString('zh-CN')}
    `
    
    // 创建Blob并下载
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `处方_${row.patientName}_${row.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('处方下载成功！')
  } catch (error) {
    ElMessage.error('处方下载失败，请重试')
  }
}

// 打印处方
const printPrescription = (row) => {
  try {
    // 生成打印内容
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #333;">医疗处方</h1>
          <p style="margin: 5px 0; color: #666;">Medical Prescription</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">处方信息</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">处方ID</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${row.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">患者姓名</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${row.patientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">处方类型</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${row.type}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">医生</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${row.doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">创建时间</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(row.createTime)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">有效期至</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(row.expireTime)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">状态</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${getStatusText(row.status)}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">药品清单</h3>
          <div style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;">
            ${row.medications}
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <p style="color: #666; font-size: 12px;">
            打印时间: ${new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
    `
    
    // 打开新窗口进行打印
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>处方打印 - ${row.patientName}</title>
          <style>
            @media print {
              body { margin: 0; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    
    // 等待内容加载完成后打印
    printWindow.onload = () => {
      printWindow.print()
    }
    
    ElMessage.success('处方打印窗口已打开！')
  } catch (error) {
    ElMessage.error('处方打印失败，请重试')
  }
}

// 生成处方对话框
const generateDialogVisible = ref(false)
const generateForm = reactive({
  patientName: '',
  patientId: '',
  prescriptionType: '',
  medications: [],
  dosage: '',
  frequency: '',
  duration: '',
  notes: ''
})

const generateRules = {
  patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  patientId: [{ required: true, message: '请输入患者ID', trigger: 'blur' }],
  prescriptionType: [{ required: true, message: '请选择处方类型', trigger: 'change' }],
  medications: [{ required: true, message: '请添加药品', trigger: 'change' }]
}

// 生成处方
const generatePrescription = () => {
  generateDialogVisible.value = true
}

// 保存生成的处方
const saveGeneratedPrescription = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newPrescription = {
      id: prescriptions.value.length + 1,
      patientName: generateForm.patientName,
      type: generateForm.prescriptionType,
      medications: generateForm.medications.join(', '),
      status: 'active',
      doctorName: '当前医生',
      createTime: new Date(),
      expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
    
    prescriptions.value.unshift(newPrescription)
    generateDialogVisible.value = false
    
    // 重置表单
    Object.keys(generateForm).forEach(key => {
      if (key === 'medications') {
        generateForm[key] = []
      } else {
        generateForm[key] = ''
      }
    })
    
    ElMessage.success('处方生成成功！')
  } catch (error) {
    ElMessage.error('处方生成失败，请重试')
  }
}

// 添加药品
const addMedication = () => {
  generateForm.medications.push('')
}

// 删除药品
const removeMedication = (index) => {
  generateForm.medications.splice(index, 1)
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
  console.log('处方管理页面已加载')
})
</script>

<style lang="scss" scoped>
.prescriptions {
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

.filter-section {
  margin-bottom: 20px;
  
  .filter-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.table-section {
  :deep(.el-table) {
    .selected-row {
      background-color: var(--brand-secondary);
    }
    
    .el-table__row {
      cursor: pointer;
      
      &:hover {
        background-color: var(--brand-secondary);
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
}

// 响应式
@media (max-width: 768px) {
  .prescriptions {
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
  }
}

// 对话框样式
.medication-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.prescription-detail {
  .detail-section {
    margin-bottom: 24px;
    
    h3 {
      color: #333;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      
      .detail-item {
        display: flex;
        align-items: center;
        
        .label {
          font-weight: 500;
          color: #666;
          margin-right: 8px;
          min-width: 80px;
        }
        
        .value {
          color: #333;
          font-weight: 400;
        }
      }
    }
    
    .medication-list {
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
      border: 1px solid #ddd;
      color: #333;
      line-height: 1.6;
    }
  }
}

.dialog-footer {
  text-align: right;
  
  .el-button {
    margin-left: 8px;
  }
}
</style>