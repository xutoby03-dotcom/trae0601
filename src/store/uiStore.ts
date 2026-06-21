import { create } from 'zustand';
import type { AnnotationType } from '@/types';

export type { AnnotationType };

export interface Annotation {
  id: string;
  type: AnnotationType;
  startTime: number;
  endTime: number;
  label: string;
  description?: string;
  createdAt: string;
}

export interface Recording {
  id: string;
  fileName: string;
  locationName: string;
  location: { lat: number; lng: number };
  latitude: number;
  longitude: number;
  altitude: number;
  duration: number;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  fileSize: string;
  format: string;
  recordedAt: string;
  tags: string[];
  isLocked: boolean;
  waveform: number[];
  description: string;
  weather: {
    condition: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    elevation: number;
  };
  peakDbfs: number;
  deviceModel: string;
  micPattern: string;
  ambienceScore: number;
  distanceSense: string;
  annotations: Annotation[];
  notes?: string;
}

export interface LicenseEvent {
  id: string;
  projectId: string;
  title: string;
  date: string;
  description: string;
  tone: "success" | "warning" | "pending" | "info";
  label: string;
  operator: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  recordingIds: string[];
  status: "active" | "planning" | "completed";
  usedRecordingCount: number;
  targetRecordingCount: number;
  clientName: string | null;
  createdAt: string;
  updatedAt: string;
  coverImage: string;
  license: {
    isLicensed: boolean;
    type: "exclusive" | "non-exclusive";
    startedAt: string | null;
    expiresAt: string | null;
  };
  licenseTimeline: LicenseEvent[];
}

export type PageViewMode = 'map' | 'library' | 'projects';
export type ViewMode = 'list' | 'grid';
export type SortKey = 'fileName' | 'recordedAt' | 'duration' | 'fileSize' | 'locationName';
export type SortOrder = 'asc' | 'desc';

interface UIState {
  currentView: PageViewMode;
  selectedRecordingId: string | null;
  detailPanelOpen: boolean;
  detailLocked: boolean;
  viewMode: ViewMode;
  batchSelectedIds: string[];
  sortKey: SortKey;
  sortOrder: SortOrder;
  expandedFilters: Record<string, boolean>;
  searchQuery: string;
  recordings: Recording[];
  projects: Project[];
  selectedRecordingIds: string[];
  isLockModalOpen: boolean;
  lockModalRecordingIds: string[];
  ambienceMin: number;
  ambienceMax: number;
  distanceSenses: string[];
  peakMin: number;
  peakMax: number;
  lockedFilter: boolean | null;
}

export const DISTANCE_SENSE_LIST = ['近景', '中近景', '中景', '远景', '极远景'] as const;

interface UIStoreFull extends UIState {
  setCurrentView: (view: PageViewMode) => void;
  setSelectedRecordingId: (id: string | null) => void;
  setDetailPanelOpen: (open: boolean) => void;
  setDetailLocked: (locked: boolean) => void;
  toggleDetailPanel: () => void;
  selectRecording: (id: string | null) => void;
  openDetailPanel: (id: string) => void;
  closeDetailPanel: () => void;
  toggleDetailLocked: () => void;

  setViewMode: (mode: ViewMode) => void;
  toggleBatchSelected: (id: string) => void;
  toggleRecordingSelected: (id: string) => void;
  selectAllRecordings: () => void;
  clearSelectedRecordings: () => void;
  setBatchSelected: (ids: string[]) => void;
  clearBatchSelected: () => void;
  setSort: (key: SortKey, order?: SortOrder) => void;
  toggleSortKey: (key: SortKey) => void;
  toggleFilterExpanded: (key: string) => void;
  setSearchQuery: (query: string) => void;
  toggleRecordingLock: (id: string) => void;
  getRecordingById: (id: string) => Recording | undefined;
  openLockModal: (ids?: string[]) => void;
  closeLockModal: () => void;
  toggleLockModal: () => void;

  addAnnotation: (recordingId: string, ann: Omit<Annotation, 'id' | 'createdAt'>) => void;
  deleteAnnotation: (recordingId: string, annotationId: string) => void;
  updateAnnotation: (recordingId: string, annotationId: string, patch: Partial<Annotation>) => void;

