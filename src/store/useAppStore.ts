import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Equipment,
  Calibration,
  ListeningTest,
  Alert,
  NewEquipment,
  NewCalibration,
  NewListeningTest,
  AlertSeverity,
} from '../types';

const genId = () => Math.random().toString(36).slice(2, 10);

const mockEquipments: Equipment[] = [
  {
    id: 'eq001',
    turntableModel: 'Technics SL-1200GR',
    tonearmModel: 'Technics S-shaped Tonearm',
    cartridgeModel: 'Ortofon 2M Blue',
    targetForceMin: 1.8,
    targetForceMax: 2.2,
    installDate: '2024-01-15',
    notes: '主试听室A号机，高频表现优秀',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'eq002',
    turntableModel: 'Audio-Technica AT-LP7',
    tonearmModel: 'AT J-shaped Carbon Tonearm',
    cartridgeModel: 'Shure V15VxMR',
    targetForceMin: 1.5,
    targetForceMax: 2.0,
    installDate: '2024-03-22',
    notes: '中低频醇厚，适合爵士',
    createdAt: '2024-03-22T14:30:00Z',
  },
  {
    id: 'eq003',
    turntableModel: 'Pro-Ject Debut Pro',
    tonearmModel: 'Pro-Ject 10" Carbon',
    cartridgeModel: 'Dynavector DV-10X5',
    targetForceMin: 1.7,
    targetForceMax: 2.1,
    installDate: '2024-06-08',
    notes: '新装机，MC唱头需精细调整',
    createdAt: '2024-06-08T09:15:00Z',
  },
];

const mockCalibrations: Calibration[] = [
  {
    id: 'cal001',
    equipmentId: 'eq001',
    calibrationDate: '2025-12-01',
    targetForce: 2.0,
    measuredForce: 2.05,
    antiSkate: 2.0,
    operator: '张工',
    notes: '校准状态良好',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'cal002',
    equipmentId: 'eq001',
    calibrationDate: '2026-01-10',
    targetForce: 2.0,
    measuredForce: 1.88,
    antiSkate: 1.8,
    operator: '李工',
    notes: '针压略有下降，已微调',
    createdAt: '2026-01-10T11:20:00Z',
  },
  {
    id: 'cal003',
    equipmentId: 'eq001',
    calibrationDate: '2026-02-15',
    targetForce: 2.0,
    measuredForce: 1.65,
    antiSkate: 1.5,
    operator: '张工',
    notes: '偏差较大，需要关注',
    createdAt: '2026-02-15T09:45:00Z',
  },
  {
    id: 'cal004',
    equipmentId: 'eq002',
    calibrationDate: '2025-12-10',
    targetForce: 1.75,
    measuredForce: 1.78,
    antiSkate: 1.75,
    operator: '王工',
    notes: '',
    createdAt: '2025-12-10T13:30:00Z',
  },
  {
    id: 'cal005',
    equipmentId: 'eq002',
    calibrationDate: '2026-01-20',
    targetForce: 1.75,
    measuredForce: 1.82,
    antiSkate: 1.8,
    operator: '张工',
    notes: '',
    createdAt: '2026-01-20T16:10:00Z',
  },
  {
    id: 'cal006',
    equipmentId: 'eq002',
    calibrationDate: '2026-03-01',
    targetForce: 1.75,
    measuredForce: 1.92,
    antiSkate: 2.0,
    operator: '李工',
    notes: '偏差较大，重新调整',
    createdAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 'cal007',
    equipmentId: 'eq003',
    calibrationDate: '2026-01-15',
    targetForce: 1.9,
    measuredForce: 1.88,
    antiSkate: 1.9,
    operator: '王工',
    notes: 'MC唱头精细校准',
    createdAt: '2026-01-15T14:00:00Z',
  },
  {
    id: 'cal008',
    equipmentId: 'eq003',
    calibrationDate: '2026-02-20',
    targetForce: 1.9,
    measuredForce: 1.92,
    antiSkate: 1.8,
    operator: '王工',
    notes: '',
    createdAt: '2026-02-20T11:45:00Z',
  },
];

