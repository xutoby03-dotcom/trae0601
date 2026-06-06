<template>
  <div class="credits-stats card">
    <h3>📊 学分统计</h3>
    
    <div class="stats-overview">
      <div class="gpa-cards">
        <div class="gpa-card">
          <div class="gpa-label">学期 GPA</div>
          <div class="gpa-value">{{ store.semesterGPA }}</div>
        </div>
        <div class="gpa-card">
          <div class="gpa-label">总 GPA</div>
          <div class="gpa-value">{{ store.totalGPA }}</div>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-container">
        <h4>已修学分分布</h4>
        <div class="chart-wrapper">
          <Pie :data="earnedChartData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="chart-container">
        <h4>毕业要求进度</h4>
        <div class="chart-wrapper">
          <Pie :data="progressChartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <div class="credits-detail">
      <h4>学分明细</h4>
      <div class="credit-item">
        <div class="credit-info">
          <span class="credit-dot" style="background: #667eea"></span>
          <span class="credit-name">必修学分</span>
        </div>
        <div class="credit-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="background: #667eea"
              :style="{ width: requiredProgress + '%' }"
            ></div>
          </div>
          <span class="credit-text">
            {{ store.creditsByCategory.required }} / {{ store.graduationRequirements.required }}
            <span v-if="store.remainingCredits.required > 0" class="remaining">
              (还差 {{ store.remainingCredits.required }})
            </span>
          </span>
        </div>
      </div>

      <div class="credit-item">
        <div class="credit-info">
          <span class="credit-dot" style="background: #51cf66"></span>
          <span class="credit-name">选修学分</span>
        </div>
        <div class="credit-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="background: #51cf66"
              :style="{ width: electiveProgress + '%' }"
            ></div>
          </div>
          <span class="credit-text">
            {{ store.creditsByCategory.elective }} / {{ store.graduationRequirements.elective }}
            <span v-if="store.remainingCredits.elective > 0" class="remaining">
              (还差 {{ store.remainingCredits.elective }})
            </span>
          </span>
        </div>
      </div>

      <div class="credit-item">
        <div class="credit-info">
          <span class="credit-dot" style="background: #ffd43b"></span>
          <span class="credit-name">通识学分</span>
        </div>
        <div class="credit-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="background: #ffd43b"
              :style="{ width: generalProgress + '%' }"
            ></div>
          </div>
          <span class="credit-text">
            {{ store.creditsByCategory.general }} / {{ store.graduationRequirements.general }}
            <span v-if="store.remainingCredits.general > 0" class="remaining">
              (还差 {{ store.remainingCredits.general }})
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { useScheduleStore } from '../stores/schedule'

ChartJS.register(ArcElement, Tooltip, Legend)

const store = useScheduleStore()

const earnedChartData = computed(() => ({
  labels: ['必修', '选修', '通识'],
  datasets: [{
    data: [
      store.creditsByCategory.required,
      store.creditsByCategory.elective,
      store.creditsByCategory.general
    ],
    backgroundColor: ['#667eea', '#51cf66', '#ffd43b'],
    borderWidth: 0
  }]
}))

const progressChartData = computed(() => {
  const earned = store.creditsByCategory
  const req = store.graduationRequirements
  const totalEarned = earned.required + earned.elective + earned.general
  const totalRequired = req.required + req.elective + req.general
  return {
    labels: ['已修', '未修'],
    datasets: [{
      data: [totalEarned, Math.max(0, totalRequired - totalEarned)],
      backgroundColor: ['#764ba2', '#e9ecef'],
      borderWidth: 0
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 16,
        usePointStyle: true
      }
    }
  }
}

const requiredProgress = computed(() => {
  const earned = store.creditsByCategory.required
  const req = store.graduationRequirements.required
  return Math.min(100, (earned / req) * 100)
})

const electiveProgress = computed(() => {
  const earned = store.creditsByCategory.elective
  const req = store.graduationRequirements.elective
  return Math.min(100, (earned / req) * 100)
})

const generalProgress = computed(() => {
  const earned = store.creditsByCategory.general
  const req = store.graduationRequirements.general
  return Math.min(100, (earned / req) * 100)
})
</script>

<style scoped>
.credits-stats h3 {
  margin-bottom: 20px;
  color: #333;
}

.gpa-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.gpa-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  text-align: center;
}

.gpa-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.gpa-value {
  font-size: 36px;
  font-weight: 700;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.chart-container h4 {
  margin-bottom: 12px;
  color: #495057;
  font-size: 14px;
  text-align: center;
}

.chart-wrapper {
  height: 200px;
}

.credits-detail h4 {
  margin-bottom: 16px;
  color: #333;
}

.credit-item {
  margin-bottom: 16px;
}

.credit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.credit-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.credit-name {
  font-weight: 500;
  color: #495057;
}

.credit-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.credit-text {
  font-size: 13px;
  color: #666;
  min-width: 120px;
}

.remaining {
  color: #ff6b6b;
  font-weight: 500;
}
</style>
