<template>
  <div class="course-library">
    <div class="library-header">
      <h3>📚 课程库</h3>
      <button class="btn btn-primary" @click="showAddModal = true">
        + 添加课程
      </button>
    </div>
    <div class="course-list">
      <div
        v-for="course in store.courseLibrary"
        :key="course.id"
        class="course-item"
        draggable="true"
        @dragstart="handleDragStart($event, course)"
      >
        <div class="course-color" :style="{ background: course.color }"></div>
        <div class="course-details">
          <div class="course-title">{{ course.name }}</div>
          <div class="course-meta">
            <span class="badge" :class="course.category === '必修' ? 'badge-required' : 'badge-elective'">
              {{ course.category }}
            </span>
            <span class="badge badge-type">{{ course.type }}</span>
            <span class="credits">{{ course.credits }}学分</span>
          </div>
          <div class="course-teacher">👨‍🏫 {{ course.teacher }}</div>
        </div>
        <div class="course-actions">
          <button class="btn-icon" @click="editCourse(course)">✏️</button>
          <button class="btn-icon btn-delete" @click="deleteCourse(course.id)">🗑️</button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ showAddModal ? '添加课程' : '编辑课程' }}</h3>
        <div class="form-group">
          <label>课程名称</label>
          <input v-model="form.name" type="text" placeholder="请输入课程名称" />
        </div>
        <div class="form-group">
          <label>教师</label>
          <input v-model="form.teacher" type="text" placeholder="请输入教师姓名" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>学分</label>
            <input v-model.number="form.credits" type="number" min="0.5" max="10" step="0.5" />
          </div>
          <div class="form-group">
            <label>类别</label>
            <select v-model="form.category">
              <option value="必修">必修</option>
              <option value="选修">选修</option>
            </select>
          </div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="form.type">
              <option value="通识">通识</option>
              <option value="专业">专业</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>卡片颜色</label>
          <div class="color-picker">
            <div
              v-for="color in colorOptions"
              :key="color"
              class="color-option"
              :style="{ background: color }"
              :class="{ active: form.color === color }"
              @click="form.color = color"
            ></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveCourse">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useScheduleStore } from '../stores/schedule'

const store = useScheduleStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingId = ref(null)

const colorOptions = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe',
  '#43e97b', '#fa709a', '#fee140', '#30cfd0',
  '#a8edea', '#ff9a9e', '#fecfef', '#ffecd2'
]

const defaultForm = {
  name: '',
  teacher: '',
  credits: 2,
  category: '必修',
  type: '专业',
  color: '#667eea'
}

const form = reactive({ ...defaultForm })

const resetForm = () => {
  Object.assign(form, defaultForm)
  editingId.value = null
}

const handleDragStart = (event, course) => {
  event.dataTransfer.setData('courseId', course.id.toString())
  event.dataTransfer.effectAllowed = 'copy'
}

const editCourse = (course) => {
  Object.assign(form, course)
  editingId.value = course.id
  showEditModal.value = true
}

const deleteCourse = (id) => {
  if (confirm('确定要删除这门课程吗？相关的课表安排和成绩也会被删除。')) {
    store.deleteCourseFromLibrary(id)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

const saveCourse = () => {
  if (!form.name.trim()) {
    alert('请输入课程名称')
    return
  }
  if (showAddModal.value) {
    store.addCourseToLibrary({ ...form })
  } else if (showEditModal.value && editingId.value) {
    store.updateCourseInLibrary(editingId.value, { ...form })
  }
  closeModal()
}
</script>

<style scoped>
.course-library {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.library-header h3 {
  font-size: 18px;
  color: #333;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.course-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: grab;
  transition: all 0.2s;
}

.course-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.course-color {
  width: 6px;
  height: 50px;
  border-radius: 3px;
  margin-right: 12px;
  flex-shrink: 0;
}

.course-details {
  flex: 1;
  min-width: 0;
}

.course-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.course-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.badge-required {
  background: #ff6b6b;
  color: white;
}

.badge-elective {
  background: #51cf66;
  color: white;
}

.badge-type {
  background: #74c0fc;
  color: white;
}

.credits {
  font-size: 12px;
  color: #666;
}

.course-teacher {
  font-size: 12px;
  color: #868e96;
}

.course-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #dee2e6;
}

.btn-delete:hover {
  background: #ffe3e3;
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

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  border: 3px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
