import { ExceptionRecord } from '@/types';

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

export const mockExceptions: ExceptionRecord[] = [
  {
    id: 'exception-4',
    elderlyId: 'elderly-6',
    exceptionDate: yesterdayStr,
    type: 'timeout',
    status: 'resolved',
    firstReminderTime: `${yesterdayStr} 10:10`,
    escalationTime: null,
    knockResult: '电话联系上了，老人手机静音没听到',
    contactedFamily: false,
    needMedical: false,
    handlingNotes: '老人身体无碍，已提醒注意手机音量',
    resolvedTime: `${yesterdayStr} 10:45`,
    resolverId: 'user-1',
  },
  {
    id: 'exception-5',
    elderlyId: 'elderly-10',
    exceptionDate: twoDaysAgoStr,
    type: 'timeout',
    status: 'resolved',
    firstReminderTime: `${twoDaysAgoStr} 10:08`,
    escalationTime: null,
    knockResult: '去公园找到了老人，他在和朋友下棋',
    contactedFamily: false,
    needMedical: false,
    handlingNotes: '老人玩得太投入忘了时间，已提醒每日报平安',
    resolvedTime: `${twoDaysAgoStr} 11:30`,
    resolverId: 'user-1',
  },
];

export const getExceptionsByStatus = (status: string): ExceptionRecord[] => {
  return mockExceptions.filter(e => e.status === status);
};

export const getExceptionsByElderly = (elderlyId: string): ExceptionRecord[] => {
  return mockExceptions.filter(e => e.elderlyId === elderlyId);
};

export const getOpenExceptions = (): ExceptionRecord[] => {
  return mockExceptions.filter(e => e.status !== 'resolved');
};

export const getEscalatedExceptions = (): ExceptionRecord[] => {
  return mockExceptions.filter(e => e.status === 'escalated');
};
