<template>
  <div id="app">
    <header v-if="isAuthenticated" class="header">
      <div class="header-content">
        <h1 v-if="!isSuperAdmin">{{ systemName }}</h1>
        <div class="user-info">
          <span>欢迎，{{ currentUser?.username }}</span>
          <button v-if="isAdmin && !isSuperAdmin" @click="showSystemNameChange = true" class="system-name-button">修改系统名称</button>
          <button @click="showPasswordChange = true" class="password-button">修改密码</button>
          <button @click="handleLogout" class="logout-button">登出</button>
        </div>
      </div>
      <nav class="nav">
        <template v-if="isSuperAdmin">
          <router-link to="/super-admin" class="nav-link">超级管理</router-link>
        </template>
        <template v-else>
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/attendance" class="nav-link">学员签到</router-link>
          <router-link to="/fitness-test" class="nav-link">体测数据</router-link>
          <router-link to="/statistics" class="nav-link">数据统计</router-link>
          <router-link to="/schedule" class="nav-link">教练排课</router-link>
          <router-link to="/student-profile" class="nav-link">学生档案</router-link>
          <router-link v-if="isAdmin" to="/coach-management" class="nav-link">教练管理</router-link>
        </template>
      </nav>
    </header>
    <main class="main-content">
      <router-view />
    </main>
    <PasswordChange :visible="showPasswordChange" @close="showPasswordChange = false" />
    
    <!-- 修改系统名称弹窗 -->
    <div v-if="showSystemNameChange" class="modal-overlay" @click="showSystemNameChange = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>修改系统名称</h3>
          <button @click="showSystemNameChange = false" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>新系统名称</label>
            <input type="text" v-model="newSystemName" placeholder="请输入新的系统名称" />
          </div>
          <div class="form-actions">
            <button @click="handleSystemNameChange" :disabled="!newSystemName" class="submit-button">
              确定
            </button>
            <button @click="showSystemNameChange = false" class="cancel-button">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from './store/auth'
import router from './router'
import PasswordChange from './components/PasswordChange.vue'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated())
const currentUser = computed(() => authStore.currentUser)
const isAdmin = computed(() => authStore.isAdmin())
const isSuperAdmin = computed(() => authStore.isSuperAdmin())
const showPasswordChange = ref(false)
const showSystemNameChange = ref(false)
const systemName = computed(() => authStore.getSystemName())
const newSystemName = ref('')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleSystemNameChange = () => {
  if (newSystemName.value) {
    const success = authStore.setSystemName(newSystemName.value)
    if (success) {
      showSystemNameChange.value = false
      newSystemName.value = ''
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #3498db;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-content h1 {
  font-size: 24px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.password-button {
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.password-button:hover {
  background-color: #e67e22;
}

.logout-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #c0392b;
}

.nav {
  display: flex;
  gap: 20px;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.1);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.system-name-button {
  background-color: #9b59b6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.system-name-button:hover {
  background-color: #8e44ad;
}

/* 弹窗样式 */
.modal-overlay {
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
  background-color: #f8f9fa;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  transition: color 0.3s ease;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #34495e;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.submit-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.submit-button:hover {
  background-color: #2980b9;
}

.submit-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.cancel-button {
  padding: 8px 16px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.cancel-button:hover {
  background-color: #7f8c8d;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .user-info {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .system-name-button,
  .password-button,
  .logout-button {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-link {
    font-size: 14px;
    padding: 6px 12px;
  }
}
</style>