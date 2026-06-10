import { FamilyMember, School, Child, PickupRecord } from '@/types';
import { getToday, getTomorrow, generateWeekDates } from '@/utils/dateUtils';

export const familyMembers: FamilyMember[] = [
  { id: 'm1', name: '张建国', role: '爷爷', phone: '13800138001', color: '#4ECDC4' },
  { id: 'm2', name: '李桂兰', role: '奶奶', phone: '13800138002', color: '#FF6B9D' },
  { id: 'm3', name: '张伟', role: '爸爸', phone: '13800138003', color: '#6C9BD2' },
  { id: 'm4', name: '王芳', role: '妈妈', phone: '13800138004', color: '#FF7A45' },
  { id: 'm5', name: '刘阿姨', role: '阿姨', phone: '13800138005', color: '#9B59B6' },
];

export const schools: School[] = [
  {
    id: 's1',
    name: '阳光幼儿园',
    address: '朝阳区阳光路88号',
    dismissTime: '16:30',
    teacherName: '王老师',
    teacherPhone: '13900139001',
    grade: '大班',
    className: '向日葵班',
  },
  {
    id: 's2',
    name: '彩虹小学',
    address: '海淀区彩虹街12号',
    dismissTime: '17:00',
    teacherName: '李老师',
    teacherPhone: '13900139002',
    grade: '二年级',
    className: '3班',
  },
];

export const children: Child[] = [
  {
    id: 'c1',
    name: '张小宝',
    schoolId: 's1',
    gender: 'boy',
    fixedPickupId: 'm2',
    backupContactIds: ['m1', 'm3'],
  },
  {
    id: 'c2',
    name: '张小贝',
    schoolId: 's2',
    gender: 'girl',
    fixedPickupId: 'm4',
    backupContactIds: ['m3', 'm5'],
  },
];

const weekDates = generateWeekDates();

export const pickupRecords: PickupRecord[] = [
  {
    id: 'p1',
    date: getToday(),
    childId: 'c1',
    schoolId: 's1',
    assignedTo: 'm2',
    status: 'pending',
    swapStatus: 'none',
  },
  {
    id: 'p2',
    date: getToday(),
    childId: 'c2',
    schoolId: 's2',
    assignedTo: 'm4',
    status: 'pending',
    swapStatus: 'requested',
    swapFrom: 'm4',
    swapTo: 'm5',
    swapRequestTime: '09:30',
  },
  {
    id: 'p3',
    date: getTomorrow(),
    childId: 'c1',
    schoolId: 's1',
    assignedTo: 'm1',
    status: 'pending',
    swapStatus: 'confirmed',
    swapFrom: 'm2',
    swapTo: 'm1',
    swapRequestTime: '昨天 14:00',
    swapConfirmTime: '昨天 15:30',
  },
  {
    id: 'p4',
    date: getTomorrow(),
    childId: 'c2',
    schoolId: 's2',
    assignedTo: 'm4',
    status: 'pending',
    swapStatus: 'none',
  },
  {
    id: 'p5',
    date: weekDates[2],
    childId: 'c1',
    schoolId: 's1',
    assignedTo: 'm5',
    status: 'pending',
    swapStatus: 'none',
  },
  {
    id: 'p6',
    date: weekDates[2],
    childId: 'c2',
    schoolId: 's2',
    assignedTo: 'm3',
    status: 'pending',
    swapStatus: 'none',
  },
  {
    id: 'p7',
    date: weekDates[3],
    childId: 'c1',
    schoolId: 's1',
    assignedTo: 'm2',
    status: 'pending',
    swapStatus: 'none',
  },
  {
    id: 'p8',
    date: weekDates[3],
    childId: 'c2',
    schoolId: 's2',
    assignedTo: 'm4',
    status: 'pending',
    swapStatus: 'none',
  },
  {
    id: 'p9',
    date: weekDates[4],
    childId: 'c1',
    schoolId: 's1',
    assignedTo: 'm1',
    status: 'picked',
    pickedTime: '16:35',
    remark: '今天很乖，老师表扬了',
  },
  {
    id: 'p10',
    date: weekDates[4],
    childId: 'c2',
    schoolId: 's2',
    assignedTo: 'm3',
    status: 'late',
    isLate: true,
    lateMinutes: 15,
    pickedTime: '17:15',
    remark: '堵车了，晚了一会儿',
  },
];

export const currentUserId = 'm4';
