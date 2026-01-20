# 舟山分岛医疗管理系统 - 药师/医生端

## 项目概述

这是舟山分岛医疗管理系统的Web前端，专门为药师和医生设计，实现了工单工作台、角色切换、处方审核等核心功能。

## 核心功能

### 🎯 工单工作台
- **统一工作界面**: 药师和医生共享的工单处理平台
- **角色切换**: 顶部角色切换按钮，支持药师端/医生端无缝切换
- **工单列表**: 表格形式展示工单，支持状态筛选和关键词搜索
- **实时操作**: 认领、升级、审核通过等操作按钮
- **右侧抽屉**: 工单详情、患者信息概览、处理时间线

### 👨‍⚕️ 药师端功能
- **工单认领**: 认领待处理的工单
- **用药建议**: 提供专业的用药建议和指导
- **工单升级**: 将复杂工单升级给医生处理
- **患者对话**: 与患者进行实时沟通

### 👩‍⚕️ 医生端功能
- **处方审核**: 审核药师提交的处方建议
- **电子签名**: 支持处方的电子签名
- **工单审核**: 审核通过或拒绝工单
- **高风险处理**: 处理高风险病例

## 技术架构

### 前端技术栈
- **Vue 3**: 现代化的前端框架
- **Element Plus**: 企业级UI组件库
- **Pinia**: 状态管理
- **Vue Router**: 路由管理
- **Axios**: HTTP客户端
- **MSW**: Mock Service Worker，用于API模拟

### 项目结构
```
web-admin/
├── src/
│   ├── api/              # API接口层
│   │   ├── auth.js       # 认证接口
│   │   ├── workorder.js  # 工单接口
│   │   └── ...
│   ├── components/        # 组件
│   │   └── OrderDrawer.vue # 工单详情抽屉
│   ├── views/            # 页面组件
│   │   ├── Workbench.vue  # 工单工作台（核心页面）
│   │   ├── PharmacistDashboard.vue # 药师工作台
│   │   ├── PrescriptionReview.vue  # 处方审核
│   │   └── ...
│   ├── layout/           # 布局组件
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── mocks/            # Mock数据
│   │   ├── handlers.js   # API处理器
│   │   └── browser.js    # MSW配置
│   ├── styles/           # 样式文件
│   └── utils/            # 工具函数
├── public/
│   └── mockServiceWorker.js # MSW服务工作者
└── package.json
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
cd web-admin
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本
```bash
npm run build
```

## 使用说明

### 角色切换
1. 在工单工作台页面顶部，点击"药师端"或"医生端"按钮
2. 系统会自动切换用户角色和权限
3. 工单列表会根据角色显示相应的工单状态
4. 操作按钮会根据角色显示不同的功能

### 工单处理流程
1. **患者提交工单** → 状态：待认领
2. **药师认领工单** → 状态：处理中
3. **药师升级工单** → 状态：待医生
4. **医生审核通过** → 状态：已完成

### 工单操作
- **认领**: 药师认领待处理的工单
- **升级**: 药师将工单升级给医生处理
- **审核通过**: 医生审核通过工单

### 工单详情
点击工单行可打开右侧抽屉，查看：
- 工单基本信息
- 患者基本信息概览
- 处理时间线
- 操作按钮

## API接口

### 认证接口
- `POST /auth/login` - 用户登录
- `GET /auth/me` - 获取用户信息

### 工单接口
- `GET /v1/help-orders` - 获取工单列表
- `POST /v1/help-orders` - 创建工单
- `POST /v1/help-orders/:id/assign` - 认领工单
- `POST /v1/help-orders/:id/escalate` - 升级工单
- `POST /v1/help-orders/:id/approve` - 审核通过工单
- `GET /v1/help-orders/:id` - 获取工单详情

### 用药打卡接口
- `POST /v1/med/checkin` - 用药打卡
- `GET /v1/med/records` - 获取打卡记录

## Mock数据

项目使用MSW (Mock Service Worker) 提供API模拟服务：

### 默认Token
- `demo.pharm` - 药师角色
- `demo.doctor` - 医生角色
- `demo.patient` - 患者角色

### 切换真实后端
1. 修改 `src/utils/request.js` 中的 `baseURL`
2. 停止MSW服务（在 `src/main.js` 中注释相关代码）
3. 确保后端API接口与Mock接口保持一致

## 设计规范

### 颜色方案
- **主品牌蓝**: #2979FF
- **辅色浅蓝**: #DBEAFF
- **主文字色**: #333333
- **次级文字色**: #556C8A

### 医疗系统专用色
- **高风险红色**: #FF4757
- **中等风险黄色**: #FFA500
- **低风险绿色**: #52C41A
- **信息蓝色**: #2979FF

## 开发指南

### 添加新功能
1. 在 `src/views/` 中创建新页面组件
2. 在 `src/router/index.js` 中添加路由
3. 在 `src/layout/Layout.vue` 中添加菜单项
4. 在 `src/api/` 中添加API接口
5. 在 `src/mocks/handlers.js` 中添加Mock处理

### 状态管理
使用Pinia进行状态管理，主要store：
- `user.js` - 用户信息和角色管理

### 样式规范
- 使用SCSS编写样式
- 遵循BEM命名规范
- 使用CSS变量定义颜色和尺寸
- 响应式设计，支持移动端

## 部署说明

### 生产环境部署
1. 运行 `npm run build` 构建项目
2. 将 `dist` 目录部署到Web服务器
3. 配置Nginx或其他Web服务器
4. 确保API接口地址正确

### 环境变量
创建 `.env` 文件：
```
VITE_BASE_URL=http://localhost:3000/api
VITE_MOCK_ENABLED=true
```

## 常见问题

### Q: 如何切换角色？
A: 在工单工作台页面顶部点击角色切换按钮，系统会自动更新权限和界面。

### Q: Mock数据如何重置？
A: 清除浏览器localStorage中的数据，或重新启动开发服务器。

### Q: 如何连接真实后端？
A: 修改 `src/utils/request.js` 中的 `baseURL`，并确保后端API接口与Mock接口保持一致。

## 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 实现工单工作台核心功能
- ✅ 支持药师/医生角色切换
- ✅ 实现工单认领、升级、审核流程
- ✅ 添加右侧抽屉详情展示
- ✅ 集成MSW Mock服务
- ✅ 响应式设计支持

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请联系开发团队。
