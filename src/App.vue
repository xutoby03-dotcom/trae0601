<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1>🎓 大学生课程表与学分管理系统</h1>
        <div class="header-actions">
          <SemesterSelector />
          <button class="btn btn-success" @click="handleExportICS">
            📅 导出日历
          </button>
        </div>
      </div>
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.icon }} {{ tab.name }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <div v-if="activeTab === 'schedule'" class="schedule-tab">
        <div class="schedule-main">
          <ScheduleView
            @edit-course="openEditCourseModal"
            @add-course="openAddCourseModal"
          />
        </div>
        <aside class="sidebar">
          <CourseLibrary />
        </aside>
      </div>

      <div v-if="activeTab === 'stats'" class="stats-tab">
        <CreditsStats />
      </div>

      <div v-if="activeTab === 'grades'" class="grades-tab">
        <GradesManager />
      </div>
    </main>

    <div v-if="showAddCourseModal || showEditCourseModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ showAddCourseModal ? '添加课程到课表' : '编辑课程安排' }}</h3>
        
        <div class="form-group">
          <label>选择课程</label>
          <select v-model="scheduleForm.courseId">
            <option v-for="course in store.courseLibrary" :key="course.id" :value="course.id">
              {{ course.name }} - {{ course.teacher }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>星期</label>
            <select v-model.number="scheduleForm.day">
              <option v-for="d in 7" :key="d" :value="d">
                周{{ ['一', '二', '三', '四', '五', '六', '日'][d - 1] }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>开始节次</label>
            <select v-model.number="scheduleForm.startPeriod">
              <option v-for="p in 12" :key="p" :value="p">第{{ p }}节</option>
            </select>
          </div>
          <div class="form-group">
            <label>结束节次</label>
            <select v-model.number="scheduleForm.endPeriod">
              <option v-for="p in 12" :key="p" :value="p">第{{ p }}节</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>教室</label>
          <input v-model="scheduleForm.classroom" type="text" placeholder="请输入教室" />
        </div>

        <div v-if="hasConflict" class="conflict-warning">
          ⚠️ 该时间段已有课程安排！
        </div>

        <div class="modal-actions">
          <button class="btn" @click="closeModal">取消</button>
          <button v-if="showEditCourseModal" class="btn btn-danger" @click="deleteScheduledCourse">删除</button>
          <button class="btn btn-primary" @click="saveSchedule">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useScheduleStore } from './stores/schedule'
import ScheduleView from './components/ScheduleView.vue'
import CourseLibrary from './components/CourseLibrary.vue'
import CreditsStats from './components/CreditsStats.vue'
import GradesManager from './components/GradesManager.vue'
import SemesterSelector from './components/SemesterSelector.vue'
import { exportToICS } from './utils/icsExport'

const store = useScheduleStore()

const tabs = [
  { key: 'schedule', name: '课程表', icon: '📅' },
  { key: 'stats', name: '学分统计', icon: '📊' },
  { key: 'grades', name: '成绩管理', icon: '📝' }
]

const activeTab = ref('schedule')

const showAddCourseModal = ref(false)
const showEditCourseModal = ref(false)
const editingScheduleId = ref(null)

const defaultScheduleForm = {
  courseId: null,
  day: 1,
  startPeriod: 1,
  endPeriod: 2,
  classroom: ''
}

const scheduleForm = reactive({ ...defaultScheduleForm })

const hasConflict = computed(() => {
  if (scheduleForm.startPeriod > scheduleForm.endPeriod) return false
  return store.checkConflict(
    scheduleForm.day,
    scheduleForm.startPeriod,
    scheduleForm.endPeriod,
    editingScheduleId.value
  )
})

const openAddCourseModal = ({ day, period }) => {
  Object.assign(scheduleForm, defaultScheduleForm)
  scheduleForm.day = day
  scheduleForm.startPeriod = period
  scheduleForm.endPeriod = Math.min(period + 1, 12)
  if (store.courseLibrary.length > 0) {
    scheduleForm.courseId = store.courseLibrary[0].id
  }
  editingScheduleId.value = null
  showAddCourseModal.value = true
}

const openEditCourseModal = (scheduledCourse) => {
  Object.assign(scheduleForm, {
    courseId: scheduledCourse.courseId,
    day: scheduledCourse.day,
    startPeriod: scheduledCourse.startPeriod,
    endPeriod: scheduledCourse.endPeriod,
    classroom: scheduledCourse.classroom
  })
  editingScheduleId.value = scheduledCourse.id
  showEditCourseModal.value = true
}

const closeModal = () => {
  showAddCourseModal.value = false
  showEditCourseModal.value = false
  Object.assign(scheduleForm, defaultScheduleForm)
  editingScheduleId.value = null
}

const saveSchedule = () => {
  if (!scheduleForm.courseId) {
    alert('请选择课程')
    return
  }
  if (scheduleForm.startPeriod > scheduleForm.endPeriod) {
    alert('开始节次不能大于结束节次')
    return
  }
  if (hasConflict.value) {
    alert('该时间段有课程冲突，请调整时间')
    return
  }

  const data = {
    courseId: scheduleForm.courseId,
    day: scheduleForm.day,
    startPeriod: scheduleForm.startPeriod,
    endPeriod: scheduleForm.endPeriod,
    classroom: scheduleForm.classroom
  }

  if (showAddCourseModal.value) {
    store.addScheduledCourse(data)
  } else if (showEditCourseModal.value && editingScheduleId.value) {
    store.updateScheduledCourse(editingScheduleId.value, data)
  }

  closeModal()
}

const deleteScheduledCourse = () => {
  if (confirm('确定要删除这个课程安排吗？')) {
    store.deleteScheduledCourse(editingScheduleId.value)
    closeModal()
  }
}

const handleExportICS = () => {
  exportToICS(
    store.currentScheduledCourses,
    store.getCourseById,
    store.currentSemester?.name || '课程表'
  )
}
</script>

<style scoped>
.app {
  min-height: 100vh;
}

.app-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content h1 {
  font-size: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tabs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #e9ecef;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #667eea;
  background: #f8f9fa;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.app-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.schedule-tab {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.schedule-main {
  min-width: 0;
}

.sidebar {
  position: sticky;
  top: 140px;
  align-self: start;
}

.stats-tab,
.grades-tab {
  max-width: 900px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.conflict-warning {
  background: #fff5f5;
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
