import { defineStore } from 'pinia'

interface FitnessTestItem {
  id: string
  name: string
  unit: string
  standard: number
  score: number
  level: '优秀' | '良好' | '及格' | '不及格'
}

interface FitnessTestRecord {
  id: string
  studentId: string
  date: string
  items: FitnessTestItem[]
  totalScore: number
  overallLevel: '优秀' | '良好' | '及格' | '不及格'
  strengths: string[]
  weaknesses: string[]
}

export const useFitnessTestStore = defineStore('fitnessTest', {
  state: () => ({
    testRecords: JSON.parse(localStorage.getItem('fitness-test-records') || '[]') as FitnessTestRecord[]
  }),

  actions: {
    addTestRecord(record: Omit<FitnessTestRecord, 'id'>) {
      const newRecord: FitnessTestRecord = {
        ...record,
        id: Date.now().toString()
      }
      this.testRecords.push(newRecord)
      
      // 保存到 localStorage
      localStorage.setItem('fitness-test-records', JSON.stringify(this.testRecords))
      
      return newRecord
    },
    getTestRecordsByStudent(studentId: string) {
      return this.testRecords.filter(r => r.studentId === studentId)
    },
    getLatestTestRecord(studentId: string) {
      const records = this.getTestRecordsByStudent(studentId)
      if (records.length === 0) return null
      return records.sort((a, b) => b.date.localeCompare(a.date))[0]
    },
    calculateLevel(score: number, standard: number): '优秀' | '良好' | '及格' | '不及格' {
      const ratio = score / standard
      if (ratio >= 1.1) return '优秀'
      if (ratio >= 0.9) return '良好'
      if (ratio >= 0.7) return '及格'
      return '不及格'
    },
    analyzeStrengthsAndWeaknesses(items: FitnessTestItem[]) {
      const strengths: string[] = []
      const weaknesses: string[] = []
      
      items.forEach(item => {
        if (item.level === '优秀') {
          strengths.push(item.name)
        } else if (item.level === '不及格') {
          weaknesses.push(item.name)
        }
      })
      
      return { strengths, weaknesses }
    },
    calculateTotalScore(items: FitnessTestItem[]): number {
      let total = 0
      items.forEach(item => {
        const ratio = item.score / item.standard
        let score = 0
        if (ratio >= 1.1) score = 20
        else if (ratio >= 0.9) score = 16
        else if (ratio >= 0.7) score = 12
        else score = 8
        total += score
      })
      return total
    },
    deleteTestRecordsByStudent(studentId: string) {
      this.testRecords = this.testRecords.filter(record => record.studentId !== studentId)
      localStorage.setItem('fitness-test-records', JSON.stringify(this.testRecords))
    }
  }
})