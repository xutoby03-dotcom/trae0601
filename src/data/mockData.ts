import type { CourseSchedule, IssueMarker, IceRink, ShiftReport } from '../types';

export const iceRinkConfig: IceRink = {
  id: 'rink-001',
  name: '主冰场',
  width: 60,
  height: 30,
  doors: [
    { id: 'door-1', name: '主入口', x: 30, y: 0, width: 4, side: 'top' },
    { id: 'door-2', name: '队员通道', x: 5, y: 0, width: 3, side: 'top' },
    { id: 'door-3', name: '裁判入口', x: 55, y: 0, width: 3, side: 'top' },
    { id: 'door-4', name: '设备门', x: 0, y: 15, width: 3, side: 'left' },
  ],
};

export const todaySchedule: CourseSchedule = {
  date: new Date().toISOString().split('T')[0],
  slots: [
    { id: 's1', startTime: '06:00', endTime: '07:30', type: 'training', name: '少年队早训', team: '冰球少年A队' },
    { id: 's2', startTime: '08:00', endTime: '09:30', type: 'training', name: '成人队训练', team: '冰球成人队' },
    { id: 's3', startTime: '10:00', endTime: '12:00', type: 'public', name: '散客时段' },
    { id: 's4', startTime: '13:00', endTime: '14:30', type: 'training', name: '花样滑冰训练', team: '花滑队' },
    { id: 's5', startTime: '15:00', endTime: '17:00', type: 'public', name: '下午散客场' },
    { id: 's6', startTime: '18:00', endTime: '19:30', type: 'private', name: '私人教学' },
    { id: 's7', startTime: '20:00', endTime: '22:00', type: 'event', name: '冰球联赛' },
  ],
};

export const mockIssues: IssueMarker[] = [
  {
    id: 'issue-1',
    type: 'groove',
    x: 25,
    y: 12,
    severity: 'high',
    description: '中区起槽严重，约3米长',
    createdAt: Date.now() - 3600000,
    resolved: false,
    radius: 3,
  },
  {
    id: 'issue-2',
    type: 'water',
    x: 45,
    y: 8,
    severity: 'medium',
    description: '补水过量，积水约2平米',
    createdAt: Date.now() - 1800000,
    resolved: false,
    radius: 2,
  },
  {
    id: 'issue-3',
    type: 'ice_debris',
    x: 30,
    y: 1.5,
    severity: 'low',
    description: '主入口碎冰堆积',
    createdAt: Date.now() - 7200000,
    resolved: false,
    radius: 2,
  },
  {
    id: 'issue-4',
    type: 'closed_area',
    x: 50,
    y: 22,
    severity: 'medium',
    description: '冰面修复区，临时封闭',
    createdAt: Date.now() - 10800000,
    resolved: false,
    radius: 4,
  },
  {
    id: 'issue-5',
    type: 'groove',
    x: 15,
    y: 25,
    severity: 'low',
    description: '轻微划痕，需下次打磨',
    createdAt: Date.now() - 5400000,
    resolved: false,
    radius: 2,
  },
];

export const mockShiftReports: ShiftReport[] = [
  {
    id: 'report-1',
    shift: 'morning',
    date: new Date().toISOString().split('T')[0],
    operatorName: '张师傅',
    iceConditionScore: 85,
    issues: [],
    maintenanceCount: 2,
    notes: '早班完成两次磨冰，整体状况良好，中区略有起槽已标记。',
    nextShiftNotes: '注意午间散客后人流量大，建议14:30后进行一次维护。',
    createdAt: Date.now() - 28800000,
  },
];
