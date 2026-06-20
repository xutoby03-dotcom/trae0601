import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Inspection, LensInfo, CheckItem, SamplePhoto, RiskTag, CheckStatus, EvaluationReport } from '@/types';
import { createInitialCheckItems } from '@/data/checklistItems';
import { calculateEvaluation } from '@/utils/evaluation';

interface InspectionState {
  inspections: Inspection[];
  currentInspectionId: string | null;
  createInspection: (lensInfo: Omit<LensInfo, 'id' | 'createdAt'>) => Inspection;
  getInspection: (id: string) => Inspection | undefined;
  updateCheckItem: (inspectionId: string, itemId: string, status: CheckStatus, notes?: string) => void;
  addSamplePhoto: (inspectionId: string, photo: Omit<SamplePhoto, 'id'>) => void;
  removeSamplePhoto: (inspectionId: string, photoId: string) => void;
  addRiskTag: (inspectionId: string, tag: Omit<RiskTag, 'id'>) => void;
  updateRiskTag: (inspectionId: string, tagId: string, updates: Partial<RiskTag>) => void;
  removeRiskTag: (inspectionId: string, tagId: string) => void;
  setCurrentStep: (inspectionId: string, step: number) => void;
  generateReport: (inspectionId: string) => EvaluationReport | undefined;
  deleteInspection: (id: string) => void;
}

const genId = () => Math.random().toString(36).slice(2, 10);

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      inspections: [],
      currentInspectionId: null,

      createInspection: (lensInfo) => {
        const newInspection: Inspection = {
          id: genId(),
          lensInfo: {
            ...lensInfo,
            id: genId(),
            createdAt: new Date().toISOString(),
          },
          checkItems: createInitialCheckItems(),
          samplePhotos: [],
          riskTags: [],
          currentStep: 0,
        };
        set((state) => ({
          inspections: [newInspection, ...state.inspections],
          currentInspectionId: newInspection.id,
        }));
        return newInspection;
      },

      getInspection: (id) => {
        return get().inspections.find((i) => i.id === id);
      },

      updateCheckItem: (inspectionId, itemId, status, notes) => {
        set((state) => ({
          inspections: state.inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return {
              ...inspection,
              checkItems: inspection.checkItems.map((item) => {
                if (item.id !== itemId) return item;
                return { ...item, status, notes: notes ?? item.notes };
              }),
            };
          }),
        }));
      },

      addSamplePhoto: (inspectionId, photo) => {
        set((state) => ({
          inspections: state.inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return {
              ...inspection,
              samplePhotos: [...inspection.samplePhotos, { ...photo, id: genId() }],
            };
          }),
        }));
      },

      removeSamplePhoto: (inspectionId, photoId) => {
        set((state) => ({
          inspections: state.inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return {
              ...inspection,
              samplePhotos: inspection.samplePhotos.filter((p) => p.id !== photoId),
            };
          }),
        }));
      },

      addRiskTag: (inspectionId, tag) => {
        set((state) => ({
          inspections: state.inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return {
              ...inspection,
              riskTags: [...inspection.riskTags, { ...tag, id: genId() }],
            };
          }),
        }));
      },

      updateRiskTag: (inspectionId, tagId, updates) => {
        set((state) => ({
          inspections: state.inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return {
              ...inspection,
              riskTags: inspection.riskTags.map((tag) => {
                if (tag.id !== tagId) return tag;
                return { ...tag, ...updates };
              }),
            };
          }),
        }));
      },

      removeRiskTag: (inspectionId, tagId) => {
        set((state) => ({
          inspections: state.inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return {
              ...inspection,
              riskTags: inspection.riskTags.filter((t) => t.id !== tagId),
            };
          }),
        }));
      },

      setCurrentStep: (inspectionId, step) => {
        set((state) => ({
          inspections: state.inspections.map((inspection) => {
            if (inspection.id !== inspectionId) return inspection;
            return { ...inspection, currentStep: step };
          }),
        }));
      },

      generateReport: (inspectionId) => {
        const inspection = get().getInspection(inspectionId);
        if (!inspection) return undefined;
        const report = calculateEvaluation(inspection);
        set((state) => ({
          inspections: state.inspections.map((i) => {
            if (i.id !== inspectionId) return i;
            return { ...i, report };
          }),
        }));
        return report;
      },

      deleteInspection: (id) => {
        set((state) => ({
          inspections: state.inspections.filter((i) => i.id !== id),
          currentInspectionId: state.currentInspectionId === id ? null : state.currentInspectionId,
        }));
      },
    }),
    {
      name: 'lens-check-inspections',
    }
  )
);
