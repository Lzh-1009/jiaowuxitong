import { defineStore } from 'pinia'
import { useAttendanceStore } from './attendance'

// 加上这一行，解决部署/开发警告
if (import.meta.hot) {
  import.meta.hot.accept()
}

interface User {
  id: string
  username: string
  password: string
  role: 'superadmin' | 'admin' | 'coach'
  name: string
  assignedStudents: string[]
  phone?: string
  organizationId: string
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    // 从 localStorage 读取数据（持久化数据）
    let users: User[] = []
    let organizations: Array<{ id: string; name: string }> = []
    let systemNames: Record<string, string> = {}
    
    try {
      users = JSON.parse(localStorage.getItem('auth-users') || '[]') as User[]
      organizations = JSON.parse(localStorage.getItem('auth-organizations') || '[]') as Array<{ id: string; name: string }>
      systemNames = JSON.parse(localStorage.getItem('auth-system-names') || '{}') as Record<string, string>
    } catch (e) {
      users = []
      organizations = []
      systemNames = {}
    }
    
    // 确保超级管理员用户存在
    const superAdminExists = users.some(u => u.username === 'superadmin')
    if (!superAdminExists) {
      users.unshift({
        id: '1',
        username: 'superadmin',
        password: 'superadmin123',
        role: 'superadmin',
        name: '超级管理员',
        assignedStudents: [],
        phone: '',
        organizationId: '0'
      })
      // 保存到 localStorage
      localStorage.setItem('auth-users', JSON.stringify(users))
    }
    
    // 确保默认机构存在
    const defaultOrgExists = organizations.some(o => o.id === '0')
    if (!defaultOrgExists) {
      organizations.unshift({
        id: '0',
        name: '超级管理机构'
      })
      organizations.push({
        id: '1',
        name: '默认机构'
      })
      // 保存到 localStorage
      localStorage.setItem('auth-organizations', JSON.stringify(organizations))
    }
    
    // 确保默认系统名称存在
    if (!systemNames['1']) {
      systemNames['1'] = '教务系统'
      localStorage.setItem('auth-system-names', JSON.stringify(systemNames))
    }
    
    // 从 sessionStorage 读取当前用户信息
    let currentUser: User | null = null
    try {
      currentUser = JSON.parse(sessionStorage.getItem('auth-current-user') || 'null') as User | null
    } catch (e) {
      currentUser = null
    }
    