const mockListeningTests: ListeningTest[] = [
  {
    id: 'lt001',
    calibrationId: 'cal001',
    equipmentId: 'eq001',
    testDate: '2025-12-05',
    jumpLevel: 0,
    sibilanceLevel: 1,
    leftChannelDb: -3.2,
    rightChannelDb: -3.1,
    recordName: '爵士名盘 Kind of Blue',
    notes: '表现稳定',
    createdAt: '2025-12-05T15:00:00Z',
  },
  {
    id: 'lt002',
    calibrationId: 'cal002',
    equipmentId: 'eq001',
    testDate: '2026-01-12',
    jumpLevel: 1,
    sibilanceLevel: 2,
    leftChannelDb: -3.0,
    rightChannelDb: -3.5,
    recordName: '贝多芬第九交响曲',
    notes: '',
    createdAt: '2026-01-12T10:20:00Z',
  },
  {
    id: 'lt003',
    calibrationId: 'cal003',
    equipmentId: 'eq001',
    testDate: '2026-02-18',
    jumpLevel: 3,
    sibilanceLevel: 4,
    leftChannelDb: -2.5,
    rightChannelDb: -4.8,
    recordName: 'Pink Floyd - The Wall',
    notes: '高频段落有明显齿音，内圈跳针',
    createdAt: '2026-02-18T14:30:00Z',
  },
  {
    id: 'lt004',
    calibrationId: 'cal003',
    equipmentId: 'eq001',
    testDate: '2026-02-25',
    jumpLevel: 2,
    sibilanceLevel: 3,
    leftChannelDb: -2.8,
    rightChannelDb: -4.5,
    recordName: '古典小提琴精选',
    notes: '状况持续，建议更换针尖',
    createdAt: '2026-02-25T16:40:00Z',
  },
  {
    id: 'lt005',
    calibrationId: 'cal003',
    equipmentId: 'eq001',
    testDate: '2026-03-05',
    jumpLevel: 4,
    sibilanceLevel: 5,
    leftChannelDb: -2.2,
    rightChannelDb: -5.1,
    recordName: '蔡琴老歌',
    notes: '人声齿音严重，必须维护',
    createdAt: '2026-03-05T11:15:00Z',
  },
  {
    id: 'lt006',
    calibrationId: 'cal004',
    equipmentId: 'eq002',
    testDate: '2025-12-15',
    jumpLevel: 0,
    sibilanceLevel: 1,
    leftChannelDb: -3.5,
    rightChannelDb: -3.4,
    recordName: 'Miles Davis - Blue in Green',
    notes: '中低频极佳',
    createdAt: '2025-12-15T13:50:00Z',
  },
  {
    id: 'lt007',
    calibrationId: 'cal005',
    equipmentId: 'eq002',
    testDate: '2026-01-22',
    jumpLevel: 0,
    sibilanceLevel: 2,
    leftChannelDb: -3.3,
    rightChannelDb: -3.6,
    recordName: 'Ella & Louis',
    notes: '',
    createdAt: '2026-01-22T14:20:00Z',
  },
  {
    id: 'lt008',
    calibrationId: 'cal005',
    equipmentId: 'eq002',
    testDate: '2026-02-05',
    jumpLevel: 1,
    sibilanceLevel: 2,
    leftChannelDb: -3.1,
    rightChannelDb: -3.8,
    recordName: '德沃夏克 自新世界',
    notes: '',
    createdAt: '2026-02-05T10:45:00Z',
  },
  {
    id: 'lt009',
    calibrationId: 'cal006',
    equipmentId: 'eq002',
    testDate: '2026-03-03',
    jumpLevel: 1,
    sibilanceLevel: 2,
    leftChannelDb: -3.4,
    rightChannelDb: -3.7,
    recordName: 'Bill Evans Trio',
    notes: '重新校准后略有改善',
    createdAt: '2026-03-03T15:30:00Z',
  },
  {
    id: 'lt010',
    calibrationId: 'cal007',
    equipmentId: 'eq003',
    testDate: '2026-01-18',
    jumpLevel: 0,
    sibilanceLevel: 0,
    leftChannelDb: -2.8,
    rightChannelDb: -2.8,
    recordName: 'Hi-Fi 测试碟',
    notes: 'MC唱头解析力极佳',
    createdAt: '2026-01-18T14:00:00Z',
  },
  {
    id: 'lt011',
    calibrationId: 'cal007',
    equipmentId: 'eq003',
    testDate: '2026-02-01',
    jumpLevel: 0,
    sibilanceLevel: 1,
    leftChannelDb: -2.9,
    rightChannelDb: -3.0,
    recordName: '夜上海老歌精选',
    notes: '',
    createdAt: '2026-02-01T16:20:00Z',
  },
  {
    id: 'lt012',
    calibrationId: 'cal008',
    equipmentId: 'eq003',
    testDate: '2026-02-22',
    jumpLevel: 0,
    sibilanceLevel: 0,
    leftChannelDb: -2.7,
    rightChannelDb: -2.9,
    recordName: '古典交响精选',
    notes: '状态良好',
    createdAt: '2026-02-22T11:30:00Z',
  },
  {
    id: 'lt013',
    calibrationId: 'cal008',
    equipmentId: 'eq003',
    testDate: '2026-03-02',
    jumpLevel: 1,
    sibilanceLevel: 1,
    leftChannelDb: -2.9,
    rightChannelDb: -3.1,
    recordName: '流行人声测试',
    notes: '',
    createdAt: '2026-03-02T13:45:00Z',
  },
  {
    id: 'lt014',
    calibrationId: 'cal008',
    equipmentId: 'eq003',
    testDate: '2026-03-08',
    jumpLevel: 0,
    sibilanceLevel: 0,
    leftChannelDb: -2.8,
    rightChannelDb: -2.8,
    recordName: '张学友 - 吻别',
    notes: '各方面均衡',
    createdAt: '2026-03-08T10:00:00Z',
  },
  {
    id: 'lt015',
    calibrationId: 'cal008',
    equipmentId: 'eq003',
    testDate: '2026-03-15',
    jumpLevel: 0,
    sibilanceLevel: 0,
    leftChannelDb: -2.7,
    rightChannelDb: -2.9,
    recordName: '邓丽君 精选集',
    notes: '',
    createdAt: '2026-03-15T15:20:00Z',
  },
];

