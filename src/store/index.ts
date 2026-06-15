import { create } from 'zustand';
import type {
  Room,
  Curtain,
  WashingRecord,
  Photo,
  Reminder,
  RemovalCheck,
  MissingPart,
  WashingStep,
} from '@/types';
import { loadFromStorage, saveRooms, saveCurtains, saveRecords, savePhotos, saveReminders, generateId } from '@/utils/storage';
import { getNowStr } from '@/utils/date';
import { calculateTotalMinutes, generateReminders as genReminders } from '@/utils/statistics';
import { mockRooms, mockCurtains, mockRecords, mockPhotos } from '@/data/mockData';

interface AppStore {
  rooms: Room[];
  curtains: Curtain[];
  records: WashingRecord[];
  photos: Photo[];
  reminders: Reminder[];
  init: () => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  addCurtain: (curtain: Omit<Curtain, 'id'>) => void;
  updateCurtain: (curtain: Curtain) => void;
  deleteCurtain: (id: string) => void;
  addRecord: (record: Omit<WashingRecord, 'id'>) => void;
  updateRecord: (record: WashingRecord) => void;
  deleteRecord: (id: string) => void;
  addPhoto: (photo: Omit<Photo, 'id'>) => void;
  deletePhoto: (id: string) => void;
  generateReminders: () => void;
  updateWashingStep: (recordId: string, step: WashingStep) => void;
  updateRemovalCheck: (recordId: string, check: RemovalCheck) => void;
  addMissingPart: (recordId: string, part: Omit<MissingPart, 'id'>) => void;
  updateMissingPart: (recordId: string, part: MissingPart) => void;
  removeMissingPart: (recordId: string, partId: string) => void;
  completeWashing: (recordId: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  rooms: [],
  curtains: [],
  records: [],
  photos: [],
  reminders: [],

  init: () => {
    const data = loadFromStorage();
    if (data.rooms.length === 0 && data.curtains.length === 0) {
      saveRooms(mockRooms);
      saveCurtains(mockCurtains);
      saveRecords(mockRecords);
      savePhotos(mockPhotos);
      set({
        rooms: mockRooms,
        curtains: mockCurtains,
        records: mockRecords,
        photos: mockPhotos,
        reminders: [],
      });
    } else {
      set(data);
    }
    get().generateReminders();
  },

  addRoom: (room) => {
    const newRoom = { ...room, id: generateId() };
    set((state) => {
      const rooms = [...state.rooms, newRoom];
      saveRooms(rooms);
      return { rooms };
    });
  },

  updateRoom: (room) => {
    set((state) => {
      const rooms = state.rooms.map((r) => (r.id === room.id ? room : r));
      saveRooms(rooms);
      return { rooms };
    });
  },

  deleteRoom: (id) => {
    set((state) => {
      const rooms = state.rooms.filter((r) => r.id !== id);
      saveRooms(rooms);
      const curtains = state.curtains.filter((c) => c.roomId !== id);
      saveCurtains(curtains);
      const curtainIds = state.curtains.filter((c) => c.roomId === id).map((c) => c.id);
      const records = state.records.filter((r) => !curtainIds.includes(r.curtainId));
      saveRecords(records);
      const photos = state.photos.filter((p) => !curtainIds.includes(p.curtainId));
      savePhotos(photos);
      return { rooms, curtains, records, photos };
    });
    get().generateReminders();
  },

  addCurtain: (curtain) => {
    const newCurtain = { ...curtain, id: generateId() };
    set((state) => {
      const curtains = [...state.curtains, newCurtain];
      saveCurtains(curtains);
      return { curtains };
    });
    get().generateReminders();
  },

  updateCurtain: (curtain) => {
    set((state) => {
      const curtains = state.curtains.map((c) => (c.id === curtain.id ? curtain : c));
      saveCurtains(curtains);
      return { curtains };
    });
    get().generateReminders();
  },

  deleteCurtain: (id) => {
    set((state) => {
      const curtains = state.curtains.filter((c) => c.id !== id);
      saveCurtains(curtains);
      const records = state.records.filter((r) => r.curtainId !== id);
      saveRecords(records);
      const photos = state.photos.filter((p) => p.curtainId !== id);
      savePhotos(photos);
      return { curtains, records, photos };
    });
    get().generateReminders();
  },

  addRecord: (record) => {
    const newRecord = { ...record, id: generateId() };
    set((state) => {
      const records = [...state.records, newRecord];
      saveRecords(records);
      return { records };
    });
  },

  updateRecord: (record) => {
    set((state) => {
      const records = state.records.map((r) => (r.id === record.id ? record : r));
      saveRecords(records);
      return { records };
    });
  },

  deleteRecord: (id) => {
    set((state) => {
      const records = state.records.filter((r) => r.id !== id);
      saveRecords(records);
      return { records };
    });
    get().generateReminders();
  },

  addPhoto: (photo) => {
    const newPhoto = { ...photo, id: generateId() };
    set((state) => {
      const photos = [...state.photos, newPhoto];
      savePhotos(photos);
      return { photos };
    });
  },

  deletePhoto: (id) => {
    set((state) => {
      const photos = state.photos.filter((p) => p.id !== id);
      savePhotos(photos);
      return { photos };
    });
  },

  generateReminders: () => {
    const { rooms, curtains, records } = get();
    const reminders = genReminders(curtains, rooms, records);
    saveReminders(reminders);
    set({ reminders });
  },

  updateWashingStep: (recordId, step) => {
    set((state) => {
      const records = state.records.map((r) => {
        if (r.id !== recordId) return r;
        const updates: Partial<WashingRecord> = { currentStep: step };
        const now = getNowStr();
        if (step === 'removal' && !r.removalTime) updates.removalTime = now;
        if (step === 'wash' && !r.washTime) updates.washTime = now;
        if (step === 'dry' && !r.dryTime) updates.dryTime = now;
        if (step === 'install' && !r.installTime) updates.installTime = now;
        return { ...r, ...updates };
      });
      saveRecords(records);
      return { records };
    });
  },

  updateRemovalCheck: (recordId, check) => {
    set((state) => {
      const records = state.records.map((r) =>
        r.id === recordId ? { ...r, removalCheck: check } : r
      );
      saveRecords(records);
      return { records };
    });
  },

  addMissingPart: (recordId, part) => {
    const newPart = { ...part, id: generateId() };
    set((state) => {
      const records = state.records.map((r) =>
        r.id === recordId ? { ...r, missingParts: [...r.missingParts, newPart] } : r
      );
      saveRecords(records);
      return { records };
    });
    get().generateReminders();
  },

  updateMissingPart: (recordId, part) => {
    set((state) => {
      const records = state.records.map((r) =>
        r.id === recordId
          ? { ...r, missingParts: r.missingParts.map((p) => (p.id === part.id ? part : p)) }
          : r
      );
      saveRecords(records);
      return { records };
    });
    get().generateReminders();
  },

  removeMissingPart: (recordId, partId) => {
    set((state) => {
      const records = state.records.map((r) =>
        r.id === recordId
          ? { ...r, missingParts: r.missingParts.filter((p) => p.id !== partId) }
          : r
      );
      saveRecords(records);
      return { records };
    });
    get().generateReminders();
  },

  completeWashing: (recordId) => {
    set((state) => {
      const records = state.records.map((r) => {
        if (r.id !== recordId) return r;
        const updated = {
          ...r,
          completed: true,
          currentStep: 'complete' as WashingStep,
          installTime: r.installTime || getNowStr(),
        };
        updated.totalMinutes = calculateTotalMinutes(updated);
        return updated;
      });
      saveRecords(records);

      const record = records.find((r) => r.id === recordId);
      if (record) {
        const curtains = state.curtains.map((c) =>
          c.id === record.curtainId
            ? { ...c, lastWashDate: new Date().toISOString().split('T')[0] }
            : c
        );
        saveCurtains(curtains);
        return { records, curtains };
      }

      return { records };
    });
    get().generateReminders();
  },
}));
