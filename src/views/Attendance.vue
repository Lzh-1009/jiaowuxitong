<template>
  <div class="attendance">
    <h1>学员签到与课时管理</h1>
    
    <div class="check-in-section">
      <h2>今日签到</h2>
      <div class="check-in-form">
        <div class="form-group">
          <label>选择学员</label>
          <select v-model="selectedStudentId">
            <option value="">请选择学员</option>
            <option v-for="student in accessibleStudents" :key="student.id" :value="student.id">
              {{ student.name }} (剩余课时: {{ student.remainingClasses }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>选择教练</label>
          <select v-model="selectedCoachId">
            <option value="">请选择教练</option>
            <option v-for="coach in accessibleCoaches" :key="coach.id" :value="coach.id">
              {{ coach.name }} (授课课时: {{ getCoachTeachingHours(coach.id) }})
            </option>
          </select>
        </div>
        <button @click="handleCheckIn" :disabled="!selectedStudentId || !selectedCoachId">
          确认签到
        </button>
      </div>
      <div v-if="checkInMessage" class="message" :class="checkInMessage.type">
        {{ checkInMessage.text }}
      </div>
    </div>
    
    <div class="records-section">
      <h2>今日签到记录</h2>
      <div class="records-table">
        <table>
          <thead>
            <tr>
              <th>学员</th>
              <th>教练</th>
              <th>签到时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in accessibleTodayRecords" :key="record.id">
              <td>{{ getStudentName(record.studentId) }}</td>
              <td>{{ getCoachName(record.coachId) }}</td>
              <td>{{ record.date }}</td>
              <td :class="'status-' + record.status">
                {{ record.status === 'attended' ? '已签到' : '未签到' }}
              </td>
            </tr>
            <tr v-if="accessibleTodayRecords.length === 0">
              <td colspan="4" class="no-records">今日暂无签到记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="students-section">
      <div class="section-header">
        <h2>学员管理</h2>
        <button v-if="isAdmin" @click="showAddStudentForm = true" class="add-button">
          添加学员
        </button>
      </div>
      
      <!-- 添加学员表单 -->
      <div v-if="showAddStudentForm" class="add-form">
        <h3>{{ editingStudent ? '编辑学员' : '添加学员' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>学员姓名</label>
            <input type="text" v-model="studentForm.name" placeholder="请输入学员姓名" />
          </div>
          <div class="form-group">
            <label>总课时</label>
            <input type="number" v-model.number="studentForm.totalClasses" placeholder="请输入总课时" />
          </div>
          <div class="form-group">
            <label>剩余课时</label>
            <input type="number" v-model.number="studentForm.remainingClasses" placeholder="请输入剩余课时" />
          </div>
          <div v-if="isAdmin" class="form-group">
            <label>应交学费</label>
            <input type="number" v-model.number="studentForm.tuition" placeholder="请输入应交学费" min="0" step="0.01" />
          </div>
          <div v-if="isAdmin" class="form-group">
            <label>实缴学费</label>
            <input type="number" v-model.number="studentForm.paidTuition" placeholder="请输入实缴学费" min="0" step="0.01" />
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleAddStudent" :disabled="!studentForm.name || !studentForm.totalClasses || !studentForm.remainingClasses">
            {{ editingStudent ? '保存修改' : '添加学员' }}
          </button>
          <button @click="cancelAddStudent" class="cancel-button">
            取消
          </button>
        </div>
      </div>
      
      <!-- 学生分配功能（仅管理员） -->
      <div v-if="isAdmin" class="assign-section">
        <h3>学员分配</h3>
        <div class="assign-form">
          <div class="form-group">
            <label>选择学员</label>
            <select v-model="assignStudentId">
              <option value="">请选择学员</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>选择教练</label>
            <select v-model="assignCoachId">
              <option value="">请选择教练</option>
              <option v-for="coach in authCoaches" :key="coach.id" :value="coach.id">
                {{ coach.name }}
              </option>
            </select>
          </div>
          <button @click="handleAssignStudent" :disabled="!assignStudentId || !assignCoachId">
            分配学员
          </button>
        </div>
      </div>
      
      <!-- 教练工资显示（仅教练） -->
      <div v-if="isCoach" class="salary-section">
        <h3>我的工资</h3>
        <div class="salary-info">
          <div class="salary-item">
            <span class="salary-label">已上课时：</span>
            <span class="salary-value">{{ currentCoach?.teachingHours || 0 }}</span>
          </div>
          <div class="salary-item">
            <span class="salary-label">每课时工资：</span>
            <span class="salary-value">¥{{ (currentCoach?.hourlyWage || 0).toFixed(2) }}</span>
          </div>
          <div class="salary-item">
            <span class="salary-label">应发工资：</span>
            <span class="salary-value">¥{{ ((currentCoach?.teachingHours || 0) * (currentCoach?.hourlyWage || 0)).toFixed(2) }}</span>
          </div>
          <div class="salary-item">
            <span class="salary-label">已发工资：</span>
            <span class="salary-value">¥{{ (currentCoach?.totalSalary || 0).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div class="students-table">
        <table>
          <thead>
            <tr>
              <th>学员姓名</th>
              <th>总课时</th>
              <th>剩余课时</th>
              <th>已用课时</th>
              <th v-if="isAdmin">应交学费</th>
              <th v-if="isAdmin">实缴学费</th>
              <th v-if="isAdmin">分配教练</th>
              <th v-if="isAdmin">操作</th>
              <th v-else>工资</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in accessibleStudents" :key="student.id">
              <td>{{ student.name }}</td>
              <td>{{ student.totalClasses }}</td>
              <td>{{ student.remainingClasses }}</td>
              <td>{{ student.totalClasses - student.remainingClasses }}</td>
              <td v-if="isAdmin">¥{{ student.tuition.toFixed(2) }}</td>
              <td v-if="isAdmin">¥{{ student.paidTuition.toFixed(2) }}</td>
              <td v-if="isAdmin">{{ getAssignedCoachName(student.id) || '未分配' }}</td>
              <td v-if="isAdmin" class="actions">
                <button @click="editStudent(student)" class="edit-button">
                  编辑
                </button>
                <button @click="deleteStudent(student.id)" class="delete-button">
                  删除
                </button>
              </td>
              <td v-else class="salary-info">
                <div class="salary-item">
                  <span class="salary-label">已上课时：</span>
                  <span class="salary-value">{{ currentCoach?.teachingHours || 0 }}</span>
                </div>
                <div class="salary-item">
                  <span class="salary-label">应发工资：</span>
                  <span class="salary-value">¥{{ ((currentCoach?.teachingHours || 0) * (currentCoach?.hourlyWage || 0)).toFixed(2) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="coaches-section" v-if="isAdmin">
      <div class="section-header">
        <h2>工资管理</h2>
        <button @click="showAddCoachForm = true" class="add-button">
          添加教练
        </button>
      </div>
      
      <!-- 添加教练表单 -->
      <div v-if="showAddCoachForm" class="add-form">
        <h3>{{ editingCoach ? '编辑教练' : '添加教练' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>教练姓名</label>
            <input type="text" v-model="coachForm.name" placeholder="请输入教练姓名" />
          </div>
          <div class="form-group">
            <label>已上课时</label>
            <input type="number" v-model.number="coachForm.teachingHours" placeholder="请输入已上课时" />
          </div>
          <div class="form-group">
            <label>每课时工资</label>
            <input type="number" v-model.number="coachForm.hourlyWage" placeholder="请输入每课时工资" min="0" step="0.01" />
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleAddCoach" :disabled="!coachForm.name">
            {{ editingCoach ? '保存修改' : '添加教练' }}
          </button>
          <button @click="cancelAddCoach" class="cancel-button">
            取消
          </button>
        </div>
      </div>
      
      <div class="coaches-table">
        <table>
          <thead>
            <tr>
              <th>教练姓名</th>
              <th>已上课时</th>
              <th>每课时工资</th>
              <th>应发工资</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coach in attendanceCoaches" :key="coach.id">
              <td>{{ coach.name }}</td>
              <td>{{ coach.teachingHours }}</td>
              <td>¥{{ coach.hourlyWage.toFixed(2) }}</td>
              <td>¥{{ (coach.teachingHours * coach.hourlyWage).toFixed(2) }}</td>
              <td class="actions">
                <button @click="editCoach(coach)" class="edit-button">
                  编辑
                </button>
                <button @click="settleSalary(coach.id)" class="settle-button">
                  结算
                </button>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAttendanceStore } from '../store/attendance'
import { useAuthStore } from '../store/auth'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const selectedStudentId = ref('')
const selectedCoachId = ref('')
const checkInMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// 学生分配相关
const assignStudentId = ref('')
const assignCoachId = ref('')

// 学生管理相关
const showAddStudentForm = ref(false)
const editingStudent = ref<string | null>(null)
const studentForm = ref({
  name: '',
  totalClasses: 0,
  remainingClasses: 0,
  tuition: 0,
  paidTuition: 0,
  organizationId: authStore.currentUser?.organizationId || '1'
})

// 教练管理相关
const showAddCoachForm = ref(false)
const editingCoach = ref<string | null>(null)
const coachForm = ref({
  name: '',
  teachingHours: 0,
  hourlyWage: 0
})

// 计算属性
const isAdmin = computed(() => authStore.isAdmin())
const isCoach = computed(() => authStore.isCoach())
const currentOrganizationId = computed(() => authStore.currentUser?.organizationId || '1')
const students = computed(() => attendanceStore.getStudentsByOrganization(currentOrganizationId.value))
const authCoaches = computed(() => {
  const coaches = authStore.coaches
  return coaches.filter(coach => coach.organizationId === currentOrganizationId.value)
})
// 从 authStore 中获取教练列表，确保与教练选择器使用相同的数据源
const attendanceCoaches = computed(() => {
  const coaches = authStore.currentOrganizationCoaches
  return coaches.map(coach => {
    const attendanceCoach = attendanceStore.getCoachById(coach.id)
    return {
      id: coach.id,
      name: coach.name,
      teachingHours: attendanceCoach?.teachingHours || 0,
      hourlyWage: attendanceCoach?.hourlyWage || 0,
      totalSalary: attendanceCoach?.totalSalary || 0,
      organizationId: coach.organizationId
    }
  })
})
const today = new Date().toISOString().split('T')[0]

// 可访问的学生（教练只能看到分配给他们的学生）
const accessibleStudents = computed(() => {
  if (isAdmin.value) {
    return students.value
  } else if (isCoach.value) {
    return students.value.filter(student => authStore.canAccessStudent(student.id))
  }
  return []
})

// 可访问的教练（教练只能看到自己）
const accessibleCoaches = computed(() => {
  if (isAdmin.value) {
    return authCoaches.value
  } else if (isCoach.value) {
    // 教练只能选择自己
    return authCoaches.value.filter(coach => coach.id === authStore.currentUser?.id)
  }
  return []
})

// 当前教练信息（仅教练）
const currentCoach = computed(() => {
  if (isCoach.value && authStore.currentUser) {
    return attendanceStore.getCoachById(authStore.currentUser.id)
  }
  return null
})

// 可访问的今日签到记录
const accessibleTodayRecords = computed(() => {
  return attendanceStore.getAttendanceRecordsByDate(today)
    .filter(record => {
      // 过滤机构 ID
      if (record.organizationId !== currentOrganizationId.value) return false
      // 过滤学生访问权限
      const student = attendanceStore.getStudentById(record.studentId)
      return student && authStore.canAccessStudent(record.studentId)
    })
})

// 处理签到
const handleCheckIn = () => {
  if (selectedStudentId.value && selectedCoachId.value) {
    const organizationId = authStore.currentUser?.organizationId || '1'
    const success = attendanceStore.checkIn(selectedStudentId.value, selectedCoachId.value, organizationId)
    if (success) {
      checkInMessage.value = {
        type: 'success',
        text: '签到成功，课时已自动扣减，教练课时已增加'
      }
    } else {
      checkInMessage.value = {
        type: 'error',
        text: '签到失败，可能是课时不足'
      }
    }
    
    // 3秒后清除消息
    setTimeout(() => {
      checkInMessage.value = null
    }, 3000)
  }
}

// 处理添加/编辑学生
const handleAddStudent = () => {
  if (studentForm.value.name && studentForm.value.totalClasses >= 0 && studentForm.value.remainingClasses >= 0) {
    if (editingStudent.value) {
      attendanceStore.updateStudent(editingStudent.value, studentForm.value)
      checkInMessage.value = {
        type: 'success',
        text: '学员信息更新成功'
      }
    } else {
      attendanceStore.addStudent(studentForm.value)
      checkInMessage.value = {
        type: 'success',
        text: '学员添加成功'
      }
    }
    
    // 重置表单
    cancelAddStudent()
    
    // 3秒后清除消息
    setTimeout(() => {
      checkInMessage.value = null
    }, 3000)
  }
}

// 编辑学生
const editStudent = (student: any) => {
  editingStudent.value = student.id
  studentForm.value = {
    name: student.name,
    totalClasses: student.totalClasses,
    remainingClasses: student.remainingClasses,
    tuition: student.tuition || 0,
    paidTuition: student.paidTuition || 0,
    organizationId: student.organizationId || authStore.currentUser?.organizationId || '1'
  }
  showAddStudentForm.value = true
}

// 删除学生
const deleteStudent = (id: string) => {
  if (confirm('确定要删除这个学员吗？')) {
    const success = attendanceStore.deleteStudent(id)
    if (success) {
      checkInMessage.value = {
        type: 'success',
        text: '学员删除成功'
      }
      
      // 3秒后清除消息
      setTimeout(() => {
        checkInMessage.value = null
      }, 3000)
    }
  }
}

// 取消添加学生
const cancelAddStudent = () => {
  showAddStudentForm.value = false
  editingStudent.value = null
  studentForm.value = {
    name: '',
    totalClasses: 0,
    remainingClasses: 0,
    tuition: 0,
    paidTuition: 0,
    organizationId: authStore.currentUser?.organizationId || '1'
  }
}

// 处理添加/编辑教练
const handleAddCoach = () => {
  if (coachForm.value.name) {
    if (editingCoach.value) {
      attendanceStore.updateCoach(editingCoach.value, coachForm.value)
      checkInMessage.value = {
        type: 'success',
        text: '教练信息更新成功'
      }
    } else {
      // 添加教练时设置机构 ID
      const coachData = {
        ...coachForm.value,
        organizationId: currentOrganizationId.value
      }
      const newCoach = attendanceStore.addCoach(coachData)
      checkInMessage.value = {
        type: 'success',
        text: '教练添加成功'
      }
    }
    
    // 重置表单
    cancelAddCoach()
    
    // 3秒后清除消息
    setTimeout(() => {
      checkInMessage.value = null
    }, 3000)
  }
}

// 编辑教练
const editCoach = (coach: any) => {
  editingCoach.value = coach.id
  coachForm.value = {
    name: coach.name,
    teachingHours: coach.teachingHours,
    hourlyWage: coach.hourlyWage || 0
  }
  showAddCoachForm.value = true
}

// 删除教练
const deleteCoach = (id: string) => {
  if (confirm('确定要删除这个教练吗？')) {
    const success = attendanceStore.deleteCoach(id)
    if (success) {
      checkInMessage.value = {
        type: 'success',
        text: '教练删除成功'
      }
      
      // 3秒后清除消息
      setTimeout(() => {
        checkInMessage.value = null
      }, 3000)
    }
  }
}

// 结算教练工资
const settleSalary = (id: string) => {
  const coach = attendanceStore.getCoachById(id)
  if (coach) {
    const totalSalary = coach.teachingHours * coach.hourlyWage
    if (confirm(`确定要结算 ${coach.name} 的工资吗？应发工资：¥${totalSalary.toFixed(2)}`)) {
      // 清零已上课时，更新已发工资
      attendanceStore.updateCoach(id, {
        teachingHours: 0,
        totalSalary: (coach.totalSalary || 0) + totalSalary
      })
      checkInMessage.value = {
        type: 'success',
        text: `工资结算成功，已发放 ¥${totalSalary.toFixed(2)}`
      }
      
      // 3秒后清除消息
      setTimeout(() => {
        checkInMessage.value = null
      }, 3000)
    }
  }
}

// 取消添加教练
const cancelAddCoach = () => {
  showAddCoachForm.value = false
  editingCoach.value = null
  coachForm.value = {
    name: '',
    teachingHours: 0,
    hourlyWage: 0
  }
}

// 处理学员分配
const handleAssignStudent = () => {
  if (assignStudentId.value && assignCoachId.value) {
    const success = authStore.assignStudentToCoach(assignCoachId.value, assignStudentId.value)
    if (success) {
      checkInMessage.value = {
        type: 'success',
        text: '学员分配成功'
      }
    } else {
      checkInMessage.value = {
        type: 'error',
        text: '学员分配失败'
      }
    }
    
    // 重置表单
    assignStudentId.value = ''
    assignCoachId.value = ''
    
    // 3秒后清除消息
    setTimeout(() => {
      checkInMessage.value = null
    }, 3000)
  }
}

// 获取学员姓名
const getStudentName = (id: string) => {
  const student = attendanceStore.getStudentById(id)
  return student ? student.name : '未知学员'
}

// 获取教练姓名
const getCoachName = (id: string) => {
  const coach = authStore.users.find(u => u.id === id && u.role === 'coach')
  return coach ? coach.name : '未知教练'
}

// 获取教练的授课课时
const getCoachTeachingHours = (id: string) => {
  const coach = attendanceStore.getCoachById(id)
  return coach ? coach.teachingHours : 0
}

// 获取分配给学员的教练姓名
const getAssignedCoachName = (studentId: string) => {
  const coach = authStore.users.find(u => u.role === 'coach' && u.assignedStudents.includes(studentId))
  return coach ? coach.name : null
}
</script>

<style scoped>
.attendance {
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

.check-in-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.check-in-form {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

select,
input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
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

.edit-button {
  background-color: #f39c12;
  padding: 6px 12px;
  font-size: 14px;
  margin-right: 5px;
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

.settle-button {
  background-color: #3498db;
  padding: 6px 12px;
  font-size: 14px;
  margin-right: 5px;
}

.settle-button:hover {
  background-color: #2980b9;
}

.message {
  margin-top: 20px;
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

.records-section,
.students-section,
.coaches-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.records-table,
.students-table,
.coaches-table {
  overflow-x: auto;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
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

.status-attended {
  color: #27ae60;
  font-weight: bold;
}

.status-absent {
  color: #e74c3c;
  font-weight: bold;
}

.no-records {
  text-align: center;
  color: #999;
  padding: 40px;
}

/* 工资相关样式 */
.salary-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.salary-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.salary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.salary-item:last-child {
  border-bottom: none;
}

.salary-label {
  font-weight: 500;
  color: #555;
}

.salary-value {
  font-weight: 600;
  color: #3498db;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .attendance {
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
  
  .check-in-section,
  .records-section,
  .students-section,
  .coaches-section {
    padding: 20px;
  }
  
  .check-in-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group {
    min-width: 100%;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .edit-button,
  .delete-button,
  .settle-button {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  table {
    font-size: 14px;
  }
  
  th,
  td {
    padding: 8px;
  }
  
  .salary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .salary-value {
    align-self: flex-end;
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .attendance {
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
  
  .check-in-section,
  .records-section,
  .students-section,
  .coaches-section {
    padding: 15px;
  }
  
  button {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  select,
  input[type="text"],
  input[type="number"] {
    padding: 8px;
    font-size: 14px;
  }
  
  table {
    font-size: 12px;
  }
  
  th,
  td {
    padding: 6px;
  }
}
</style>