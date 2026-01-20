import request from '@/utils/request'

// 获取聊天列表
export function getChatList(params) {
  return request({
    url: '/api/chat/list',
    method: 'get',
    params
  })
}

// 获取聊天消息
export function getChatMessages(chatId, params) {
  return request({
    url: `/api/chat/${chatId}/messages`,
    method: 'get',
    params
  })
}

// 发送消息
export function sendMessage(chatId, data) {
  return request({
    url: `/api/chat/${chatId}/send`,
    method: 'post',
    data
  })
}

// 开始聊天
export function startChat(patientId) {
  return request({
    url: '/api/chat/start',
    method: 'post',
    data: { patientId }
  })
}

// 结束聊天
export function endChat(chatId) {
  return request({
    url: `/api/chat/${chatId}/end`,
    method: 'post'
  })
}

// 获取未读消息数量
export function getUnreadCount() {
  return request({
    url: '/api/chat/unread-count',
    method: 'get'
  })
}

// 标记消息为已读
export function markAsRead(chatId, messageId) {
  return request({
    url: `/api/chat/${chatId}/read`,
    method: 'post',
    data: { messageId }
  })
}

















