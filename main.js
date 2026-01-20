import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './styles/index.scss'

// 启动Mock服务（开发环境）
if (import.meta.env.DEV) {
  import('./mocks/browser').then(async ({ startMockService }) => {
    try {
      await startMockService()
    } catch (error) {
      console.warn('Mock服务启动失败，继续运行:', error)
    }
  }).catch(error => {
    console.warn('Mock服务加载失败，继续运行:', error)
  })
}

// 创建应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { size: 'default' })

// 挂载应用
app.mount('#app')


