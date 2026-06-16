import type { Course, Application, Seat } from '../../../shared/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultSeats = (rows: number, cols: number, fixedStudents: number): Seat[][] => {
  const seats: Seat[][] = [];
  let fixedCount = 0;

  for (let row = 0; row < rows; row++) {
    const seatRow: Seat[] = [];
    for (let col = 0; col < cols; col++) {
      let type: Seat['type'] = 'auditor';
      let status: Seat['status'] = 'available';

      if (col === 2 || col === 5) {
        type = 'aisle';
        status = 'blocked';
      } else if (fixedCount < fixedStudents) {
        type = 'fixed';
        status = 'blocked';
        fixedCount++;
      }

      seatRow.push({
        id: `seat-${row}-${col}`,
        row,
        col,
        type,
        status,
        hasOutlet: col === 0 || col === cols - 1,
      });
    }
    seats.push(seatRow);
  }

  return seats;
};

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    name: '高等数学公开课',
    classroom: '教学楼A-301',
    capacity: 60,
    teacher: '张教授',
    fixedStudents: 30,
    auditorQuota: 12,
    isKeyCourse: true,
    date: '2026-06-17',
    startTime: '14:00',
    endTime: '16:30',
    description: '面向全校的高等数学重点难点解析课程',
    seats: createDefaultSeats(7, 8, 30),
  },
  {
    id: 'course-2',
    name: '物理竞赛辅导',
    classroom: '实验楼B-203',
    capacity: 40,
    teacher: '李老师',
    fixedStudents: 20,
    auditorQuota: 10,
    isKeyCourse: true,
    date: '2026-06-18',
    startTime: '19:00',
    endTime: '21:00',
    description: '全国大学生物理竞赛赛前专项辅导',
    seats: createDefaultSeats(5, 8, 20),
  },
  {
    id: 'course-3',
    name: '程序设计基础',
    classroom: '计算机楼C-105',
    capacity: 50,
    teacher: '王副教授',
    fixedStudents: 28,
    auditorQuota: 8,
    isKeyCourse: false,
    date: '2026-06-19',
    startTime: '08:30',
    endTime: '10:30',
    description: 'C语言程序设计入门课程',
    seats: createDefaultSeats(6, 8, 28),
  },
  {
    id: 'course-4',
    name: '英语演讲技巧',
    classroom: '外语楼D-402',
    capacity: 30,
    teacher: '陈老师',
    fixedStudents: 12,
    auditorQuota: 8,
    isKeyCourse: false,
    date: '2026-06-20',
    startTime: '14:00',
    endTime: '15:30',
    description: '提升英语公众演讲能力的实践课程',
    seats: createDefaultSeats(5, 6, 12),
  },
  {
    id: 'course-5',
    name: '人工智能导论',
    classroom: '计算机楼C-201',
    capacity: 80,
    teacher: '刘教授',
    fixedStudents: 45,
    auditorQuota: 19,
    isKeyCourse: true,
    date: '2026-06-21',
    startTime: '10:00',
    endTime: '12:00',
    description: '人工智能基础概念与应用前景介绍',
    seats: createDefaultSeats(8, 10, 45),
  },
];


export const mockApplications: Application[] = [
  {
    id: 'app-1',
    courseId: 'course-1',
    studentName: '赵小明',
    className: '计算机2班',
    reason: '准备考研，需要加强数学基础',
    arrivalTime: '13:45',
    needsOutlet: true,
    status: 'approved',
    seatId: 'seat-5-0',
    createdAt: '2026-06-15T10:30:00',
  },
  {
    id: 'app-2',
    courseId: 'course-1',
    studentName: '钱小红',
    className: '电子3班',
    reason: '对数学建模感兴趣',
    arrivalTime: '13:50',
    needsOutlet: false,
    status: 'pending_approval',
    createdAt: '2026-06-15T11:20:00',
  },
  {
    id: 'app-3',
    courseId: 'course-1',
    studentName: '孙小刚',
    className: '机械1班',
    reason: '补修课程内容',
    arrivalTime: '13:30',
    needsOutlet: false,
    status: 'waitlist',
    waitlistPosition: 1,
    createdAt: '2026-06-15T14:15:00',
  },
  {
    id: 'app-4',
    courseId: 'course-2',
    studentName: '李小华',
    className: '物理2班',
    reason: '参加物理竞赛',
    arrivalTime: '18:45',
    needsOutlet: true,
    status: 'approved',
    seatId: 'seat-3-0',
    createdAt: '2026-06-14T09:00:00',
  },
  {
    id: 'app-5',
    courseId: 'course-3',
    studentName: '王小丽',
    className: '软件工程1班',
    reason: '巩固编程基础',
    arrivalTime: '08:15',
    needsOutlet: true,
    status: 'checked_in',
    seatId: 'seat-5-7',
    createdAt: '2026-06-16T08:00:00',
    checkedInAt: '2026-06-19T08:20:00',
  },
  {
    id: 'app-6',
    courseId: 'course-1',
    studentName: '周小强',
    className: '自动化2班',
    reason: '准备期末考试',
    arrivalTime: '13:55',
    needsOutlet: false,
    status: 'waitlist',
    waitlistPosition: 2,
    createdAt: '2026-06-15T16:45:00',
  },
  {
    id: 'app-7',
    courseId: 'course-5',
    studentName: '吴小芳',
    className: '计算机1班',
    reason: '对AI方向感兴趣',
    arrivalTime: '09:45',
    needsOutlet: true,
    status: 'approved',
    seatId: 'seat-6-0',
    createdAt: '2026-06-15T20:30:00',
  },
  {
    id: 'app-8',
    courseId: 'course-3',
    studentName: '郑小伟',
    className: '网络工程2班',
    reason: '转专业需要',
    arrivalTime: '08:20',
    needsOutlet: true,
    status: 'no_show',
    seatId: 'seat-4-7',
    createdAt: '2026-06-16T10:15:00',
  },
];

export const generateMockId = generateId;
