import { http, HttpResponse } from 'msw'

// Mock数据
const mockWorkOrders = [
  {
    id: 1,
    patientName: '张明',
    patientAge: 65,
    patientGender: '男',
    patientLevel: 1,
    requestType: '便民开药',
    symptoms: '头晕、心悸',
    duration: '3天',
    severity: '中等',
    description: '最近血压不稳定',
    allergies: '青霉素过敏',
    currentMedications: '氨氯地平 5mg',
    status: 'pending',
    priority: 'high',
    submitTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    institution: '社区医院',
    timeline: [
      {
        id: 1,
        action: 'patient_submit',
        description: '患者提交工单',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        operator: '张明'
      }
    ]
  },
  {
    id: 2,
    patientName: '王丽',
    patientAge: 58,
    patientGender: '女',
    patientLevel: 2,
    requestType: '用药咨询',
    symptoms: '多饮、多尿',
    duration: '1周',
    severity: '轻微',
    description: '血糖控制咨询',
    allergies: '无',
    currentMedications: '二甲双胍 500mg',
    status: 'processing',
    priority: 'normal',
    submitTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    institution: '三甲医院',
    timeline: [
      {
        id: 1,
        action: 'patient_submit',
        description: '患者提交工单',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        operator: '王丽'
      },
      {
        id: 2,
        action: 'pharmacist_claim',
        description: '药师认领工单',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        operator: '李药师'
      }
    ]
  },
  {
    id: 3,
    patientName: '李华',
    patientAge: 72,
    patientGender: '男',
    patientLevel: 1,
    requestType: '便民开药',
    symptoms: '咳嗽、发热',
    duration: '2天',
    severity: '中等',
    description: '感冒症状',
    allergies: '无',
    currentMedications: '无',
    status: 'waiting_doctor',
    priority: 'normal',
    submitTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    institution: '社区医院',
    timeline: [
      {
        id: 1,
        action: 'patient_submit',
        description: '患者提交工单',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        operator: '李华'
      },
      {
        id: 2,
        action: 'pharmacist_claim',
        description: '药师认领工单',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        operator: '王药师'
      },
      {
        id: 3,
        action: 'pharmacist_escalate',
        description: '药师升级工单',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        operator: '王药师'
      }
    ]
  },
  {
    id: 4,
    patientName: '陈芳',
    patientAge: 45,
    patientGender: '女',
    patientLevel: 2,
    requestType: '用药咨询',
    symptoms: '失眠、焦虑',
    duration: '2周',
    severity: '轻微',
    description: '睡眠质量差',
    allergies: '无',
    currentMedications: '无',
    status: 'completed',
    priority: 'normal',
    submitTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    institution: '三甲医院',
    timeline: [
      {
        id: 1,
        action: 'patient_submit',
        description: '患者提交工单',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        operator: '陈芳'
      },
      {
        id: 2,
        action: 'pharmacist_claim',
        description: '药师认领工单',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        operator: '赵药师'
      },
      {
        id: 3,
        action: 'pharmacist_escalate',
        description: '药师升级工单',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        operator: '赵药师'
      },
      {
        id: 4,
        action: 'doctor_approve',
        description: '医生审核通过',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        operator: '刘医生'
      }
    ]
  }
]

// 存储工单数据到localStorage
const saveWorkOrders = () => {
  localStorage.setItem('mockWorkOrders', JSON.stringify(mockWorkOrders))
}

const loadWorkOrders = () => {
  const saved = localStorage.getItem('mockWorkOrders')
  return saved ? JSON.parse(saved) : mockWorkOrders
}

// 初始化数据
saveWorkOrders()