  setAmbienceRange: (min: number, max: number) => void;
  toggleDistanceSense: (sense: string) => void;
  setPeakRange: (min: number, max: number) => void;
  setLockedFilter: (locked: boolean | null) => void;
  resetFilters: () => void;
}

function makeWaveform(seed: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < 100; i++) {
    const v =
      Math.sin(i * 0.12 + seed) * 0.3 +
      Math.sin(i * 0.07 + seed * 1.3) * 0.25 +
      Math.sin(i * 0.21 + seed * 0.7) * 0.2 +
      (Math.sin((i + seed) * 0.05) * 0.5 + 0.5) * 0.2;
    arr.push(Math.max(0.05, Math.min(1, Math.abs(v) * 1.1 + 0.08)));
  }
  return arr;
}

const projTimeline1: LicenseEvent[] = [
  { id: 'le-1-1', projectId: 'proj-1', title: '项目启动', date: '2024-10-12', description: '雨林计划立项，划定云南南部 6 个采样点，目标采集 240 小时自然声景。', tone: 'info', label: '立项', operator: '王教授' },
  { id: 'le-1-2', projectId: 'proj-1', title: '野外采集第一期', date: '2024-11-03', description: '完成 92 小时雨林样本采集，含 14 种保护鸟类鸣唱。', tone: 'success', label: '阶段完成', operator: '李田野' },
  { id: 'le-1-3', projectId: 'proj-1', title: '独家授权生效', date: '2024-12-01', description: '与纪录片《赤道之森》签署独家授权协议，覆盖全片配乐使用。', tone: 'success', label: '授权生效', operator: '法务-陈' },
  { id: 'le-1-4', projectId: 'proj-1', title: '授权到期预警', date: '2025-05-20', description: '当前授权将于 30 天后到期，建议与制作方沟通续期事宜。', tone: 'warning', label: '到期提醒', operator: null },
  { id: 'le-1-5', projectId: 'proj-1', title: '续期申请审核中', date: '2025-06-05', description: '已提交第二季续期申请，等待客户确认授权范围与报价。', tone: 'pending', label: '审核中', operator: '张主管' },
];

const projTimeline2: LicenseEvent[] = [
  { id: 'le-2-1', projectId: 'proj-2', title: '海岸线采样计划', date: '2025-01-08', description: '规划青岛-厦门-北海 3 段海岸线共 18 个采样点。', tone: 'info', label: '规划', operator: '周博士' },
  { id: 'le-2-2', projectId: 'proj-2', title: '开始野外作业', date: '2025-03-15', description: '北线青岛至上海段采样启动，预计采集 60 小时潮间带声景。', tone: 'pending', label: '采集中', operator: '吴海风' },
];

const projTimeline3: LicenseEvent[] = [
  { id: 'le-3-1', projectId: 'proj-3', title: '项目立项', date: '2024-06-10', description: '高山水系声景计划立项，含九寨沟、黄龙、贡嘎山 3 个区域。', tone: 'info', label: '立项', operator: '王教授' },
  { id: 'le-3-2', projectId: 'proj-3', title: '采集完成', date: '2024-09-25', description: '完成全部 187 小时样本，包括 2300 米到 4700 米海拔梯度。', tone: 'success', label: '采集完成', operator: '李田野' },
  { id: 'le-3-3', projectId: 'proj-3', title: '非独家授权签署', date: '2024-10-18', description: '以非独家形式授权给国家地理中文网、自然之声博物馆等三家机构。', tone: 'success', label: '已授权', operator: '法务-陈' },
  { id: 'le-3-4', projectId: 'proj-3', title: '项目结项归档', date: '2025-02-28', description: '项目材料完整归档，素材已按 CC BY-NC-SA 开放部分给科研使用。', tone: 'success', label: '结项', operator: '张主管' },
];

