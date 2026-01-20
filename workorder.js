import request from '@/utils/request'

// 获取工单列表
export const getWorkOrders = (params) => {
  return request({
    url: '/v1/help-orders',
    method: 'get',
    params
  })
}

// 创建工单
export const createWorkOrder = (data) => {
  return request({
    url: '/v1/help-orders',
    method: 'post',
    data
  })
}

// 认领工单
export const claimWorkOrder = (id) => {
  return request({
    url: `/v1/help-orders/${id}/assign`,
    method: 'post'
  })
}

// 升级工单
export const escalateWorkOrder = (id) => {
  return request({
    url: `/v1/help-orders/${id}/escalate`,
    method: 'post'
  })
}

// 审核通过工单
export const approveWorkOrder = (id) => {
  return request({
    url: `/v1/help-orders/${id}/approve`,
    method: 'post'
  })
}

// 获取工单详情
export const getWorkOrderDetail = (id) => {
  return request({
    url: `/v1/help-orders/${id}`,
    method: 'get'
  })
}

// 更新工单状态
export const updateWorkOrderStatus = (id, status) => {
  return request({
    url: `/v1/help-orders/${id}/status`,
    method: 'put',
    data: { status }
  })
}