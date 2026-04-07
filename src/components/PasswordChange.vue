<template>
  <div class="password-change-modal" v-if="visible">
    <div class="modal-content">
      <div class="modal-header">
        <h3>修改账户信息</h3>
        <button @click="close" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>用户名</label>
          <input type="text" v-model="username" placeholder="请输入新用户名" />
        </div>
        <div class="form-group">
          <label>原密码</label>
          <input type="password" v-model="oldPassword" placeholder="请输入原密码" />
        </div>
        <div class="form-group">
          <label>新密码</label>
          <input type="password" v-model="newPassword" placeholder="请输入新密码（留空则不修改）" />
        </div>
        <div class="form-group">
          <label>确认新密码</label>
          <input type="password" v-model="confirmPassword" placeholder="请确认新密码" />
        </div>
        <div v-if="message" class="message" :class="message.type">
          {{ message.text }}
        </div>
      </div>
      <div class="modal-footer">
        <button @click="close" class="cancel-button">取消</button>
        <button @click="submit" :disabled="!isFormValid" class="submit-button">提交</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()

const username = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const isFormValid = computed(() => {
  // 原密码必须填写
  if (!oldPassword.value) return false
  // 如果填写了新密码，必须确认密码
  if (newPassword.value && newPassword.value !== confirmPassword.value) return false
  // 用户名和新密码至少填写一个
  return username.value || newPassword.value
})

const close = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  username.value = authStore.currentUser?.username || ''
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  message.value = null
}

const submit = () => {
  if (!isFormValid.value) return

  const userId = authStore.currentUser?.id
  if (!userId) {
    message.value = {
      type: 'error',
      text: '用户未登录'
    }
    return
  }

  // 验证原密码
  const user = authStore.users.find(u => u.id === userId)
  if (!user || user.password !== oldPassword.value) {
    message.value = {
      type: 'error',
      text: '原密码错误'
    }
    return
  }

  // 准备更新数据
  const updates: any = {}
  if (username.value && username.value !== user.username) {
    // 检查用户名是否已存在
    const existingUser = authStore.users.find(u => u.username === username.value && u.id !== userId)
    if (existingUser) {
      message.value = {
        type: 'error',
        text: '用户名已存在'
      }
      return
    }
    updates.username = username.value
  }
  if (newPassword.value) {
    updates.password = newPassword.value
  }

  // 执行更新
  const success = authStore.updateUser(userId, updates)
  if (success) {
    message.value = {
      type: 'success',
      text: '账户信息修改成功'
    }
    // 更新当前用户信息
    authStore.currentUser = authStore.users.find(u => u.id === userId) || null
    localStorage.setItem('auth-current-user', JSON.stringify(authStore.currentUser))
    setTimeout(() => {
      close()
    }, 1500)
  } else {
    message.value = {
      type: 'error',
      text: '修改失败，请重试'
    }
  }
}

// 当组件挂载时，初始化用户名
onMounted(() => {
  username.value = authStore.currentUser?.username || ''
})
</script>

<style scoped>
.password-change-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #34495e;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.cancel-button {
  padding: 8px 16px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background-color: #7f8c8d;
}

.submit-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #2980b9;
}

.submit-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>