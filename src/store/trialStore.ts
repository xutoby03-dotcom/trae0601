import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  TrialLesson,
  TrialStatus,
  Feedback,
  PrepItem,
  EnrollmentDecision,
  CourseCategory
} from '../types/trial'

function generateId(): string {
  return `TRL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

const MOCK_DATA: TrialLesson[] = [
  {
    id: 'TRL-MOCK-1',
    organization: '彩虹画室',
    courseName: '创意儿童画启蒙班',
    category: '画画',
    ageGroup: '4-6岁',
    trialTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    address: '朝阳区建国路88号SOHO现代城A座301',
    teacher: '李老师',
    fee: 99,
    classroomPhoto: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop',
    status: '待试听',
    prepItems: [
      { id: 'p1', text: '带好围裙和袖套', completed: false },
      { id: 'p2', text: '准备一套换洗衣物', completed: true },
      { id: 'p3', text: '提前15分钟到达熟悉环境', completed: false }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TRL-MOCK-2',
    organization: '小飞人篮球俱乐部',
    courseName: '幼儿篮球基础班',
    category: '篮球',
    ageGroup: '5-7岁',
    trialTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    address: '海淀区中关村大街19号新中关购物中心B1层',
    teacher: '王教练',
    fee: 0,
    classroomPhoto: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop',
    status: '已试听',
    prepItems: [
      { id: 'p1', text: '穿运动鞋和运动服', completed: true },
      { id: 'p2', text: '带好水壶和毛巾', completed: true }
    ],
    feedback: {
      childInterest: 5,
      teacherFeedback: '王教练非常有耐心，教学方式生动有趣，孩子全程积极参与，基本动作掌握得不错。',
      convenience: 4,
      wantToEnroll: true,
      feedbackAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TRL-MOCK-3',
    organization: '极客晨星少儿编程',
    courseName: 'Scratch图形化编程入门',
    category: '编程',
    ageGroup: '6-8岁',
    trialTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    address: '西城区金融街7号英蓝国际金融中心15层',
    teacher: '张老师',
    fee: 199,
    classroomPhoto: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    status: '待试听',
    prepItems: [
      { id: 'p1', text: '确认孩子会使用鼠标键盘', completed: false },
      { id: 'p2', text: '带好笔记本记录知识点', completed: false }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TRL-MOCK-4',
    organization: '小天鹅舞蹈艺术中心',
    courseName: '中国舞启蒙班',
    category: '舞蹈',
    ageGroup: '4-6岁',
    trialTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    address: '东城区东直门外大街48号东方银座D座5层',
    teacher: '陈老师',
    fee: 0,
    classroomPhoto: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&h=400&fit=crop',
    status: '已报名',
    prepItems: [
      { id: 'p1', text: '穿舞蹈服和舞蹈鞋', completed: true },
      { id: 'p2', text: '扎好头发，不佩戴饰品', completed: true }
    ],
    feedback: {
      childInterest: 4,
      teacherFeedback: '陈老师专业且温柔，孩子有点怕生但很快融入了课堂，节奏感不错。',
      convenience: 5,
      wantToEnroll: true,
      feedbackAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
    },
    enrollment: {
      decidedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      reason: '孩子非常喜欢跳舞，老师专业有耐心，机构离家很近，课程体系完整。',
      discountDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      discountInfo: '618活动立减2000元，送全套舞蹈装备'
    },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TRL-MOCK-5',
    organization: '音乐之声琴行',
    courseName: '幼儿钢琴启蒙课',
    category: '音乐',
    ageGroup: '5-7岁',
    trialTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    address: '丰台区方庄路2号贵友大厦4层',
    teacher: '刘老师',
    fee: 150,
    classroomPhoto: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&h=400&fit=crop',
    status: '放弃',
    prepItems: [
      { id: 'p1', text: '提前修剪指甲', completed: true }
    ],
    feedback: {
      childInterest: 2,
      teacherFeedback: '老师比较严格，孩子坐不住，练习枯燥的音阶时容易分心。',
      convenience: 2,
      wantToEnroll: false,
      feedbackAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
    },
    giveUpReason: '孩子年龄还小，坐不住45分钟，对钢琴兴趣不高，且距离较远交通不便。',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
]

interface TrialStore {
  lessons: TrialLesson[]
  addLesson: (lesson: Omit<TrialLesson, 'id' | 'createdAt' | 'status' | 'prepItems'> & { prepItems?: string[] }) => string
  updateStatus: (id: string, status: TrialStatus, extra?: { giveUpReason?: string; feedback?: Feedback; enrollment?: EnrollmentDecision }) => void
  togglePrepItem: (lessonId: string, prepId: string) => void
  addPrepItem: (lessonId: string, text: string) => void
  removePrepItem: (lessonId: string, prepId: string) => void
  submitFeedback: (id: string, feedback: Feedback) => void
  enrollLesson: (id: string, decision: EnrollmentDecision) => void
  giveUpLesson: (id: string, reason: string) => void
  deleteLesson: (id: string) => void
  getStats: () => {
    totalFee: number
    favoriteCategory: CourseCategory | null
    remainingTrials: number
  }
}

export const useTrialStore = create<TrialStore>()(
  persist(
    (set, get) => ({
      lessons: MOCK_DATA,

      addLesson: (lesson) => {
        const id = generateId()
        const prepItems: PrepItem[] = (lesson.prepItems || []).map((text, idx) => ({
          id: `p-${Date.now()}-${idx}`,
          text,
          completed: false
        }))
        const newLesson: TrialLesson = {
          ...lesson,
          id,
          status: '待试听',
          prepItems,
          createdAt: new Date().toISOString()
        }
        set((state) => ({ lessons: [newLesson, ...state.lessons] }))
        return id
      },

      updateStatus: (id, status, extra) => {
        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.id === id
              ? {
                  ...l,
                  status,
                  ...(extra?.giveUpReason ? { giveUpReason: extra.giveUpReason } : {}),
                  ...(extra?.feedback ? { feedback: extra.feedback } : {}),
                  ...(extra?.enrollment ? { enrollment: extra.enrollment } : {})
                }
              : l
          )
        }))
      },

      togglePrepItem: (lessonId, prepId) => {
        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.id === lessonId
              ? {
                  ...l,
                  prepItems: l.prepItems.map((p) =>
                    p.id === prepId ? { ...p, completed: !p.completed } : p
                  )
                }
              : l
          )
        }))
      },

      addPrepItem: (lessonId, text) => {
        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.id === lessonId
              ? {
                  ...l,
                  prepItems: [...l.prepItems, { id: `p-${Date.now()}`, text, completed: false }]
                }
              : l
          )
        }))
      },

      removePrepItem: (lessonId, prepId) => {
        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.id === lessonId
              ? { ...l, prepItems: l.prepItems.filter((p) => p.id !== prepId) }
              : l
          )
        }))
      },

      submitFeedback: (id, feedback) => {
        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.id === id ? { ...l, status: '已试听', feedback } : l
          )
        }))
      },

      enrollLesson: (id, decision) => {
        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.id === id ? { ...l, status: '已报名', enrollment: decision } : l
          )
        }))
      },

      giveUpLesson: (id, reason) => {
        set((state) => ({
          lessons: state.lessons.map((l) =>
            l.id === id ? { ...l, status: '放弃', giveUpReason: reason } : l
          )
        }))
      },

      deleteLesson: (id) => {
        set((state) => ({ lessons: state.lessons.filter((l) => l.id !== id) }))
      },

      getStats: () => {
        const { lessons } = get()
        const totalFee = lessons.reduce((sum, l) => sum + (l.fee || 0), 0)
        const remainingTrials = lessons.filter((l) => l.status === '待试听').length

        const categoryCount: Record<string, { total: number; score: number }> = {}
        lessons.forEach((l) => {
          if (l.feedback) {
            if (!categoryCount[l.category]) {
              categoryCount[l.category] = { total: 0, score: 0 }
            }
            categoryCount[l.category].total += 1
            categoryCount[l.category].score += l.feedback.childInterest
          }
        })

        let favoriteCategory: CourseCategory | null = null
        let maxScore = 0
        Object.entries(categoryCount).forEach(([cat, data]) => {
          const avgScore = data.score / data.total
          if (avgScore > maxScore) {
            maxScore = avgScore
            favoriteCategory = cat as CourseCategory
          }
        })

        return { totalFee, favoriteCategory, remainingTrials }
      }
    }),
    {
      name: 'trial-lessons-store'
    }
  )
)
