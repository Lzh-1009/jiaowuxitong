<template>
  <div class="home">
    <div class="feature-grid">
      <router-link to="/attendance" class="feature-card">
        <h2>学员签到与课时管理</h2>
        <p>学员签到自动消课，剩余课时实时同步，教练授课课时自动核算</p>
      </router-link>
      <router-link to="/fitness-test" class="feature-card">
        <h2>体测数据管理</h2>
        <p>一键录入学员数据，自动生成体测报告，家长直观了解孩子强弱项</p>
      </router-link>
      <router-link to="/statistics" class="feature-card">
        <h2>数据统计分析</h2>
        <p>营收明细、学员留存、学员出勤等情况自动汇总，校长端随时查看</p>
      </router-link>
      <router-link to="/schedule" class="feature-card">
        <h2>教练排课管理</h2>
        <p>合理安排教练课程，避免时间冲突，优化教学资源配置</p>
      </router-link>
      <router-link to="/student-profile" class="feature-card">
        <h2>学生档案管理</h2>
        <p>建立完整学生档案，记录个人信息、学习进度和成长轨迹</p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #333;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.feature-card h2 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.feature-card p {
  line-height: 1.6;
  color: #666;
}
</style>