<template>
  <div class="class-content">
    <div class="header">
      <button @click="goBack" class="back-button">
        返回
      </button>
      <h1>课堂内容管理</h1>
    </div>
    
    <div class="upload-section">
      <h2>上传课堂内容</h2>
      <div class="upload-form">
        <div class="form-group">
          <label>课程标题</label>
          <input type="text" v-model="newClass.title" placeholder="请输入课程标题" />
        </div>
        <div class="form-group">
          <label>日期</label>
          <input type="date" v-model="newClass.date" />
        </div>
        <div class="form-group">
          <label>教练</label>
          <select v-model="newClass.coachId">
            <option value="">请选择教练</option>
            <option v-for="coach in coaches" :key="coach.id" :value="coach.id">
              {{ coach.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>参与学员</label>
          <div class="checkbox-group">
            <label v-for="student in students" :key="student.id" class="checkbox-item">
              <input type="checkbox" :value="student.id" v-model="newClass.students" />
              {{ student.name }}
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>课堂照片</label>
          <input type="file" multiple accept="image/*" @change="handlePhotoUpload" />
        </div>
        <div class="form-group">
          <label>课堂视频</label>
          <input type="file" multiple accept="video/*" @change="handleVideoUpload" />
        </div>
        <div class="form-group">
          <label>教练点评</label>
          <textarea v-model="newClass.comments" placeholder="请输入课堂点评" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>AI点评</label>
          <textarea v-model="newClass.aiReview" placeholder="AI自动生成的点评" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>语音建议</label>
          <input type="text" v-model="newClass.voiceSuggestion" placeholder="语音建议链接" />
        </div>
        <button @click="handleUpload" :disabled="!isFormValid">
          上传课堂内容
        </button>
      </div>
      <div v-if="uploadMessage" class="message" :class="uploadMessage.type">
        {{ uploadMessage.text }}
      </div>
    </div>
    
    <div class="class-list-section">
      <h2>课堂记录</h2>
      <div class="class-list">
        <div v-for="content in classContents" :key="content.id" class="class-card">
          <h3>{{ content.title }}</h3>
          <p class="class-info">
            {{ content.date }} | 教练：{{ getCoachName(content.coachId) }} | 
            学员：{{ getStudentNames(content.students).join('、') }}
          </p>
          
          <div v-if="content.photos.length > 0" class="media-section">
            <h4>课堂照片</h4>
            <div class="photo-grid">
              <img v-for="(photo, index) in content.photos" :key="index" :src="photo" alt="课堂照片" class="class-photo" />
            </div>
          </div>
          
          <div v-if="content.videos.length > 0" class="media-section">
            <h4>课堂视频</h4>
            <div class="video-list">
              <div v-for="(video, index) in content.videos" :key="index" class="video-item">
                {{ video }}
              </div>
            </div>
          </div>
          
          <div class="comments-section">
            <h4>点评</h4>
            <p class="coach-comment">{{ content.comments }}</p>
            <p class="ai-review"><strong>AI点评：</strong>{{ content.aiReview }}</p>
            <p v-if="content.voiceSuggestion" class="voice-suggestion">
              <strong>语音建议：</strong><a :href="content.voiceSuggestion" target="_blank">查看</a>
            </p>
          </div>
        </div>
        <div v-if="classContents.length === 0" class="no-classes">
          暂无课堂记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClassStore } from '../store/class'
import { useAttendanceStore } from '../store/attendance'
import router from '../router'

const classStore = useClassStore()
const attendanceStore = useAttendanceStore()

const newClass = ref({
  title: '',
  date: new Date().toISOString().split('T')[0],
  coachId: '',
  students: [] as string[],
  photos: [] as string[],
  videos: [] as string[],
  comments: '',
  aiReview: '',
  voiceSuggestion: ''
})

const uploadMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const classContents = computed(() => classStore.classContents)
const students = computed(() => attendanceStore.students)
const coaches = computed(() => attendanceStore.coaches)

const isFormValid = computed(() => {
  return newClass.value.title && newClass.value.coachId && newClass.value.students.length > 0
})

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    // 模拟上传，实际项目中需要实现真实的文件上传
    for (let i = 0; i < target.files.length; i++) {
      // 生成模拟的图片URL
      const photoUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20sports%20training%20${i}&image_size=square`
      newClass.value.photos.push(photoUrl)
    }
  }
}

const handleVideoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    // 模拟上传，实际项目中需要实现真实的文件上传
    for (let i = 0; i < target.files.length; i++) {
      newClass.value.videos.push(`https://example.com/video${Date.now() + i}.mp4`)
    }
  }
}

const handleUpload = () => {
  if (isFormValid.value) {
    classStore.addClassContent({
      title: newClass.value.title,
      date: newClass.value.date,
      coachId: newClass.value.coachId,
      students: newClass.value.students,
      photos: newClass.value.photos,
      videos: newClass.value.videos,
      comments: newClass.value.comments,
      aiReview: newClass.value.aiReview,
      voiceSuggestion: newClass.value.voiceSuggestion
    })
    
    // 重置表单
    newClass.value = {
      title: '',
      date: new Date().toISOString().split('T')[0],
      coachId: '',
      students: [],
      photos: [],
      videos: [],
      comments: '',
      aiReview: '',
      voiceSuggestion: ''
    }
    
    uploadMessage.value = {
      type: 'success',
      text: '课堂内容上传成功'
    }
    
    // 3秒后清除消息
    setTimeout(() => {
      uploadMessage.value = null
    }, 3000)
  }
}

const getCoachName = (id: string) => {
  const coach = attendanceStore.getCoachById(id)
  return coach ? coach.name : '未知教练'
}

const getStudentNames = (ids: string[]) => {
  return ids.map(id => {
    const student = attendanceStore.getStudentById(id)
    return student ? student.name : '未知学员'
  })
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.class-content {
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
  margin-bottom: 10px;
}

h4 {
  color: #7f8c8d;
  margin: 15px 0 10px;
}

.upload-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.upload-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  grid-column: span 1;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="date"],
input[type="file"],
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 5px;
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
  grid-column: span 2;
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
  grid-column: span 2;
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

.class-list-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.class-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.class-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s ease;
}

.class-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.class-info {
  color: #7f8c8d;
  margin-bottom: 15px;
  font-size: 14px;
}

.media-section {
  margin: 15px 0;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.class-photo {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.video-list {
  margin-top: 10px;
}

.video-item {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 5px;
  font-size: 14px;
}

.comments-section {
  margin-top: 15px;
}

.coach-comment {
  margin-bottom: 10px;
  line-height: 1.5;
}

.ai-review {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #3498db;
}

.voice-suggestion {
  line-height: 1.5;
  color: #27ae60;
}

.voice-suggestion a {
  color: #27ae60;
  text-decoration: none;
}

.voice-suggestion a:hover {
  text-decoration: underline;
}

.no-classes {
  grid-column: span 2;
  text-align: center;
  color: #999;
  padding: 60px;
}

@media (max-width: 768px) {
  .upload-form {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width,
  button,
  .message {
    grid-column: span 1;
  }
  
  .class-list {
    grid-template-columns: 1fr;
  }
  
  .no-classes {
    grid-column: span 1;
  }
}
</style>