import { defineStore } from 'pinia'
import { useStatisticsStore } from './statistics'
import { useFitnessTestStore } from './fitnessTest'

interface Student {
  id: string
  name: string
  remainingClasses: number
  totalClasses: number
  tuition: number // 应交学费
  paidTuition: number // 实缴学费
  organizationId: string
}

interface Coach {
  id: string
  name: string
  teachingHours: number
  hourlyWage: number // 每课时工资
  totalSalary: number // 已发工资
  organizationId: string
}

interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  coachId: string
  status: 'attended' | 'absent'
  organizationId: string
}

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    students: JSON.parse(localStorage.getItem('attendance-students') || '[]') as Student[],
    coaches: JSON.parse(localStorage.getItem('attendance-coaches') || '[]') as Coach[],
    attendanceRecords: JSON.parse(localStorage.getItem('attendance-records') || '[]') as AttendanceRecord[]
  }),

  actions: {
    checkIn(studentId: string, coachId: string, organizationId: string) {
      const student = this.students.find(s => s.id === studentId)
      const coach = this.coaches.find(c => c.id === coachId)
      
      if (student && student.remainingClasses > 0 && coach) {
        // 扣减课时
        student.remainingClasses--
        
        // 增加教练授课课时
        coach.teachingHours++
        
        // 记录签到
        this.attendanceRecords.push({
          id: Date.now().toString(),
          studentId,
          date: new Date().toISOString().split('T')[0],
          coachId,
          status: 'attended',
          organizationId
        })
        
        // 保存到 localStorage
        localStorage.setItem('attendance-students', JSON.stringify(this.students))
        localStorage.setItem('attendance-coaches', JSON.stringify(this.coaches))
        localStorage.setItem('attendance-records', JSON.stringify(this.attendanceRecords))
        
        return true
      }
      return false
    },
    addStudent(student: Omit<Student, 'id'>) {
      const newStudent: Student = {
        ...student,
        id: Date.now().toString()
      }
      this.students.push(newStudent)
      
      // 同步实缴学费到营收记录
      if (student.paidTuition > 0) {
        const statisticsStore = useStatisticsStore()
        statisticsStore.addRevenueRecord({
          date: new Date().toISOString().split('T')[0],
          amount: student.paidTuition,
          type: 'tuition',
          studentId: newStudent.id,
          organizationId: student.organizationId
        })
      }
      
      // 保存到 localStorage
      localStorage.setItem('attendance-students', JSON.stringify(this.students))
      
      return newStudent
    },
    updateStudent(id: string, updates: Partial<Student>) {
      const index = this.students.findIndex(s => s.id === id)
      if (index !== -1) {
        const oldStudent = { ...this.students[index] }
        this.students[index] = { ...this.students[index], ...updates }
        
        // 如果实缴学费发生变化，同步到营收记录
        if (updates.paidTuition !== undefined && updates.paidTuition > oldStudent.paidTuition) {
          const statisticsStore = useStatisticsStore()
          const amount = updates.paidTuition - oldStudent.paidTuition
          statisticsStore.addRevenueRecord({
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            type: 'tuition',
            studentId: id,
            organizationId: oldStudent.organizationId
          })
        }
        
        // 保存到 localStorage
        localStorage.setItem('attendance-students', JSON.stringify(this.students))
        
        return this.students[index]
      }
      return null
    },
    deleteStudent(id: string) {
      const index = this.students.findIndex(s => s.id === id)
      if (index !== -1) {
        // 删除学员
        this.students.splice(index, 1)
        
        // 删除相关的签到记录
        this.attendanceRecords = this.attendanceRecords.filter(record => record.studentId !== id)
        
        // 删除相关的营收记录
        const statisticsStore = useStatisticsStore()
        statisticsStore.revenueRecords = statisticsStore.revenueRecords.filter(record => record.studentId !== id)
        localStorage.setItem('statistics-revenue-records', JSON.stringify(statisticsStore.revenueRecords))
        
        // 删除相关的体测记录
        const fitnessTestStore = useFitnessTestStore()
        fitnessTestStore.deleteTestRecordsByStudent(id)
        
        // 保存到 localStorage
        localStorage.setItem('attendance-students', JSON.stringify(this.students))
        localStorage.setItem('attendance-records', JSON.stringify(this.attendanceRecords))
        
        return true
      }
      return false
    },
    addCoach(coach: Omit<Coach, 'id'>, id?: string) {
      const newCoach: Coach = {
        ...coach,
        totalSalary: 0, // 初始化已发工资为 0
        id: id || Date.now().toString()
      }
      this.coaches.push(newCoach)
      
      // 保存到 localStorage
      localStorage.setItem('attendance-coaches', JSON.stringify(this.coaches))
      
      return newCoach
    },
    updateCoach(id: string, updates: Partial<Coach>) {
      const index = this.coaches.findIndex(c => c.id === id)
      if (index !== -1) {
        this.coaches[index] = { ...this.coaches[index], ...updates }
        
        // 保存到 localStorage
        localStorage.setItem('attendance-coaches', JSON.stringify(this.coaches))
        
        return this.coaches[index]
      }
      return null
    },
    deleteCoach(id: string) {
      const index = this.coaches.findIndex(c => c.id === id)
      if (index !== -1) {
        this.coaches.splice(index, 1)
        
        // 保存到 localStorage
        localStorage.setItem('attendance-coaches', JSON.stringify(this.coaches))
        
        return true
      }
      return false
    },
    getStudentById(id: string) {
      return this.students.find(s => s.id === id)
    },
    getCoachById(id: string) {
      return this.coaches.find(c => c.id === id)
    },
    getAttendanceRecordsByDate(date: string) {
      return this.attendanceRecords.filter(r => r.date === date)
    },
    getStudentsByOrganization(organizationId: string) {
      return this.students.filter(s => s.organizationId === organizationId)
    },
    getCoachesByOrganization(organizationId: string) {
      return this.coaches.filter(c => c.organizationId === organizationId)
    },
    getAttendanceRecordsByOrganization(organizationId: string) {
      return this.attendanceRecords.filter(r => r.organizationId === organizationId)
    }
  }
})