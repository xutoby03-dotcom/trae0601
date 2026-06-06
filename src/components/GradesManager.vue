<template>
  <div class="grades-manager card">
    <h3>📝 成绩管理</h3>
    
    <div class="grades-summary">
      <div class="summary-card">
        <div class="summary-icon">📊</div>
        <div class="summary-info">
          <div class="summary-label">学期 GPA</div>
          <div class="summary-value">{{ store.semesterGPA }}</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">🎯</div>
        <div class="summary-info">
          <div class="summary-label">总 GPA</div>
          <div class="summary-value">{{ store.totalGPA }}</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">📚</div>
        <div class="summary-info">
          <div class="summary-label">已录入成绩</div>
          <div class="summary-value">{{ gradedCount }} / {{ semesterCourses.length }}</div>
        </div>
      </div>
    </div>

    <div class="grades-table">
      <table>
        <thead>
          <tr>
            <th>课程名称</th>
            <th>学分</th>
            <th>类别</th>
            <th>类型</th>
            <th>期末成绩</th>
            <th>GPA</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in semesterCourses" :key="item.courseId">
            <td class="course-name-cell">
              <span
                class="course-color-dot"
                :style="{ background: item.course.color }"
              ></span>
              {{ item.course.name }}
            </td>
            <td>{{ item.course.credits }}</td>
            <td>
              <span
                class="badge"
                :class="item.course.category === '必修' ? 'badge-required' : 'badge-elective'"
              >
                {{ item.course.category }}
              </span>
            </td>
            <td>{{ item.course.type }}</td>
            <td>
              <div class="grade-input-wrapper">
                <input
                  v-model.number="item.tempScore"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="未录入"
                  class="grade-input"
                  @keyup.enter="saveGrade(item)"
                />
                <button
                  v-if="item.tempScore !== item.score"
                  class="btn btn-primary btn-small"
                  @click="saveGrade(item)"
                >
                  保存
                </button>
              </div>
            </td>
            <td>
              <span :class="{ 'gpa-good': item.gpa >= 3.5, 'gpa-bad': item.gpa < 2.0 }">
                {{ item.gpa ? item.gpa.toFixed(1) : '-' }}
              </span>
            </td>
            <td>
              <button
                v-if="item.score !== null"
                class="btn-icon"
                @click="clearGrade(item.courseId)"
                title="清除成绩"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="gpa-reference">
      <h4>📖 GPA 换算参考</h4>
      <div class="reference-grid">
        <div class="ref-item">
          <span class="ref-score">90-100</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">4.0</span>
        </div>
        <div class="ref-item">
          <span class="ref-score">85-89</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">3.7</span>
        </div>
        <div class="ref-item">
          <span class="ref-score">82-84</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">3.3</span>
        </div>
        <div class="ref-item">
          <span class="ref-score">78-81</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">3.0</span>
        </div>
        <div class="ref-item">
          <span class="ref-score">75-77</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">2.7</span>
        </div>
        <div class="ref-item">
          <span class="ref-score">72-74</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">2.3</span>
        </div>
        <div class="ref-item">
          <span class="ref-score">68-71</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">2.0</span>
        </div>
        <div class="ref-item">
          <span class="ref-score">64-67</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">1.5</span>
        </div>
        <div class="ref-item">
          <span class="ref-score">60-63</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">1.0</span>
        </div>
        <div class="ref-item">
          <span class="ref-score">0-59</span>
          <span class="ref-arrow">→</span>
          <span class="ref-gpa">0.0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useScheduleStore } from '../stores/schedule'

const store = useScheduleStore()

const semesterCourses = computed(() => {
  const courseIds = new Set()
  store.currentScheduledCourses.forEach(sc => {
    courseIds.add(sc.courseId)
  })
  
  return Array.from(courseIds).map(courseId => {
    const course = store.getCourseById(courseId)
    const score = store.getGrade(courseId)
    return {
      courseId,
      course,
      score,
      tempScore: score,
      gpa: score !== null ? store.scoreToGPA(score) : null
    }
  })
})

const gradedCount = computed(() => {
  return semesterCourses.value.filter(c => c.score !== null).length
})

const saveGrade = (item) => {
  if (item.tempScore === null || item.tempScore === undefined) {
    alert('请输入有效成绩')
    return
  }
  if (item.tempScore < 0 || item.tempScore > 100) {
    alert('成绩必须在0-100之间')
    return
  }
  store.setGrade(item.courseId, item.tempScore)
  item.score = item.tempScore
  item.gpa = store.scoreToGPA(item.tempScore)
}

const clearGrade = (courseId) => {
  if (confirm('确定要清除这门课的成绩吗？')) {
    const item = semesterCourses.value.find(c => c.courseId === courseId)
    if (item) {
      store.setGrade(courseId, null)
      item.score = null
      item.tempScore = null
      item.gpa = null
    }
  }
}
</script>

<style scoped>
.grades-manager h3 {
  margin-bottom: 20px;
  color: #333;
}

.grades-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 12px;
}

.summary-icon {
  font-size: 32px;
}

.summary-label {
  font-size: 13px;
  color: #868e96;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.grades-table {
  overflow-x: auto;
  margin-bottom: 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  font-size: 13px;
}

.course-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
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

.grade-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.grade-input {
  width: 80px;
  padding: 6px 8px;
}

.btn-small {
  padding: 6px 10px;
  font-size: 12px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.btn-icon:hover {
  background: #ffe3e3;
}

.gpa-good {
  color: #51cf66;
  font-weight: 600;
}

.gpa-bad {
  color: #ff6b6b;
  font-weight: 600;
}

.gpa-reference {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.gpa-reference h4 {
  margin-bottom: 12px;
  color: #495057;
  font-size: 14px;
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.ref-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  font-size: 12px;
}

.ref-score {
  font-weight: 500;
  color: #495057;
}

.ref-arrow {
  color: #868e96;
}

.ref-gpa {
  font-weight: 700;
  color: #667eea;
}
</style>
