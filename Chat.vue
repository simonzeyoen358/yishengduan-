<template>
  <div class="chat">

    <div class="page-header">
      <h1 class="page-title">聊天系统</h1>
      <p class="page-subtitle">与患者进行实时沟通</p>
    </div>
    

    <!-- 简单聊天界面 -->
    <div class="simple-chat">
      <div class="chat-list">
        <div 
          v-for="chat in chats" 
          :key="chat.id"
          class="chat-item"
          @click="selectChat(chat)"
          :class="{ active: selectedChat?.id === chat.id }"
        >
          <div class="patient-info">
            <span class="patient-name">{{ chat.patientName }}</span>
            <span class="last-message">{{ chat.lastMessage }}</span>
          </div>
        </div>
      </div>

      <div v-if="selectedChat" class="chat-content">
        <div class="chat-header">
          <h3>{{ selectedChat.patientName }}</h3>
        </div>
        
        <div class="messages">
          <div 
            v-for="message in selectedChat.messages" 
            :key="message.id"
            class="message"
            :class="{ sent: message.isSent }"
          >
            <!-- 图片消息 -->
            <div v-if="message.type === 'image'" class="image-message">
              <img :src="message.imageUrl" :alt="message.content" @click="previewImage(message.imageUrl)" />
              <p v-if="message.content">{{ message.content }}</p>
            </div>
            <!-- 文字消息 -->
            <div v-else class="text-message">
              {{ message.content }}
            </div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>

        <div class="input-area">
          <!-- 图片上传区域 -->
          <div v-if="showImageUpload" class="image-upload-area">
            <el-upload
              class="image-uploader"
              :action="uploadAction"
              :show-file-list="false"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload"
              accept="image/*"
            >
              <el-icon class="image-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tips">
              <p>支持 JPG、PNG 格式，大小不超过 20MB</p>
              <el-button size="small" @click="showImageUpload = false">取消</el-button>
            </div>
          </div>

          <!-- 消息输入区域 -->
          <div class="message-input-row">
            <el-button 
              type="text" 
              @click="showImageUpload = !showImageUpload"
              class="image-btn"
            >
              <el-icon><Picture /></el-icon>
              图片
            </el-button>
            <el-input 
              v-model="newMessage" 
              placeholder="输入消息..."
              @keyup.enter="sendMessage"
              class="message-input"
            />
            <el-button type="primary" @click="sendMessage">发送</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue'

const route = useRoute()
const currentTime = ref('')
const selectedChat = ref(null)
const newMessage = ref('')
const showImageUpload = ref(false)
const uploadAction = ref('/api/upload') // 模拟上传接口

// 为初始消息添加时间戳，确保按时间顺序排列
const chats = ref([
  {
    id: 1,
    patientName: '张明',
    lastMessage: '谢谢您的建议',
    messages: [
      { id: 1, content: '您好，我想咨询高血压用药问题', isSent: false, type: 'text', timestamp: new Date(Date.now() - 120000) },
      { id: 2, content: '您好，请详细描述症状', isSent: true, type: 'text', timestamp: new Date(Date.now() - 90000) },
      { id: 3, content: '我最近血压不稳定，经常头晕', isSent: false, type: 'text', timestamp: new Date(Date.now() - 60000) },
      { id: 4, content: '建议定时测量血压，注意饮食', isSent: true, type: 'text', timestamp: new Date(Date.now() - 30000) }
    ]
  },
  {
    id: 2,
    patientName: '王丽',
    lastMessage: '好的，我明白了',
    messages: [
      { id: 1, content: '我想咨询糖尿病饮食问题', isSent: false, type: 'text', timestamp: new Date(Date.now() - 180000) },
      { id: 2, content: '建议控制碳水化合物摄入', isSent: true, type: 'text', timestamp: new Date(Date.now() - 150000) },
      { id: 3, content: '好的，我明白了', isSent: false, type: 'text', timestamp: new Date(Date.now() - 120000) }
    ]
  }
])

