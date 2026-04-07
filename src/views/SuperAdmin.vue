<template>
  <div class="super-admin">
    <h1>超级管理中心</h1>
    
    <!-- 管理员管理 -->
    <div class="admin-list-section">
      <div class="section-header">
        <h2>管理员管理</h2>
        <button @click="showAddAdminForm = true" class="add-button">
          添加管理员
        </button>
      </div>
      
      <!-- 添加/编辑管理员表单 -->
      <div v-if="showAddAdminForm" class="add-form">
        <h3>{{ editingAdmin ? '编辑管理员' : '添加管理员' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>姓名</label>
            <input type="text" v-model="adminForm.name" placeholder="请输入姓名" />
          </div>
          <div class="form-group">
            <label>用户名</label>
            <input type="text" v-model="adminForm.username" placeholder="请输入用户名" :disabled="!!editingAdmin" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" v-model="adminForm.password" placeholder="请输入密码" />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input type="tel" v-model="adminForm.phone" placeholder="请输入联系电话" />
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleAddAdmin" :disabled="!adminForm.name || !adminForm.username || (!editingAdmin && !adminForm.password)">
            {{ editingAdmin ? '保存修改' : '添加管理员' }}
          </button>
          <button @click="cancelAddAdmin" class="cancel-button">
            取消
          </button>
        </div>
      </div>
      
      <!-- 管理员列表 -->
      <div class="admin-list">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>用户名</th>
              <th>联系电话</th>
              <th>教练数量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in admins" :key="admin.id">
              <td>{{ admin.name }}</td>
              <td>{{ admin.username }}</td>
              <td>{{ admin.phone || '未设置' }}</td>
              <td>{{ getAdminCoachCount(admin.id) }}</td>
              <td class="actions">
                <button @click="editAdmin(admin)" class="edit-button">
                  编辑
                </button>
                <button v-if="admin.id !== currentAdminId" @click="deleteAdmin(admin.id)" class="delete-button">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 系统概览 -->
    <div class="system-overview-section">
      <div class="section-header">
        <h2>系统概览</h2>
      </div>
      
      <div class="system-overview">
        <div class="overview-card" @click="showAdminsModal = true">
          <h3>管理员数量</h3>
          <p>{{ admins.length }}</p>
          <span class="click-hint">点击查看详情</span>
        </div>
        <div class="overview-card" @click="showCoachesModal = true">
          <h3>教练数量</h3>
          <p>{{ coaches.length }}</p>
          <span class="click-hint">点击查看详情</span>
        </div>
      </div>
    </div>
    
    <!-- 管理员详情弹窗 -->
    <div v-if="showAdminsModal" class="modal-overlay" @click="showAdminsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>管理员详情</h3>
          <button @click="showAdminsModal = false" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <table class="detail-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>用户名</th>
                <th>密码</th>
                <th>联系电话</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.id">
                <td>{{ admin.name }}</td>
                <td>{{ admin.username }}</td>
                <td>{{ admin.password }}</td>
                <td>{{ admin.phone || '未设置' }}</td>
                <td class="actions">
                  <button @click="deleteAdmin(admin.id)" class="delete-button">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 教练详情弹窗 -->
    <div v-if="showCoachesModal" class="modal-overlay" @click="showCoachesModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>教练详情</h3>
          <button @click="showCoachesModal = false" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <table class="detail-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>用户名</th>
                <th>密码</th>
                <th>联系电话</th>
                <th>归属管理员</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="coach in coaches" :key="coach.id">
                <td>{{ coach.name }}</td>
                <td>{{ coach.username }}</td>
                <td>{{ coach.password }}</td>
                <td>{{ coach.phone || '未设置' }}</td>
                <td>{{ getCoachAdminName(coach.organizationId) }}</td>
                <td class="actions">
                  <button @click="deleteCoach(coach.id)" class="delete-button">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'

// 扩展 window 接口，添加 activitySaveTimeout 属性
declare global {
  interface Window {
    activitySaveTimeout: number
  }
}

const authStore = useAuthStore()

const currentAdminId = computed(() => authStore.currentUser?.id)
const isSuperAdmin = computed(() => authStore.isSuperAdmin())

// 管理员管理相关
const showAddAdminForm = ref(false)
const editingAdmin = ref<string | null>(null)
const adminForm = ref({
  name: '',
  username: '',
  password: '',
  phone: ''
})

// 弹窗控制
const showAdminsModal = ref(false)
const showCoachesModal = ref(false)

// 管理员列表
const admins = computed(() => authStore.users.filter(u => u.role === 'admin'))

// 教练列表
const coaches = computed(() => authStore.users.filter(u => u.role === 'coach'))

// 获取管理员的教练数量
const getAdminCoachCount = (adminId: string) => {
  // 找到管理员对应的机构 ID
  const admin = admins.value.find(admin => admin.id === adminId)
  if (!admin) return 0
  
  // 只计算与管理员同一机构的教练数量
  return coaches.value.filter(coach => coach.organizationId === admin.organizationId).length
}

// 获取教练归属的管理员姓名
const getCoachAdminName = (organizationId: string) => {
  // 查找与教练同一机构的管理员
  const admin = admins.value.find(admin => admin.organizationId === organizationId)
  return admin ? admin.name : '未知'
}

// 管理员管理方法
const handleAddAdmin = () => {
  try {
    if (editingAdmin.value) {
      // 编辑管理员
      const success = authStore.updateUser(editingAdmin.value, {
        name: adminForm.value.name,
        phone: adminForm.value.phone,
        password: adminForm.value.password || undefined
      })
      if (success) {
        cancelAddAdmin()
      } else {
        alert('更新失败')
      }
    } else {
      // 为新管理员创建一个新的机构，确保机构名称唯一
      const organizationName = adminForm.value.name + '机构' + Date.now()
      const newOrganization = authStore.addOrganization(organizationName)
      
      // 添加管理员，并将其分配到新创建的机构
      const success = authStore.registerAdmin(
        adminForm.value.username,
        adminForm.value.password,
        adminForm.value.name,
        adminForm.value.phone,
        newOrganization.id
      )
      if (success) {
        cancelAddAdmin()
      } else {
        alert('用户名已存在')
      }
    }
  } catch (error) {
    console.error('添加管理员失败:', error)
    alert('添加管理员失败，请查看控制台错误信息')
  }
}

const editAdmin = (admin: any) => {
  editingAdmin.value = admin.id
  adminForm.value = {
    name: admin.name,
    username: admin.username,
    password: '',
    phone: admin.phone || ''
  }
  showAddAdminForm.value = true
}

const deleteAdmin = (adminId: string) => {
  if (confirm('确定要删除该管理员吗？')) {
    const success = authStore.deleteUser(adminId)
    if (success) {
      alert('管理员删除成功')
    }
  }
}

const deleteCoach = (coachId: string) => {
  if (confirm('确定要删除该教练吗？')) {
    const success = authStore.deleteCoach(coachId)
    if (success) {
      alert('教练删除成功')
    }
  }
}

const cancelAddAdmin = () => {
  showAddAdminForm.value = false
  editingAdmin.value = null
  adminForm.value = {
    name: '',
    username: '',
    password: '',
    phone: ''
  }
}

// 加载数据
onMounted(() => {
  // 可以在这里添加初始化逻辑
})
</script>

<style scoped>
.super-admin {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
}

.admin-list-section,
.system-overview-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.add-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.add-button:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.add-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.add-form h3 {
  margin-top: 0;
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
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

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  font-size: 14px;
  font-weight: 500;
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.cancel-button {
  background-color: #95a5a6;
  color: white;
}

.cancel-button:hover {
  background-color: #7f8c8d;
  transform: translateY(-1px);
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.delete-button:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}

.edit-button {
  background-color: #f39c12;
  color: white;
  margin-right: 10px;
}

.edit-button:hover {
  background-color: #e67e22;
  transform: translateY(-1px);
}

.admin-list {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 1;
}

tr:hover {
  background-color: #f5f5f5;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.system-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.overview-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 25px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

.overview-card h3 {
  margin: 0 0 15px 0;
  color: #6c757d;
  font-size: 16px;
  font-weight: 500;
}

.overview-card p {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #3498db;
  font-family: 'Arial', sans-serif;
  cursor: pointer;
}

.overview-card:hover {
  cursor: pointer;
}

.click-hint {
  font-size: 12px;
  color: #95a5a6;
  margin-top: 5px;
  display: block;
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
  max-width: 800px;
  max-height: 80vh;
  overflow: auto;
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

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.detail-table th,
.detail-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.detail-table th {
  background-color: #f2f2f2;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.detail-table tr:hover {
  background-color: #f5f5f5;
}

@media (max-width: 768px) {
  .super-admin {
    padding: 15px;
  }
  
  h1 {
    font-size: 24px;
    margin-bottom: 30px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .system-overview {
    grid-template-columns: 1fr;
  }
  
  .overview-card {
    padding: 20px;
  }
  
  .overview-card p {
    font-size: 28px;
  }
  
  table {
    font-size: 13px;
  }
  
  th, td {
    padding: 10px;
  }
  
  .actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .edit-button {
    margin-right: 0;
  }
}
</style>