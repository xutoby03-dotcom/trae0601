export type Gender = 'male' | 'female';

export type CourseTopic = 
  | 'wechat' 
  | 'registration' 
  | 'payment' 
  | 'cleanup' 
  | 'photography' 
  | 'taxi' 
  | 'shortvideo' 
  | 'other';

export type Difficulty = 'beginner' | 'elementary' | 'intermediate' | 'advanced';

export type CourseStatus = 'upcoming' | 'ongoing' | 'finished' | 'cancelled';

export type RegistrationStatus = 'confirmed' | 'waitlist' | 'cancelled' | 'completed';

export interface Elder {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  avatar: string;
  phoneModel: string;
  phoneSystem: 'ios' | 'android' | 'other';
  commonApps: string;
  vision: string;
  hearing: string;
  emergencyContact: string;
  emergencyPhone: string;
  address: string;
  notes: string;
  needHomeVisit: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  topic: CourseTopic;
  difficulty: Difficulty;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  volunteer: string;
  capacity: number;
  status: CourseStatus;
  createdAt: string;
}

export interface Registration {
  id: string;
  elderId: string;
  courseId: string;
  needOneOnOne: boolean;
  withFamily: boolean;
  status: RegistrationStatus;
  waitlistPosition: number;
  notes: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  elderId: string;
  courseId: string;
  volunteerName: string;
  checkInTime: string;
  learnedFunctions: string;
  stuckProblems: string;
  nextFollowUp: string;
  duration: number;
  createdAt: string;
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  skills: string;
  totalHours: number;
}

export const COURSE_TOPIC_MAP: Record<CourseTopic, string> = {
  wechat: '微信使用',
  registration: '手机挂号',
  payment: '手机支付',
  cleanup: '清理内存',
  photography: '拍照修图',
  taxi: '打车出行',
  shortvideo: '短视频',
  other: '其他',
};

export const DIFFICULTY_MAP: Record<Difficulty, string> = {
  beginner: '入门级',
  elementary: '初级',
  intermediate: '中级',
  advanced: '高级',
};

export const COURSE_STATUS_MAP: Record<CourseStatus, string> = {
  upcoming: '未开始',
  ongoing: '进行中',
  finished: '已结束',
  cancelled: '已取消',
};

export const REGISTRATION_STATUS_MAP: Record<RegistrationStatus, string> = {
  confirmed: '已报名',
  waitlist: '候补',
  cancelled: '已取消',
  completed: '已完成',
};

export const PHONE_SYSTEM_MAP: Record<string, string> = {
  ios: 'iOS (苹果)',
  android: 'Android (安卓)',
  other: '其他',
};
