<template>
  <div class="statistics">
    <h1>数据统计分析</h1>
    
    <div class="summary-cards">
      <div class="summary-card" v-if="isAdmin">
        <h3>总营收</h3>
        <p class="amount">¥{{ totalRevenue.toFixed(2) }}</p>
        <p class="period">本月</p>
      </div>
      <div class="summary-card">
        <h3>平均出勤率</h3>
        <p class="rate">{{ averageAttendanceRate.toFixed(1) }}%</p>
        <p class="period">{{ isAdmin ? '所有学员' : '我的学员' }}</p>
      </div>
      <div class="summary-card" v-if="isAdmin">
        <h3>学员留存率</h3>
        <p class="rate">{{ latestRetentionRate.toFixed(1) }}%</p>
        <p class="period">本月</p>
      </div>
      <div class="summary-card">
        <h3>总学员数</h3>
        <p class="count">{{ totalStudents }}</p>
        <p class="period">{{ isAdmin ? '当前' : '我的学员' }}</p>
      </div>
    </div>
    
    <div class="revenue-management" v-if="isAdmin">
      <div class="section-header">
        <h2>营收管理</h2>
        <button @click="showAddRevenueForm = true" class="add-button">
          添加营收记录
        </button>
      </div>
      
      <!-- 添加营收记录表单 -->
      <div v-if="showAddRevenueForm" class="add-form">
        <h3>{{ editingRevenue ? '编辑营收记录' : '添加营收记录' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>日期</label>
            <input type="date" v-model="revenueForm.date" />
          </div>
          <div class="form-group">
            <label>金额</label>
            <input type="number" v-model.number="revenueForm.amount" placeholder="请输入金额" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="revenueForm.type">
              <option value="tuition">学费</option>
              <option value="activity">活动</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>学员（可选）</label>
            <select v-model="revenueForm.studentId">
              <option value="">请选择学员</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleAddRevenue" :disabled="!revenueForm.date || !revenueForm.amount">
            {{ editingRevenue ? '保存修改' : '添加记录' }}
          </button>
          <button @click="cancelAddRevenue" class="cancel-button">
            取消
          </button>
        </div>
      </div>
    </div>
    
    <div class="revenue-section" v-if="isAdmin">
      <h2>营收明细</h2>
      <div class="date-filter">
        <label>开始日期</label>
        <input type="date" v-model="revenueStartDate" />
        <label>结束日期</label>
        <input type="date" v-model="revenueEndDate" />
        <button @click="updateRevenueStats">查询</button>
      </div>
      <div class="revenue-details">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>金额</th>
              <th>类型</th>
              <th>学员</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in filteredRevenueRecords" :key="record.id">
              <td>{{ record.date }}</td>
              <td>¥{{ record.amount.toFixed(2) }}</td>
              <td>{{ getRevenueTypeText(record.type) }}</td>
              <td>{{ record.studentId ? getStudentName(record.studentId) : '无' }}</td>
            </tr>
            <tr v-if="filteredRevenueRecords.length === 0">
              <td colspan="4" class="no-data">暂无营收记录</td>
            </tr>
          </tbody>
        </table>
        <div class="revenue-summary">
          <h4>营收汇总</h4>
          <div class="summary-items">
            <div class="summary-item">
              <span>学费收入</span>
              <span>¥{{ tuitionRevenue.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>活动收入</span>
              <span>¥{{ activityRevenue.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>其他收入</span>
              <span>¥{{ otherRevenue.toFixed(2) }}</span>
            </div>
            <div class="summary-item total">
              <span>总计</span>
              <span>¥{{ filteredTotalRevenue.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="attendance-section">
      <h2>学员出勤情况</h2>
      <div class="attendance-list">
        <table>
          <thead>
            <tr>
              <th>学员</th>
              <th>总课时</th>
              <th>出勤课时</th>
              <th>出勤率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in attendanceStats" :key="stat.studentId">
              <td>{{ getStudentName(stat.studentId) }}</td>
              <td>{{ stat.totalClasses }}</td>
              <td>{{ stat.attendedClasses }}</td>
              <td :class="getAttendanceRateClass(stat.attendanceRate)">
                {{ stat.attendanceRate.toFixed(1) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="retention-section">
      <h2>学员留存情况</h2>
      <div class="retention-chart">
        <div class="chart-container">
          <div v-for="stat in recentRetentionStats" :key="stat.month" class="chart-bar">
            <div class="bar-label">{{ stat.month }}</div>
            <div class="bar-container">
              <div class="bar" :style="{ width: stat.retentionRate + '%' }"></div>
              <div class="bar-value">{{ stat.retentionRate.toFixed(1) }}%</div>
            </div>
            <div class="bar-details">
              <span>新学员: {{ stat.newStudents }}</span>
              <span>留存: {{ stat.retainedStudents }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStatisticsStore } from '../store/statistics'
import { useAttendanceStore } from '../store/attendance'
import { useAuthStore } from '../store/auth'

const statisticsStore = useStatisticsStore()
const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

// 权限控制
const isAdmin = computed(() => authStore.isAdmin())
const isCoach = computed(() => authStore.isCoach())
const currentOrganizationId = computed(() => authStore.currentUser?.organizationId || '1')

// 可访问的学员
const accessibleStudents = computed(() => {
  const orgStudents = attendanceStore.getStudentsByOrganization(currentOrganizationId.value)
  if (isAdmin.value) {
    return orgStudents
  } else if (isCoach.value) {
    return orgStudents.filter(student => authStore.canAccessStudent(student.id))
  }
  return []
})

// 营收管理相关
const showAddRevenueForm = ref(false)
const editingRevenue = ref<string | null>(null)
const revenueForm = ref({
  date: new Date().toISOString().split('T')[0],
  amount: 0,
  type: 'tuition' as 'tuition' | 'activity' | 'other',
  studentId: ''
})

const revenueStartDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
const revenueEndDate = ref(new Date().toISOString().split('T')[0])

const totalStudents = computed(() => accessibleStudents.value.length)

const totalRevenue = computed(() => {
  if (!isAdmin.value) return 0 // 教练看不到总营收
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date().toISOString().split('T')[0]
  const records = statisticsStore.getRevenueByDateRange(startOfMonth, endOfMonth)
  return records
    .filter(record => record.organizationId === currentOrganizationId.value)
    .filter(record => !record.studentId || attendanceStore.getStudentById(record.studentId))
    .reduce((total, record) => total + record.amount, 0)
})

// 教练只能看到自己学员的出勤率
const averageAttendanceRate = computed(() => {
  // 计算当前机构学员的平均出勤率
  const accessibleStudentIds = accessibleStudents.value.map(s => s.id)
  const stats = statisticsStore.realAttendanceStats.filter(stat => 
    accessibleStudentIds.includes(stat.studentId)
  )
  if (stats.length === 0) return 0
  const totalRate = stats.reduce((sum, stat) => sum + stat.attendanceRate, 0)
  return totalRate / stats.length
})

const recentRetentionStats = computed(() => {
  // 过滤当前机构的留存数据
  return statisticsStore.getRecentRetentionStats()
    .filter(stat => stat.organizationId === currentOrganizationId.value)
})

const latestRetentionRate = computed(() => {
  const stats = recentRetentionStats.value
  return stats.length > 0 ? stats[stats.length - 1].retentionRate : 0
})

const filteredRevenueRecords = computed(() => {
  if (!isAdmin.value) return [] // 教练看不到营收明细
  return statisticsStore.getRevenueByDateRange(revenueStartDate.value, revenueEndDate.value)
    .filter(record => record.organizationId === currentOrganizationId.value)
    .filter(record => !record.studentId || attendanceStore.getStudentById(record.studentId))
})

const filteredTotalRevenue = computed(() => {
  return filteredRevenueRecords.value
    .reduce((total, record) => total + record.amount, 0)
})

const tuitionRevenue = computed(() => {
  return filteredRevenueRecords.value
    .filter(record => record.type === 'tuition')
    .reduce((total, record) => total + record.amount, 0)
})

const activityRevenue = computed(() => {
  return filteredRevenueRecords.value
    .filter(record => record.type === 'activity')
    .reduce((total, record) => total + record.amount, 0)
})

const otherRevenue = computed(() => {
  return filteredRevenueRecords.value
    .filter(record => record.type === 'other')
    .reduce((total, record) => total + record.amount, 0)
})

const attendanceStats = computed(() => {
  // 教练只能看到自己学员的出勤情况
  const accessibleStudentIds = accessibleStudents.value.map(s => s.id)
  return statisticsStore.realAttendanceStats.filter(stat => 
    accessibleStudentIds.includes(stat.studentId)
  )
})
const students = computed(() => accessibleStudents)

const updateRevenueStats = () => {
  // 日期变化后，计算属性会自动更新
}

const getRevenueTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    tuition: '学费',
    activity: '活动',
    other: '其他'
  }
  return typeMap[type] || '未知类型'
}

const getStudentName = (id: string) => {
  const student = attendanceStore.getStudentById(id)
  return student ? student.name : '未知学员'
}

const getAttendanceRateClass = (rate: number) => {
  if (rate >= 90) return 'rate-high'
  if (rate >= 80) return 'rate-medium'
  return 'rate-low'
}

const handleAddRevenue = () => {
  if (revenueForm.value.date && revenueForm.value.amount > 0) {
    const record = {
      date: revenueForm.value.date,
      amount: revenueForm.value.amount,
      type: revenueForm.value.type,
      studentId: revenueForm.value.studentId || undefined,
      organizationId: currentOrganizationId.value
    }
    
    statisticsStore.addRevenueRecord(record)
    
    // 重置表单
    cancelAddRevenue()
  }
}

const cancelAddRevenue = () => {
  showAddRevenueForm.value = false
  editingRevenue.value = null
  revenueForm.value = {
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'tuition',
    studentId: ''
  }
}

onMounted(() => {
  // 组件挂载时的初始化逻辑
})
</script>

<style scoped>
.statistics {
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
  margin: 10px 0;
}

h4 {
  color: #7f8c8d;
  margin: 15px 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-button {
  background-color: #95a5a6;
  margin-left: 10px;
}

.cancel-button:hover {
  background-color: #7f8c8d;
}

.summary-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.amount {
  font-size: 32px;
  font-weight: bold;
  color: #3498db;
  margin: 10px 0;
}

.rate {
  font-size: 32px;
  font-weight: bold;
  color: #27ae60;
  margin: 10px 0;
}

.count {
  font-size: 32px;
  font-weight: bold;
  color: #e67e22;
  margin: 10px 0;
}

.period {
  color: #7f8c8d;
  font-size: 14px;
}

.revenue-section,
.attendance-section,
.retention-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.date-filter {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.date-filter label {
  font-weight: bold;
  color: #555;
}

.date-filter input[type="date"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.date-filter button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.date-filter button:hover {
  background-color: #2980b9;
}

.revenue-details {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .revenue-details {
    grid-template-columns: 1fr;
  }
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
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

.no-data {
  text-align: center;
  color: #999;
  padding: 40px;
}

.revenue-summary {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.summary-item.total {
  font-weight: bold;
  background-color: #ecf0f1;
  border-radius: 4px;
  margin-top: 10px;
}

.rate-high {
  color: #27ae60;
  font-weight: bold;
}

.rate-medium {
  color: #f39c12;
  font-weight: bold;
}

.rate-low {
  color: #e74c3c;
  font-weight: bold;
}

.retention-chart {
  margin-top: 20px;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: 20px;
}

.bar-label {
  width: 100px;
  font-weight: bold;
  color: #34495e;
}

.bar-container {
  flex: 1;
  height: 40px;
  background-color: #ecf0f1;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.bar {
  height: 100%;
  background-color: #3498db;
  border-radius: 20px;
  transition: width 0.5s ease;
}

.bar-value {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #34495e;
}

.bar-details {
  width: 200px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #7f8c8d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics {
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
  
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .summary-card {
    padding: 20px;
  }
  
  .amount,
  .rate,
  .count {
    font-size: 24px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .revenue-section,
  .attendance-section,
  .retention-section {
    padding: 20px;
  }
  
  .date-filter {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .revenue-details {
    grid-template-columns: 1fr;
  }
  
  table {
    font-size: 14px;
  }
  
  th,
  td {
    padding: 8px;
  }
  
  .chart-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .bar-label {
    width: 100%;
  }
  
  .bar-details {
    width: 100%;
    margin-top: 5px;
  }
  
  .no-data {
    padding: 30px;
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .statistics {
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
  
  .summary-card {
    padding: 15px;
  }
  
  .amount,
  .rate,
  .count {
    font-size: 20px;
  }
  
  .revenue-section,
  .attendance-section,
  .retention-section {
    padding: 15px;
  }
  
  input[type="date"],
  input[type="number"],
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
  
  .no-data {
    padding: 20px;
  }
}
</style>