import { create } from 'zustand';
import { Inspection, Notification, RecheckRecord, InspectionStatus, NotificationMethod } from '@/types';
import {
  getInspections,
  addInspection as addInspectionToStorage,
  updateInspection as updateInspectionInStorage,
  deleteInspection as deleteInspectionFromStorage,
  getNotifications,
  addNotification as addNotificationToStorage,
  updateNotification as updateNotificationInStorage,
  getRecheckRecords,
  addRecheckRecord as addRecheckRecordToStorage,
  initializeStorage,
} from '@/services/storageService';
import { generateId, addDaysFromNow } from '@/utils/date';
import { DEFAULT_NOTICE_DAYS } from '@/constants';

interface InspectionState {
  inspections: Inspection[];
  notifications: Notification[];
  recheckRecords: RecheckRecord[];
  isInitialized: boolean;
  initialize: () => void;
  refreshData: () => void;
  addInspection: (data: Omit<Inspection, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'recheckCount'>) => void;
  updateInspection: (id: string, updates: Partial<Inspection>) => void;
  deleteInspection: (id: string) => void;
  markAsCleaned: (id: string, cleanedPhoto?: string) => void;
  addNotification: (
    inspectionId: string,
    data: {
      method: NotificationMethod;
      deadline?: string;
      contactPerson: string;
      contactPhone: string;
    }
  ) => void;
  addFeedback: (notificationId: string, feedback: string) => void;
  addRecheckRecord: (
    inspectionId: string,
    data: {
      result: string;
      needsSecondNotice: boolean;
      remark: string;
    }
  ) => void;
  getInspectionById: (id: string) => Inspection | undefined;
  getNotificationsByInspectionId: (inspectionId: string) => Notification[];
  getRecheckRecordsByInspectionId: (inspectionId: string) => RecheckRecord[];
}

export const useInspectionStore = create<InspectionState>((set, get) => ({
  inspections: [],
  notifications: [],
  recheckRecords: [],
  isInitialized: false,

  initialize: () => {
    initializeStorage();
    get().refreshData();
    set({ isInitialized: true });
  },

  refreshData: () => {
    set({
      inspections: getInspections(),
      notifications: getNotifications(),
      recheckRecords: getRecheckRecords(),
    });
  },

  addInspection: (data) => {
    const now = new Date().toISOString();
    const newInspection: Inspection = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      recheckCount: 0,
    };
    addInspectionToStorage(newInspection);
    get().refreshData();
  },

  updateInspection: (id, updates) => {
    updateInspectionInStorage(id, updates);
    get().refreshData();
  },

  deleteInspection: (id) => {
    deleteInspectionFromStorage(id);
    get().refreshData();
  },

  markAsCleaned: (id, cleanedPhoto) => {
    const now = new Date().toISOString();
    updateInspectionInStorage(id, {
      status: 'cleaned',
      cleanedAt: now,
      cleanedPhoto,
    });
    get().refreshData();
  },

  addNotification: (inspectionId, data) => {
    const now = new Date().toISOString();
    const inspection = get().getInspectionById(inspectionId);
    const currentNotifications = get().getNotificationsByInspectionId(inspectionId);
    
    const newNotification: Notification = {
      id: generateId(),
      inspectionId,
      method: data.method,
      deadline: data.deadline || addDaysFromNow(DEFAULT_NOTICE_DAYS),
      contactPerson: data.contactPerson,
      contactPhone: data.contactPhone,
      status: 'sent',
      createdAt: now,
      noticeCount: currentNotifications.length + 1,
    };
    
    addNotificationToStorage(newNotification);
    
    const newStatus: InspectionStatus = currentNotifications.length === 0 ? 'notified' : 'notified';
    updateInspectionInStorage(inspectionId, { status: newStatus });
    
    if (inspection?.recheckCount !== undefined) {
      updateInspectionInStorage(inspectionId, { status: 'notified' });
    }
    
    get().refreshData();
  },

  addFeedback: (notificationId, feedback) => {
    const now = new Date().toISOString();
    updateNotificationInStorage(notificationId, {
      feedback,
      feedbackAt: now,
      status: 'feedback_received',
    });
    get().refreshData();
  },

  addRecheckRecord: (inspectionId, data) => {
    const now = new Date().toISOString();
    const record: RecheckRecord = {
      id: generateId(),
      inspectionId,
      recheckDate: now,
      ...data,
    };
    addRecheckRecordToStorage(record);
    
    const inspection = get().getInspectionById(inspectionId);
    const currentRecheckCount = inspection?.recheckCount || 0;
    
    if (data.needsSecondNotice) {
      updateInspectionInStorage(inspectionId, {
        status: 'recheck',
        recheckCount: currentRecheckCount + 1,
      });
    }
    
    get().refreshData();
  },

  getInspectionById: (id) => {
    return get().inspections.find((i) => i.id === id);
  },

  getNotificationsByInspectionId: (inspectionId) => {
    return get().notifications.filter((n) => n.inspectionId === inspectionId);
  },

  getRecheckRecordsByInspectionId: (inspectionId) => {
    return get().recheckRecords.filter((r) => r.inspectionId === inspectionId);
  },
}));
