<template>
  <div class="semester-selector">
    <button
      v-for="semester in store.semesters"
      :key="semester.id"
      class="semester-btn"
      :class="{ active: semester.id === store.currentSemesterId }"
      @click="store.switchSemester(semester.id)"
    >
      {{ semester.name }}
    </button>
  </div>
</template>

<script setup>
import { useScheduleStore } from '../stores/schedule'

const store = useScheduleStore()
</script>

<style scoped>
.semester-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.semester-btn {
  padding: 8px 16px;
  border: 2px solid #e1e8ed;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.semester-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.semester-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}
</style>