const selectChat = (chat) => {
  selectedChat.value = chat
  ElMessage.success(`已选择患者：${chat.patientName}`)
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedChat.value) {
    return
  }
  
  const message = {
    id: Date.now(),
    content: newMessage.value.trim(),
    isSent: true,
    type: 'text',
    timestamp: new Date()
  }
  
  // 添加消息并按时间戳排序
  selectedChat.value.messages.push(message)
  selectedChat.value.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  
  selectedChat.value.lastMessage = message.content
  newMessage.value = ''
  
  ElMessage.success('消息发送成功')
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt20M = file.size / 1024 / 1024 < 20

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt20M) {
    ElMessage.error('图片大小不能超过 20MB!')
    return false
  }
  return true
}

// 图片上传成功
const handleImageSuccess = (response, file) => {
  if (!selectedChat.value) {
    ElMessage.warning('请先选择一个患者')
    return
  }

  // 模拟图片URL
  const imageUrl = URL.createObjectURL(file.raw)
  
  const message = {
    id: Date.now(),
    content: '发送了一张图片',
    isSent: true,
    type: 'image',
    imageUrl: imageUrl,
    timestamp: new Date()
  }
  
  // 添加消息并按时间戳排序
  selectedChat.value.messages.push(message)
  selectedChat.value.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  
  selectedChat.value.lastMessage = message.content
  showImageUpload.value = false
  
  ElMessage.success('图片发送成功')
}

// 预览图片
const previewImage = (imageUrl) => {
  // 创建图片预览窗口
  const img = new Image()
  img.src = imageUrl
  img.style.maxWidth = '80%'
  img.style.maxHeight = '80%'
  img.style.cursor = 'pointer'
  
  // 创建遮罩层
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(0,0,0,0.8)'
  overlay.style.display = 'flex'
  overlay.style.justifyContent = 'center'
  overlay.style.alignItems = 'center'
  overlay.style.zIndex = '9999'
  overlay.style.cursor = 'pointer'
  
  overlay.appendChild(img)
  document.body.appendChild(overlay)
  
  // 点击关闭预览
  overlay.onclick = () => {
    document.body.removeChild(overlay)
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const diff = now - new Date(time)
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else {
    const hours = Math.floor(minutes / 60)
    return `${hours}小时前`
  }
}

onMounted(() => {
  currentTime.value = new Date().toLocaleString()
  console.log('聊天系统已加载')
  console.log('当前路由:', route.path)
  console.log('URL参数:', route.query)
  
  // 检查URL参数
  const patientId = route.query.patientId
  const patientName = route.query.patientName
  
  if (patientId && patientName) {
    console.log('从URL参数获取患者信息:', { patientId, patientName })
    
    // 查找对应的患者聊天
    let targetChat = chats.value.find(chat => 
      chat.patientName === patientName || chat.id.toString() === patientId
    )
    
    if (targetChat) {
      selectChat(targetChat)
      ElMessage.success(`已自动选择患者：${patientName}`)
    } else {
      // 创建新聊天
      const newChat = {
        id: parseInt(patientId),
        patientName: patientName,
        lastMessage: '开始新的对话',
        messages: [
          {
            id: 1,
            content: '您好，我是您的药师，有什么可以帮助您的吗？',
            isSent: true,
            type: 'text',
            timestamp: new Date()
          }
        ]
      }
      
      chats.value.unshift(newChat)
      selectChat(newChat)
      ElMessage.success(`已为患者 ${patientName} 创建新对话`)
    }
  } else {
    // 自动选择第一个聊天
    if (chats.value.length > 0) {
      selectChat(chats.value[0])
    }
  }
})
</script>

<style lang="scss" scoped>
.chat {
  padding: 20px;
  background: #F5F7FA;
  min-height: 100vh;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat {
    padding: 10px;
  }
  
  .simple-chat {
    grid-template-columns: 1fr;
    height: auto;
    min-height: calc(100vh - 100px);
  }
  
  .chat-list {
    max-height: 200px;
    margin-bottom: 10px;
  }
  
  .chat-content {
    height: calc(100vh - 300px);
  }
  
  .messages {
    .message {
      max-width: 85%;
      
      .image-message img {
        max-width: 150px;
        max-height: 150px;
      }
    }
  }
}

@media (max-width: 480px) {
  .messages {
    .message {
      max-width: 90%;
    }
  }
  
  .message-input-row {
    padding: 10px;
    gap: 6px;
    
    .image-btn {
      padding: 6px 8px;
    }
  }
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 8px;
  }
  
  .page-subtitle {
    font-size: 16px;
    color: #556C8A;
  }
}

