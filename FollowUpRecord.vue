<template>
  <div class="follow-up-record">
    <el-card shadow="hover" class="record-card">
      <!-- 随访记录基本信息 -->
      <div class="record-header">
        <div class="record-title">
          <h3>{{ followUp.patientName || '未知患者' }}</h3>
          <el-tag :type="getStatusType(followUp.status)" class="status-tag">
            {{ getStatusText(followUp.status) }}
          </el-tag>
        </div>
        <div class="record-meta">
          <div class="meta-item">
            <el-icon><Calendar /></el-icon>
            <span>{{ formatDate(followUp.followUpDate) }}</span>
          </div>
          <div class="meta-item">
            <el-icon><Clock /></el-icon>
            <span>{{ formatTime(followUp.followUpDate) }}</span>
          </div>
          <div class="meta-item">
            <el-icon><User /></el-icon>
            <span>{{ followUp.operator || '未知操作人' }}</span>
          </div>
        </div>
      </div>

      <!-- 患者信息概览 -->
      <div class="patient-info-section">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">性别：</span>
            <span class="value">{{ followUp.patientGender || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">年龄：</span>
            <span class="value">{{ followUp.patientAge || '未知' }}岁</span>
          </div>
          <div class="info-item">
            <span class="label">随访类型：</span>
            <span class="value">{{ getFollowUpTypeText(followUp.followUpType) }}</span>
          </div>
          <div class="info-item">
            <span class="label">下次随访：</span>
            <span class="value next-follow-up" :class="{ 'expired': isNextFollowUpExpired }">
              {{ followUp.nextFollowUpDate ? formatDate(followUp.nextFollowUpDate) : '未设置' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 随访内容摘要 -->
      <div class="content-section">
        <h4 class="section-subtitle">随访摘要</h4>
        <div class="content-summary">
          {{ followUp.summary || '无摘要信息' }}
        </div>
        <el-button
          v-if="followUp.description"
          type="text"
          size="small"
          @click="showFullDescription = !showFullDescription"
        >
          {{ showFullDescription ? '收起详情' : '查看详情' }}
          <el-icon>{{ showFullDescription ? <ArrowUp /> : <ArrowDown /> }}</el-icon>
        </el-button>
        <div v-if="showFullDescription && followUp.description" class="content-full">
          {{ followUp.description }}
        </div>
      </div>

      <!-- 随访结果 -->
      <div v-if="followUp.result" class="result-section">
        <h4 class="section-subtitle">随访结果</h4>
        <div class="result-content">
          <el-tag :type="getResultType(followUp.result)" class="result-tag">
            {{ getResultText(followUp.result) }}
          </el-tag>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button-group>
          <el-button
            type="primary"
            size="small"
            @click="$emit('edit', followUp)"
            :disabled="actionDisabled"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button
            type="warning"
            size="small"
            @click="$emit('remind', followUp)"
            :disabled="actionDisabled"
          >
            <el-icon><Bell /></el-icon>
            提醒
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete"
            :disabled="actionDisabled"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button
            type="info"
            size="small"
            @click="$emit('detail', followUp)"
            :disabled="actionDisabled"
          >
            <el-icon><Document /></el-icon>
            详情
          </el-button>
        </el-button-group>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Calendar,
  Clock,
  User,
  Edit,
  Bell,
  Delete,
  Document,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'

const props = defineProps({
  followUp: {
    type: Object,
    default: () => ({})
  },
  actionDisabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'remind', 'detail'])

const showFullDescription = ref(false)

// 计算属性
const isNextFollowUpExpired = computed(() => {
  if (!props.followUp.nextFollowUpDate) return false
  const nextDate = new Date(props.followUp.nextFollowUpDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return nextDate < today
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取随访状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待随访',
    completed: '已完成',
    missed: '已错过',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取随访状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    completed: 'success',
    missed: 'danger',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取随访类型文本
const getFollowUpTypeText = (type) => {
  const typeMap = {
    phone: '电话随访',
    in_person: '门诊随访',
    online: '在线随访',
    home: '上门随访'
  }
  return typeMap[type] || '未知类型'
}

// 获取随访结果文本
const getResultText = (result) => {
  const resultMap = {
    normal: '正常',
    improved: '好转',
    worsened: '恶化',
    stable: '稳定'
  }
  return resultMap[result] || '未知结果'
}

// 获取随访结果类型
const getResultType = (result) => {
  const typeMap = {
    normal: 'success',
    improved: 'success',
    worsened: 'danger',
    stable: 'info'
  }
  return typeMap[result] || 'info'
}

// 处理删除操作
const handleDelete = () => {
  ElMessageBox.confirm(
    `确定要删除患者${props.followUp.patientName || '未知患者'}的随访记录吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      emit('delete', props.followUp)
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // 取消删除
    })
}
</script>

<style lang="scss" scoped>
.follow-up-record {
  width: 100%;
}

.record-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);

  .record-title {
    display: flex;
    align-items: center;
    gap: 12px;

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .status-tag {
      font-size: 12px;
    }
  }

  .record-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: var(--text-secondary);

      .el-icon {
        font-size: 14px;
      }
    }
  }
}

.patient-info-section {
  margin-bottom: 20px;

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        font-size: 14px;
        color: var(--text-secondary);
        min-width: 60px;
      }

      .value {
        font-size: 14px;
        color: var(--text-primary);
        font-weight: 500;

        &.next-follow-up {
          &.expired {
            color: var(--medical-red);
            font-weight: 600;
          }
        }
      }
    }
  }
}

.content-section {
  margin-bottom: 20px;

  .section-subtitle {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 12px 0;
  }

  .content-summary {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.6;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .content-full {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.6;
    margin-top: 8px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }
}

.result-section {
  margin-bottom: 20px;

  .section-subtitle {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 12px 0;
  }

  .result-content {
    .result-tag {
      font-size: 14px;
      padding: 6px 12px;
    }
  }
}

.action-section {
  display: flex;
  justify-content: flex-end;

  .el-button-group {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    .el-button {
      padding: 8px 16px;
      font-size: 14px;

      .el-icon {
        font-size: 14px;
        margin-right: 4px;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .record-header {
    flex-direction: column;
    gap: 12px;

    .record-meta {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
  }

  .patient-info-section {
    .info-grid {
      grid-template-columns: 1fr;
    }
  }

  .action-section {
    .el-button-group {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
