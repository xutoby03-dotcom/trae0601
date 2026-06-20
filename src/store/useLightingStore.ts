import { create } from 'zustand';
import type {
  LightingSetup,
  CanvasDevice,
  CameraSettings,
  Annotation,
  BookingRecord,
  DeviceCatalogItem,
} from '@/types';
import { MOCK_SETUPS } from '@/data/mockSetups';
import { MOCK_TODAY_BOOKINGS } from '@/data/mockBookings';
import { checkConflicts } from '@/utils/conflictChecker';
import { generateId, todayStr } from '@/utils/common';
import { DEVICE_CATALOG } from '@/data/deviceCatalog';

interface StoreState {
  currentSetup: LightingSetup | null;
  selectedDeviceId: string | null;
  historySetups: LightingSetup[];
  todayBookings: BookingRecord[];
  showConflictModal: boolean;
  conflictDevices: (BookingRecord & { matchedDevice?: CanvasDevice })[];
  showHistoryPanel: boolean;
  pendingDuplicateId: string | null;
  saveToast: string | null;
  snapToGrid: boolean;
  gridStep: number;

  createNewSetup: () => void;
  loadSetup: (id: string) => void;
  saveSetup: () => void;
  duplicateSetup: (id: string) => Promise<void>;
  confirmDuplicate: () => void;
  cancelDuplicate: () => void;
  selectDevice: (id: string | null) => void;
  addDeviceFromCatalog: (item: DeviceCatalogItem, x: number, y: number) => void;
  updateDevice: (id: string, patch: Partial<CanvasDevice>) => void;
  removeDevice: (id: string) => void;
  updateSetupMeta: (patch: Partial<Pick<LightingSetup, 'name' | 'client' | 'shootDate' | 'tags'>>) => void;
  updateCamera: (patch: Partial<CameraSettings>) => void;
  addAnnotation: (ann: Omit<Annotation, 'id' | 'createdAt'>) => void;
  removeAnnotation: (id: string) => void;
  dismissConflictModal: () => void;
  toggleHistoryPanel: () => void;
  setSaveToast: (msg: string | null) => void;
  setSnapToGrid: (enabled: boolean) => void;
  setGridStep: (step: number) => void;
}

const DEFAULT_CAMERA: CameraSettings = {
  cameraModel: 'Sony A7R V',
  lens: 'Sony FE 85mm f/1.4 GM',
  focalLength: 85,
  aperture: 'f/5.6',
  shutterSpeed: '1/160',
  iso: 100,
  whiteBalance: 5500,
};

