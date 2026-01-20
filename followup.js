/**
 * 随访管理工具函数
 * 包含日期格式化、状态转换、数据验证等通用辅助函数
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

/**
 * 格式化日期为 YYYY年MM月DD日 格式
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateCN(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
}

/**
 * 格式化时间为 HH:MM 格式
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * 格式化时间为 HH:MM:SS 格式
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @returns {string} 格式化后的时间字符串
 */
export function formatTimeWithSeconds(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:MM 格式
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(date) {
  if (!date) return ''
  return `${formatDate(date)} ${formatTime(date)}`
}

/**
 * 获取随访状态文本
 * @param {string} status - 随访状态码
 * @returns {string} 随访状态文本
 */
export function getFollowUpStatusText(status) {
  const statusMap = {
    pending: '待随访',
    completed: '已完成',
    missed: '已错过',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取随访状态对应的Element Plus标签类型
 * @param {string} status - 随访状态码
 * @returns {string} 标签类型
 */
export function getFollowUpStatusType(status) {
  const typeMap = {
    pending: 'warning',
    completed: 'success',
    missed: 'danger',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

/**
 * 获取随访类型文本
 * @param {string} type - 随访类型码
 * @returns {string} 随访类型文本
 */
export function getFollowUpTypeText(type) {
  const typeMap = {
    phone: '电话随访',
    in_person: '门诊随访',
    online: '在线随访',
    home: '上门随访'
  }
  return typeMap[type] || '未知类型'
}

/**
 * 获取随访结果文本
 * @param {string} result - 随访结果码
 * @returns {string} 随访结果文本
 */
export function getFollowUpResultText(result) {
  const resultMap = {
    normal: '正常',
    improved: '好转',
    worsened: '恶化',
    stable: '稳定'
  }
  return resultMap[result] || '未知结果'
}

/**
 * 获取随访结果对应的Element Plus标签类型
 * @param {string} result - 随访结果码
 * @returns {string} 标签类型
 */
export function getFollowUpResultType(result) {
  const typeMap = {
    normal: 'success',
    improved: 'success',
    worsened: 'danger',
    stable: 'info'
  }
  return typeMap[result] || 'info'
}

/**
 * 计算下次随访日期
 * @param {Date|string|number} date - 当前日期
 * @param {number} days - 间隔天数
 * @returns {Date} 下次随访日期
 */
export function calculateNextFollowUpDate(date, days = 30) {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d.getTime())) return null
  d.setDate(d.getDate() + days)
  return d
}

/**
 * 计算下次随访日期字符串
 * @param {Date|string|number} date - 当前日期
 * @param {number} days - 间隔天数
 * @returns {string} 下次随访日期字符串 (YYYY-MM-DD)
 */
export function calculateNextFollowUpDateString(date, days = 30) {
  const nextDate = calculateNextFollowUpDate(date, days)
  return nextDate ? formatDate(nextDate) : ''
}

/**
 * 判断随访是否已过期
 * @param {Date|string|number} date - 随访日期
 * @returns {boolean} 是否过期
 */
export function isFollowUpExpired(date) {
  if (!date) return false
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

/**
 * 判断随访是否即将过期（默认7天内）
 * @param {Date|string|number} date - 随访日期
 * @param {number} days - 预警天数
 * @returns {boolean} 是否即将过期
 */
export function isFollowUpExpiringSoon(date, days = 7) {
  if (!date) return false
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const warningDate = new Date(today)
  warningDate.setDate(today.getDate() + days)
  return d < warningDate && d >= today
}

/**
 * 验证随访记录表单数据
 * @param {Object} data - 随访记录数据
 * @returns {Object} 验证结果 { isValid: boolean, errors: Array<string> }
 */
export function validateFollowUpForm(data) {
  const errors = []

  if (!data.patientName || data.patientName.trim() === '') {
    errors.push('患者姓名不能为空')
  }

  if (!data.followUpDate) {
    errors.push('随访日期不能为空')
  }

  if (!data.followUpType) {
    errors.push('随访类型不能为空')
  }

  if (!data.status) {
    errors.push('随访状态不能为空')
  }

  if (data.status === 'completed' && !data.result) {
    errors.push('已完成的随访记录必须填写随访结果')
  }

  if (data.status === 'completed' && !data.summary) {
    errors.push('已完成的随访记录必须填写随访摘要')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 格式化随访记录数据，用于显示
 * @param {Object} followUp - 随访记录原始数据
 * @returns {Object} 格式化后的随访记录数据
 */
export function formatFollowUpData(followUp) {
  if (!followUp) return {}

  return {
    ...followUp,
    formattedDate: formatDate(followUp.followUpDate),
    formattedDateTime: formatDateTime(followUp.followUpDate),
    formattedDateCN: formatDateCN(followUp.followUpDate),
    statusText: getFollowUpStatusText(followUp.status),
    statusType: getFollowUpStatusType(followUp.status),
    typeText: getFollowUpTypeText(followUp.followUpType),
    resultText: getFollowUpResultText(followUp.result),
    resultType: getFollowUpResultType(followUp.result),
    isExpired: isFollowUpExpired(followUp.followUpDate),
    isExpiringSoon: isFollowUpExpiringSoon(followUp.followUpDate),
    nextFollowUpDateFormatted: followUp.nextFollowUpDate ? formatDate(followUp.nextFollowUpDate) : ''
  }
}

/**
 * 批量格式化随访记录数据
 * @param {Array} followUps - 随访记录数组
 * @returns {Array} 格式化后的随访记录数组
 */
export function formatFollowUpListData(followUps) {
  if (!Array.isArray(followUps)) return []
  return followUps.map(formatFollowUpData)
}

/**
 * 生成随访记录导出数据
 * @param {Array} followUps - 随访记录数组
 * @returns {Array} 导出数据数组
 */
export function generateExportData(followUps) {
  if (!Array.isArray(followUps)) return []
  return followUps.map(followUp => ({
    '患者姓名': followUp.patientName || '',
    '性别': followUp.patientGender || '',
    '年龄': followUp.patientAge || '',
    '随访日期': formatDate(followUp.followUpDate),
    '随访类型': getFollowUpTypeText(followUp.followUpType),
    '随访状态': getFollowUpStatusText(followUp.status),
    '随访结果': getFollowUpResultText(followUp.result),
    '摘要': followUp.summary || '',
    '操作人': followUp.operator || '',
    '下次随访日期': followUp.nextFollowUpDate ? formatDate(followUp.nextFollowUpDate) : ''
  }))
}