interface AppState {
  equipments: Equipment[];
  calibrations: Calibration[];
  listeningTests: ListeningTest[];
  addEquipment: (data: NewEquipment) => void;
  updateEquipment: (id: string, data: Partial<NewEquipment>) => void;
  deleteEquipment: (id: string) => void;
  addCalibration: (data: NewCalibration) => void;
  updateCalibration: (id: string, data: Partial<NewCalibration>) => void;
  deleteCalibration: (id: string) => void;
  addListeningTest: (data: NewListeningTest) => void;
  updateListeningTest: (id: string, data: Partial<NewListeningTest>) => void;
  deleteListeningTest: (id: string) => void;
  getEquipmentName: (id: string) => string;
  getEquipment: (id: string) => Equipment | undefined;
  getCalibrationsByEquipment: (equipmentId: string) => Calibration[];
  getLatestCalibration: (equipmentId: string) => Calibration | undefined;
  getTestsByEquipment: (equipmentId: string) => ListeningTest[];
  getLatestTestsByEquipment: (equipmentId: string, count?: number) => ListeningTest[];
  generateAlerts: () => Alert[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      equipments: mockEquipments,
      calibrations: mockCalibrations,
      listeningTests: mockListeningTests,

      addEquipment: (data) =>
        set((s) => ({
          equipments: [
            ...s.equipments,
            { ...data, id: genId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateEquipment: (id, data) =>
        set((s) => ({
          equipments: s.equipments.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),

      deleteEquipment: (id) =>
        set((s) => ({
          equipments: s.equipments.filter((e) => e.id !== id),
          calibrations: s.calibrations.filter((c) => c.equipmentId !== id),
          listeningTests: s.listeningTests.filter((t) => t.equipmentId !== id),
        })),

      addCalibration: (data) =>
        set((s) => ({
          calibrations: [
            ...s.calibrations,
            { ...data, id: genId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateCalibration: (id, data) =>
        set((s) => ({
          calibrations: s.calibrations.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteCalibration: (id) =>
        set((s) => ({
          calibrations: s.calibrations.filter((c) => c.id !== id),
          listeningTests: s.listeningTests.filter((t) => t.calibrationId !== id),
        })),

      addListeningTest: (data) =>
        set((s) => ({
          listeningTests: [
            ...s.listeningTests,
            { ...data, id: genId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateListeningTest: (id, data) =>
        set((s) => ({
          listeningTests: s.listeningTests.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),

      deleteListeningTest: (id) =>
        set((s) => ({
          listeningTests: s.listeningTests.filter((t) => t.id !== id),
        })),

      getEquipmentName: (id) => {
        const eq = get().equipments.find((e) => e.id === id);
        return eq ? `${eq.turntableModel} / ${eq.cartridgeModel}` : '未知设备';
      },

      getEquipment: (id) => get().equipments.find((e) => e.id === id),

      getCalibrationsByEquipment: (equipmentId) =>
        get()
          .calibrations.filter((c) => c.equipmentId === equipmentId)
          .sort((a, b) => b.calibrationDate.localeCompare(a.calibrationDate)),

      getLatestCalibration: (equipmentId) => {
        const list = get().getCalibrationsByEquipment(equipmentId);
        return list[0];
      },

      getTestsByEquipment: (equipmentId) =>
        get()
          .listeningTests.filter((t) => t.equipmentId === equipmentId)
          .sort((a, b) => b.testDate.localeCompare(a.testDate)),

      getLatestTestsByEquipment: (equipmentId, count = 3) =>
        get().getTestsByEquipment(equipmentId).slice(0, count),

      generateAlerts: () => {
        const alerts: Alert[] = [];
        const { equipments, getLatestCalibration, getLatestTestsByEquipment } = get();

        equipments.forEach((eq) => {
          const latestCal = getLatestCalibration(eq.id);
          const recentTests = getLatestTestsByEquipment(eq.id, 3);

          if (latestCal) {
            const deviation = latestCal.measuredForce - latestCal.targetForce;
            const outsideRange =
              latestCal.measuredForce < eq.targetForceMin - 0.3 ||
              latestCal.measuredForce > eq.targetForceMax + 0.3;
            if (Math.abs(deviation) > 0.3 || outsideRange) {
              const severity: AlertSeverity = Math.abs(deviation) > 0.5 || outsideRange ? 'danger' : 'warning';
              alerts.push({
                id: `force-${eq.id}`,
                equipmentId: eq.id,
                type: 'realignment',
                severity,
                message: `针压偏差 ${deviation > 0 ? '+' : ''}${deviation.toFixed(2)} mN，建议重新调平唱臂针压`,
                relatedRecordId: latestCal.id,
              });
            }
          }

          if (recentTests.length > 0) {
            const latestTest = recentTests[0];
            const channelDiff = Math.abs(latestTest.leftChannelDb - latestTest.rightChannelDb);
            if (channelDiff > 2) {
              alerts.push({
                id: `channel-${eq.id}`,
                equipmentId: eq.id,
                type: 'channel_balance',
                severity: channelDiff > 3 ? 'danger' : 'warning',
                message: `左右声道偏差 ${channelDiff.toFixed(1)} dB，建议检查唱头方位角和AZM调整`,
                relatedRecordId: latestTest.id,
              });
            }

            if (latestTest.jumpLevel >= 3 || latestTest.sibilanceLevel >= 4) {
              alerts.push({
                id: `stylus-${eq.id}`,
                equipmentId: eq.id,
                type: 'replace_stylus',
                severity: 'danger',
                message: `跳针${latestTest.jumpLevel}级/齿音${latestTest.sibilanceLevel}级，建议检查或更换针尖`,
                relatedRecordId: latestTest.id,
              });
            } else if (
              recentTests.length >= 3 &&
              recentTests.every((t) => t.jumpLevel >= 2 || t.sibilanceLevel >= 3)
            ) {
              alerts.push({
                id: `stylus-trend-${eq.id}`,
                equipmentId: eq.id,
                type: 'replace_stylus',
                severity: 'warning',
                message: '连续3次试听出现异常，建议检查针尖磨损情况',
                relatedRecordId: latestTest.id,
              });
            }
          }
        });

        return alerts;
      },
    }),
    { name: 'vinyl-calibration-store' }
  )
);
