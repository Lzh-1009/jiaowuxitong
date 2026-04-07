<template>
  <div class="parent-interaction">
    <div class="header">
      <button @click="goBack" class="back-button">
        返回
      </button>
      <h1>家校互动</h1>
    </div>
    
    <div class="notification-section">
      <h2>通知管理</h2>
      <div class="notification-form">
        <div class="form-group">
          <label>选择学员</label>
          <select v-model="newNotification.studentId">
            <option value="">请选择学员</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>通知类型</label>
          <select v-model="newNotification.type">
            <option value="class_reminder">上课提醒</option>
            <option value="schedule_change">调课通知</option>
            <option value="activity">活动预告</option>
            <option value="other">其他通知</option>
          </select>
        </div>
        <div class="form-group">
          <label>标题</label>
          <input type="text" v-model="newNotification.title" placeholder="请输入通知标题" />
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea v-model="newNotification.content" placeholder="请输入通知内容" rows="3"></textarea>
        </div>
        <button @click="sendNotification" :disabled="!newNotification.studentId || !newNotification.title || !newNotification.content">
          发送通知
        </button>
      </div>
      
      <div class="notification-list">
        <h3>通知列表</h3>
        <div class="filter">
          <label>筛选学员</label>
          <select v-model="filterStudentId">
            <option value="">全部学员</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }}
            </option>
          </select>
        </div>
        <div class="notification-items">
          <div v-for="notification in filteredNotifications" :key="notification.id" class="notification-item" :class="{ 'unread': !notification.isRead }">
            <div class="notification-header">
              <h4>{{ notification.title }}</h4>
              <span class="notification-date">{{ notification.date }}</span>
            </div>
            <div class="notification-content">
              <p>{{ notification.content }}</p>
              <div class="notification-meta">
                <span class="notification-type">{{ getNotificationTypeText(notification.type) }}</span>
                <span class="notification-student">{{ getStudentName(notification.studentId) }}</span>
              </div>
            </div>
            <div class="notification-actions">
              <button v-if="!notification.isRead" @click="markAsRead(notification.id)" class="read-button">
                标记为已读
              </button>
            </div>
          </div>
          <div v-if="filteredNotifications.length === 0" class="no-notifications">
            暂无通知
          </div>
        </div>
      </div>
    </div>
    
    <div class="points-section">
      <h2>积分管理</h2>
      <div class="points-form">
        <div class="form-group">
          <label>选择学员</label>
          <select v-model="newPointRecord.studentId">
            <option value="">请选择学员</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>积分</label>
          <input type="number" v-model.number="newPointRecord.points" placeholder="请输入积分" />
        </div>
        <div class="form-group">
          <label>原因</label>
          <input type="text" v-model="newPointRecord.reason" placeholder="请输入积分原因" />
        </div>
        <button @click="addPoints" :disabled="!newPointRecord.studentId || !newPointRecord.points || !newPointRecord.reason">
          添加积分
        </button>
      </div>
      
      <div class="points-list">
        <h3>积分记录</h3>
        <div class="filter">
          <label>筛选学员</label>
          <select v-model="filterPointsStudentId">
            <option value="">全部学员</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }}
            </option>
          </select>
        </div>
        <div class="points-items">
          <div v-for="record in filteredPointRecords" :key="record.id" class="points-item">
            <div class="points-header">
              <span class="points-value">+{{ record.points }}</span>
              <span class="points-date">{{ record.date }}</span>
            </div>
            <div class="points-content">
              <p>{{ record.reason }}</p>
              <span class="points-student">{{ getStudentName(record.studentId) }}</span>
            </div>
          </div>
          <div v-if="filteredPointRecords.length === 0" class="no-points">
            暂无积分记录
          </div>
        </div>
        
        <div class="total-points">
          <h3>总积分</h3>
          <div class="points-summary">
            <div v-for="student in students" :key="student.id" class="student-points">
              <span class="student-name">{{ student.name }}</span>
              <span class="student-total">{{ getTotalPoints(student.id) }} 积分</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useParentStore } from '../store/parent'
import { useAttendanceStore } from '../store/attendance'
import router from '../router'

const parentStore = useParentStore()
const attendanceStore = useAttendanceStore()

