import type { Course, SignWord, Student, PracticeRecord, Annotation } from '../types';

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    name: '日常问候用语',
    description: '基础手语问候、致谢、道别等常用表达',
    createdAt: '2025-06-10',
  },
  {
    id: 'course-2',
    name: '数字与时间表达',
    description: '数字1-100、年月日、星期、时间点的手语表达',
    createdAt: '2025-06-12',
  },
  {
    id: 'course-3',
    name: '家庭成员称谓',
    description: '父母、兄弟姐妹、爷爷奶奶等亲属称呼',
    createdAt: '2025-06-15',
  },
];

export const mockSignWords: SignWord[] = [
  {
    id: 'word-1',
    courseId: 'course-1',
    name: '你好',
    standardPoints: {
      handShape: '食指伸直，其余四指弯曲握拳，指尖朝上',
      orientation: '手掌朝向对方，手臂自然伸展',
      trajectory: '从胸部位置向前轻轻挥动一次',
      expression: '面带微笑，眼神注视对方',
    },
    createdAt: '2025-06-10',
  },
  {
    id: 'word-2',
    courseId: 'course-1',
    name: '谢谢',
    standardPoints: {
      handShape: '拇指伸出，其余四指弯曲，拇指指尖轻抵下巴',
      orientation: '手心向内下方，手腕放松',
      trajectory: '拇指从下巴处向前下方轻轻划出',
      expression: '真诚的微笑，头微微点一下',
    },
    createdAt: '2025-06-10',
  },
  {
    id: 'word-3',
    courseId: 'course-1',
    name: '再见',
    standardPoints: {
      handShape: '五指伸直张开，手心朝前',
      orientation: '手臂抬起至肩高，手掌面向对方',
      trajectory: '手腕左右轻轻摆动2-3次',
      expression: '微笑，眼神温和地目送',
    },
    createdAt: '2025-06-10',
  },
  {
    id: 'word-4',
    courseId: 'course-2',
    name: '数字5',
    standardPoints: {
      handShape: '五指全部伸直张开',
      orientation: '手心向外或向前，手臂自然放松',
      trajectory: '手保持静止，无需移动',
      expression: '表情自然，无需特殊配合',
    },
    createdAt: '2025-06-12',
  },
  {
    id: 'word-5',
    courseId: 'course-2',
    name: '数字10',
    standardPoints: {
      handShape: '拇指和食指交叉成十字形',
      orientation: '手心向下，十字朝向正前方',
      trajectory: '手保持静止，十字形状清晰',
      expression: '表情自然',
    },
    createdAt: '2025-06-12',
  },
  {
    id: 'word-6',
    courseId: 'course-3',
    name: '妈妈',
    standardPoints: {
      handShape: '食指伸直，其余四指握拳',
      orientation: '食指指尖轻点嘴唇',
      trajectory: '指尖轻触下巴下方位置，稍微点动2次',
      expression: '温柔微笑，带着亲昵感',
    },
    createdAt: '2025-06-15',
  },
];

export const mockStudents: Student[] = [
  {
    id: 'stu-1',
    name: '李小明',
  },
  {
    id: 'stu-2',
    name: '王芳',
  },
  {
    id: 'stu-3',
    name: '张伟',
  },
  {
    id: 'stu-4',
    name: '刘婷',
  },
];

const sampleAnnotations: Annotation[] = [
  {
    id: 'ann-1',
    frameIndex: 15,
    timestamp: 0.5,
    type: 'rect',
    color: '#ff4757',
    x: 0.3,
    y: 0.4,
    width: 0.2,
    height: 0.25,
    errorType: 'handShape',
  },
  {
    id: 'ann-2',
    frameIndex: 30,
    timestamp: 1.0,
    type: 'text',
    color: '#ffa502',
    x: 0.5,
    y: 0.1,
    text: '朝向需要更正一些',
    errorType: 'orientation',
  },
];

export const mockPracticeRecords: PracticeRecord[] = [
  {
    id: 'record-1',
    studentId: 'stu-1',
    signWordId: 'word-1',
    courseId: 'course-1',
    videoUrl: '',
    videoName: '李小明_你好_练习1.mp4',
    scores: {
      handShape: 65,
      orientation: 72,
      trajectory: 80,
      expression: 85,
      comments: {
        handShape: '食指弯曲不够标准，四指应更紧凑握拳',
        orientation: '手掌稍微偏下，应该更正对对方',
        trajectory: '挥动幅度良好',
        expression: '笑容自然，眼神交流到位',
      },
    },
    annotations: sampleAnnotations,
    overallScore: 75.5,
    practiceDate: '2025-06-20',
    needsReview: true,
  },
  {
    id: 'record-2',
    studentId: 'stu-1',
    signWordId: 'word-2',
    courseId: 'course-1',
    videoUrl: '',
    videoName: '李小明_谢谢_练习1.mp4',
    scores: {
      handShape: 55,
      orientation: 60,
      trajectory: 68,
      expression: 78,
      comments: {
        handShape: '拇指位置偏高，应轻抵下巴而不是嘴唇',
        orientation: '手腕角度不够放松',
        trajectory: '划出轨迹偏短，需要更舒展',
        expression: '微笑自然，配合点头动作很好',
      },
    },
    annotations: [],
    overallScore: 65.3,
    practiceDate: '2025-06-20',
    needsReview: true,
  },
  {
    id: 'record-3',
    studentId: 'stu-2',
    signWordId: 'word-1',
    courseId: 'course-1',
    videoUrl: '',
    videoName: '王芳_你好_练习1.mp4',
    scores: {
      handShape: 88,
      orientation: 92,
      trajectory: 85,
      expression: 90,
      comments: {
        handShape: '标准！食指伸直到位',
        orientation: '朝向非常准确',
        trajectory: '挥动手势自然',
        expression: '微笑自然大方',
      },
    },
    annotations: [],
    overallScore: 88.8,
    practiceDate: '2025-06-20',
    needsReview: false,
  },
];
