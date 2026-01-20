import request from '@/utils/request'

// 获取患者列表
export function getPatients(params) {
  return request({
    url: '/api/patients',
    method: 'get',
    params
  })
}

// 获取患者详情
export function getPatientDetail(id) {
  return request({
    url: `/api/patients/${id}`,
    method: 'get'
  })
}

// 更新患者信息
export function updatePatient(id, data) {
  return request({
    url: `/api/patients/${id}`,
    method: 'put',
    data
  })
}

// 获取患者健康档案
export function getPatientHealthRecord(id) {
  return request({
    url: `/api/patients/${id}/health-record`,
    method: 'get'
  })
}

// 更新患者健康档案
export function updatePatientHealthRecord(id, data) {
  return request({
    url: `/api/patients/${id}/health-record`,
    method: 'put',
    data
  })
}

// 获取患者处方历史
export function getPatientPrescriptionHistory(id, params) {
  return request({
    url: `/api/patients/${id}/prescriptions`,
    method: 'get',
    params
  })
}

// 获取患者工单历史
export function getPatientWorkOrderHistory(id, params) {
  return request({
    url: `/api/patients/${id}/workorders`,
    method: 'get',
    params
  })
}

















