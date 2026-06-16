import { create } from 'zustand';
import { Rectification, RectificationStatus, RectificationType } from '@/types';
import { mockRectifications } from '@/data/rectifications';
import { generateId } from '@/utils/date';

interface RectificationStore {
  rectifications: Rectification[];
  getRectificationById: (id: string) => Rectification | undefined;
  getRectificationsByDeviceId: (deviceId: string) => Rectification[];
  getRectificationsByStatus: (status: RectificationStatus) => Rectification[];
  getRectificationsByType: (type: RectificationType) => Rectification[];
  addRectification: (rectification: Omit<Rectification, 'id' | 'createDate'>) => Rectification;
  updateRectification: (id: string, rectification: Partial<Rectification>) => void;
  closeRectification: (id: string, fixPhoto: string, fixRemark: string) => void;
  getPendingCount: () => number;
}

export const useRectificationStore = create<RectificationStore>((set, get) => ({
  rectifications: mockRectifications,

  getRectificationById: (id) => {
    return get().rectifications.find(r => r.id === id);
  },

  getRectificationsByDeviceId: (deviceId) => {
    return get().rectifications
      .filter(r => r.deviceId === deviceId)
      .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());
  },

  getRectificationsByStatus: (status) => {
    return get().rectifications
      .filter(r => r.status === status)
      .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());
  },

  getRectificationsByType: (type) => {
    return get().rectifications.filter(r => r.type === type);
  },

  addRectification: (rectification) => {
    const newRectification: Rectification = {
      ...rectification,
      id: 'rect' + generateId(),
      createDate: new Date().toISOString().split('T')[0]
    };
    set(state => ({ rectifications: [newRectification, ...state.rectifications] }));
    return newRectification;
  },

  updateRectification: (id, rectification) => {
    set(state => ({
      rectifications: state.rectifications.map(r =>
        r.id === id ? { ...r, ...rectification } : r
      )
    }));
  },

  closeRectification: (id, fixPhoto, fixRemark) => {
    set(state => ({
      rectifications: state.rectifications.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'closed' as RectificationStatus,
              fixPhoto,
              fixRemark,
              fixDate: new Date().toISOString().split('T')[0]
            }
          : r
      )
    }));
  },

  getPendingCount: () => {
    return get().rectifications.filter(r => r.status === 'pending' || r.status === 'processing').length;
  }
}));
