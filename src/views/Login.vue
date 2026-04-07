<template>
  <div class="login">
    <div class="login-container">
      <h1>教务系统</h1>
      <h2>登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input type="text" v-model="username" placeholder="请输入用户名" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="password" placeholder="请输入密码" required />
        </div>
        <button type="submit" class="login-button">登录</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
      <div class="login-info">
        <p>默认账号：</p>
        <p>超级管理员：superadmin / superadmin123</p>
        <p>管理员：admin / admin123</p>
        <p>教练：coach / coach123</p>
        <button @click="clearLocalStorage" class="clear-button">
          清除本地数据（测试用）
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import router from '../router'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = () => {
  console.log('Login attempt:', username.value, password.value)
  const success = authStore.login(username.value, password.value)
  console.log('Login result:', success)
  if (success) {
    console.log('Current user:', authStore.currentUser)
    // 根据用户角色跳转到不同页面
    if (authStore.isSuperAdmin()) {
      router.push('/super-admin')
    } else {
      router.push('/')
    }
  } else {
    errorMessage.value = '用户名或密码错误'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  }
}

const clearLocalStorage = () => {
  if (confirm('确定要清除本地数据吗？这将重置所有用户信息。')) {
    authStore.clearLocalStorage()
    alert('本地数据已清除，页面将刷新')
    window.location.reload()
  }
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h1 {
  color: #3498db;
  margin-bottom: 10px;
}

h2 {
  color: #2c3e50;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

.login-button:hover {
  background-color: #2980b9;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
}

.login-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: left;
}

.login-info p {
  margin: 5px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.clear-button {
  width: 100%;
  padding: 8px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 15px;
}

.clear-button:hover {
  background-color: #c0392b;
}
</style>
