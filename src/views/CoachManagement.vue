<template>
  <div class="coach-management">
    <h1>教练管理</h1>
    
    <!-- 机构管理（仅超级管理员） -->
    <div v-if="isSuperAdmin" class="organization-section">
      <div class="section-header">
        <h2>机构管理</h2>
        <button @click="showAddOrganizationForm = true" class="add-button">
          添加机构
        </button>
      </div>
      
      <!-- 添加/编辑机构表单 -->
      <div v-if="showAddOrganizationForm" class="add-form">
        <h3>{{ editingOrganization ? '编辑机构' : '添加机构' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>机构名称</label>
            <input type="text" v-model="organizationForm.name" placeholder="请输入机构名称" />
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleAddOrganization" :disabled="!organizationForm.name">
            {{ editingOrganization ? '保存修改' : '添加机构' }}
          </button>
          <button @click="cancelAddOrganization" class="cancel-button">
            取消
          </button>
        </div>
      </div>
      
      <!-- 机构列表 -->
      <div class="organization-list">
        <table>
          <thead>
            <tr>
              <th>机构名称</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="org in organizations" :key="org.id">
              <td>{{ org.name }}</td>
              <td class="actions">
                <button @click="editOrganization(org)" class="edit-button">
                  编辑
                </button>
                <button v-if="org.id !== '0'" @click="deleteOrganization(org.id)" class="delete-button">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 管理员管理（仅超级管理员） -->
    <div v-if="isSuperAdmin" class="admin-list-section">
      <div class="section-header">
        <h2>管理员列表</h2>
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
          <div class="form-group">
            <label>所属机构</label>
            <select v-model="adminForm.organizationId">
              <option value="">请选择机构</option>
              <option v-for="org in organizations" :key="org.id" :value="org.id">
                {{ org.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleAddAdmin" :disabled="!adminForm.name || !adminForm.username || (!editingAdmin && !adminForm.password) || !adminForm.organizationId">
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
              <th>所属机构</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in admins" :key="admin.id">
              <td>{{ admin.name }}</td>
              <td>{{ admin.username }}</td>
              <td>{{ admin.phone || '未设置' }}</td>
              <td>{{ getOrganizationName(admin.organizationId) }}</td>
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
    
    <div class="coach-list-section">
      <div class="section-header">
        <h2>教练列表</h2>
        <button @click="showAddCoachForm = true" class="add-button">
          添加教练
        </button>
      </div>
      
      <!-- 添加/编辑教练表单 -->
      <div v-if="showAddCoachForm" class="add-form">
        <h3>{{ editingCoach ? '编辑教练' : '添加教练' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>姓名</label>
            <input type="text" v-model="coachForm.name" placeholder="请输入姓名" />
          </div>
          <div class="form-group">
            <label>用户名</label>
            <input type="text" v-model="coachForm.username" placeholder="请输入用户名" :disabled="!!editingCoach" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" v-model="coachForm.password" placeholder="请输入密码" />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input type="tel" v-model="coachForm.phone" placeholder="请输入联系电话" />
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleAddCoach" :disabled="!coachForm.name || !coachForm.username || (!editingCoach && !coachForm.password)">
            {{ editingCoach ? '保存修改' : '添加教练' }}
          </button>
          <button @click="cancelAddCoach" class="cancel-button">
            取消
          </button>
        </div>
      </div>
      
      <!-- 教练列表 -->
      <div class="coach-list">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>用户名</th>
              <th>联系电话</th>
              <th>分配学员数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coach in coaches" :key="coach.id">
              <td>{{ coach.name }}</td>
              <td>{{ coach.username }}</td>
              <td>{{ coach.phone || '未设置' }}</td>
              <td>{{ getAssignedStudentCount(coach.id) }}</td>
              <td class="actions">
                <button @click="editCoach(coach)" class="edit-button">
                  编辑
                </button>
                <button @click="viewAssignedStudents(coach)" class="view-button">
                  查看学员
                </button>
                <button v-if="coach.id !== currentAdminId" @click="deleteCoach(coach.id)" class="delete-button">
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="coaches.length === 0">
              <td colspan="5" class="no-data">暂无教练</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 查看分配学员弹窗 -->
    <div v-if="selectedCoachForStudents" class="modal-overlay" @click="selectedCoachForStudents = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedCoachForStudents.name }} 的学员</h3>
          <button @click="selectedCoachForStudents = null" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="student-list">
            <div v-if="getAssignedStudents(selectedCoachForStudents.id).length === 0" class="no-data">
              暂无分配的学员
            </div>
            <div v-else class="student-items">
              <div v-for="student in getAssignedStudents(selectedCoachForStudents.id)" :key="student.id" class="student-item">
                <span>{{ student.name }}</span>
                <button @click="removeStudentFromCoach(selectedCoachForStudents.id!, student.id)" class="remove-button">
                  移除
                </button>
              </div>
            </div>
          </div>
          
          <div class="assign-student-section">
            <h4>分配学员</h4>
            <div class="assign-form">
              <select v-model="selectedStudentToAssign">
                <option value="">请选择学员</option>
                <option v-for="student in unassignedStudents" :key="student.id" :value="student.id">
                  {{ student.name }}
                </option>
              </select>
              <button @click="assignStudentToSelectedCoach" :disabled="!selectedStudentToAssign" class="assign-button">
                分配
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../store/auth'
import { useAttendanceStore } from '../store/attendance'

const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()

const currentAdminId = computed(() => authStore.currentUser?.id)
const isSuperAdmin = computed(() => authStore.isSuperAdmin())

// 机构管理相关
const showAddOrganizationForm = ref(false)
const editingOrganization = ref<string | null>(null)
const organizationForm = ref({
  name: ''
})

// 管理员管理相关
const showAddAdminForm = ref(false)
const editingAdmin = ref<string | null>(null)
const adminForm = ref({
  name: '',
  username: '',
  password: '',
  phone: '',
  organizationId: ''
})

// 教练列表
const coaches = computed(() => {
  if (isSuperAdmin.value) {
    return authStore.coaches
  }
  return authStore.currentOrganizationCoaches
})

// 机构列表
const organizations = computed(() => authStore.organizations)

// 管理员列表
const admins = computed(() => {
  if (isSuperAdmin.value) {
    return authStore.users.filter(u => u.role === 'admin')
  }
  return []
})

// 添加/编辑教练表单
const showAddCoachForm = ref(false)
const editingCoach = ref<string | null>(null)
const coachForm = ref({
  name: '',
  username: '',
  password: '',
  phone: ''
})

// 查看分配学员相关
const selectedCoachForStudents = ref<any>(null)
const selectedStudentToAssign = ref('')

// 获取教练分配的学员数量
const getAssignedStudentCount = (coachId: string) => {
  const coach = authStore.users.find(u => u.id === coachId)
  return coach?.assignedStudents?.length || 0
}

// 获取教练分配的学员列表
const getAssignedStudents = (coachId: string) => {
  const coach = authStore.users.find(u => u.id === coachId)
  if (!coach) return []
  return attendanceStore.students.filter(s => coach.assignedStudents?.includes(s.id))
}

// 未分配给该教练的学员
const unassignedStudents = computed(() => {
  if (!selectedCoachForStudents.value) return []
  const coach = authStore.users.find(u => u.id === selectedCoachForStudents.value.id)
  if (!coach) return []
  return attendanceStore.students.filter(s => !coach.assignedStudents?.includes(s.id))
})

// 获取机构名称
const getOrganizationName = (organizationId: string) => {
  const org = organizations.value.find(o => o.id === organizationId)
  return org ? org.name : '未知机构'
}

// 机构管理方法
const handleAddOrganization = () => {
  if (editingOrganization.value) {
    // 编辑机构
    const success = authStore.updateOrganization(editingOrganization.value, organizationForm.value.name)
    if (success) {
      cancelAddOrganization()
    }
  } else {
    // 添加机构
    const success = authStore.addOrganization(organizationForm.value.name)
    if (success) {
      cancelAddOrganization()
    }
  }
}

const editOrganization = (org: any) => {
  editingOrganization.value = org.id
  organizationForm.value = {
    name: org.name
  }
  showAddOrganizationForm.value = true
}

const deleteOrganization = (orgId: string) => {
  if (confirm('确定要删除该机构吗？这将同时删除该机构的所有用户。')) {
    const success = authStore.deleteOrganization(orgId)
    if (!success) {
      alert('删除失败，该机构可能还有用户。')
    }
  }
}

const cancelAddOrganization = () => {
  showAddOrganizationForm.value = false
  editingOrganization.value = null
  organizationForm.value = {
    name: ''
  }
}

// 管理员管理方法
const handleAddAdmin = () => {
  if (editingAdmin.value) {
    // 编辑管理员
    const success = authStore.updateUser(editingAdmin.value, {
      name: adminForm.value.name,
      phone: adminForm.value.phone,
      password: adminForm.value.password || undefined,
      organizationId: adminForm.value.organizationId
    })
    if (success) {
      cancelAddAdmin()
    }
  } else {
    // 添加管理员
    const success = authStore.registerAdmin(
      adminForm.value.username,
      adminForm.value.password,
      adminForm.value.name,
      adminForm.value.phone,
      adminForm.value.organizationId
    )
    if (success) {
      cancelAddAdmin()
    } else {
      alert('用户名已存在')
    }
  }
}

const editAdmin = (admin: any) => {
  editingAdmin.value = admin.id
  adminForm.value = {
    name: admin.name,
    username: admin.username,
    password: '',
    phone: admin.phone || '',
    organizationId: admin.organizationId
  }
  showAddAdminForm.value = true
}

const deleteAdmin = (adminId: string) => {
  if (confirm('确定要删除该管理员吗？')) {
    authStore.deleteUser(adminId)
  }
}

const cancelAddAdmin = () => {
  showAddAdminForm.value = false
  editingAdmin.value = null
  adminForm.value = {
    name: '',
    username: '',
    password: '',
    phone: '',
    organizationId: ''
  }
}

// 教练管理方法
const handleAddCoach = () => {
  if (editingCoach.value) {
    // 编辑教练
    const success = authStore.updateCoach(editingCoach.value, {
      name: coachForm.value.name,
      phone: coachForm.value.phone,
      password: coachForm.value.password || undefined
    })
    if (success) {
      cancelAddCoach()
    }
  } else {
    // 添加教练
    const success = authStore.registerCoach(
      coachForm.value.username,
      coachForm.value.password,
      coachForm.value.name,
      coachForm.value.phone
    )
    if (success) {
      // 同时在 attendanceStore 中添加对应的教练数据
      const newCoach = authStore.coaches.find(c => c.username === coachForm.value.username)
      if (newCoach) {
        attendanceStore.addCoach({
          id: newCoach.id,
          name: newCoach.name,
          teachingHours: 0,
          hourlyWage: 0,
          organizationId: newCoach.organizationId
        })
      }
      cancelAddCoach()
    } else {
      alert('用户名已存在')
    }
  }
}

const editCoach = (coach: any) => {
  editingCoach.value = coach.id
  coachForm.value = {
    name: coach.name,
    username: coach.username,
    password: '',
    phone: coach.phone || ''
  }
  showAddCoachForm.value = true
}

const viewAssignedStudents = (coach: any) => {
  selectedCoachForStudents.value = coach
  selectedStudentToAssign.value = ''
}

const assignStudentToSelectedCoach = () => {
  if (selectedCoachForStudents.value && selectedStudentToAssign.value) {
    authStore.assignStudentToCoach(selectedCoachForStudents.value.id, selectedStudentToAssign.value)
    selectedStudentToAssign.value = ''
  }
}

const removeStudentFromCoach = (coachId: string, studentId: string) => {
  if (confirm('确定要移除该学员吗？')) {
    authStore.removeStudentFromCoach(coachId, studentId)
  }
}

const deleteCoach = (coachId: string) => {
  if (confirm('确定要删除该教练吗？这将同时移除该教练分配的所有学员。')) {
    authStore.deleteCoach(coachId)
  }
}

const cancelAddCoach = () => {
  showAddCoachForm.value = false
  editingCoach.value = null
  coachForm.value = {
    name: '',
    username: '',
    password: '',
    phone: ''
  }
}
</script>

<style scoped>
.coach-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #2c3e50;
}

.organization-section,
.admin-list-section,
.coach-list-section {
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
  margin-bottom: 25px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.add-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.add-button:hover {
  background: #2980b9;
}

.add-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.add-form h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.form-group input:disabled {
  background: #eee;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.form-actions button:first-child {
  background: #3498db;
  color: white;
}

.form-actions button:first-child:hover {
  background: #2980b9;
}

.form-actions button:first-child:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.cancel-button {
  background: #95a5a6;
  color: white;
}

.cancel-button:hover {
  background: #7f8c8d;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

table tr:hover {
  background: #f8f9fa;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.edit-button {
  background: #f39c12;
  color: white;
}

.edit-button:hover {
  background: #e67e22;
}

.view-button {
  background: #3498db;
  color: white;
}

.view-button:hover {
  background: #2980b9;
}

.delete-button {
  background: #e74c3c;
  color: white;
}

.delete-button:hover {
  background: #c0392b;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 30px !important;
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
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
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
  color: #999;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.student-list {
  margin-bottom: 20px;
}

.student-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

.remove-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.remove-button:hover {
  background: #c0392b;
}

.assign-student-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
}

.assign-form {
  display: flex;
  gap: 10px;
}

.assign-form select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.assign-button {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.assign-button:hover {
  background: #229954;
}

.assign-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}
</style>
