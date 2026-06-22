import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TeaItem, ClothConfig, StageVersion, DetectionResult, ItemType } from '@/types';
import { getItemTemplate } from '@/data/items';
import { runAllDetections } from '@/utils/layout';

interface TeaStore {
  items: TeaItem[];
  clothConfig: ClothConfig;
  versions: StageVersion[];
  currentVersionId: string | null;
  detections: DetectionResult[];
  movementPath: string;
  selectedItemId: string | null;

  addItem: (type: ItemType, x: number, y: number) => void;
  updateItem: (id: string, updates: Partial<TeaItem>) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  updateClothConfig: (config: Partial<ClothConfig>) => void;
  saveVersion: (name: string) => void;
  loadVersion: (id: string) => void;
  deleteVersion: (id: string) => void;
  runDetection: () => void;
  setMovementPath: (path: string) => void;
  clearAll: () => void;
  bringToFront: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultClothConfig: ClothConfig = {
  width: 600,
  height: 400,
  hostDirection: 'left',
  guestDirection: 'right',
};

export const useTeaStore = create<TeaStore>()(
  persist(
    (set, get) => ({
      items: [],
      clothConfig: defaultClothConfig,
      versions: [],
      currentVersionId: null,
      detections: [],
      movementPath: '',
      selectedItemId: null,

      addItem: (type, x, y) => {
        const template = getItemTemplate(type);
        if (!template) return;

        const newItem: TeaItem = {
          id: generateId(),
          type,
          name: template.name,
          x: x - template.defaultWidth / 2,
          y: y - template.defaultHeight / 2,
          width: template.defaultWidth,
          height: template.defaultHeight,
          rotation: 0,
          isLeftHand: template.isLeftHand,
        };

        set((state) => ({
          items: [...state.items, newItem],
          selectedItemId: newItem.id,
        }));

        get().runDetection();
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
        get().runDetection();
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
        }));
        get().runDetection();
      },

      selectItem: (id) => {
        set({ selectedItemId: id });
      },

      updateClothConfig: (config) => {
        set((state) => ({
          clothConfig: { ...state.clothConfig, ...config },
        }));
        get().runDetection();
      },

      saveVersion: (name) => {
        const { items, clothConfig, movementPath } = get();
        const newVersion: StageVersion = {
          id: generateId(),
          name,
          createdAt: Date.now(),
          items: JSON.parse(JSON.stringify(items)),
          clothConfig: { ...clothConfig },
          movementPath,
        };

        set((state) => ({
          versions: [...state.versions, newVersion],
          currentVersionId: newVersion.id,
        }));
      },

      loadVersion: (id) => {
        const version = get().versions.find((v) => v.id === id);
        if (!version) return;

        set({
          items: JSON.parse(JSON.stringify(version.items)),
          clothConfig: { ...version.clothConfig },
          movementPath: version.movementPath,
          currentVersionId: id,
          selectedItemId: null,
        });

        get().runDetection();
      },

      deleteVersion: (id) => {
        set((state) => ({
          versions: state.versions.filter((v) => v.id !== id),
          currentVersionId:
            state.currentVersionId === id ? null : state.currentVersionId,
        }));
      },

      runDetection: () => {
        const { items, clothConfig } = get();
        const detections = runAllDetections(items, clothConfig);
        set({ detections });
      },

      setMovementPath: (path) => {
        set({ movementPath: path });
      },

      clearAll: () => {
        set({
          items: [],
          detections: [],
          selectedItemId: null,
          currentVersionId: null,
        });
      },

      bringToFront: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;
          const filtered = state.items.filter((i) => i.id !== id);
          return { items: [...filtered, item] };
        });
      },
    }),
    {
      name: 'tea-stage-storage',
    }
  )
);