const createEmptySetup = (): LightingSetup => ({
  id: generateId('setup'),
  name: '未命名布光方案',
  client: '',
  shootDate: todayStr(),
  tags: [],
  devices: [],
  camera: { ...DEFAULT_CAMERA },
  finalImage:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=empty%20studio%20gray%20seamless%20background%20soft%20gradient%20lighting%20professional%20photo&image_size=landscape_4_3',
  btsImage:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=behind%20the%20scenes%20empty%20photography%20studio%20with%20light%20stands%20and%20softboxes%20moody%20interior&image_size=landscape_4_3',
  annotations: [],
  author: '当前用户',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const initialSetup = (): LightingSetup => {
  const base = MOCK_SETUPS[0];
  return {
    ...base,
    id: generateId('setup'),
    name: `${base.name}（副本·复盘）`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const useLightingStore = create<StoreState>((set, get) => ({
  currentSetup: initialSetup(),
  selectedDeviceId: null,
  historySetups: MOCK_SETUPS,
  todayBookings: MOCK_TODAY_BOOKINGS,
  showConflictModal: false,
  conflictDevices: [],
  showHistoryPanel: false,
  pendingDuplicateId: null,
  saveToast: null,
  snapToGrid: true,
  gridStep: 5,

  createNewSetup: () => {
    set({ currentSetup: createEmptySetup(), selectedDeviceId: null });
  },

  loadSetup: (id) => {
    const target = get().historySetups.find((s) => s.id === id);
    if (!target) return;
    set({
      currentSetup: { ...target, updatedAt: Date.now() },
      selectedDeviceId: null,
      showHistoryPanel: false,
    });
  },

  saveSetup: () => {
    const { currentSetup, historySetups } = get();
    if (!currentSetup) return;
    const saved = { ...currentSetup, updatedAt: Date.now() };
    const idx = historySetups.findIndex((s) => s.id === saved.id);
    const nextHistory =
      idx >= 0
        ? [...historySetups.slice(0, idx), saved, ...historySetups.slice(idx + 1)]
        : [saved, ...historySetups];
    set({
      currentSetup: saved,
      historySetups: nextHistory,
      saveToast: '方案已保存 ✓',
    });
    setTimeout(() => get().setSaveToast(null), 2400);
  },

  duplicateSetup: async (id) => {
    const src = get().historySetups.find((s) => s.id === id);
    if (!src) return;
    const conflicts = checkConflicts(src.devices, get().todayBookings);
    if (conflicts.length > 0) {
      set({
        pendingDuplicateId: id,
        conflictDevices: conflicts,
        showConflictModal: true,
      });
    } else {
      const cloned: LightingSetup = {
        ...src,
        id: generateId('setup'),
        name: `${src.name}（副本）`,
        shootDate: todayStr(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        annotations: [],
        devices: src.devices.map((d) => ({ ...d, id: generateId('d') })),
      };
      set({
        currentSetup: cloned,
        selectedDeviceId: null,
        showHistoryPanel: false,
        saveToast: `已从「${src.name}」复制布光方案`,
      });
      setTimeout(() => get().setSaveToast(null), 2800);
    }
  },

  confirmDuplicate: () => {
    const id = get().pendingDuplicateId;
    if (!id) return;
    const src = get().historySetups.find((s) => s.id === id);
    if (!src) return;
    const cloned: LightingSetup = {
      ...src,
      id: generateId('setup'),
      name: `${src.name}（副本·已改）`,
      shootDate: todayStr(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      annotations: [],
      devices: src.devices.map((d) => ({ ...d, id: generateId('d') })),
    };
    set({
      currentSetup: cloned,
      selectedDeviceId: null,
      showHistoryPanel: false,
      showConflictModal: false,
      pendingDuplicateId: null,
      conflictDevices: [],
      saveToast: `已复制，请留意被预约的灯具并更换替代型号`,
    });
    setTimeout(() => get().setSaveToast(null), 3200);
  },

  cancelDuplicate: () => {
    set({
      showConflictModal: false,
      pendingDuplicateId: null,
      conflictDevices: [],
    });
  },

  selectDevice: (id) => set({ selectedDeviceId: id }),

  addDeviceFromCatalog: (item, x, y) => {
    const newDevice: CanvasDevice = {
      id: generateId('d'),
      type: item.type,
      model: item.model || item.name,
      x,
      y,
      rotation: item.type === 'background' ? 0 : 180,
      ...(item.defaultColorTemp ? { colorTemp: item.defaultColorTemp } : {}),
      ...(item.maxPower ? { power: 50 } : {}),
      distance: item.type === 'background' ? undefined : 1.5,
      angle: item.type === 'background' ? undefined : 45,
      modifier:
        item.type === 'main_light' || item.type === 'fill_light'
          ? '柔光箱 60×90cm'
          : undefined,
    };
    const setup = get().currentSetup;
    if (!setup) return;
    set({
      currentSetup: {
        ...setup,
        devices: [...setup.devices, newDevice],
        updatedAt: Date.now(),
      },
      selectedDeviceId: newDevice.id,
    });
  },

  updateDevice: (id, patch) => {
    const setup = get().currentSetup;
    if (!setup) return;
    set({
      currentSetup: {
        ...setup,
        devices: setup.devices.map((d) =>
          d.id === id ? { ...d, ...patch } : d
        ),
        updatedAt: Date.now(),
      },
    });
  },

  removeDevice: (id) => {
    const setup = get().currentSetup;
    if (!setup) return;
    set({
      currentSetup: {
        ...setup,
        devices: setup.devices.filter((d) => d.id !== id),
        updatedAt: Date.now(),
      },
      selectedDeviceId: get().selectedDeviceId === id ? null : get().selectedDeviceId,
    });
  },

  updateSetupMeta: (patch) => {
    const setup = get().currentSetup;
    if (!setup) return;
    set({
      currentSetup: { ...setup, ...patch, updatedAt: Date.now() },
    });
  },

  updateCamera: (patch) => {
    const setup = get().currentSetup;
    if (!setup) return;
    set({
      currentSetup: {
        ...setup,
        camera: { ...setup.camera, ...patch },
        updatedAt: Date.now(),
      },
    });
  },

  addAnnotation: (ann) => {
    const setup = get().currentSetup;
    if (!setup) return;
    const newAnn: Annotation = {
      ...ann,
      id: generateId('a'),
      createdAt: Date.now(),
    };
    set({
      currentSetup: {
        ...setup,
        annotations: [...setup.annotations, newAnn],
        updatedAt: Date.now(),
      },
    });
  },

  removeAnnotation: (id) => {
    const setup = get().currentSetup;
    if (!setup) return;
    set({
      currentSetup: {
        ...setup,
        annotations: setup.annotations.filter((a) => a.id !== id),
        updatedAt: Date.now(),
      },
    });
  },

  dismissConflictModal: () =>
    set({ showConflictModal: false, conflictDevices: [], pendingDuplicateId: null }),

  toggleHistoryPanel: () =>
    set((s) => ({ showHistoryPanel: !s.showHistoryPanel })),

  setSaveToast: (msg) => set({ saveToast: msg }),
  setSnapToGrid: (enabled) => set({ snapToGrid: enabled }),
  setGridStep: (step) => set({ gridStep: step }),
}));
