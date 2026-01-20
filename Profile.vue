<template>
  <div class="profile">
    <div class="page-header">
      <h1 class="page-title">个人资料</h1>
      <p class="page-subtitle">管理个人信息和设置</p>
    </div>

    <div class="profile-content">
      <!-- 个人信息卡片 -->
      <div class="medical-card">
        <div class="card-header">
          <div class="title">个人信息</div>
          <div class="subtitle">查看和编辑个人资料</div>
        </div>
        <div class="card-body">
          <div class="profile-form">
            <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px">
              <div class="form-section">
                <h3 class="section-title">基本信息</h3>
                <div class="form-row">
                  <el-form-item label="姓名" prop="name">
                    <el-input v-model="profileForm.name" placeholder="请输入姓名" />
                  </el-form-item>
                  <el-form-item label="工号" prop="employeeId">
                    <el-input v-model="profileForm.employeeId" placeholder="请输入工号" disabled />
                  </el-form-item>
                </div>
                
                <div class="form-row">
                  <el-form-item label="性别" prop="gender">
                    <el-radio-group v-model="profileForm.gender">
                      <el-radio value="男">男</el-radio>
                      <el-radio value="女">女</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="年龄" prop="age">
                    <el-input-number v-model="profileForm.age" :min="18" :max="70" placeholder="请输入年龄" />
                  </el-form-item>
                </div>
                
                <div class="form-row">
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                  </el-form-item>
                </div>
              </div>

              <div class="form-section">
                <h3 class="section-title">职业信息</h3>
                <div class="form-row">
                  <el-form-item label="职位" prop="position">
                    <el-input v-model="profileForm.position" placeholder="请输入职位" />
                  </el-form-item>
                  <el-form-item label="部门" prop="department">
                    <el-input v-model="profileForm.department" placeholder="请输入部门" />
                  </el-form-item>
                </div>
                
                <div class="form-row">
                  <el-form-item label="职称" prop="title">
                    <el-select v-model="profileForm.title" placeholder="请选择职称" style="width: 100%">
                      <el-option label="主任医师" value="主任医师" />
                      <el-option label="副主任医师" value="副主任医师" />
                      <el-option label="主治医师" value="主治医师" />
                      <el-option label="住院医师" value="住院医师" />
                      <el-option label="主任药师" value="主任药师" />
                      <el-option label="副主任药师" value="副主任药师" />
                      <el-option label="主管药师" value="主管药师" />
                      <el-option label="药师" value="药师" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="执业证书" prop="license">
                    <el-input v-model="profileForm.license" placeholder="请输入执业证书号" />
                  </el-form-item>
                </div>
              </div>

              <div class="form-section">
                <h3 class="section-title">个人简介</h3>
                <el-form-item label="简介" prop="bio">
                  <el-input
                    v-model="profileForm.bio"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入个人简介"
                  />
                </el-form-item>
              </div>
            </el-form>
          </div>
          
          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="saveProfile" :loading="saving">
              保存修改
            </el-button>
          </div>
        </div>
      </div>

      <!-- 头像上传卡片 -->
      <div class="medical-card">
        <div class="card-header">
          <div class="title">头像设置</div>
          <div class="subtitle">上传个人头像</div>
        </div>
        <div class="card-body">
          <div class="avatar-section">
            <div class="avatar-preview">
              <el-avatar :size="120" :src="profileForm.avatar">
                <el-icon size="60"><User /></el-icon>
              </el-avatar>
              <div class="avatar-info">
                <h4>{{ profileForm.name || '未设置姓名' }}</h4>
                <p>{{ profileForm.position || '未设置职位' }}</p>
              </div>
            </div>
            
            <div class="avatar-upload">
              <el-upload
                class="avatar-uploader"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                action="#"
              >
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>
                  选择头像
                </el-button>
              </el-upload>
              <p class="upload-tip">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 密码修改卡片 -->
      <div class="medical-card">
        <div class="card-header">
          <div class="title">密码安全</div>
          <div class="subtitle">修改登录密码</div>
        </div>
        <div class="card-body">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
          </el-form>
          
          <div class="form-actions">
            <el-button @click="resetPasswordForm">重置</el-button>
            <el-button type="primary" @click="changePassword" :loading="changingPassword">
              修改密码
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 表单引用
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

// 加载状态
const saving = ref(false)
const changingPassword = ref(false)

// 个人信息表单
const profileForm = reactive({
  name: '',
  employeeId: '',
  gender: '男',
  age: null,
  phone: '',
  email: '',
  position: '',
  department: '',
  title: '',
  license: '',
  bio: '',
  avatar: ''
})

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入部门', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化个人信息
const initProfile = () => {
  // 从用户状态获取信息
  const userInfo = userStore.userInfo
  Object.assign(profileForm, {
    name: userInfo.name || '',
    employeeId: userInfo.employeeId || '',
    gender: userInfo.gender || '男',
    age: userInfo.age || null,
    phone: userInfo.phone || '',
    email: userInfo.email || '',
    position: userInfo.position || '',
    department: userInfo.department || '',
    title: userInfo.title || '',
    license: userInfo.license || '',
    bio: userInfo.bio || '',
    avatar: userInfo.avatar || ''
  })
}

// 保存个人信息
const saveProfile = async () => {
  try {
    await profileFormRef.value.validate()
    saving.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户状态
    userStore.updateUserInfo(profileForm)
    
    ElMessage.success('个人信息保存成功')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败，请检查输入信息')
    }
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  initProfile()
  profileFormRef.value?.clearValidate()
}

// 头像上传成功
const handleAvatarSuccess = (response, file) => {
  // 模拟上传成功，设置头像URL
  profileForm.avatar = URL.createObjectURL(file.raw)
  ElMessage.success('头像上传成功')
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 修改密码
const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 验证当前密码（模拟）
    if (passwordForm.currentPassword !== '123456') {
      ElMessage.error('当前密码错误')
      return
    }
    
    ElMessage.success('密码修改成功')
    
    // 重置密码表单
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    passwordFormRef.value?.clearValidate()
    
  } catch (error) {
    if (error !== false) {
      ElMessage.error('密码修改失败')
    }
  } finally {
    changingPassword.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordFormRef.value?.clearValidate()
}

onMounted(() => {
  // 初始化个人信息
  initProfile()
  console.log('个人资料页面已加载')
})
</script>

<style lang="scss" scoped>
.profile {
  padding: 20px;
  background: var(--bg-secondary);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .page-subtitle {
    font-size: 16px;
    color: var(--text-secondary);
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  margin-bottom: 32px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--brand-primary);
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 16px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-preview {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .avatar-info {
      h4 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
      }
      
      p {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }
  }
  
  .avatar-upload {
    .upload-tip {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 8px;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .profile {
    padding: 16px;
  }
  
  .page-header .page-title {
    font-size: 24px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>