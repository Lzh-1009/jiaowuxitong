import { defineStore } from 'pinia'

interface ClassContent {
  id: string
  title: string
  date: string
  coachId: string
  students: string[]
  photos: string[]
  videos: string[]
  comments: string
  aiReview: string
  voiceSuggestion: string
}

export const useClassStore = defineStore('class', {
  state: () => ({
    classContents: [
      {
        id: '1',
        title: '基础体能训练',
        date: '2026-04-04',
        coachId: '1',
        students: ['1', '2', '3'],
        photos: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20doing%20physical%20training%20in%20gym&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kids%20exercising%20with%20coach&image_size=square'
        ],
        videos: [],
        comments: '今天的训练强度适中，孩子们表现很好',
        aiReview: '整体表现良好，建议加强核心力量训练',
        voiceSuggestion: 'https://example.com/voice1.mp3'
      },
      {
        id: '2',
        title: '球类技能训练',
        date: '2026-04-03',
        coachId: '2',
        students: ['3', '4', '5'],
        photos: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20playing%20basketball%20in%20training&image_size=square'
        ],
        videos: [
          'https://example.com/video1.mp4'
        ],
        comments: '孩子们的传球技巧有明显进步',
        aiReview: '传球准确性有待提高，建议增加传球练习',
        voiceSuggestion: 'https://example.com/voice2.mp3'
      }
    ] as ClassContent[]
  }),
  actions: {
    addClassContent(content: Omit<ClassContent, 'id'>) {
      const newContent: ClassContent = {
        ...content,
        id: Date.now().toString()
      }
      this.classContents.push(newContent)
      return newContent
    },
    getClassContentById(id: string) {
      return this.classContents.find(c => c.id === id)
    },
    getClassContentsByDateRange(startDate: string, endDate: string) {
      return this.classContents.filter(c => {
        return c.date >= startDate && c.date <= endDate
      })
    },
    getClassContentsByStudent(studentId: string) {
      return this.classContents.filter(c => c.students.includes(studentId))
    }
  }
})