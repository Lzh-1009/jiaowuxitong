<template>
  <div class="student-profile">
    <h1>学生档案管理</h1>
    
    <div class="profile-management">
      <div class="section-header">
        <h2>学生档案</h2>
        <button v-if="isAdmin" @click="showAddProfileForm = true" class="add-button">
          添加档案
        </button>
      </div>
      
      <!-- 添加档案表单 -->
      <div v-if="showAddProfileForm" class="add-form">
        <h3>{{ editingProfile ? '编辑档案' : '添加档案' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>姓名</label>
            <input type="text" v-model="profileForm.name" placeholder="请输入姓名" />
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="profileForm.gender">
              <option value="">请选择性别</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div class="form-group">
            <label>年龄</label>
            <input type="number" v-model.number="profileForm.age" placeholder="请输入年龄" min="1" />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input type="tel" v-model="profileForm.phone" placeholder="请输入联系电话" />
          </div>
          <div class="form-group">
            <label>紧急联系人</label>
            <input type="text" v-model="profileForm.emergencyContact" placeholder="请输入紧急联系人" />
          </div>
          <div class="form-group">
            <label>紧急联系电话</label>
            <input type="tel" v-model="profileForm.emergencyPhone" placeholder="请输入紧急联系电话" />
          </div>
          <div class="form-group">
            <label>身高 (cm)</label>
            <input type="number" v-model.number="profileForm.height" placeholder="请输入身高" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label>体重 (kg)</label>
            <input type="number" v-model.number="profileForm.weight" placeholder="请输入体重" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label>教练</label>
            <select v-model="profileForm.coachId">
              <option value="">请选择教练</option>
              <option v-for="coach in coaches" :key="coach.id" :value="coach.id">
                {{ coach.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>班级</label>
            <input type="text" v-model="profileForm.class" placeholder="请输入班级" />
          </div>
          <div class="form-group full-width">
            <label>备注</label>
            <textarea v-model="profileForm.notes" placeholder="请输入备注信息" rows="4"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleAddProfile" :disabled="!profileForm.name || !profileForm.gender || !profileForm.age || !profileForm.phone">
            {{ editingProfile ? '保存修改' : '添加档案' }}
          </button>
          <button @click="cancelAddProfile" class="cancel-button">
            取消
          </button>
        </div>
      </div>
      
      <!-- 档案列表 -->
      <div class="profile-list">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>性别</th>
              <th>年龄</th>
              <th>联系电话</th>
              <th>教练</th>
              <th>班级</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="profile in accessibleProfiles" :key="profile.id">
              <td>{{ profile.name }}</td>
              <td>{{ profile.gender === 'male' ? '男' : '女' }}</td>
              <td>{{ profile.age }}</td>
              <td>{{ profile.phone }}</td>
              <td>{{ getCoachName(profile.coachId) }}</td>
              <td>{{ profile.class }}</td>
              <td class="actions">
                <button @click="viewProfile(profile)" class="view-button">
                  查看
                </button>
                <button v-if="isAdmin" @click="editProfile(profile)" class="edit-button">
                  编辑
                </button>
                <button v-if="isAdmin" @click="deleteProfile(profile.id)" class="delete-button">
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="accessibleProfiles.length === 0">
              <td colspan="7" class="no-data">暂无档案记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 档案详情 -->
    <div v-if="selectedProfile" class="profile-detail">
      <div class="section-header">
        <h2>档案详情</h2>
        <button @click="selectedProfile = null" class="close-button">
          关闭
        </button>
      </div>
      <div class="detail-content">
        <div class="detail-grid">
          <div class="detail-item">
            <label>姓名</label>
            <span>{{ selectedProfile.name }}</span>
          </div>
          <div class="detail-item">
            <label>性别</label>
            <span>{{ selectedProfile.gender === 'male' ? '男' : '女' }}</span>
          </div>
          <div class="detail-item">
            <label>年龄</label>
            <span>{{ selectedProfile.age }}</span>
          </div>
          <div class="detail-item">
            <label>联系电话</label>
            <span>{{ selectedProfile.phone }}</span>
          </div>
          <div class="detail-item">
            <label>紧急联系人</label>
            <span>{{ selectedProfile.emergencyContact }}</span>
          </div>
          <div class="detail-item">
            <label>紧急联系电话</label>
            <span>{{ selectedProfile.emergencyPhone }}</span>
          </div>
          <div class="detail-item">
            <label>身高</label>
            <span>{{ selectedProfile.height }} cm</span>
          </div>
          <div class="detail-item">
            <label>体重</label>
            <span>{{ selectedProfile.weight }} kg</span>
          </div>
          <div class="detail-item">
            <label>教练</label>
            <span>{{ getCoachName(selectedProfile.coachId) }}</span>
          </div>
          <div class="detail-item">
            <label>班级</label>
            <span>{{ selectedProfile.class }}</span>
          </div>
          <div class="detail-item full-width">
            <label>备注</label>
            <span>{{ selectedProfile.notes || '无' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAttendanceStore } from '../store/attendance'
import { useAuthStore } from '../store/auth'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

// 权限控制
const isAdmin = computed(() => authStore.isAdmin())
const isCoach = computed(() => authStore.isCoach())
const currentOrganizationId = computed(() => authStore.currentUser?.organizationId || '1')

// 档案管理相关
const showAddProfileForm = ref(false)
const editingProfile = ref<string | null>(null)
const selectedProfile = ref<any>(null)
const profileForm = ref({
  name: '',
  gender: '' as 'male' | 'female' | '',
  age: 0,
  phone: '',
  emergencyContact: '',
  emergencyPhone: '',
  height: 0,
  weight: 0,
  coachId: '',
  class: '',
  notes: ''
})

// 档案数据
const profiles = ref(JSON.parse(localStorage.getItem('student-profiles') || '[]'))

const coaches = computed(() => attendanceStore.getCoachesByOrganization(currentOrganizationId.value))

// 可访问的学生档案（教练只能看到分配给他们的学生的档案）
const accessibleProfiles = computed(() => {
  const orgProfiles = profiles.value.filter(profile => profile.organizationId === currentOrganizationId.value)
  if (isAdmin.value) {
    return orgProfiles
  } else if (isCoach.value) {
    return orgProfiles.filter(profile => {
      // 检查学生是否分配给了当前教练
      // 我们需要通过学员姓名匹配 attendance store 中的学员
      const student = attendanceStore.getStudentsByOrganization(currentOrganizationId.value).find(s => s.name === profile.name)
      if (student) {
        return authStore.canAccessStudent(student.id)
      }
      return false
    })
  }
  return []
})

const handleAddProfile = () => {
  if (profileForm.value.name && profileForm.value.gender && profileForm.value.age && profileForm.value.phone) {
    if (editingProfile.value) {
      // 编辑档案
      const index = profiles.value.findIndex(p => p.id === editingProfile.value)
      if (index !== -1) {
        profiles.value[index] = {
          ...profiles.value[index],
          ...profileForm.value
        }
      }
    } else {
      // 添加档案
      const newProfile = {
        id: Date.now().toString(),
        ...profileForm.value,
        organizationId: currentOrganizationId.value
      }
      profiles.value.push(newProfile)
    }
    
    // 重置表单
    cancelAddProfile()
  }
}

const editProfile = (profile: any) => {
  editingProfile.value = profile.id
  profileForm.value = {
    ...profile
  }
  showAddProfileForm.value = true
}

const viewProfile = (profile: any) => {
  selectedProfile.value = profile
}

const deleteProfile = (id: string) => {
  if (confirm('确定要删除这个档案吗？')) {
    const index = profiles.value.findIndex(p => p.id === id)
    if (index !== -1) {
      profiles.value.splice(index, 1)
    }
  }
}

const cancelAddProfile = () => {
  showAddProfileForm.value = false
  editingProfile.value = null
  profileForm.value = {
    name: '',
    gender: '',
    age: 0,
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    height: 0,
    weight: 0,
    coachId: '',
    class: '',
    notes: ''
  }
}

const getCoachName = (id: string) => {
  const coach = attendanceStore.getCoachById(id)
  return coach ? coach.name : '未知教练'
}

// 监听档案数据变化，保存到 localStorage
watch(profiles, (newValue) => {
  localStorage.setItem('student-profiles', JSON.stringify(newValue))
}, { deep: true })

// 从 attendance store 中监听学员删除事件，同步删除相关档案记录

// 监听学员变化，删除相关档案记录
watch(() => attendanceStore.students, (newStudents) => {
  const studentNames = newStudents.map(s => s.name)
  profiles.value = profiles.value.filter(profile => studentNames.includes(profile.name))
}, { deep: true })
</script>

<style scoped>
.student-profile {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

.back-button {
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 20px;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #7f8c8d;
}

h1 {
  flex: 1;
  text-align: center;
  color: #333;
  margin: 0;
}

h2 {
  color: #2c3e50;
  margin: 30px 0 20px;
}

h3 {
  color: #34495e;
  margin: 15px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  padding: 8px 16px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-button:hover {
  background-color: #219a52;
}

.close-button {
  padding: 8px 16px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-button:hover {
  background-color: #7f8c8d;
}

.add-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="number"],
input[type="tel"],
select,
textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #95a5a6;
  margin-left: 10px;
}

.cancel-button:hover {
  background-color: #7f8c8d;
}

.profile-list {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
}

.actions {
  display: flex;
  gap: 5px;
}

.view-button {
  background-color: #3498db;
  padding: 6px 12px;
  font-size: 14px;
}

.view-button:hover {
  background-color: #2980b9;
}

.edit-button {
  background-color: #f39c12;
  padding: 6px 12px;
  font-size: 14px;
}

.edit-button:hover {
  background-color: #e67e22;
}

.delete-button {
  background-color: #e74c3c;
  padding: 6px 12px;
  font-size: 14px;
}

.delete-button:hover {
  background-color: #c0392b;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px;
}

.profile-detail {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
}

.detail-content {
  margin-top: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: bold;
  color: #555;
  margin-bottom: 5px;
}

.detail-item span {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  min-height: 40px;
  display: flex;
  align-items: center;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .student-profile {
    padding: 10px;
  }
  
  h1 {
    font-size: 20px;
  }
  
  h2 {
    font-size: 18px;
    margin: 20px 0 15px;
  }
  
  h3 {
    font-size: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .profile-list,
  .profile-detail {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .form-group.full-width {
    grid-column: 1 / 2;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  table {
    font-size: 14px;
  }
  
  th,
  td {
    padding: 8px;
  }
  
  .actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .view-button,
  .edit-button,
  .delete-button {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .detail-item.full-width {
    grid-column: 1 / 2;
  }
  
  .no-data {
    padding: 30px;
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .student-profile {
    padding: 5px;
  }
  
  h1 {
    font-size: 18px;
  }
  
  h2 {
    font-size: 16px;
  }
  
  h3 {
    font-size: 14px;
  }
  
  .profile-list,
  .profile-detail {
    padding: 15px;
  }
  
  input[type="text"],
  input[type="number"],
  input[type="tel"],
  select,
  textarea {
    padding: 8px;
    font-size: 14px;
  }
  
  button {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  table {
    font-size: 12px;
  }
  
  th,
  td {
    padding: 6px;
  }
  
  .no-data {
    padding: 20px;
  }
}
</style>