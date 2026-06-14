import { create } from 'zustand';
import { Inspection, Notification, RecheckRecord, InspectionStatus, NotificationMethod } from '@/types';
import {
  getInspections,
  saveInspections,
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
import { generateId, addDaysFromNow, isOverdue } from '@/utils/date';
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

const checkOverdueStatus = (inspections: Inspection[], notifications: Notification[]): Inspection[] => {
  let hasChanges = false;
  const updatedInspections = inspections.map((inspection) => {
    if (inspection.status === 'notified') {
      const latestNotification = notifications
        .filter((n) => n.inspectionId === inspection.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      if (latestNotification?.deadline && isOverdue(latestNotification.deadline)) {
        hasChanges = true;
        return { ...inspection, status: 'overdue' as InspectionStatus, updatedAt: new Date().toISOString() };
      }
    }
    return inspection;
  });
  if (hasChanges) {
    saveInspections(updatedInspections);
  }
  return updatedInspections;
};

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
    const rawInspections = getInspections();
    const notifications = getNotifications();
    const inspections = checkOverdueStatus(rawInspections, notifications);
    set({
      inspections,
      notifications,
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
    const isFirstNotice = currentNotifications.length === 0;

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

    let newStatus: InspectionStatus;
    const updates: Partial<Inspection> = {};

    if (isFirstNotice) {
      newStatus = 'notified';
      updates.status = newStatus;
    } else {
      newStatus = 'recheck';
      updates.status = newStatus;
      const currentRecheckCount = inspection?.recheckCount || 0;
      updates.recheckCount = currentRecheckCount + 1;
    }

    updateInspectionInStorage(inspectionId, updates);
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
