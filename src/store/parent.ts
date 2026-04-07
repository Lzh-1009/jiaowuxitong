import { defineStore } from 'pinia'

interface Notification {
  id: string
  studentId: string
  title: string
  content: string
  type: 'class_reminder' | 'schedule_change' | 'activity' | 'other'
  date: string
  isRead: boolean
}

interface PointRecord {
  id: string
  studentId: string
  points: number
  reason: string
  date: string
}

export const useParentStore = defineStore('parent', {
  state: () => ({
    notifications: [
      {
        id: '1',
        studentId: '1',
        title: '上课提醒',
        content: '今天下午3点有篮球课，请准时参加',
        type: 'class_reminder',
        date: '2026-04-05',
        isRead: false
      },
      {
        id: '2',
        studentId: '1',
        title: '调课通知',
        content: '原定明天的课程调整到后天下午4点',
        type: 'schedule_change',
        date: '2026-04-04',
        isRead: true
      },
      {
        id: '3',
        studentId: '2',
        title: '活动预告',
        content: '本周末将举行亲子运动会，欢迎家长参加',
        type: 'activity',
        date: '2026-04-05',
        isRead: false
      }
    ] as Notification[],
    pointRecords: [
      {
        id: '1',
        studentId: '1',
        points: 10,
        reason: '按时上课',
        date: '2026-04-04'
      },
      {
        id: '2',
        studentId: '1',
        points: 5,
        reason: '课堂表现优秀',
        date: '2026-04-03'
      },
      {
        id: '3',
        studentId: '2',
        points: 8,
        reason: '按时上课',
        date: '2026-04-04'
      }
    ] as PointRecord[]
  }),
  actions: {
    addNotification(notification: Omit<Notification, 'id' | 'isRead'>) {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        isRead: false
      }
      this.notifications.push(newNotification)
      return newNotification
    },
    markNotificationAsRead(id: string) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.isRead = true
      }
    },
    getNotificationsByStudent(studentId: string) {
      return this.notifications.filter(n => n.studentId === studentId)
    },
    getUnreadNotificationsByStudent(studentId: string) {
      return this.getNotificationsByStudent(studentId).filter(n => !n.isRead)
    },
    addPointRecord(record: Omit<PointRecord, 'id'>) {
      const newRecord: PointRecord = {
        ...record,
        id: Date.now().toString()
      }
      this.pointRecords.push(newRecord)
      return newRecord
    },
    getPointRecordsByStudent(studentId: string) {
      return this.pointRecords.filter(r => r.studentId === studentId)
    },
    getTotalPointsByStudent(studentId: string) {
      return this.getPointRecordsByStudent(studentId).reduce((total, record) => total + record.points, 0)
    }
  }
})