.simple-chat {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  height: 500px;
}

.chat-list {
    background: white;
    border-radius: 8px;
    padding: 0;
    overflow-y: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    .chat-item {
      padding: 16px;
      border-radius: 0;
      cursor: pointer;
      margin-bottom: 0;
      transition: background 0.2s;
      border-bottom: 1px solid #f0f0f0;
      background: #f0f7ed;
      
      &:hover {
        background: #e8f5e8;
      }
      
      &.active {
        background: #e3f2fd;
        border-bottom: 1px solid #bbdefb;
      }
      
      .patient-info {
        .patient-name {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
          font-size: 15px;
        }
        
        .last-message {
          font-size: 13px;
          color: #999;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

.chat-content {
    background: white;
    border-radius: 8px;
    padding: 0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    .chat-header {
      border-bottom: 1px solid #f0f0f0;
      padding: 16px;
      margin-bottom: 0;
      background: white;
      
      h3 {
        margin: 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .messages {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 0;
      padding: 10px 16px;
      background-color: #f5f5f5;
      
      .message {
        margin-bottom: 16px;
        max-width: 75%;
        display: flex;
        align-items: flex-end;
        
        &.sent {
          flex-direction: row-reverse;
        }
        
        &:not(.sent) {
          flex-direction: row;
        }
        
        .text-message {
          padding: 10px 14px;
          border-radius: 18px;
          line-height: 1.5;
          word-wrap: break-word;
          word-break: break-word;
          white-space: pre-wrap;
          max-width: 100%;
          font-size: 14px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          
          // 微信风格气泡样式
          position: relative;
        }
        
        &.sent .text-message {
          background: #1677ff;
          color: white;
          border-bottom-right-radius: 6px;
          box-shadow: 0 1px 2px rgba(22, 119, 255, 0.2);
        }
        
        &:not(.sent) .text-message {
          background: #ffffff;
          color: #333333;
          border: 1px solid #e0e0e0;
          border-bottom-left-radius: 6px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .image-message {
          max-width: 100%;
          
          img {
            max-width: 200px;
            max-height: 200px;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            
            &:hover {
              transform: scale(1.02);
            }
          }
          
          p {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #666;
          }
        }
        
        &.sent .image-message {
          margin-left: auto;
        }
        
        .message-time {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
          margin-right: 8px;
          margin-left: 8px;
          text-align: center;
          align-self: flex-end;
        }
      }
    }
    
    .input-area {
      background: white;
      border-top: 1px solid #f0f0f0;
      
      .image-upload-area {
        margin-bottom: 0;
        padding: 16px;
        border: 2px dashed #d9d9d9;
        border-radius: 0;
        text-align: center;
        background: #fafafa;
        
        .image-uploader {
          .image-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 60px;
            height: 60px;
            line-height: 60px;
            text-align: center;
            border: 1px dashed #d9d9d9;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            
            &:hover {
              border-color: #409eff;
              color: #409eff;
            }
          }
        }
        
        .upload-tips {
          margin-top: 12px;
          
          p {
            margin: 8px 0;
            color: #666;
            font-size: 12px;
          }
        }
      }
      
      .message-input-row {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 12px 16px;
        
        .image-btn {
          color: #409eff;
          padding: 8px 12px;
          
          &:hover {
            background: #f0f9ff;
          }
        }
        
        .message-input {
          flex: 1;
        }
      }
    }
}
</style>