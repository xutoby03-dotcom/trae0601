import { ExceptionRecord } from '@/types';
import { getToday } from '@/utils/date';

const today = getToday();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

export const mockExceptions: ExceptionRecord[] = [
  {
    id: 'exception-1',
    elderlyId: 'elderly-4',
    exceptionDate: today,
    type: 'timeout',
    status: 'pending',
    firstReminderTime: null,
    escalationTime: null,
    knockResult: null,
    contactedFamily: null,
    needMedical: null,
    handlingNotes: '',
    resolvedTime: null,
    resolverId: null,
  },
  {
    id: 'exception-2',
    elderlyId: 'elderly-5',
    exceptionDate: today,
    type: 'timeout',
    status: 'processing',
    firstReminderTime: `${today} 10:05`,
    escalationTime: null,
    knockResult: '敲门无人应答',
    contactedFamily: true,
    needMedical: false,
    handlingNotes: '已联系侄子，他正在赶来的路上',
    resolvedTime: null,
    resolverId: null,
  },
  {
    id: 'exception-3',
    elderlyId: 'elderly-8',
    exceptionDate: today,
    type: 'timeout',
    status: 'escalated',
    firstReminderTime: `${today} 10:02`,
    escalationTime: `${today} 12:10`,
    knockResult: '敲门很久才开门，老人说身体不舒服',
    contactedFamily: true,
    needMedical: true,
    handlingNotes: '老人说头晕，已经联系120和女儿，正在等救护车',
    resolvedTime: null,
    resolverId: null,
  },
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
