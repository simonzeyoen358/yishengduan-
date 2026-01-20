import request from '@/utils/request'

// 获取待审核处方列表
export function getPendingPrescriptions(params) {
  return request({
    url: '/api/prescriptions/pending',
    method: 'get',
    params
  })
}

// 获取处方详情
export function getPrescriptionDetail(id) {
  return request({
    url: `/api/prescriptions/${id}`,
    method: 'get'
  })
}

// 审核处方
export function reviewPrescription(id, data) {
  return request({
    url: `/api/prescriptions/${id}/review`,
    method: 'post',
    data
  })
}

// 电子签名处方
export function signPrescription(id, data) {
  return request({
    url: `/api/prescriptions/${id}/sign`,
    method: 'post',
    data
  })
}

// 获取处方统计
export function getPrescriptionStats() {
  return request({
    url: '/api/prescriptions/stats',
    method: 'get'
  })
}

// 获取处方历史
export function getPrescriptionHistory(params) {
  return request({
    url: '/api/prescriptions/history',
    method: 'get',
    params
  })
}

















