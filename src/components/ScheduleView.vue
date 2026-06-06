<template>
  <div class="schedule-container">
    <div class="schedule-header">
      <div class="corner-cell"></div>
      <div v-for="day in weekDays" :key="day.key" class="day-header">
        {{ day.name }}
      </div>
    </div>
    <div class="schedule-body">
      <div class="time-column">
        <div v-for="period in periods" :key="period" class="time-cell">
          <span class="period-num">第{{ period }}节</span>
          <span class="period-time">{{ getTimeSlot(period) }}</span>
        </div>
      </div>
      <div class="grid-container">
        <div
          v-for="day in weekDays"
          :key="day.key"
          class="day-column"
          @dragover.prevent
          @drop="handleDrop($event, day.key)"
        >
          <div
            v-for="period in periods"
            :key="period"
            class="grid-cell"
            :class="{ 'conflict-cell': hasConflict(day.key, period) }"
            @click="handleCellClick(day.key, period)"
          >
            <div
              v-if="getCourseAt(day.key, period)"
              class="course-card"
              :style="{ background: getCourseColor(day.key, period) }"
              :class="{ 'conflict-course': isCourseConflict(getCourseAt(day.key, period).id) }"
              draggable="true"
              @dragstart="handleDragStart($event, getCourseAt(day.key, period))"
              @click.stop="handleCourseClick(getCourseAt(day.key, period))"
            >
              <div class="course-name">{{ getCourseAt(day.key, period).course.name }}</div>
              <div class="course-info">
                <span>📍 {{ getCourseAt(day.key, period).classroom }}</span>
              </div>
              <div class="course-info">
                <span>👨‍🏫 {{ getCourseAt(day.key, period).course.teacher }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useScheduleStore } from '../stores/schedule'

const store = useScheduleStore()

const weekDays = [
  { key: 1, name: '周一' },
  { key: 2, name: '周二' },
  { key: 3, name: '周三' },
  { key: 4, name: '周四' },
  { key: 5, name: '周五' },
  { key: 6, name: '周六' },
  { key: 7, name: '周日' }
]

const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const draggedCourse = ref(null)

const emit = defineEmits(['editCourse', 'addCourse'])

const getTimeSlot = (period) => {
  const timeSlots = {
    1: '08:00-08:45',
    2: '08:55-09:40',
    3: '10:00-10:45',
    4: '10:55-11:40',
    5: '14:00-14:45',
    6: '14:55-15:40',
    7: '16:00-16:45',
    8: '16:55-17:40',
    9: '19:00-19:45',
    10: '19:55-20:40',
    11: '20:50-21:35',
    12: '21:45-22:30'
  }
  return timeSlots[period] || ''
}

const getCourseAt = (day, period) => {
  const scheduled = store.currentScheduledCourses.find(sc => {
    return sc.day === day && period >= sc.startPeriod && period <= sc.endPeriod
  })
  if (!scheduled) return null
  if (scheduled.startPeriod !== period) return null
  return {
    ...scheduled,
    course: store.getCourseById(scheduled.courseId)
  }
}

const getCourseColor = (day, period) => {
  const course = getCourseAt(day, period)
  return course?.course?.color || '#667eea'
}

const hasConflict = (day, period) => {
  const courses = store.currentScheduledCourses.filter(sc => {
    return sc.day === day && period >= sc.startPeriod && period <= sc.endPeriod
  })
  return courses.length > 1
}

const isCourseConflict = (scheduledId) => {
  const scheduled = store.getScheduledCourseById(scheduledId)
  if (!scheduled) return false
  return store.checkConflict(scheduled.day, scheduled.startPeriod, scheduled.endPeriod, scheduledId)
}

const handleDragStart = (event, course) => {
  draggedCourse.value = course
  event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = (event, day) => {
  if (!draggedCourse.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const y = event.clientY - rect.top
  const cellHeight = rect.height / 12
  const period = Math.floor(y / cellHeight) + 1
  const duration = draggedCourse.value.endPeriod - draggedCourse.value.startPeriod + 1
  const startPeriod = Math.min(Math.max(period, 1), 12)
  const endPeriod = Math.min(startPeriod + duration - 1, 12)
  if (store.checkConflict(day, startPeriod, endPeriod, draggedCourse.value.id)) {
    alert('该时间段有课程冲突！')
    return
  }
  store.updateScheduledCourse(draggedCourse.value.id, {
    day,
    startPeriod,
    endPeriod
  })
  draggedCourse.value = null
}

const handleCellClick = (day, period) => {
  if (!getCourseAt(day, period)) {
    emit('addCourse', { day, period })
  }
}

const handleCourseClick = (course) => {
  emit('editCourse', course)
}
</script>

<style scoped>
.schedule-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.schedule-header {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.corner-cell {
  width: 100px;
  min-width: 100px;
  padding: 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.day-header {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.day-header:last-child {
  border-right: none;
}

.schedule-body {
  display: flex;
  max-height: 700px;
  overflow-y: auto;
}

.time-column {
  width: 100px;
  min-width: 100px;
  background: #f8f9fa;
}

.time-cell {
  height: 80px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e9ecef;
  border-right: 1px solid #e9ecef;
}

.period-num {
  font-weight: 600;
  font-size: 13px;
  color: #495057;
}

.period-time {
  font-size: 11px;
  color: #868e96;
  margin-top: 4px;
}

.grid-container {
  flex: 1;
  display: flex;
}

.day-column {
  flex: 1;
  position: relative;
}

.grid-cell {
  height: 80px;
  border-bottom: 1px solid #e9ecef;
  border-right: 1px solid #e9ecef;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}

.grid-cell:hover {
  background: #f8f9fa;
}

.grid-cell:last-child {
  border-bottom: none;
}

.conflict-cell {
  background: #fff5f5 !important;
}

.course-card {
  position: absolute;
  left: 2px;
  right: 2px;
  top: 2px;
  bottom: 2px;
  border-radius: 8px;
  padding: 8px;
  color: white;
  font-size: 12px;
  overflow: hidden;
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 10;
}

.course-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.course-card:active {
  cursor: grabbing;
}

.conflict-course {
  animation: pulse 1.5s infinite;
  box-shadow: 0 0 0 2px #ff6b6b;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px #ff6b6b;
  }
  50% {
    box-shadow: 0 0 0 4px #ff6b6b;
  }
}

.course-name {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-info {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