const mockRecordings: Recording[] = [
  { id: 'rec-001', fileName: 'YN_Rainforest_Dawn_01.wav', locationName: '云南西双版纳·勐腊雨林', location: { lat: 21.48, lng: 101.56 }, latitude: 21.48, longitude: 101.56, altitude: 780, duration: 1847, sampleRate: 96000, bitDepth: 24, channels: 2, fileSize: '1.02 GB', format: 'WAV', recordedAt: '2024-10-23T06:12:00+08:00', tags: ['雨林', '鸟鸣', '清晨', '溪流'], isLocked: true, waveform: makeWaveform(1), description: '黎明时分的热带雨林，长臂猿远鸣配合近百种鸟类晨唱，背景有持续的山溪声。', weather: { condition: '晴间多云', temperature: 19, humidity: 94, windSpeed: 0.3, elevation: 780 }, peakDbfs: -3.2, deviceModel: 'Sound Devices 888', micPattern: '双声道ORTF', ambienceScore: 9.4, distanceSense: '中景', notes: '长臂猿晨鸣片段可用作纪录片开场，3:15 处有清晰树冠层鸟鸣群。', annotations: [
    { id: 'a1-1', type: 'loop', startTime: 240, endTime: 320, label: '可用循环段 · 晨雾溪声', description: '背景稳定无干扰，适合循环垫乐', createdAt: '2024-10-24T09:12:00+08:00' },
    { id: 'a1-2', type: 'voice', startTime: 512, endTime: 518, label: '人声穿帮 · 护林员', description: '远处护林员对讲机，建议切除', createdAt: '2024-10-25T14:30:00+08:00' },
    { id: 'a1-3', type: 'wind_noise', startTime: 890, endTime: 905, label: '风噪 · 树冠阵风', description: '3 级风扫过树冠，低频可用', createdAt: '2024-10-26T11:05:00+08:00' },
  ]},
  { id: 'rec-002', fileName: 'QD_Coast_Tide_14.wav', locationName: '山东青岛·崂山仰口湾', location: { lat: 36.22, lng: 120.67 }, latitude: 36.22, longitude: 120.67, altitude: 12, duration: 3600, sampleRate: 192000, bitDepth: 24, channels: 2, fileSize: '4.12 GB', format: 'WAV', recordedAt: '2024-11-14T15:36:00+08:00', tags: ['海岸', '潮汐', '风声', '浪'], isLocked: false, waveform: makeWaveform(2), description: '满月大潮，浪峰节奏 9-12 秒周期，风从海面掠过带来远处渔船马达低频。', weather: { condition: '多云', temperature: 12, humidity: 72, windSpeed: 6.8, elevation: 12 }, peakDbfs: -1.8, deviceModel: 'Zoom F6 + DPA 4060', micPattern: '全指向', ambienceScore: 8.1, distanceSense: '远景', notes: '浪涛声节奏规整，适合做氛围底。注意 53 分钟处有渔船经过。', annotations: [
    { id: 'a2-1', type: 'loop', startTime: 180, endTime: 360, label: '可用循环 · 浪涛周期', description: '浪峰节奏稳定，可无缝循环', createdAt: '2024-11-15T10:20:00+08:00' },
    { id: 'a2-2', type: 'traffic', startTime: 2140, endTime: 2165, label: '渔船马达 · 远', description: '远处渔船低频轰鸣，约 80Hz', createdAt: '2024-11-16T16:45:00+08:00' },
  ]},
  { id: 'rec-003', fileName: 'SC_Jiuzhai_Waterfall_A2.wav', locationName: '四川九寨沟·诺日朗瀑布', location: { lat: 33.16, lng: 103.91 }, latitude: 33.16, longitude: 103.91, altitude: 2365, duration: 724, sampleRate: 96000, bitDepth: 24, channels: 2, fileSize: '802 MB', format: 'WAV', recordedAt: '2024-09-08T11:24:00+08:00', tags: ['瀑布', '高原', '森林', '水流'], isLocked: true, waveform: makeWaveform(3), description: '钙化滩瀑布宽阔白噪，林间穿插橙翅噪鹛与红腹锦鸡叫声。', weather: { condition: '小雨', temperature: 11, humidity: 81, windSpeed: 1.2, elevation: 2365 }, peakDbfs: -2.6, deviceModel: 'Sound Devices MixPre-10T', micPattern: '双声道XY', ambienceScore: 8.7, distanceSense: '中近景', notes: '瀑布白噪+林间鸟鸣，已授权给《川西秘境》纪录片。', annotations: [
    { id: 'a3-1', type: 'loop', startTime: 60, endTime: 180, label: '循环段 · 瀑布主声', description: '白噪均匀，适合环境铺垫', createdAt: '2024-09-10T15:30:00+08:00' },
    { id: 'a3-2', type: 'voice', startTime: 445, endTime: 452, label: '人声 · 游客交谈', description: '栈道上游客说话声', createdAt: '2024-09-11T09:12:00+08:00' },
    { id: 'a3-3', type: 'needs_editing', startTime: 0, endTime: 724, label: '待剪辑 · 分段导出', description: '建议切成 5 段不同距离感的素材', createdAt: '2024-09-12T20:00:00+08:00' },
  ]},
  { id: 'rec-004', fileName: 'AH_Huangshan_CloudSea.wav', locationName: '安徽黄山·光明顶', location: { lat: 30.13, lng: 118.17 }, latitude: 30.13, longitude: 118.17, altitude: 1860, duration: 2400, sampleRate: 96000, bitDepth: 24, channels: 2, fileSize: '2.68 GB', format: 'WAV', recordedAt: '2024-10-05T05:48:00+08:00', tags: ['山脉', '云海', '风', '松涛'], isLocked: false, waveform: makeWaveform(4), description: '云海翻涌流过山脊，黄山松针共振与远处山谷鸟鸣。', weather: { condition: '雾', temperature: 7, humidity: 96, windSpeed: 9.4, elevation: 1860 }, peakDbfs: -5.1, deviceModel: 'Tascam DR-701D', micPattern: '心形', ambienceScore: 9.1, distanceSense: '极远景', notes: '云海声+风啸，极远景氛围极好。', annotations: [
    { id: 'a4-1', type: 'wind_noise', startTime: 300, endTime: 340, label: '阵风 · 云海流过', description: '4 级风扫过山脊，带松涛声', createdAt: '2024-10-06T08:30:00+08:00' },
    { id: 'a4-2', type: 'loop', startTime: 900, endTime: 1200, label: '长循环 · 云雾缭绕', description: '5 分钟稳定风声循环', createdAt: '2024-10-07T14:20:00+08:00' },
  ]},
  { id: 'rec-005', fileName: 'JX_Wuyuan_Village_Dusk.wav', locationName: '江西婺源·篁岭古村', location: { lat: 29.46, lng: 117.72 }, latitude: 29.46, longitude: 117.72, altitude: 490, duration: 1440, sampleRate: 48000, bitDepth: 24, channels: 2, fileSize: '820 MB', format: 'FLAC', recordedAt: '2024-11-02T17:30:00+08:00', tags: ['乡村', '黄昏', '人声', '虫鸣'], isLocked: false, waveform: makeWaveform(5), description: '秋日黄昏，晒秋农户归家，鸭群振翅配以蟋蟀和远处炊烟袅袅中的村落广播。', weather: { condition: '晴', temperature: 15, humidity: 68, windSpeed: 0.8, elevation: 490 }, peakDbfs: -4.3, deviceModel: 'Sony PCM-D100', micPattern: '双声道XY', ambienceScore: 7.6, distanceSense: '中景', notes: '人声较多，适合乡村题材但需挑片段用。', annotations: [
    { id: 'a5-1', type: 'voice', startTime: 210, endTime: 225, label: '人声 · 农妇交谈', description: '晒场收谷子的妇女说话声', createdAt: '2024-11-03T21:05:00+08:00' },
    { id: 'a5-2', type: 'traffic', startTime: 680, endTime: 690, label: '摩托车 · 村道', description: '远处村道摩托经过', createdAt: '2024-11-04T09:18:00+08:00' },
    { id: 'a5-3', type: 'loop', startTime: 1080, endTime: 1200, label: '虫鸣夜曲', description: '入夜后蟋蟀合唱，无干扰', createdAt: '2024-11-04T19:40:00+08:00' },
    { id: 'a5-4', type: 'needs_editing', startTime: 0, endTime: 1440, label: '待整理 · 提取虫鸣段', description: '剪 3 段纯虫鸣素材', createdAt: '2024-11-05T10:00:00+08:00' },
  ]},
  { id: 'rec-006', fileName: 'GS_Dunhuang_SingingSand.wav', locationName: '甘肃敦煌·鸣沙山', location: { lat: 40.09, lng: 94.67 }, latitude: 40.09, longitude: 94.67, altitude: 1650, duration: 1080, sampleRate: 96000, bitDepth: 24, channels: 1, fileSize: '1.18 GB', format: 'WAV', recordedAt: '2024-08-19T19:05:00+08:00', tags: ['沙漠', '沙丘', '风声', '驼铃'], isLocked: false, waveform: makeWaveform(6), description: '日落时分沙粒滑坡自鸣声，罕见的 150Hz 低频轰鸣，偶有商队驼铃。', weather: { condition: '晴', temperature: 28, humidity: 18, windSpeed: 4.2, elevation: 1650 }, peakDbfs: -6.4, deviceModel: 'Zoom H8 + Schoeps MK4', micPattern: '心形', ambienceScore: 8.9, distanceSense: '近景', notes: '鸣沙山自鸣声非常罕见，150Hz 低频轰鸣很有特色。', annotations: [
    { id: 'a6-1', type: 'loop', startTime: 120, endTime: 300, label: '沙鸣低频段', description: '150Hz 沙粒自鸣声，极其罕见', createdAt: '2024-08-21T16:30:00+08:00' },
    { id: 'a6-2', type: 'wind_noise', startTime: 540, endTime: 560, label: '阵风扬沙', description: '3 级风吹起沙粒打在防风罩', createdAt: '2024-08-22T09:10:00+08:00' },
    { id: 'a6-3', type: 'traffic', startTime: 820, endTime: 835, label: '驼铃商队 · 远', description: '远处商队经过，驼铃声清晰', createdAt: '2024-08-22T19:25:00+08:00' },
  ]},
];