    return {
      users,
      organizations,
      systemNames,
      currentUser
    }
  },
  getters: {
    coaches: (state) => state.users.filter(u => u.role === 'coach'),
    currentOrganizationCoaches: (state) => {
      if (!state.currentUser) return []
      return state.users.filter(u => u.role === 'coach' && u.organizationId === state.currentUser?.organizationId)
    },
    allOrganizations: (state) => state.organizations
  },
  actions: {
    login(username: string, password: string) {
      console.log('AuthStore login attempt:', username, password)
      console.log('Available users:', this.users)
      const user = this.users.find(u => u.username === username && u.password === password)
      console.log('Found user:', user)
      if (user) {
        this.currentUser = user
        sessionStorage.setItem('auth-current-user', JSON.stringify(user))
        console.log('Login successful, current user:', this.currentUser)
        return true
      }
      console.log('Login failed')
      return false
    },
    clearLocalStorage() {
      localStorage.removeItem('auth-users')
      sessionStorage.removeItem('auth-current-user')
      localStorage.removeItem('auth-organizations')
      // 重新初始化数据
      this.$reset()
    },
    logout() {
      this.currentUser = null
      sessionStorage.setItem('auth-current-user', 'null')
    },
    addUser(user: Omit<User, 'id'>) {
      const newUser: User = {
        ...user,
        id: Date.now().toString()
      }
      this.users.push(newUser)
      localStorage.setItem('auth-users', JSON.stringify(this.users))
      return newUser
    },
    updateUser(id: string, updates: Partial<User>) {
      const index = this.users.findIndex(u => u.id === id)
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...updates }
        localStorage.setItem('auth-users', JSON.stringify(this.users))
        return this.users[index]
      }
      return null
    },
    deleteUser(id: string) {
      const index = this.users.findIndex(u => u.id === id)
      if (index !== -1) {
        this.users.splice(index, 1)
        localStorage.setItem('auth-users', JSON.stringify(this.users))
        return true
      }
      return false
    },
    assignStudentToCoach(coachId: string, studentId: string) {
      const coach = this.users.find(u => u.id === coachId && u.role === 'coach')
      if (coach && !coach.assignedStudents.includes(studentId)) {
        coach.assignedStudents.push(studentId)
        localStorage.setItem('auth-users', JSON.stringify(this.users))
        return true
      }
      return false
    },
    removeStudentFromCoach(coachId: string, studentId: string) {
      const coach = this.users.find(u => u.id === coachId && u.role === 'coach')
      if (coach) {
        const index = coach.assignedStudents.indexOf(studentId)
        if (index !== -1) {
          coach.assignedStudents.splice(index, 1)
          localStorage.setItem('auth-users', JSON.stringify(this.users))
          return true
        }
      }
      return false
    },
    isAuthenticated() {
      return this.currentUser !== null
    },
    isSuperAdmin() {
      return this.currentUser?.role === 'superadmin'
    },
    isAdmin() {
      return this.currentUser?.role === 'admin' || this.currentUser?.role === 'superadmin'
    },
    isCoach() {
      return this.currentUser?.role === 'coach'
    },
    canAccessStudent(studentId: string) {
      if (this.isAdmin()) return true
      if (this.isCoach()) {
        return this.currentUser?.assignedStudents.includes(studentId) || false
      }
      return false
    },
    canAccessOrganization(organizationId: string) {
      if (this.isSuperAdmin()) return true
      return this.currentUser?.organizationId === organizationId
    },
    registerCoach(username: string, password: string, name: string, phone?: string) {
      // 检查用户名是否已存在
      const existingUser = this.users.find(u => u.username === username)
      if (existingUser) {
        return false
      }
      
      const newCoach: User = {
        id: Date.now().toString(),
        username,
        password,
        role: 'coach',
        name,
        assignedStudents: [],
        phone,
        organizationId: this.currentUser?.organizationId || '1'
      }
      
      this.users.push(newCoach)
      localStorage.setItem('auth-users', JSON.stringify(this.users))
      
      // 同时在 attendanceStore 中添加对应的教练信息，使用相同的 ID
      const attendanceStore = useAttendanceStore()
      attendanceStore.addCoach({
        name: newCoach.name,
        teachingHours: 0,
        hourlyWage: 0,
        organizationId: newCoach.organizationId
      }, newCoach.id)
      
      return true
    },
    registerAdmin(username: string, password: string, name: string, phone?: string, organizationId?: string) {
      // 检查用户名是否已存在
      const existingUser = this.users.find(u => u.username === username)
      if (existingUser) {
        return false
      }
      
      const newAdmin: User = {
        id: Date.now().toString(),
        username,
        password,
        role: 'admin',
        name,
        assignedStudents: [],
        phone,
        organizationId: organizationId || this.currentUser?.organizationId || '1'
      }
      
      this.users.push(newAdmin)
      localStorage.setItem('auth-users', JSON.stringify(this.users))
      return true
    },
    addOrganization(name: string) {
      const newOrganization = {
        id: Date.now().toString(),
        name
      }
      // 使用扩展运算符创建新数组，确保 Vue 的响应式系统能够检测到变化
      this.organizations = [...this.organizations, newOrganization]
      localStorage.setItem('auth-organizations', JSON.stringify(this.organizations))
      return newOrganization
    },
    updateOrganization(id: string, name: string) {
      const index = this.organizations.findIndex(o => o.id === id)
      if (index !== -1) {
        // 使用扩展运算符创建新数组，确保 Vue 的响应式系统能够检测到变化
        this.organizations = this.organizations.map(organization => {
          if (organization.id === id) {
            return { ...organization, name }
          }
          return organization
        })
        localStorage.setItem('auth-organizations', JSON.stringify(this.organizations))
        return this.organizations[index]
      }
      return null
    },
    deleteOrganization(id: string) {
      // 不能删除超级管理机构
      if (id === '0') return false
      
      // 检查是否有用户属于该机构
      const hasUsers = this.users.some(u => u.organizationId === id)
      if (hasUsers) return false
      
      // 使用 filter 方法创建新数组，确保 Vue 的响应式系统能够检测到变化
      const newOrganizations = this.organizations.filter(organization => organization.id !== id)
      if (newOrganizations.length !== this.organizations.length) {
        this.organizations = newOrganizations
        localStorage.setItem('auth-organizations', JSON.stringify(this.organizations))
        return true
      }
      return false
    },
    updateCoach(coachId: string, updates: { name?: string; phone?: string; password?: string }) {
      const coach = this.users.find(u => u.id === coachId && u.role === 'coach')
      if (coach) {
        if (updates.name !== undefined) coach.name = updates.name
        if (updates.phone !== undefined) coach.phone = updates.phone
        if (updates.password) coach.password = updates.password
        
        // 如果是当前用户，也更新 currentUser
        if (this.currentUser?.id === coachId) {
          this.currentUser = { ...coach }
          sessionStorage.setItem('auth-current-user', JSON.stringify(this.currentUser))
        }
        
        localStorage.setItem('auth-users', JSON.stringify(this.users))
        return true
      }
      return false
    },
    deleteCoach(coachId: string) {
      const index = this.users.findIndex(u => u.id === coachId && u.role === 'coach')
      if (index !== -1) {
        this.users.splice(index, 1)
        localStorage.setItem('auth-users', JSON.stringify(this.users))
        
        // 同时在 attendanceStore 中删除对应的教练信息
        const attendanceStore = useAttendanceStore()
        attendanceStore.deleteCoach(coachId)
        
        return true
      }
      return false
    },
    changePassword(userId: string, oldPassword: string, newPassword: string) {
      const user = this.users.find(u => u.id === userId)
      if (user && user.password === oldPassword) {
        user.password = newPassword
        localStorage.setItem('auth-users', JSON.stringify(this.users))
        
        // 如果是当前用户，也更新 currentUser
        if (this.currentUser?.id === userId) {
          this.currentUser = { ...user }
          sessionStorage.setItem('auth-current-user', JSON.stringify(this.currentUser))
        }
        
        return true
      }
      return false
    },
    getSystemName() {
      if (!this.currentUser) return '教务系统'
      return this.systemNames[this.currentUser.organizationId] || '教务系统'
    },
    setSystemName(name: string) {
      if (!this.currentUser) return false
      this.systemNames[this.currentUser.organizationId] = name
      localStorage.setItem('auth-system-names', JSON.stringify(this.systemNames))
      return true
    }
  }
})