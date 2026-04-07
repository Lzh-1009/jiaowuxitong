<template>
  <div class="schedule">
    <h1>教练排课管理</h1>
    
    <div class="schedule-management">
      <div class="section-header">
        <h2>排课管理</h2>
        <button v-if="isAdmin || isCoach" @click="showAddScheduleForm = true" class="add-button">
          添加排课
        </button>
      </div>
      
      <!-- 添加排课表单 -->
      <div v-if="showAddScheduleForm" class="add-form">
        <h3>{{ editingSchedule ? '编辑排课' : '添加排课' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>周几</label>
            <select v-model="scheduleForm.dayOfWeek">
              <option value="">请选择周几</option>
              <option value="1">周一</option>
              <option value="2">周二</option>
              <option value="3">周三</option>
              <option value="4">周四</option>
              <option value="5">周五</option>
              <option value="6">周六</option>
              <option value="7">周日</option>
            </select>
          </div>
          <div class="form-group">
            <label>开始时间</label>
            <input type="time" v-model="scheduleForm.startTime" />
          </div>
          <div class="form-group">
            <label>结束时间</label>
            <input type="time" v-model="scheduleForm.endTime" />
          </div>
          <div v-if="isAdmin" class="form-group">
            <label>教练</label>
            <select v-model="scheduleForm.coachId">
              <option value="">请选择教练</option>
              <option v-for="coach in accessibleCoaches" :key="coach.id" :value="coach.id">
                {{ coach.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>课程名称</label>
            <input type="text" v-model="scheduleForm.courseName" placeholder="请输入课程名称" />
          </div>
          <div class="form-group">
            <label>学员</label>
            <select v-model="scheduleForm.studentId" multiple>
              <option v-for="student in accessibleStudents" :key="student.id" :value="student.id">
                {{ student.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleAddSchedule" :disabled="!scheduleForm.dayOfWeek || !scheduleForm.startTime || !scheduleForm.endTime || !scheduleForm.coachId || !scheduleForm.courseName">
            {{ editingSchedule ? '保存修改' : '添加排课' }}
          </button>
          <button @click="cancelAddSchedule" class="cancel-button">
            取消
          </button>
        </div>
      </div>
      
      <!-- 排课列表 -->
      <div class="schedule-list">
        <table>
          <thead>
            <tr>
              <th>周几</th>
              <th>时间</th>
              <th>教练</th>
              <th>课程名称</th>
              <th>学员</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="schedule in accessibleSchedules" :key="schedule.id">
              <td>{{ getDayOfWeekName(schedule.dayOfWeek) }}</td>
              <td>{{ schedule.startTime }} - {{ schedule.endTime }}</td>
              <td>{{ getCoachName(schedule.coachId) }}</td>
              <td>{{ schedule.courseName }}</td>
              <td>{{ getStudentNames(schedule.studentId) }}</td>
              <td class="actions">
                <button v-if="isAdmin || (isCoach && schedule.coachId === authStore.currentUser?.id)" @click="editSchedule(schedule)" class="edit-button">
                  编辑
                </button>
                <button v-if="isAdmin || (isCoach && schedule.coachId === authStore.currentUser?.id)" @click="deleteSchedule(schedule.id)" class="delete-button">
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="accessibleSchedules.length === 0">
              <td colspan="6" class="no-data">暂无排课记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 课表生成 -->
    <div class="timetable-section">
      <h2>周课表</h2>
      <div class="timetable">
        <div class="timetable-header">
          <div class="timetable-cell time-header">时间</div>
          <div class="timetable-cell day-header" v-for="day in weekDays" :key="day.value">
            {{ day.name }}
          </div>
        </div>
        <div class="timetable-body">
          <div v-for="hour in timeSlots" :key="hour" class="timetable-row">
            <div class="timetable-cell time-cell">{{ hour }}:00</div>
            <div v-for="day in weekDays" :key="day.value" class="timetable-cell">
              <div v-for="schedule in getSchedulesForDayAndHour(day.value, hour)" :key="schedule.id" class="schedule-item">
                <div class="schedule-course">{{ schedule.courseName }}</div>
                <div class="schedule-coach">{{ getCoachName(schedule.coachId) }}</div>
                <div class="schedule-time">{{ schedule.startTime }}-{{ schedule.endTime }}</div>
              </div>
            </div>
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

// 排课管理相关
const showAddScheduleForm = ref(false)
const editingSchedule = ref<string | null>(null)
const scheduleForm = ref({
  dayOfWeek: '',
  startTime: '09:00',
  endTime: '10:00',
  coachId: '',
  courseName: '',
  studentId: [] as string[]
})

// 排课数据
const schedules = ref(JSON.parse(localStorage.getItem('schedules') || '[]'))

const students = computed(() => attendanceStore.getStudentsByOrganization(currentOrganizationId.value))
const authCoaches = computed(() => {
  const coaches = authStore.coaches
  return coaches.filter(coach => coach.organizationId === currentOrganizationId.value)
})

// 周几数据
const weekDays = [
  { value: '1', name: '周一' },
  { value: '2', name: '周二' },
  { value: '3', name: '周三' },
  { value: '4', name: '周四' },
  { value: '5', name: '周五' },
  { value: '6', name: '周六' },
  { value: '7', name: '周日' }
]

// 时间槽（8:00 - 20:00）
const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8)

// 可访问的教练（教练只能看到自己）
const accessibleCoaches = computed(() => {
  if (isAdmin.value) {
    return authCoaches.value
  } else if (isCoach.value) {
    return authCoaches.value.filter(coach => coach.id === authStore.currentUser?.id)
  }
  return []
})

// 可访问的学生（教练只能看到分配给他们的学生）
const accessibleStudents = computed(() => {
  if (isAdmin.value) {
    return students.value
  } else if (isCoach.value) {
    return students.value.filter(student => authStore.canAccessStudent(student.id))
  }
  return []
})

// 可访问的排课记录（教练只能看到自己的排课）
const accessibleSchedules = computed(() => {
  const orgSchedules = schedules.value.filter(schedule => schedule.organizationId === currentOrganizationId.value)
  if (isAdmin.value) {
    return orgSchedules
  } else if (isCoach.value) {
    return orgSchedules.filter(schedule => schedule.coachId === authStore.currentUser?.id)
  }
  return []
})

const handleAddSchedule = () => {
  if (scheduleForm.value.dayOfWeek && scheduleForm.value.startTime && scheduleForm.value.endTime && scheduleForm.value.coachId && scheduleForm.value.courseName) {
    if (editingSchedule.value) {
      // 编辑排课
      const index = schedules.value.findIndex(s => s.id === editingSchedule.value)
      if (index !== -1) {
        schedules.value[index] = {
          ...schedules.value[index],
          ...scheduleForm.value
        }
      }
    } else {
      // 添加排课
      const newSchedule = {
        id: Date.now().toString(),
        ...scheduleForm.value,
        organizationId: currentOrganizationId.value
      }
      schedules.value.push(newSchedule)
    }
    
    // 重置表单
    cancelAddSchedule()
  }
}

const editSchedule = (schedule: any) => {
  editingSchedule.value = schedule.id
  scheduleForm.value = {
    dayOfWeek: schedule.dayOfWeek,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    coachId: schedule.coachId,
    courseName: schedule.courseName,
    studentId: [...schedule.studentId]
  }
  showAddScheduleForm.value = true
}

const deleteSchedule = (id: string) => {
  if (confirm('确定要删除这个排课吗？')) {
    const index = schedules.value.findIndex(s => s.id === id)
    if (index !== -1) {
      schedules.value.splice(index, 1)
    }
  }
}

const cancelAddSchedule = () => {
  showAddScheduleForm.value = false
  editingSchedule.value = null
  const defaultCoachId = isCoach.value && authStore.currentUser?.id ? authStore.currentUser.id : ''
  scheduleForm.value = {
    dayOfWeek: '',
    startTime: '09:00',
    endTime: '10:00',
    coachId: defaultCoachId,
    courseName: '',
    studentId: []
  }
}

const getCoachName = (id: string) => {
  const coach = authStore.users.find(u => u.id === id && u.role === 'coach')
  return coach ? coach.name : '未知教练'
}

const getStudentNames = (ids: string[]) => {
  return ids.map(id => {
    const student = attendanceStore.getStudentById(id)
    return student ? student.name : '未知学员'
  }).join(', ')
}

// 获取周几的名称
const getDayOfWeekName = (day: string) => {
  const dayObj = weekDays.find(d => d.value === day)
  return dayObj ? dayObj.name : '未知'
}

// 获取指定周几和小时的排课
const getSchedulesForDayAndHour = (day: string, hour: number) => {
  return accessibleSchedules.value.filter(schedule => {
    if (schedule.dayOfWeek !== day) return false
    const startHour = parseInt(schedule.startTime.split(':')[0])
    return startHour === hour
  })
}

// 监听排课数据变化，保存到 localStorage
watch(schedules, (newValue) => {
  localStorage.setItem('schedules', JSON.stringify(newValue))
}, { deep: true })

// 从 attendance store 中监听学员删除事件，同步删除相关排课记录

// 监听学员变化，删除相关排课记录
watch(() => attendanceStore.students, (newStudents) => {
  const studentIds = newStudents.map(s => s.id)
  schedules.value = schedules.value.filter(schedule => {
    // 检查排课中的所有学员是否都存在
    return schedule.studentId.every(id => studentIds.includes(id))
  })
}, { deep: true })
</script>

<style scoped>
.schedule {
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

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="date"],
input[type="time"],
select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

select[multiple] {
  height: 120px;
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

.schedule-list {
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

/* 课表样式 */
.timetable-section {
  margin-top: 40px;
}

.timetable {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.timetable-header {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.timetable-body {
  display: flex;
  flex-direction: column;
}

.timetable-row {
  display: flex;
  border-bottom: 1px solid #e9ecef;
}

.timetable-cell {
  flex: 1;
  padding: 10px;
  min-height: 80px;
  border-right: 1px solid #e9ecef;
  position: relative;
}

.timetable-cell:last-child {
  border-right: none;
}

.time-header {
  flex: 0 0 80px;
  background-color: #e9ecef;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

.day-header {
  text-align: center;
  font-weight: bold;
  padding: 10px;
}

.time-cell {
  flex: 0 0 80px;
  background-color: #f8f9fa;
  text-align: center;
  font-weight: bold;
}

.schedule-item {
  background-color: #e3f2fd;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 5px;
  border-left: 4px solid #2196f3;
}

.schedule-course {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.schedule-coach {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.schedule-time {
  font-size: 11px;
  color: #999;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .schedule {
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
  
  .schedule-list {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
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
  
  .edit-button,
  .delete-button {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .timetable {
    overflow-x: auto;
  }
  
  .timetable-header,
  .timetable-row {
    min-width: 700px;
  }
  
  .no-data {
    padding: 30px;
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .schedule {
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
  
  .schedule-list {
    padding: 15px;
  }
  
  input[type="text"],
  input[type="date"],
  input[type="time"],
  select {
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
  
  .timetable-header,
  .timetable-row {
    min-width: 600px;
  }
  
  .no-data {
    padding: 20px;
  }
}
</style>