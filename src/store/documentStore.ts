import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Document, Material, ReminderSetting, DocumentType, ProcessStatus } from '@/types';
import { DEFAULT_REMINDER_SETTINGS, DEFAULT_MATERIALS } from '@/types';
import { generateId } from '@/utils/dateUtils';

interface DocumentStore {
  documents: Document[];
  materials: Material[];
  reminderSettings: ReminderSetting[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'processStatus'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  getDocumentById: (id: string) => Document | undefined;
  getDocumentsByStatus: (status: string) => Document[];
  updateProcessStatus: (id: string, status: ProcessStatus) => void;
  getMaterialsByDocumentId: (documentId: string) => Material[];
  toggleMaterial: (materialId: string) => void;
  addMaterial: (documentId: string, name: string) => void;
  deleteMaterial: (materialId: string) => void;
  updateReminderSetting: (type: DocumentType, days: number) => void;
  getReminderDays: (type: DocumentType) => number;
  initDefaultMaterials: (documentId: string) => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],
      materials: [],
      reminderSettings: DEFAULT_REMINDER_SETTINGS,

      addDocument: (docData) => {
        const now = new Date().toISOString();
        const newDoc: Document = {
          ...docData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          processStatus: 'not_started',
        };
        set((state) => ({
          documents: [...state.documents, newDoc],
        }));
        get().initDefaultMaterials(newDoc.id);
      },

      updateDocument: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates, updatedAt: now } : doc
          ),
        }));
      },

      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
          materials: state.materials.filter((m) => m.documentId !== id),
        }));
      },

      getDocumentById: (id) => {
        return get().documents.find((doc) => doc.id === id);
      },

      getDocumentsByStatus: (status) => {
        return get().documents.filter((doc) => {
          // Status filtering is handled in components using getDocumentStatus
          return status === 'all' ? true : true;
        });
      },

      updateProcessStatus: (id, status) => {
        get().updateDocument(id, { processStatus: status });
      },

      getMaterialsByDocumentId: (documentId) => {
        return get().materials.filter((m) => m.documentId === documentId);
      },

      toggleMaterial: (materialId) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === materialId ? { ...m, isReady: !m.isReady } : m
          ),
        }));
      },

      addMaterial: (documentId, name) => {
        const newMaterial: Material = {
          id: generateId(),
          documentId,
          name,
          isReady: false,
        };
        set((state) => ({
          materials: [...state.materials, newMaterial],
        }));
      },

      deleteMaterial: (materialId) => {
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== materialId),
        }));
      },

      updateReminderSetting: (type, days) => {
        set((state) => ({
          reminderSettings: state.reminderSettings.map((s) =>
            s.documentType === type ? { ...s, defaultDays: days } : s
          ),
        }));
      },

      getReminderDays: (type) => {
        const setting = get().reminderSettings.find((s) => s.documentType === type);
        return setting?.defaultDays ?? 30;
      },

      initDefaultMaterials: (documentId) => {
        const existing = get().materials.filter((m) => m.documentId === documentId);
        if (existing.length > 0) return;

        const newMaterials: Material[] = DEFAULT_MATERIALS.map((name) => ({
          id: generateId(),
          documentId,
          name,
          isReady: false,
        }));
        set((state) => ({
          materials: [...state.materials, ...newMaterials],
        }));
      },
    }),
    {
      name: 'document-manager-storage',
    }
  )
);