const mockProjects: Project[] = [
  { id: 'proj-1', name: '雨林计划', description: '云南南部热带雨林全年声景采样，用于自然纪录片与生物多样性声学监测。', recordingIds: ['rec-001', 'rec-003'], status: 'active', usedRecordingCount: 2, targetRecordingCount: 5, clientName: '赤道之森纪录片组', createdAt: '2024-10-12T09:00:00+08:00', updatedAt: '2025-06-05T14:32:00+08:00', coverImage: '', license: { isLicensed: true, type: 'exclusive', startedAt: '2024-12-01', expiresAt: '2025-06-30' }, licenseTimeline: projTimeline1 },
  { id: 'proj-2', name: '海岸线', description: '中国东部沿海潮间带生态声学调查，覆盖渤海至北部湾。', recordingIds: ['rec-002'], status: 'planning', usedRecordingCount: 1, targetRecordingCount: 8, clientName: '国家海洋博物馆', createdAt: '2025-01-08T10:20:00+08:00', updatedAt: '2025-03-15T18:44:00+08:00', coverImage: '', license: { isLicensed: false, type: 'non-exclusive', startedAt: null, expiresAt: null }, licenseTimeline: projTimeline2 },
  { id: 'proj-3', name: '高山水系', description: '川西至藏东海拔梯度声景采集，含瀑布、溪流、高山湖泊。', recordingIds: ['rec-004', 'rec-006'], status: 'completed', usedRecordingCount: 2, targetRecordingCount: 2, clientName: '国家地理中文网', createdAt: '2024-06-10T08:30:00+08:00', updatedAt: '2025-02-28T16:10:00+08:00', coverImage: '', license: { isLicensed: true, type: 'non-exclusive', startedAt: '2024-10-18', expiresAt: '2026-10-18' }, licenseTimeline: projTimeline3 },
];