export const handlers = [
  // 认证相关
  http.post('/auth/login', async ({ request }) => {
    const { username, password } = await request.json()
    
    // 简单的用户名密码验证
    if (username && password) {
      const tokenMap = {
        'demo.pharm': 'pharmacist',
        'demo.doctor': 'doctor',
        'demo.patient': 'patient'
      }
      
      const role = tokenMap[username] || 'doctor'
      const userName = role === 'pharmacist' ? '李药师' : role === 'doctor' ? '张医生' : '患者'
      
      return HttpResponse.json({
        code: 200,
        message: '登录成功',
        data: {
          token: username,
          user: {
            id: 1,
            name: userName,
            role: role,
            avatar: ''
          }
        }
      })
    }
    
    return HttpResponse.json({
      code: 401,
      message: '用户名或密码错误'
    }, { status: 401 })
  }),

  http.get('/auth/me', ({ request }) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return HttpResponse.json({
        code: 401,
        message: '未登录'
      }, { status: 401 })
    }
    
    const roleMap = {
      'demo.pharm': 'pharmacist',
      'demo.doctor': 'doctor',
      'demo.patient': 'patient'
    }
    
    const role = roleMap[token] || 'doctor'
    const userName = role === 'pharmacist' ? '李药师' : role === 'doctor' ? '张医生' : '患者'
    
    return HttpResponse.json({
      code: 200,
      data: {
        id: 1,
        name: userName,
        role: role,
        avatar: ''
      }
    })
  }),

  // 工单相关
  http.get('/v1/help-orders', ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || 1
    const pageSize = url.searchParams.get('pageSize') || 10
    const status = url.searchParams.get('status')
    const keyword = url.searchParams.get('keyword')
    
    const workOrders = loadWorkOrders()
    let filteredOrders = [...workOrders]
    
    // 状态筛选
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status)
    }
    
    // 关键词搜索
    if (keyword) {
      const keywordLower = keyword.toLowerCase()
      filteredOrders = filteredOrders.filter(order => 
        order.patientName.toLowerCase().includes(keywordLower) ||
        order.id.toString().includes(keywordLower)
      )
    }
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedOrders = filteredOrders.slice(start, end)
    
    return HttpResponse.json({
      code: 200,
      data: {
        list: paginatedOrders,
        total: filteredOrders.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  }),

  http.post('/v1/help-orders', async ({ request }) => {
    const workOrders = loadWorkOrders()
    const newOrder = {
      id: workOrders.length + 1,
      ...await request.json(),
      status: 'pending',
      submitTime: new Date().toISOString(),
      timeline: [
        {
          id: 1,
          action: 'patient_submit',
          description: '患者提交工单',
          timestamp: new Date().toISOString(),
          operator: '患者'
        }
      ]
    }
    
    workOrders.push(newOrder)
    localStorage.setItem('mockWorkOrders', JSON.stringify(workOrders))
    
    return HttpResponse.json({
      code: 200,
      message: '工单创建成功',
      data: newOrder
    })
  }),

  http.post('/v1/help-orders/:id/assign', ({ params }) => {
    const { id } = params
    const workOrders = loadWorkOrders()
    const orderIndex = workOrders.findIndex(order => order.id === parseInt(id))
    
    if (orderIndex === -1) {
      return HttpResponse.json({
        code: 404,
        message: '工单不存在'
      }, { status: 404 })
    }
    
    const order = workOrders[orderIndex]
    order.status = 'processing'
    order.timeline.push({
      id: order.timeline.length + 1,
      action: 'pharmacist_claim',
      description: '药师认领工单',
      timestamp: new Date().toISOString(),
      operator: '当前药师'
    })
    
    localStorage.setItem('mockWorkOrders', JSON.stringify(workOrders))
    
    return HttpResponse.json({
      code: 200,
      message: '工单认领成功',
      data: order
    })
  }),

  http.post('/v1/help-orders/:id/escalate', ({ params }) => {
    const { id } = params
    const workOrders = loadWorkOrders()
    const orderIndex = workOrders.findIndex(order => order.id === parseInt(id))
    
    if (orderIndex === -1) {
      return HttpResponse.json({
        code: 404,
        message: '工单不存在'
      }, { status: 404 })
    }
    
    const order = workOrders[orderIndex]
    order.status = 'waiting_doctor'
    order.timeline.push({
      id: order.timeline.length + 1,
      action: 'pharmacist_escalate',
      description: '药师升级工单',
      timestamp: new Date().toISOString(),
      operator: '当前药师'
    })
    
    localStorage.setItem('mockWorkOrders', JSON.stringify(workOrders))
    
    return HttpResponse.json({
      code: 200,
      message: '工单升级成功',
      data: order
    })
  }),

  http.post('/v1/help-orders/:id/approve', ({ params }) => {
    const { id } = params
    const workOrders = loadWorkOrders()
    const orderIndex = workOrders.findIndex(order => order.id === parseInt(id))
    
    if (orderIndex === -1) {
      return HttpResponse.json({
        code: 404,
        message: '工单不存在'
      }, { status: 404 })
    }
    
    const order = workOrders[orderIndex]
    order.status = 'completed'
    order.timeline.push({
      id: order.timeline.length + 1,
      action: 'doctor_approve',
      description: '医生审核通过',
      timestamp: new Date().toISOString(),
      operator: '当前医生'
    })
    
    localStorage.setItem('mockWorkOrders', JSON.stringify(workOrders))
    
    return HttpResponse.json({
      code: 200,
      message: '工单审核通过',
      data: order
    })
  }),

  http.get('/v1/help-orders/:id', ({ params }) => {
    const { id } = params
    const workOrders = loadWorkOrders()
    const order = workOrders.find(order => order.id === parseInt(id))
    
    if (!order) {
      return HttpResponse.json({
        code: 404,
        message: '工单不存在'
      }, { status: 404 })
    }
    
    return HttpResponse.json({
      code: 200,
      data: order
    })
  }),

  // 用药打卡相关
  http.post('/v1/med/checkin', async ({ request }) => {
    const checkinData = {
      id: Date.now(),
      ...await request.json(),
      timestamp: new Date().toISOString()
    }
    
    // 保存到localStorage
    const existingCheckins = JSON.parse(localStorage.getItem('mockCheckins') || '[]')
    existingCheckins.push(checkinData)
    localStorage.setItem('mockCheckins', JSON.stringify(existingCheckins))
    
    return HttpResponse.json({
      code: 200,
      message: '打卡成功',
      data: checkinData
    })
  }),

  http.get('/v1/med/records', ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || 1
    const pageSize = url.searchParams.get('pageSize') || 10
    
    const checkins = JSON.parse(localStorage.getItem('mockCheckins') || '[]')
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedCheckins = checkins.slice(start, end)
    
    return HttpResponse.json({
      code: 200,
      data: {
        list: paginatedCheckins,
        total: checkins.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  })
]