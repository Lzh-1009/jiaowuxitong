<template>
  <div class="fitness-test">
    <h1>体测数据管理</h1>
    
    <div class="input-section">
      <h2>录入体测数据</h2>
      <div class="input-form">
        <div class="form-group">
          <label>选择学员</label>
          <select v-model="selectedStudentId">
            <option value="">请选择学员</option>
            <option v-for="student in accessibleStudents" :key="student.id" :value="student.id">
              {{ student.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>性别</label>
          <select v-model="studentGender" @change="updateTestItems">
            <option value="">请选择性别</option>
            <option value="male">男生</option>
            <option value="female">女生</option>
          </select>
        </div>
        <div class="form-group">
          <label>测试日期</label>
          <input type="date" v-model="testDate" />
        </div>
        
        <div class="test-items">
          <h3>测试项目</h3>
          <div v-for="(item, index) in testItems" :key="index" class="test-item">
            <div class="item-header">
              <span>{{ item.name }}</span>
              <span class="unit">({{ item.unit }})</span>
            </div>
            <div class="item-inputs">
              <div class="input-group">
                <label>测试值</label>
                <input 
                  v-if="item.name === '1000米跑' || item.name === '800米跑'"
                  type="text" 
                  v-model="item.scoreText" 
                  @input="handleRunInput(index)" 
                  placeholder="例如：3'40""
                />
                <input 
                  v-else
                  type="number" 
                  v-model.number="item.score" 
                  step="0.1" 
                  @input="updateItemLevel(index)" 
                />
              </div>
              <div class="input-group">
                <label>等级</label>
                <span class="level-display" :class="'level-' + item.level.toLowerCase()">{{ item.level }}</span>
              </div>
              <div class="input-group">
                <label>分值</label>
                <span class="score-display">{{ item.calculatedScore || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="handleSubmit" :disabled="!selectedStudentId || !testDate">
          生成体测报告
        </button>
      </div>
      <div v-if="submitMessage" class="message" :class="submitMessage.type">
        {{ submitMessage.text }}
      </div>
    </div>
    
    <div class="report-section">
      <h2>体测报告</h2>
      <div v-if="selectedStudentId" class="student-reports">
        <h3>{{ getStudentName(selectedStudentId) }}的体测记录</h3>
        <div v-for="record in studentRecords" :key="record.id" class="report-card">
          <div class="report-header">
            <h4>{{ record.date }} - {{ record.overallLevel }}</h4>
            <span class="total-score">总分: {{ record.totalScore }}</span>
          </div>
          <div class="report-body">
            <div class="test-results">
              <table>
                <thead>
                  <tr>
                    <th>项目</th>
                    <th>标准值</th>
                    <th>测试值</th>
                    <th>等级</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in record.items" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.standard }} {{ item.unit }}</td>
                    <td>{{ item.score }} {{ item.unit }}</td>
                    <td :class="'level-' + item.level.toLowerCase()">{{ item.level }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="analysis">
              <div class="strengths">
                <h5>优势项目</h5>
                <ul>
                  <li v-for="(strength, index) in record.strengths" :key="index">{{ strength }}</li>
                  <li v-if="record.strengths.length === 0">无</li>
                </ul>
              </div>
              <div class="weaknesses">
                <h5>待改进项目</h5>
                <ul>
                  <li v-for="(weakness, index) in record.weaknesses" :key="index">{{ weakness }}</li>
                  <li v-if="record.weaknesses.length === 0">无</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div v-if="studentRecords.length === 0" class="no-reports">
          暂无体测记录
        </div>
      </div>
      <div v-else class="select-student">
        请选择学员查看体测报告
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFitnessTestStore } from '../store/fitnessTest'
import { useAttendanceStore } from '../store/attendance'
import { useAuthStore } from '../store/auth'

const fitnessTestStore = useFitnessTestStore()
const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const selectedStudentId = ref('')
const studentGender = ref('' as 'male' | 'female' | '')
const testDate = ref(new Date().toISOString().split('T')[0])
const submitMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const testItems = ref([] as Array<{
  id: string
  name: string
  unit: string
  score: number
  scoreText: string
  calculatedScore: number
  level: string
}>)  

// 权限控制
const isAdmin = computed(() => authStore.isAdmin())
const isCoach = computed(() => authStore.isCoach())
const currentOrganizationId = computed(() => authStore.currentUser?.organizationId || '1')

// 可访问的学生（教练只能看到分配给他们的学生）
const accessibleStudents = computed(() => {
  const orgStudents = attendanceStore.getStudentsByOrganization(currentOrganizationId.value)
  if (isAdmin.value) {
    return orgStudents
  } else if (isCoach.value) {
    return orgStudents.filter(student => authStore.canAccessStudent(student.id))
  }
  return []
})

const updateTestItems = () => {
  if (studentGender.value === 'male') {
    // 男生项目：1000米跑、立定跳远、引体向上、坐位体前屈
    testItems.value = [
      { id: '1', name: '1000米跑', unit: '分秒', score: 0, scoreText: '', calculatedScore: 0, level: '不及格' },
      { id: '2', name: '立定跳远', unit: '厘米', score: 0, scoreText: '', calculatedScore: 0, level: '不及格' },
      { id: '3', name: '引体向上', unit: '个', score: 0, scoreText: '', calculatedScore: 0, level: '不及格' },
      { id: '4', name: '坐位体前屈', unit: '厘米', score: 0, scoreText: '', calculatedScore: 0, level: '不及格' }
    ]
  } else if (studentGender.value === 'female') {
    // 女生项目：800米跑、立定跳远、仰卧起坐、坐位体前屈
    testItems.value = [
      { id: '1', name: '800米跑', unit: '分秒', score: 0, scoreText: '', calculatedScore: 0, level: '不及格' },
      { id: '2', name: '立定跳远', unit: '厘米', score: 0, scoreText: '', calculatedScore: 0, level: '不及格' },
      { id: '3', name: '仰卧起坐', unit: '个/分钟', score: 0, scoreText: '', calculatedScore: 0, level: '不及格' },
      { id: '4', name: '坐位体前屈', unit: '厘米', score: 0, scoreText: '', calculatedScore: 0, level: '不及格' }
    ]
  } else {
    testItems.value = []
  }
}

// 处理跑步项目的时间输入
const handleRunInput = (index: number) => {
  const item = testItems.value[index]
  const input = item.scoreText
  
  // 解析时间格式：3'40" 或 3:40
  const match = input.match(/(\d+)[':](\d+)/)
  if (match) {
    const minutes = parseInt(match[1])
    const seconds = parseInt(match[2])
    const totalSeconds = minutes * 60 + seconds
    item.score = totalSeconds
    updateItemLevel(index)
    calculateItemScore(index)
  } else {
    item.score = 0
    item.level = '不及格'
    item.calculatedScore = 0
  }
}

// 计算单个项目的分数
const calculateItemScore = (index: number) => {
  const item = testItems.value[index]
  let itemScore = 0
  
  if (item.score > 0) {
    if (item.name === '1000米跑') {
      // 男生1000米跑
      if (item.score <= 220) itemScore = 100 + calculateRunBonus('male', 220 - item.score) // 3'40"及以下，100分+加分
      else if (item.score <= 225) itemScore = 95 // 3'45"
      else if (item.score <= 230) itemScore = 90 // 3'50"
      else if (item.score <= 237) itemScore = 85 // 3'57"
      else if (item.score <= 245) itemScore = 80 // 4'05"
      else if (item.score <= 250) itemScore = 78 // 4'10"
      else if (item.score <= 255) itemScore = 76 // 4'15"
      else if (item.score <= 260) itemScore = 74 // 4'20"
      else if (item.score <= 265) itemScore = 72 // 4'25"
      else if (item.score <= 270) itemScore = 70 // 4'30"
      else if (item.score <= 275) itemScore = 68 // 4'35"
      else if (item.score <= 280) itemScore = 66 // 4'40"
      else if (item.score <= 285) itemScore = 64 // 4'45"
      else if (item.score <= 290) itemScore = 62 // 4'50"
      else if (item.score <= 295) itemScore = 60 // 4'55"
      else if (item.score <= 315) itemScore = 50 // 5'15"
      else if (item.score <= 335) itemScore = 40 // 5'35"
      else if (item.score <= 355) itemScore = 30 // 5'55"
      else if (item.score <= 375) itemScore = 20 // 6'15"
      else if (item.score <= 395) itemScore = 10 // 6'35"
      else itemScore = 0
    } else if (item.name === '800米跑') {
      // 女生800米跑
      if (item.score <= 205) itemScore = 100 + calculateRunBonus('female', 205 - item.score) // 3'25"及以下，100分+加分
      else if (item.score <= 212) itemScore = 95 // 3'32"
      else if (item.score <= 219) itemScore = 90 // 3'39"
      else if (item.score <= 227) itemScore = 85 // 3'47"
      else if (item.score <= 235) itemScore = 80 // 3'55"
      else if (item.score <= 240) itemScore = 78 // 4'00"
      else if (item.score <= 245) itemScore = 76 // 4'05"
      else if (item.score <= 250) itemScore = 74 // 4'10"
      else if (item.score <= 255) itemScore = 72 // 4'15"
      else if (item.score <= 260) itemScore = 70 // 4'20"
      else if (item.score <= 265) itemScore = 68 // 4'25"
      else if (item.score <= 270) itemScore = 66 // 4'30"
      else if (item.score <= 275) itemScore = 64 // 4'35"
      else if (item.score <= 280) itemScore = 62 // 4'40"
      else if (item.score <= 285) itemScore = 60 // 4'45"
      else if (item.score <= 295) itemScore = 50 // 4'55"
      else if (item.score <= 305) itemScore = 40 // 5'05"
      else if (item.score <= 315) itemScore = 30 // 5'15"
      else if (item.score <= 325) itemScore = 20 // 5'25"
      else if (item.score <= 335) itemScore = 10 // 5'35"
      else itemScore = 0
    } else if (item.name === '立定跳远') {
      // 立定跳远，距离越远分数越高
      if (studentGender.value === 'male') {
        if (item.score >= 250) itemScore = 100
        else if (item.score >= 245) itemScore = 95
        else if (item.score >= 240) itemScore = 90
        else if (item.score >= 233) itemScore = 85
        else if (item.score >= 225) itemScore = 80
        else if (item.score >= 221) itemScore = 78
        else if (item.score >= 217) itemScore = 76
        else if (item.score >= 213) itemScore = 74
        else if (item.score >= 209) itemScore = 72
        else if (item.score >= 205) itemScore = 70
        else if (item.score >= 201) itemScore = 68
        else if (item.score >= 197) itemScore = 66
        else if (item.score >= 193) itemScore = 64
        else if (item.score >= 189) itemScore = 62
        else if (item.score >= 185) itemScore = 60
        else if (item.score >= 180) itemScore = 50
        else if (item.score >= 175) itemScore = 40
        else if (item.score >= 170) itemScore = 30
        else if (item.score >= 165) itemScore = 20
        else if (item.score >= 160) itemScore = 10
        else itemScore = 0
      } else {
        if (item.score >= 202) itemScore = 100
        else if (item.score >= 196) itemScore = 95
        else if (item.score >= 190) itemScore = 90
        else if (item.score >= 183) itemScore = 85
        else if (item.score >= 176) itemScore = 80
        else if (item.score >= 173) itemScore = 78
        else if (item.score >= 170) itemScore = 76
        else if (item.score >= 167) itemScore = 74
        else if (item.score >= 164) itemScore = 72
        else if (item.score >= 161) itemScore = 70
        else if (item.score >= 158) itemScore = 68
        else if (item.score >= 155) itemScore = 66
        else if (item.score >= 152) itemScore = 64
        else if (item.score >= 149) itemScore = 62
        else if (item.score >= 146) itemScore = 60
        else if (item.score >= 141) itemScore = 50
        else if (item.score >= 136) itemScore = 40
        else if (item.score >= 131) itemScore = 30
        else if (item.score >= 126) itemScore = 20
        else if (item.score >= 121) itemScore = 10
        else itemScore = 0
      }
    } else if (item.name === '引体向上') {
      // 引体向上，个数越多分数越高
      if (item.score >= 15) itemScore = 100 + calculatePullUpBonus(item.score - 15) // 100分+加分
      else if (item.score >= 14) itemScore = 95
      else if (item.score >= 13) itemScore = 90
      else if (item.score >= 12) itemScore = 85
      else if (item.score >= 11) itemScore = 80
      else if (item.score >= 10) itemScore = 78
      else if (item.score >= 9) itemScore = 74
      else if (item.score >= 8) itemScore = 68
      else if (item.score >= 7) itemScore = 64
      else if (item.score >= 6) itemScore = 60
      else if (item.score >= 5) itemScore = 50
      else if (item.score >= 4) itemScore = 40
      else if (item.score >= 3) itemScore = 30
      else if (item.score >= 2) itemScore = 20
      else if (item.score >= 1) itemScore = 10
      else itemScore = 0
    } else if (item.name === '仰卧起坐') {
      // 仰卧起坐，个数越多越好
      if (item.score >= 52) itemScore = 100 + calculateSitUpBonus(item.score - 52) // 100分+加分
      else if (item.score >= 50) itemScore = 95
      else if (item.score >= 48) itemScore = 90
      else if (item.score >= 45) itemScore = 85
      else if (item.score >= 42) itemScore = 80
      else if (item.score >= 40) itemScore = 78
      else if (item.score >= 38) itemScore = 76
      else if (item.score >= 36) itemScore = 74
      else if (item.score >= 34) itemScore = 72
      else if (item.score >= 32) itemScore = 70
      else if (item.score >= 30) itemScore = 68
      else if (item.score >= 28) itemScore = 66
      else if (item.score >= 26) itemScore = 64
      else if (item.score >= 24) itemScore = 62
      else if (item.score >= 22) itemScore = 60
      else if (item.score >= 20) itemScore = 50
      else if (item.score >= 18) itemScore = 40
      else if (item.score >= 16) itemScore = 30
      else if (item.score >= 14) itemScore = 20
      else if (item.score >= 12) itemScore = 10
      else itemScore = 0
    } else if (item.name === '坐位体前屈') {
      // 坐位体前屈，距离越远分数越高
      if (studentGender.value === 'male') {
        if (item.score >= 21.6) itemScore = 100
        else if (item.score >= 19.7) itemScore = 95
        else if (item.score >= 17.8) itemScore = 90
        else if (item.score >= 15.8) itemScore = 85
        else if (item.score >= 13.8) itemScore = 80
        else if (item.score >= 12.4) itemScore = 78
        else if (item.score >= 11.0) itemScore = 76
        else if (item.score >= 9.6) itemScore = 74
        else if (item.score >= 8.2) itemScore = 72
        else if (item.score >= 6.8) itemScore = 70
        else if (item.score >= 5.4) itemScore = 68
        else if (item.score >= 4.0) itemScore = 66
        else if (item.score >= 2.6) itemScore = 64
        else if (item.score >= 1.2) itemScore = 62
        else if (item.score >= -0.2) itemScore = 60
        else if (item.score >= -1.4) itemScore = 50
        else if (item.score >= -2.6) itemScore = 40
        else if (item.score >= -3.8) itemScore = 30
        else if (item.score >= -5.0) itemScore = 20
        else if (item.score >= -6.2) itemScore = 10
        else itemScore = 0
      } else {
        if (item.score >= 23.5) itemScore = 100
        else if (item.score >= 21.8) itemScore = 95
        else if (item.score >= 20.1) itemScore = 90
        else if (item.score >= 18.4) itemScore = 85
        else if (item.score >= 16.7) itemScore = 80
        else if (item.score >= 15.4) itemScore = 78
        else if (item.score >= 14.1) itemScore = 76
        else if (item.score >= 12.8) itemScore = 74
        else if (item.score >= 11.5) itemScore = 72
        else if (item.score >= 10.2) itemScore = 70
        else if (item.score >= 8.9) itemScore = 68
        else if (item.score >= 7.6) itemScore = 66
        else if (item.score >= 6.3) itemScore = 64
        else if (item.score >= 5.0) itemScore = 62
        else if (item.score >= 3.7) itemScore = 60
        else if (item.score >= 2.9) itemScore = 50
        else if (item.score >= 2.1) itemScore = 40
        else if (item.score >= 1.3) itemScore = 30
        else if (item.score >= 0.5) itemScore = 20
        else if (item.score >= -0.3) itemScore = 10
        else itemScore = 0
      }
    }
  }
  
  item.calculatedScore = itemScore
}

// 初始化测试项目
updateTestItems()

// 可访问的学生记录（教练只能看到分配给他们的学生的记录）
const studentRecords = computed(() => {
  if (!selectedStudentId.value) return []
  // 只有当学生可以被访问时才显示记录
  if (!authStore.canAccessStudent(selectedStudentId.value)) return []
  return fitnessTestStore.getTestRecordsByStudent(selectedStudentId.value)
    .filter(record => record.organizationId === currentOrganizationId.value)
})

const updateItemLevel = (index: number) => {
  const item = testItems.value[index]
  if (item.score > 0) {
    // 根据山东潍坊中考体测评分标准计算等级
    if (item.name === '1000米跑') {
      // 男生1000米跑
      if (item.score <= 230) item.level = '优秀' // 3'50"及以下
      else if (item.score <= 245) item.level = '良好' // 4'05"及以下
      else if (item.score <= 295) item.level = '及格' // 4'55"及以下
      else item.level = '不及格' // 4'55"以上
    } else if (item.name === '800米跑') {
      // 女生800米跑
      if (item.score <= 219) item.level = '优秀' // 3'39"及以下
      else if (item.score <= 235) item.level = '良好' // 3'55"及以下
      else if (item.score <= 285) item.level = '及格' // 4'45"及以下
      else item.level = '不及格' // 4'45"以上
    } else if (item.name === '立定跳远') {
      // 立定跳远，距离越远越好
      if (studentGender.value === 'male') {
        if (item.score >= 240) item.level = '优秀' // 240厘米及以上
        else if (item.score >= 225) item.level = '良好' // 225厘米及以上
        else if (item.score >= 185) item.level = '及格' // 185厘米及以上
        else item.level = '不及格' // 185厘米以下
      } else {
        if (item.score >= 190) item.level = '优秀' // 190厘米及以上
        else if (item.score >= 176) item.level = '良好' // 176厘米及以上
        else if (item.score >= 146) item.level = '及格' // 146厘米及以上
        else item.level = '不及格' // 146厘米以下
      }
    } else if (item.name === '引体向上') {
      // 引体向上，个数越多越好
      if (item.score >= 13) item.level = '优秀' // 13个及以上
      else if (item.score >= 11) item.level = '良好' // 11个及以上
      else if (item.score >= 6) item.level = '及格' // 6个及以上
      else item.level = '不及格' // 6个以下
    } else if (item.name === '仰卧起坐') {
      // 仰卧起坐，个数越多越好
      if (item.score >= 48) item.level = '优秀' // 48个及以上
      else if (item.score >= 42) item.level = '良好' // 42个及以上
      else if (item.score >= 22) item.level = '及格' // 22个及以上
      else item.level = '不及格' // 22个以下
    } else if (item.name === '坐位体前屈') {
      // 坐位体前屈，距离越远越好
      if (studentGender.value === 'male') {
        if (item.score >= 17.8) item.level = '优秀' // 17.8厘米及以上
        else if (item.score >= 13.8) item.level = '良好' // 13.8厘米及以上
        else if (item.score >= -0.2) item.level = '及格' // -0.2厘米及以上
        else item.level = '不及格' // -0.2厘米以下
      } else {
        if (item.score >= 20.1) item.level = '优秀' // 20.1厘米及以上
        else if (item.score >= 16.7) item.level = '良好' // 16.7厘米及以上
        else if (item.score >= 3.7) item.level = '及格' // 3.7厘米及以上
        else item.level = '不及格' // 3.7厘米以下
      }
    }
    
    // 计算项目分数
    calculateItemScore(index)
  } else {
    item.level = '不及格'
    item.calculatedScore = 0
  }
}

const handleSubmit = () => {
  if (selectedStudentId.value && testDate.value && studentGender.value) {
    // 确保所有项目都有测试值
    const allScored = testItems.value.every(item => item.score > 0)
    if (!allScored) {
      submitMessage.value = {
        type: 'error',
        text: '请填写所有测试项目的值'
      }
      setTimeout(() => {
        submitMessage.value = null
      }, 3000)
      return
    }
    
    // 根据山东潍坊中考体测评分标准计算总分
    let totalScore = 0
    testItems.value.forEach(item => {
      let itemScore = 0
      if (item.name === '1000米跑' || item.name === '800米跑') {
        // 跑步项目，时间越短分数越高
        if (item.name === '1000米跑') {
          // 男生1000米跑
          if (item.score <= 220) itemScore = 100 + calculateRunBonus('male', 220 - item.score) // 3'40"及以下，100分+加分
          else if (item.score <= 225) itemScore = 95 // 3'45"
          else if (item.score <= 230) itemScore = 90 // 3'50"
          else if (item.score <= 237) itemScore = 85 // 3'57"
          else if (item.score <= 245) itemScore = 80 // 4'05"
          else if (item.score <= 250) itemScore = 78 // 4'10"
          else if (item.score <= 255) itemScore = 76 // 4'15"
          else if (item.score <= 260) itemScore = 74 // 4'20"
          else if (item.score <= 265) itemScore = 72 // 4'25"
          else if (item.score <= 270) itemScore = 70 // 4'30"
          else if (item.score <= 275) itemScore = 68 // 4'35"
          else if (item.score <= 280) itemScore = 66 // 4'40"
          else if (item.score <= 285) itemScore = 64 // 4'45"
          else if (item.score <= 290) itemScore = 62 // 4'50"
          else if (item.score <= 295) itemScore = 60 // 4'55"
          else if (item.score <= 315) itemScore = 50 // 5'15"
          else if (item.score <= 335) itemScore = 40 // 5'35"
          else if (item.score <= 355) itemScore = 30 // 5'55"
          else if (item.score <= 375) itemScore = 20 // 6'15"
          else if (item.score <= 395) itemScore = 10 // 6'35"
          else itemScore = 0
        } else {
          // 女生800米跑
          if (item.score <= 205) itemScore = 100 + calculateRunBonus('female', 205 - item.score) // 3'25"及以下，100分+加分
          else if (item.score <= 212) itemScore = 95 // 3'32"
          else if (item.score <= 219) itemScore = 90 // 3'39"
          else if (item.score <= 227) itemScore = 85 // 3'47"
          else if (item.score <= 235) itemScore = 80 // 3'55"
          else if (item.score <= 240) itemScore = 78 // 4'00"
          else if (item.score <= 245) itemScore = 76 // 4'05"
          else if (item.score <= 250) itemScore = 74 // 4'10"
          else if (item.score <= 255) itemScore = 72 // 4'15"
          else if (item.score <= 260) itemScore = 70 // 4'20"
          else if (item.score <= 265) itemScore = 68 // 4'25"
          else if (item.score <= 270) itemScore = 66 // 4'30"
          else if (item.score <= 275) itemScore = 64 // 4'35"
          else if (item.score <= 280) itemScore = 62 // 4'40"
          else if (item.score <= 285) itemScore = 60 // 4'45"
          else if (item.score <= 295) itemScore = 50 // 4'55"
          else if (item.score <= 305) itemScore = 40 // 5'05"
          else if (item.score <= 315) itemScore = 30 // 5'15"
          else if (item.score <= 325) itemScore = 20 // 5'25"
          else if (item.score <= 335) itemScore = 10 // 5'35"
          else itemScore = 0
        }
      } else if (item.name === '立定跳远') {
        // 立定跳远，距离越远分数越高
        if (studentGender.value === 'male') {
          if (item.score >= 250) itemScore = 100
          else if (item.score >= 245) itemScore = 95
          else if (item.score >= 240) itemScore = 90
          else if (item.score >= 233) itemScore = 85
          else if (item.score >= 225) itemScore = 80
          else if (item.score >= 221) itemScore = 78
          else if (item.score >= 217) itemScore = 76
          else if (item.score >= 213) itemScore = 74
          else if (item.score >= 209) itemScore = 72
          else if (item.score >= 205) itemScore = 70
          else if (item.score >= 201) itemScore = 68
          else if (item.score >= 197) itemScore = 66
          else if (item.score >= 193) itemScore = 64
          else if (item.score >= 189) itemScore = 62
          else if (item.score >= 185) itemScore = 60
          else if (item.score >= 180) itemScore = 50
          else if (item.score >= 175) itemScore = 40
          else if (item.score >= 170) itemScore = 30
          else if (item.score >= 165) itemScore = 20
          else if (item.score >= 160) itemScore = 10
          else itemScore = 0
        } else {
          if (item.score >= 202) itemScore = 100
          else if (item.score >= 196) itemScore = 95
          else if (item.score >= 190) itemScore = 90
          else if (item.score >= 183) itemScore = 85
          else if (item.score >= 176) itemScore = 80
          else if (item.score >= 173) itemScore = 78
          else if (item.score >= 170) itemScore = 76
          else if (item.score >= 167) itemScore = 74
          else if (item.score >= 164) itemScore = 72
          else if (item.score >= 161) itemScore = 70
          else if (item.score >= 158) itemScore = 68
          else if (item.score >= 155) itemScore = 66
          else if (item.score >= 152) itemScore = 64
          else if (item.score >= 149) itemScore = 62
          else if (item.score >= 146) itemScore = 60
          else if (item.score >= 141) itemScore = 50
          else if (item.score >= 136) itemScore = 40
          else if (item.score >= 131) itemScore = 30
          else if (item.score >= 126) itemScore = 20
          else if (item.score >= 121) itemScore = 10
          else itemScore = 0
        }
      } else if (item.name === '引体向上') {
        // 引体向上，个数越多分数越高
        if (item.score >= 15) itemScore = 100 + calculatePullUpBonus(item.score - 15) // 100分+加分
        else if (item.score >= 14) itemScore = 95
        else if (item.score >= 13) itemScore = 90
        else if (item.score >= 12) itemScore = 85
        else if (item.score >= 11) itemScore = 80
        else if (item.score >= 10) itemScore = 78
        else if (item.score >= 9) itemScore = 74
        else if (item.score >= 8) itemScore = 68
        else if (item.score >= 7) itemScore = 64
        else if (item.score >= 6) itemScore = 60
        else if (item.score >= 5) itemScore = 50
        else if (item.score >= 4) itemScore = 40
        else if (item.score >= 3) itemScore = 30
        else if (item.score >= 2) itemScore = 20
        else if (item.score >= 1) itemScore = 10
        else itemScore = 0
      } else if (item.name === '仰卧起坐') {
        // 仰卧起坐，个数越多分数越高
        if (item.score >= 52) itemScore = 100 + calculateSitUpBonus(item.score - 52) // 100分+加分
        else if (item.score >= 50) itemScore = 95
        else if (item.score >= 48) itemScore = 90
        else if (item.score >= 45) itemScore = 85
        else if (item.score >= 42) itemScore = 80
        else if (item.score >= 40) itemScore = 78
        else if (item.score >= 38) itemScore = 76
        else if (item.score >= 36) itemScore = 74
        else if (item.score >= 34) itemScore = 72
        else if (item.score >= 32) itemScore = 70
        else if (item.score >= 30) itemScore = 68
        else if (item.score >= 28) itemScore = 66
        else if (item.score >= 26) itemScore = 64
        else if (item.score >= 24) itemScore = 62
        else if (item.score >= 22) itemScore = 60
        else if (item.score >= 20) itemScore = 50
        else if (item.score >= 18) itemScore = 40
        else if (item.score >= 16) itemScore = 30
        else if (item.score >= 14) itemScore = 20
        else if (item.score >= 12) itemScore = 10
        else itemScore = 0
      } else if (item.name === '坐位体前屈') {
        // 坐位体前屈，距离越远分数越高
        if (studentGender.value === 'male') {
          if (item.score >= 21.6) itemScore = 100
          else if (item.score >= 19.7) itemScore = 95
          else if (item.score >= 17.8) itemScore = 90
          else if (item.score >= 15.8) itemScore = 85
          else if (item.score >= 13.8) itemScore = 80
          else if (item.score >= 12.4) itemScore = 78
          else if (item.score >= 11.0) itemScore = 76
          else if (item.score >= 9.6) itemScore = 74
          else if (item.score >= 8.2) itemScore = 72
          else if (item.score >= 6.8) itemScore = 70
          else if (item.score >= 5.4) itemScore = 68
          else if (item.score >= 4.0) itemScore = 66
          else if (item.score >= 2.6) itemScore = 64
          else if (item.score >= 1.2) itemScore = 62
          else if (item.score >= -0.2) itemScore = 60
          else if (item.score >= -1.4) itemScore = 50
          else if (item.score >= -2.6) itemScore = 40
          else if (item.score >= -3.8) itemScore = 30
          else if (item.score >= -5.0) itemScore = 20
          else if (item.score >= -6.2) itemScore = 10
          else itemScore = 0
        } else {
          if (item.score >= 23.5) itemScore = 100
          else if (item.score >= 21.8) itemScore = 95
          else if (item.score >= 20.1) itemScore = 90
          else if (item.score >= 18.4) itemScore = 85
          else if (item.score >= 16.7) itemScore = 80
          else if (item.score >= 15.4) itemScore = 78
          else if (item.score >= 14.1) itemScore = 76
          else if (item.score >= 12.8) itemScore = 74
          else if (item.score >= 11.5) itemScore = 72
          else if (item.score >= 10.2) itemScore = 70
          else if (item.score >= 8.9) itemScore = 68
          else if (item.score >= 7.6) itemScore = 66
          else if (item.score >= 6.3) itemScore = 64
          else if (item.score >= 5.0) itemScore = 62
          else if (item.score >= 3.7) itemScore = 60
          else if (item.score >= 2.9) itemScore = 50
          else if (item.score >= 2.1) itemScore = 40
          else if (item.score >= 1.3) itemScore = 30
          else if (item.score >= 0.5) itemScore = 20
          else if (item.score >= -0.3) itemScore = 10
          else itemScore = 0
        }
      }
      totalScore += itemScore
    })
    
    // 计算平均分
    totalScore = Math.round(totalScore / testItems.value.length)
    
    // 分析强弱项
    const strengths = testItems.value.filter(item => item.level === '优秀').map(item => item.name)
    const weaknesses = testItems.value.filter(item => item.level === '不及格').map(item => item.name)
    
    // 计算总体等级
    let overallLevel: '优秀' | '良好' | '及格' | '不及格' = '及格'
    if (totalScore >= 90) overallLevel = '优秀'
    else if (totalScore >= 75) overallLevel = '良好'
    else if (totalScore >= 60) overallLevel = '及格'
    else overallLevel = '不及格'
    
    // 添加测试记录
    fitnessTestStore.addTestRecord({
      studentId: selectedStudentId.value,
      date: testDate.value,
      items: [...testItems.value],
      totalScore,
      overallLevel,
      strengths,
      weaknesses,
      organizationId: currentOrganizationId.value
    })
    
    submitMessage.value = {
      type: 'success',
      text: '体测报告生成成功'
    }
    
    // 3秒后清除消息
    setTimeout(() => {
      submitMessage.value = null
    }, 3000)
  } else {
    submitMessage.value = {
      type: 'error',
      text: '请选择学员和性别'
    }
    setTimeout(() => {
      submitMessage.value = null
    }, 3000)
  }
}

const getStudentName = (id: string) => {
  const student = attendanceStore.getStudentById(id)
  return student ? student.name : '未知学员'
}

// 计算仰卧起坐加分
const calculateSitUpBonus = (extraReps: number): number => {
  // 女生仰卧起坐加分表：13次对应10分，12次对应9分，...，2次对应1分
  const bonusTable = {
    13: 10,
    12: 9,
    11: 8,
    10: 7,
    9: 6,
    8: 5,
    7: 4,
    6: 3,
    4: 2,
    2: 1
  }
  
  // 找到最接近的加分次数
  const bonusKeys = Object.keys(bonusTable).map(Number).sort((a, b) => b - a)
  for (const key of bonusKeys) {
    if (extraReps >= key) {
      return bonusTable[key]
    }
  }
  return 0
}

// 计算引体向上加分
const calculatePullUpBonus = (extraReps: number): number => {
  // 男生引体向上加分表：10次对应10分，9次对应9分，...，1次对应1分
  if (extraReps >= 10) return 10
  if (extraReps >= 9) return 9
  if (extraReps >= 8) return 8
  if (extraReps >= 7) return 7
  if (extraReps >= 6) return 6
  if (extraReps >= 5) return 5
  if (extraReps >= 4) return 4
  if (extraReps >= 3) return 3
  if (extraReps >= 2) return 2
  if (extraReps >= 1) return 1
  return 0
}

// 计算跑步项目加分
const calculateRunBonus = (gender: 'male' | 'female', extraSeconds: number): number => {
  if (gender === 'male') {
    // 男生1000米跑加分表：-35"对应10分，-32"对应9分，...，-4"对应1分
    if (extraSeconds >= 35) return 10
    if (extraSeconds >= 32) return 9
    if (extraSeconds >= 29) return 8
    if (extraSeconds >= 26) return 7
    if (extraSeconds >= 23) return 6
    if (extraSeconds >= 20) return 5
    if (extraSeconds >= 16) return 4
    if (extraSeconds >= 12) return 3
    if (extraSeconds >= 8) return 2
    if (extraSeconds >= 4) return 1
  } else {
    // 女生800米跑加分表：-50"对应10分，-45"对应9分，...，-5"对应1分
    if (extraSeconds >= 50) return 10
    if (extraSeconds >= 45) return 9
    if (extraSeconds >= 40) return 8
    if (extraSeconds >= 35) return 7
    if (extraSeconds >= 30) return 6
    if (extraSeconds >= 25) return 5
    if (extraSeconds >= 20) return 4
    if (extraSeconds >= 15) return 3
    if (extraSeconds >= 10) return 2
    if (extraSeconds >= 5) return 1
  }
  return 0
}
</script>

<style scoped>
.fitness-test {
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
  margin: 15px 0 10px;
}

h5 {
  color: #95a5a6;
  margin: 10px 0;
}

.input-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.input-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
input[type="date"],
input[type="number"],
select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.test-items {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.test-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.test-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
  color: #34495e;
}

.unit {
  margin-left: 10px;
  color: #7f8c8d;
  font-weight: normal;
}

.item-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-size: 14px;
  color: #7f8c8d;
}

.level-display {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-display {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
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
  align-self: flex-start;
}

button:hover {
  background-color: #2980b9;
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
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

.report-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.student-reports {
  margin-top: 20px;
}

.report-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s ease;
}

.report-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.total-score {
  font-weight: bold;
  color: #3498db;
}

.test-results {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
}

.level-优秀 {
  color: #27ae60;
  font-weight: bold;
}

.level-良好 {
  color: #3498db;
  font-weight: bold;
}

.level-及格 {
  color: #f39c12;
  font-weight: bold;
}

.level-不及格 {
  color: #e74c3c;
  font-weight: bold;
}

.analysis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.strengths,
.weaknesses {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px 0;
  border-bottom: 1px solid #e0e0e0;
}

li:last-child {
  border-bottom: none;
}

.no-reports,
.select-student {
  text-align: center;
  color: #999;
  padding: 60px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fitness-test {
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
  
  .input-section,
  .report-section {
    padding: 20px;
  }
  
  .item-inputs {
    grid-template-columns: 1fr;
  }
  
  .analysis {
    grid-template-columns: 1fr;
  }
  
  button {
    padding: 10px 20px;
    font-size: 14px;
    align-self: stretch;
  }
  
  table {
    font-size: 14px;
  }
  
  th,
  td {
    padding: 8px;
  }
  
  .report-card {
    padding: 15px;
  }
  
  .test-items {
    padding: 15px;
  }
  
  .no-reports,
  .select-student {
    padding: 40px;
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .fitness-test {
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
  
  .input-section,
  .report-section {
    padding: 15px;
  }
  
  input[type="text"],
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
  
  .report-card {
    padding: 10px;
  }
  
  .test-items {
    padding: 10px;
  }
  
  .no-reports,
  .select-student {
    padding: 30px;
  }
}
</style>