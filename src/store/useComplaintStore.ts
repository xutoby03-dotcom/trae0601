import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Complaint, Second, Action, NoiseType, DecibelLevel, ComplaintStatus, ActionType } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 10);

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c001',
    location: '3栋2单元1502',
    noiseType: 'renovation',
    noiseTime: '2026-06-09T09:30:00',
    durationMinutes: 120,
    decibelLevel: 'loud',
    affectsRest: false,
    notes: '电钻声不断，从早上九点半开始一直在钻',
    photoUrls: [],
    audioUrls: [],
    status: 'ongoing',
    reporterId: 'u001',
    createdAt: '2026-06-09T09:35:00',
    seconds: [
      { id: 's001', complaintId: 'c001', userId: 'u002', createdAt: '2026-06-09T10:00:00' },
      { id: 's002', complaintId: 'c001', userId: 'u003', createdAt: '2026-06-09T10:15:00' },
      { id: 's003', complaintId: 'c001', userId: 'u005', createdAt: '2026-06-09T11:00:00' },
    ],
    actions: [
      { id: 'a001', complaintId: 'c001', type: 'contacted', actionTime: '2026-06-09T10:30:00', note: '已电话联系装修业主，要求遵守施工时间', operatorId: 'admin' },
    ],
  },
  {
    id: 'c002',
    location: '5栋1单元2201',
    noiseType: 'singing',
    noiseTime: '2026-06-08T23:30:00',
    durationMinutes: 60,
    decibelLevel: 'moderate',
    affectsRest: true,
    notes: '深夜K歌，隔着两层楼都能听到，严重影响睡眠',
    photoUrls: [],
    audioUrls: [],
    status: 'pending',
    reporterId: 'u002',
    createdAt: '2026-06-08T23:35:00',
    seconds: [
      { id: 's004', complaintId: 'c002', userId: 'u004', createdAt: '2026-06-09T00:10:00' },
      { id: 's005', complaintId: 'c002', userId: 'u006', createdAt: '2026-06-09T00:20:00' },
    ],
    actions: [
      { id: 'a002', complaintId: 'c002', type: 'visited', actionTime: '2026-06-09T00:05:00', note: '保安上门敲门无人应答', operatorId: 'admin' },
    ],
  },
  {
    id: 'c003',
    location: '小区中央广场',
    noiseType: 'speaker',
    noiseTime: '2026-06-09T07:00:00',
    durationMinutes: 90,
    decibelLevel: 'extreme',
    affectsRest: true,
    notes: '广场舞大音响七点就开始了，周末都没法睡懒觉',
    photoUrls: [],
    audioUrls: [],
    status: 'recurring',
    reporterId: 'u003',
    createdAt: '2026-06-09T07:10:00',
    seconds: [
      { id: 's006', complaintId: 'c003', userId: 'u001', createdAt: '2026-06-09T07:20:00' },
      { id: 's007', complaintId: 'c003', userId: 'u002', createdAt: '2026-06-09T07:25:00' },
      { id: 's008', complaintId: 'c003', userId: 'u004', createdAt: '2026-06-09T07:30:00' },
      { id: 's009', complaintId: 'c003', userId: 'u005', createdAt: '2026-06-09T07:35:00' },
      { id: 's010', complaintId: 'c003', userId: 'u006', createdAt: '2026-06-09T07:40:00' },
    ],
    actions: [
      { id: 'a003', complaintId: 'c003', type: 'contacted', actionTime: '2026-06-09T07:30:00', note: '已联系广场舞组织者，要求降低音量', operatorId: 'admin' },
      { id: 'a004', complaintId: 'c003', type: 'rectification', actionTime: '2026-06-09T08:00:00', note: '约定8点后降低音量，不再使用大音响', operatorId: 'admin', rectificationDeadline: '2026-06-16T08:00:00' },
    ],
  },
  {
    id: 'c004',
    location: '1栋3单元801',
    noiseType: 'pet',
    noiseTime: '2026-06-07T06:00:00',
    durationMinutes: 30,
    decibelLevel: 'moderate',
    affectsRest: true,
    notes: '狗每天早上六点叫，持续半个多小时',
    photoUrls: [],
    audioUrls: [],
    status: 'resolved',
    reporterId: 'u004',
    createdAt: '2026-06-07T06:15:00',
    seconds: [
      { id: 's011', complaintId: 'c004', userId: 'u003', createdAt: '2026-06-07T06:30:00' },
    ],
    actions: [
      { id: 'a005', complaintId: 'c004', type: 'contacted', actionTime: '2026-06-07T09:00:00', note: '已联系狗主人，主人表示会训练', operatorId: 'admin' },
      { id: 'a006', complaintId: 'c004', type: 'visited', actionTime: '2026-06-08T10:00:00', note: '上门回访，狗主人已采取措施，目前安静', operatorId: 'admin' },
    ],
  },
  {
    id: 'c005',
    location: '7栋2单元603',
    noiseType: 'renovation',
    noiseTime: '2026-06-09T14:00:00',
    durationMinutes: 180,
    decibelLevel: 'extreme',
    affectsRest: false,
    notes: '砸墙声巨响，整栋楼都能感觉到震动',
    photoUrls: [],
    audioUrls: [],
    status: 'ongoing',
    reporterId: 'u005',
    createdAt: '2026-06-09T14:05:00',
    seconds: [
      { id: 's012', complaintId: 'c005', userId: 'u001', createdAt: '2026-06-09T14:20:00' },
      { id: 's013', complaintId: 'c005', userId: 'u002', createdAt: '2026-06-09T14:30:00' },
    ],
    actions: [],
  },
  {
    id: 'c006',
    location: '2栋1单元1803',
    noiseType: 'other',
    noiseTime: '2026-06-08T22:00:00',
    durationMinutes: 45,
    decibelLevel: 'moderate',
    affectsRest: true,
    notes: '楼上不断搬东西拖拽的声音，来回走动很大声',
    photoUrls: [],
    audioUrls: [],
    status: 'pending',
    reporterId: 'u006',
    createdAt: '2026-06-08T22:10:00',
    seconds: [],
    actions: [
      { id: 'a007', complaintId: 'c006', type: 'contacted', actionTime: '2026-06-08T22:30:00', note: '已留言通知楼上住户注意', operatorId: 'admin' },
    ],
  },
  {
    id: 'c007',
    location: '小区中央广场',
    noiseType: 'speaker',
    noiseTime: '2026-06-06T19:00:00',
    durationMinutes: 120,
    decibelLevel: 'loud',
    affectsRest: false,
    notes: '晚上广场舞音响太大，影响孩子写作业',
    photoUrls: [],
    audioUrls: [],
    status: 'recurring',
    reporterId: 'u001',
    createdAt: '2026-06-06T19:10:00',
    seconds: [
      { id: 's014', complaintId: 'c007', userId: 'u003', createdAt: '2026-06-06T19:30:00' },
      { id: 's015', complaintId: 'c007', userId: 'u005', createdAt: '2026-06-06T19:45:00' },
    ],
    actions: [
      { id: 'a008', complaintId: 'c007', type: 'contacted', actionTime: '2026-06-06T19:30:00', note: '已劝导降低音量', operatorId: 'admin' },
      { id: 'a009', complaintId: 'c007', type: 'police', actionTime: '2026-06-06T20:30:00', note: '多次劝导无效，已报警处理', operatorId: 'admin' },
    ],
  },
  {
    id: 'c008',
    location: '4栋3单元1201',
    noiseType: 'singing',
    noiseTime: '2026-06-05T01:00:00',
    durationMinutes: 90,
    decibelLevel: 'loud',
    affectsRest: true,
    notes: '凌晨一点还在嗨歌，完全无法入睡',
    photoUrls: [],
    audioUrls: [],
    status: 'resolved',
    reporterId: 'u002',
    createdAt: '2026-06-05T01:10:00',
    seconds: [
      { id: 's016', complaintId: 'c008', userId: 'u004', createdAt: '2026-06-05T01:20:00' },
      { id: 's017', complaintId: 'c008', userId: 'u006', createdAt: '2026-06-05T01:30:00' },
    ],
    actions: [
      { id: 'a010', complaintId: 'c008', type: 'police', actionTime: '2026-06-05T01:30:00', note: '报警处理，民警上门劝止', operatorId: 'admin' },
      { id: 'a011', complaintId: 'c008', type: 'rectification', actionTime: '2026-06-05T02:00:00', note: '住户承诺不再深夜K歌', operatorId: 'admin', rectificationDeadline: '2026-06-12T22:00:00' },
    ],
  },
  {
    id: 'c009',
    location: '6栋1单元402',
    noiseType: 'pet',
    noiseTime: '2026-06-09T12:00:00',
    durationMinutes: 20,
    decibelLevel: 'quiet',
    affectsRest: false,
    notes: '隔壁养的鹦鹉中午开始叫，声音不大但很烦',
    photoUrls: [],
    audioUrls: [],
    status: 'ongoing',
    reporterId: 'u003',
    createdAt: '2026-06-09T12:05:00',
    seconds: [],
    actions: [],
  },
  {
    id: 'c010',
    location: '3栋2单元1502',
    noiseType: 'renovation',
    noiseTime: '2026-06-06T09:00:00',
    durationMinutes: 240,
    decibelLevel: 'extreme',
    affectsRest: true,
    notes: '同户装修，周末也在施工，电钻锤击不间断',
    photoUrls: [],
    audioUrls: [],
    status: 'recurring',
    reporterId: 'u004',
    createdAt: '2026-06-06T09:10:00',
    seconds: [
      { id: 's018', complaintId: 'c010', userId: 'u001', createdAt: '2026-06-06T09:30:00' },
      { id: 's019', complaintId: 'c010', userId: 'u005', createdAt: '2026-06-06T10:00:00' },
    ],
    actions: [
      { id: 'a012', complaintId: 'c010', type: 'visited', actionTime: '2026-06-06T10:00:00', note: '上门查看，确认周末违规施工', operatorId: 'admin' },
      { id: 'a013', complaintId: 'c010', type: 'rectification', actionTime: '2026-06-06T11:00:00', note: '约定工作日施工，周末停工', operatorId: 'admin', rectificationDeadline: '2026-06-30T18:00:00' },
    ],
  },
];