const newNotification = ref({
  studentId: '',
  title: '',
  content: '',
  type: 'class_reminder' as 'class_reminder' | 'schedule_change' | 'activity' | 'other'
})

const newPointRecord = ref({
  studentId: '',
  points: 0,
  reason: ''
})

const filterStudentId = ref('')
const filterPointsStudentId = ref('')

const students = computed(() => attendanceStore.students)

const filteredNotifications = computed(() => {
  if (!filterStudentId.value) {
    return parentStore.notifications
  }
  return parentStore.getNotificationsByStudent(filterStudentId.value)
})

const filteredPointRecords = computed(() => {
  if (!filterPointsStudentId.value) {
    return parentStore.pointRecords
  }
  return parentStore.getPointRecordsByStudent(filterPointsStudentId.value)
})

const sendNotification = () => {
  if (newNotification.value.studentId && newNotification.value.title && newNotification.value.content) {
    parentStore.addNotification({
      studentId: newNotification.value.studentId,
      title: newNotification.value.title,
      content: newNotification.value.content,
      type: newNotification.value.type,
      date: new Date().toISOString().split('T')[0]
    })
    
    // 重置表单
    newNotification.value = {
      studentId: '',
      title: '',
      content: '',
      type: 'class_reminder'
    }
  }
}

const markAsRead = (id: string) => {
  parentStore.markNotificationAsRead(id)
}

const addPoints = () => {
  if (newPointRecord.value.studentId && newPointRecord.value.points > 0 && newPointRecord.value.reason) {
    parentStore.addPointRecord({
      studentId: newPointRecord.value.studentId,
      points: newPointRecord.value.points,
      reason: newPointRecord.value.reason,
      date: new Date().toISOString().split('T')[0]
    })
    
    // 重置表单
    newPointRecord.value = {
      studentId: '',
      points: 0,
      reason: ''
    }
  }
}

const getNotificationTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    class_reminder: '上课提醒',
    schedule_change: '调课通知',
    activity: '活动预告',
    other: '其他通知'
  }
  return typeMap[type] || '未知类型'
}

const getStudentName = (id: string) => {
  const student = attendanceStore.getStudentById(id)
  return student ? student.name : '未知学员'
}

const getTotalPoints = (studentId: string) => {
  return parentStore.getTotalPointsByStudent(studentId)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.parent-interaction {
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
  margin: 20px 0 15px;
}

h4 {
  color: #7f8c8d;
  margin: 10px 0;
}

.notification-section,
.points-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.notification-form,
.points-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="number"],
textarea,
select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  padding: 12px 24px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  align-self: end;
}

button:hover {
  background-color: #2980b9;
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.filter {
  margin-bottom: 20px;
}

.filter label {
  margin-right: 10px;
}

.filter select {
  padding: 8px;
  font-size: 14px;
}

.notification-items,
.points-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.3s ease;
}

.notification-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
  border-left: 4px solid #3498db;
  background-color: #f8f9fa;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.notification-date {
  font-size: 14px;
  color: #95a5a6;
}

.notification-content {
  margin-bottom: 10px;
}

.notification-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 10px;
}

.notification-type {
  background-color: #ecf0f1;
  padding: 2px 8px;
  border-radius: 12px;
}

.notification-actions {
  margin-top: 10px;
  text-align: right;
}

.read-button {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #27ae60;
}

.read-button:hover {
  background-color: #229954;
}

.points-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.3s ease;
}

.points-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.points-value {
  font-weight: bold;
  color: #27ae60;
  font-size: 18px;
}

.points-date {
  font-size: 14px;
  color: #95a5a6;
}

.points-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-student {
  font-size: 14px;
  color: #7f8c8d;
}

.total-points {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.points-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.student-points {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  min-width: 200px;
}

.student-name {
  font-weight: bold;
  color: #34495e;
}

.student-total {
  color: #3498db;
  font-weight: bold;
}

.no-notifications,
.no-points {
  text-align: center;
  color: #999;
  padding: 40px;
}

@media (max-width: 768px) {
  .notification-form,
  .points-form {
    grid-template-columns: 1fr;
  }
  
  button {
    align-self: stretch;
  }
  
  .points-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>