export const useUIStore = create<UIStoreFull>((set, get) => ({
  currentView: 'map',
  selectedRecordingId: null,
  detailPanelOpen: false,
  detailLocked: false,
  viewMode: 'grid',
  batchSelectedIds: [],
  sortKey: 'recordedAt',
  sortOrder: 'desc',
  expandedFilters: { search: true, envTags: true, date: true, status: false, spec: false },
  searchQuery: '',
  recordings: mockRecordings,
  projects: mockProjects,
  selectedRecordingIds: [],
  isLockModalOpen: false,
  lockModalRecordingIds: [],
  ambienceMin: 1,
  ambienceMax: 10,
  distanceSenses: [],
  peakMin: -20,
  peakMax: 0,
  lockedFilter: null,

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedRecordingId: (id) =>
    set({
      selectedRecordingId: id,
      detailPanelOpen: id !== null,
    }),
  setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),
  setDetailLocked: (locked) => set({ detailLocked: locked }),
  toggleDetailPanel: () => set((s) => ({ detailPanelOpen: !s.detailPanelOpen })),
  selectRecording: (id) =>
    set({
      selectedRecordingId: id,
      detailPanelOpen: id !== null,
    }),
  openDetailPanel: (id) =>
    set({
      selectedRecordingId: id,
      detailPanelOpen: true,
    }),
  closeDetailPanel: () =>
    set({
      detailPanelOpen: false,
      selectedRecordingId: null,
    }),
  toggleDetailLocked: () => set((s) => ({ detailLocked: !s.detailLocked })),

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleBatchSelected: (id) =>
    set((s) => ({
      batchSelectedIds: s.batchSelectedIds.includes(id)
        ? s.batchSelectedIds.filter((x) => x !== id)
        : [...s.batchSelectedIds, id],
    })),
  toggleRecordingSelected: (id) =>
    set((s) => ({
      selectedRecordingIds: s.selectedRecordingIds.includes(id)
        ? s.selectedRecordingIds.filter((x) => x !== id)
        : [...s.selectedRecordingIds, id],
    })),
  selectAllRecordings: () =>
    set({ selectedRecordingIds: get().recordings.map((r) => r.id) }),
  clearSelectedRecordings: () => set({ selectedRecordingIds: [] }),
  setBatchSelected: (ids) => set({ batchSelectedIds: ids }),
  clearBatchSelected: () => set({ batchSelectedIds: [] }),
  setSort: (key, order) => set({ sortKey: key, sortOrder: order ?? get().sortOrder }),
  toggleSortKey: (key) => {
    const current = get();
    if (current.sortKey === key) {
      set({ sortOrder: current.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortKey: key, sortOrder: 'desc' });
    }
  },
  toggleFilterExpanded: (key) =>
    set((s) => ({
      expandedFilters: { ...s.expandedFilters, [key]: !s.expandedFilters[key] },
    })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleRecordingLock: (id) =>
    set((s) => ({
      recordings: s.recordings.map((r) =>
        r.id === id ? { ...r, isLocked: !r.isLocked } : r
      ),
    })),
  getRecordingById: (id) => get().recordings.find((r) => r.id === id),
  openLockModal: (ids) =>
    set({
      isLockModalOpen: true,
      lockModalRecordingIds: ids ?? get().batchSelectedIds,
    }),
  closeLockModal: () =>
    set({
      isLockModalOpen: false,
      lockModalRecordingIds: [],
    }),
  toggleLockModal: () =>
    set((s) => ({
      isLockModalOpen: !s.isLockModalOpen,
      lockModalRecordingIds: s.isLockModalOpen ? [] : s.lockModalRecordingIds,
    })),

  addAnnotation: (recordingId, ann) =>
    set((s) => ({
      recordings: s.recordings.map((r) =>
        r.id === recordingId
          ? {
              ...r,
              annotations: [
                ...r.annotations,
                {
                  ...ann,
                  id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : r
      ),
    })),
  deleteAnnotation: (recordingId, annotationId) =>
    set((s) => ({
      recordings: s.recordings.map((r) =>
        r.id === recordingId
          ? { ...r, annotations: r.annotations.filter((a) => a.id !== annotationId) }
          : r
      ),
    })),
  updateAnnotation: (recordingId, annotationId, patch) =>
    set((s) => ({
      recordings: s.recordings.map((r) =>
        r.id === recordingId
          ? {
              ...r,
              annotations: r.annotations.map((a) =>
                a.id === annotationId ? { ...a, ...patch } : a
              ),
            }
          : r
      ),
    })),

  setAmbienceRange: (min, max) => set({ ambienceMin: min, ambienceMax: max }),
  toggleDistanceSense: (sense) =>
    set((s) => {
      const has = s.distanceSenses.includes(sense);
      return {
        distanceSenses: has
          ? s.distanceSenses.filter((x) => x !== sense)
          : [...s.distanceSenses, sense],
      };
    }),
  setPeakRange: (min, max) => set({ peakMin: min, peakMax: max }),
  setLockedFilter: (locked) => set({ lockedFilter: locked }),
  resetFilters: () =>
    set({
      searchQuery: '',
      ambienceMin: 1,
      ambienceMax: 10,
      distanceSenses: [],
      peakMin: -20,
      peakMax: 0,
      lockedFilter: null,
    }),
}));
