import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 设置MSW worker
export const worker = setupWorker(...handlers)

// 启动MSW
export const startMockService = async () => {
  if (typeof window !== 'undefined') {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      })
      console.log('MSW已启动，Mock服务正在运行')
    } catch (error) {
      console.warn('MSW启动失败，继续使用真实API:', error)
    }
  }
}

// 停止MSW
export const stopMockService = () => {
  if (typeof window !== 'undefined') {
    worker.stop()
    console.log('MSW已停止')
  }
}