interface ComplaintStore {
  complaints: Complaint[];
  currentUserId: string;
  addComplaint: (data: Omit<Complaint, 'id' | 'createdAt' | 'seconds' | 'actions' | 'reporterId'>) => void;
  secondComplaint: (complaintId: string) => void;
  addAction: (complaintId: string, type: ActionType, note: string, rectificationDeadline?: string) => void;
  updateStatus: (complaintId: string, status: ComplaintStatus) => void;
  getComplaintsByStatus: (status: ComplaintStatus) => Complaint[];
  getComplaintById: (id: string) => Complaint | undefined;
}

export const useComplaintStore = create<ComplaintStore>()(
  persist(
    (set, get) => ({
      complaints: MOCK_COMPLAINTS,
      currentUserId: 'u001',

      addComplaint: (data) => {
        const newComplaint: Complaint = {
          ...data,
          id: generateId(),
          reporterId: get().currentUserId,
          createdAt: new Date().toISOString(),
          seconds: [],
          actions: [],
        };
        set((state) => ({
          complaints: [newComplaint, ...state.complaints],
        }));
      },

      secondComplaint: (complaintId) => {
        const userId = get().currentUserId;
        set((state) => ({
          complaints: state.complaints.map((c) => {
            if (c.id !== complaintId) return c;
            if (c.seconds.some((s) => s.userId === userId)) return c;
            return {
              ...c,
              seconds: [
                ...c.seconds,
                { id: generateId(), complaintId, userId, createdAt: new Date().toISOString() },
              ],
            };
          }),
        }));
      },

      addAction: (complaintId, type, note, rectificationDeadline) => {
        set((state) => ({
          complaints: state.complaints.map((c) => {
            if (c.id !== complaintId) return c;
            return {
              ...c,
              actions: [
                ...c.actions,
                {
                  id: generateId(),
                  complaintId,
                  type,
                  actionTime: new Date().toISOString(),
                  note,
                  operatorId: 'admin',
                  ...(rectificationDeadline ? { rectificationDeadline } : {}),
                },
              ],
            };
          }),
        }));
      },

      updateStatus: (complaintId, status) => {
        set((state) => ({
          complaints: state.complaints.map((c) =>
            c.id === complaintId ? { ...c, status } : c
          ),
        }));
      },

      getComplaintsByStatus: (status) => {
        return get().complaints.filter((c) => c.status === status);
      },

      getComplaintById: (id) => {
        return get().complaints.find((c) => c.id === id);
      },
    }),
    {
      name: 'noise-complaint-storage',
    }
  )
);
