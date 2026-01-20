<template>
  <div class="follow-up-reminder">
    <el-card shadow="hover" class="reminder-card">
      <template #header>
        <div class="card-header">
          <h3 class="card-title">
            <el-icon><Bell /></el-icon>
            随访提醒
            <el-tag type="danger" size="small" :effect="'dark'" v-if="reminderCount > 0">
              {{ reminderCount }}
            </el-tag>
          </h3>
          <el-button
            type="text"
            size="small"
            @click="$emit('view-all')"
            :disabled="reminderCount === 0"
          >
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>

      <!-- 没有提醒时的提示 -->
      <div v-if="reminderCount === 0" class="no-reminders">
        <el-empty
          description="暂无随访提醒"
          :image-size="120"
        >
          <el-button type="primary" size="small" @click="$emit('create')">
            <el-icon><Plus /></el-icon>
            创建随访记录
          </el-button>
        </el-empty>
      </div>

      <!-- 提醒列表 -->
      <div v-else class="reminder-list">
        <el-timeline>
          <el-timeline-item
            v-for="reminder in reminders"
            :key="reminder.id"
            :timestamp="getReminderTimeText(reminder)"
            :type="getReminderType(reminder)"
            :icon="getReminderIcon(reminder)"
          >
            <div class="reminder-item">
              <div class="reminder-content">
                <div class="reminder-title">
                  <span class="patient-name">{{ reminder.patientName }}</span>
                  <el-tag size="small" :type="getReminderStatusType(reminder)">
                    {{ getReminderStatusText(reminder) }}
                  </el-tag>
                </div>
                <div class="reminder-details">
                  <div class="detail-item">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ formatDate(reminder.followUpDate) }}</span>
                  </div>
                  <div class="detail-item">
                    <el-icon><User /></el-icon>
                    <span>{{ reminder.patientAge || '未知' }}岁 · {{ reminder.patientGender || '未知' }}</span>
                  </div>
                  <div class="detail-item">
                    <el-icon><CircleCheck /></el-icon>
                    <span>{{ getFollowUpTypeText(reminder.followUpType) }}</span>
                  </div>
                </div>
              </div>
              <div class="reminder-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="$emit('handle', reminder)"
                  :loading="loading[reminder.id]"
                >
                  <el-icon><CircleCheck /></el-icon>
                  处理
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click="$emit('view', reminder)"
                  :loading="loading[reminder.id]"
                >
                  <el-icon><Eye /></el-icon>
                  查看
                </el-button>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Bell,
  ArrowRight,
  Plus,
  Calendar,
  User,
  CircleCheck,
  Eye,
  Clock
} from '@element-plus/icons-vue'
import { formatDate, getFollowUpTypeText, isFollowUpExpired, isFollowUpExpiringSoon } from '@/utils/followup'

const props = defineProps({
  reminders: {
    type: Array,
    default: () => []
  },
  maxDisplay: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['view-all', 'create', 'handle', 'view'])

const loading = ref({})

// 计算属性
const reminderCount = computed(() => props.reminders.length)
const displayReminders = computed(() => {
  return props.reminders.slice(0, props.maxDisplay)
})

// 获取提醒时间文本
const getReminderTimeText = (reminder) => {
  if (!reminder.followUpDate) return '未知时间'
  
  const isExpired = isFollowUpExpired(reminder.followUpDate)
  const isExpiringSoon = isFollowUpExpiringSoon(reminder.followUpDate)
  
  if (isExpired) {
    return '已过期'
  } else if (isExpiringSoon) {
    return '即将到期'
  } else {
    return formatDate(reminder.followUpDate)
  }
}

// 获取提醒类型
const getReminderType = (reminder) => {
  if (!reminder.followUpDate) return 'info'
  
  const isExpired = isFollowUpExpired(reminder.followUpDate)
  const isExpiringSoon = isFollowUpExpiringSoon(reminder.followUpDate)
  
  if (isExpired) {
    return 'danger'
  } else if (isExpiringSoon) {
    return 'warning'
  } else {
    return 'success'
  }
}

// 获取提醒图标
const getReminderIcon = (reminder) => {
  if (!reminder.followUpDate) return Clock
  
  const isExpired = isFollowUpExpired(reminder.followUpDate)
  const isExpiringSoon = isFollowUpExpiringSoon(reminder.followUpDate)
  
  if (isExpired) {
    return CircleCheck
  } else if (isExpiringSoon) {
    return CircleCheck
  } else {
    return CircleCheck
  }
}

// 获取提醒状态文本
const getReminderStatusText = (reminder) => {
  return getFollowUpStatusText(reminder.status)
}

// 获取提醒状态类型
const getReminderStatusType = (reminder) => {
  const statusMap = {
    pending: 'warning',
    completed: 'success',
    missed: 'danger',
    cancelled: 'info'
  }
  return statusMap[reminder.status] || 'info'
}

// 获取随访状态文本
const getFollowUpStatusText = (status) => {
  const statusMap = {
    pending: '待随访',
    completed: '已完成',
    missed: '已错过',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知状态'
}
</script>

<style lang="scss" scoped>
.follow-up-reminder {
  width: 100%;
}

.reminder-card {
  border-radius: 12px;
  transition: all 0.3s ease;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);

      .el-icon {
        font-size: 20px;
      }
    }
  }
}

.no-reminders {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reminder-list {
  padding: 10px 0;

  .el-timeline {
    padding: 0;

    .el-timeline-item {
      padding-bottom: 20px;

      &:last-child {
        padding-bottom: 0;
      }

      .el-timeline-item__timestamp {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}

.reminder-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-primary);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--brand-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.reminder-content {
  .reminder-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .patient-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .reminder-details {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .detail-item {
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

.reminder-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);

  .el-button {
    padding: 6px 12px;
    font-size: 12px;

    .el-icon {
      font-size: 12px;
      margin-right: 4px;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .reminder-item {
    padding: 12px;
  }

  .reminder-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
