import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useScheduleStore = defineStore('schedule', () => {
  const semesters = ref([
    { id: 1, name: '大一上学期', year: 2023, term: 1 },
    { id: 2, name: '大一下学期', year: 2024, term: 2 },
    { id: 3, name: '大二上学期', year: 2024, term: 1 },
    { id: 4, name: '大二下学期', year: 2025, term: 2 },
    { id: 5, name: '大三上学期', year: 2025, term: 1 },
    { id: 6, name: '大三下学期', year: 2026, term: 2 }
  ])

  const currentSemesterId = ref(1)

  const courseLibrary = ref([
    {
      id: 1,
      name: '高等数学',
      credits: 4,
      category: '必修',
      type: '通识',
      teacher: '张教授',
      color: '#667eea'
    },
    {
      id: 2,
      name: '大学英语',
      credits: 3,
      category: '必修',
      type: '通识',
      teacher: '李老师',
      color: '#764ba2'
    },
    {
      id: 3,
      name: '程序设计基础',
      credits: 4,
      category: '必修',
      type: '专业',
      teacher: '王教授',
      color: '#f093fb'
    },
    {
      id: 4,
      name: '数据结构',
      credits: 3,
      category: '必修',
      type: '专业',
      teacher: '刘教授',
      color: '#4facfe'
    },
    {
      id: 5,
      name: '音乐鉴赏',
      credits: 2,
      category: '选修',
      type: '通识',
      teacher: '陈老师',
      color: '#43e97b'
    },
    {
      id: 6,
      name: '人工智能导论',
      credits: 3,
      category: '选修',
      type: '专业',
      teacher: '赵教授',
      color: '#fa709a'
    }
  ])

  const scheduledCourses = ref([
    {
      id: 1,
      courseId: 1,
      semesterId: 1,
      day: 1,
      startPeriod: 1,
      endPeriod: 2,
      classroom: '教1-101'
    },
    {
      id: 2,
      courseId: 2,
      semesterId: 1,
      day: 2,
      startPeriod: 3,
      endPeriod: 4,
      classroom: '教2-203'
    },
    {
      id: 3,
      courseId: 3,
      semesterId: 1,
      day: 3,
      startPeriod: 5,
      endPeriod: 6,
      classroom: '实验楼A-301'
    },
    {
      id: 4,
      courseId: 1,
      semesterId: 1,
      day: 4,
      startPeriod: 1,
      endPeriod: 2,
      classroom: '教1-101'
    }
  ])

  const grades = ref([
    { id: 1, courseId: 1, semesterId: 1, score: 85 },
    { id: 2, courseId: 2, semesterId: 1, score: 88 },
    { id: 3, courseId: 3, semesterId: 1, score: 92 }
  ])

  const graduationRequirements = ref({
    required: 60,
    elective: 20,
    general: 12
  })

  const currentSemester = computed(() => {
    return semesters.value.find(s => s.id === currentSemesterId.value)
  })

  const currentScheduledCourses = computed(() => {
    return scheduledCourses.value.filter(sc => sc.semesterId === currentSemesterId.value)
  })

  const getCourseById = (id) => {
    return courseLibrary.value.find(c => c.id === id)
  }

  const getScheduledCourseById = (id) => {
    return scheduledCourses.value.find(sc => sc.id === id)
  }

  const checkConflict = (day, startPeriod, endPeriod, excludeId = null) => {
    return currentScheduledCourses.value.some(sc => {
      if (excludeId && sc.id === excludeId) return false
      if (sc.day !== day) return false
      return !(endPeriod < sc.startPeriod || startPeriod > sc.endPeriod)
    })
  }

  const addCourseToLibrary = (course) => {
    const newId = Math.max(...courseLibrary.value.map(c => c.id), 0) + 1
    courseLibrary.value.push({ ...course, id: newId })
    return newId
  }

  const updateCourseInLibrary = (id, course) => {
    const index = courseLibrary.value.findIndex(c => c.id === id)
    if (index !== -1) {
      courseLibrary.value[index] = { ...courseLibrary.value[index], ...course }
    }
  }

  const deleteCourseFromLibrary = (id) => {
    courseLibrary.value = courseLibrary.value.filter(c => c.id !== id)
    scheduledCourses.value = scheduledCourses.value.filter(sc => sc.courseId !== id)
    grades.value = grades.value.filter(g => g.courseId !== id)
  }

  const addScheduledCourse = (scheduledCourse) => {
    const newId = Math.max(...scheduledCourses.value.map(sc => sc.id), 0) + 1
    scheduledCourses.value.push({ ...scheduledCourse, id: newId, semesterId: currentSemesterId.value })
    return newId
  }

  const updateScheduledCourse = (id, updates) => {
    const index = scheduledCourses.value.findIndex(sc => sc.id === id)
    if (index !== -1) {
      scheduledCourses.value[index] = { ...scheduledCourses.value[index], ...updates }
    }
  }

  const deleteScheduledCourse = (id) => {
    scheduledCourses.value = scheduledCourses.value.filter(sc => sc.id !== id)
  }

  const setGrade = (courseId, score) => {
    const existing = grades.value.find(g => g.courseId === courseId && g.semesterId === currentSemesterId.value)
    if (existing) {
      existing.score = score
    } else {
      const newId = Math.max(...grades.value.map(g => g.id), 0) + 1
      grades.value.push({
        id: newId,
        courseId,
        semesterId: currentSemesterId.value,
        score
      })
    }
  }

  const getGrade = (courseId) => {
    const grade = grades.value.find(g => g.courseId === courseId && g.semesterId === currentSemesterId.value)
    return grade ? grade.score : null
  }

  const scoreToGPA = (score) => {
    if (score >= 90) return 4.0
    if (score >= 85) return 3.7
    if (score >= 82) return 3.3
    if (score >= 78) return 3.0
    if (score >= 75) return 2.7
    if (score >= 72) return 2.3
    if (score >= 68) return 2.0
    if (score >= 64) return 1.5
    if (score >= 60) return 1.0
    return 0
  }

  const semesterGPA = computed(() => {
    const semesterGrades = grades.value.filter(g => g.semesterId === currentSemesterId.value)
    let totalPoints = 0
    let totalCredits = 0
    semesterGrades.forEach(g => {
      const course = getCourseById(g.courseId)
      if (course) {
        totalPoints += scoreToGPA(g.score) * course.credits
        totalCredits += course.credits
      }
    })
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0
  })

  const totalGPA = computed(() => {
    let totalPoints = 0
    let totalCredits = 0
    grades.value.forEach(g => {
      const course = getCourseById(g.courseId)
      if (course) {
        totalPoints += scoreToGPA(g.score) * course.credits
        totalCredits += course.credits
      }
    })
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0
  })

  const creditsByCategory = computed(() => {
    const result = { required: 0, elective: 0, general: 0 }
    grades.value.forEach(g => {
      const course = getCourseById(g.courseId)
      if (course) {
        if (course.category === '必修' && course.type === '通识') {
          result.general += course.credits
        } else if (course.category === '必修') {
          result.required += course.credits
        } else {
          result.elective += course.credits
        }
      }
    })
    return result
  })

  const remainingCredits = computed(() => {
    const earned = creditsByCategory.value
    const req = graduationRequirements.value
    return {
      required: Math.max(0, req.required - earned.required),
      elective: Math.max(0, req.elective - earned.elective),
      general: Math.max(0, req.general - earned.general)
    }
  })

  const switchSemester = (id) => {
    currentSemesterId.value = id
  }

  return {
    semesters,
    currentSemesterId,
    courseLibrary,
    scheduledCourses,
    grades,
    graduationRequirements,
    currentSemester,
    currentScheduledCourses,
    getCourseById,
    getScheduledCourseById,
    checkConflict,
    addCourseToLibrary,
    updateCourseInLibrary,
    deleteCourseFromLibrary,
    addScheduledCourse,
    updateScheduledCourse,
    deleteScheduledCourse,
    setGrade,
    getGrade,
    scoreToGPA,
    semesterGPA,
    totalGPA,
    creditsByCategory,
    remainingCredits,
    switchSemester
  }
})
