import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SamplingSite, SampleRecord } from '@/types';
import { generateId } from '@/utils/formatters';

interface SamplingState {
  sites: SamplingSite[];
  sampleRecords: SampleRecord[];
  selectedSiteId: string | null;
  addSite: (site: Omit<SamplingSite, 'id' | 'createdAt'>) => void;
  updateSite: (id: string, updates: Partial<SamplingSite>) => void;
  deleteSite: (id: string) => void;
  setSelectedSiteId: (id: string | null) => void;
  addSampleRecord: (record: Omit<SampleRecord, 'id' | 'sampledAt'>) => void;
  updateSampleRecord: (id: string, updates: Partial<SampleRecord>) => void;
  deleteSampleRecord: (id: string) => void;
}

const getInitialSites = (): SamplingSite[] => {
  const now = new Date();
  const tomorrow1 = new Date(now);
  tomorrow1.setDate(tomorrow1.getDate() + 1);
  tomorrow1.setHours(6, 30, 0, 0);

  const tomorrow2 = new Date(now);
  tomorrow2.setDate(tomorrow2.getDate() + 1);
  tomorrow2.setHours(18, 45, 0, 0);

  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(7, 15, 0, 0);

  return [
    {
      id: generateId(),
      name: '东滩一号点位',
      targetSpecies: '菲律宾蛤仔',
      lowTideTime: tomorrow1.toISOString(),
      travelTimeMinutes: 45,
      permitStatus: 'approved',
      notes: '靠近防波堤，注意泥泞',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: '西滩泥滩区',
      targetSpecies: '四角蛤蜊',
      lowTideTime: tomorrow2.toISOString(),
      travelTimeMinutes: 60,
      permitStatus: 'pending',
      notes: '需走林间小道',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: '南岛岩礁带',
      targetSpecies: '紫贻贝',
      lowTideTime: dayAfter.toISOString(),
      travelTimeMinutes: 30,
      permitStatus: 'approved',
      notes: '岩礁湿滑，穿防滑鞋',
      createdAt: new Date().toISOString(),
    },
  ];
};

const getInitialSampleRecords = (sites: SamplingSite[]): SampleRecord[] => {
  if (sites.length < 2) return [];
  return [
    {
      id: generateId(),
      siteId: sites[0].id,
      sampleNumber: 'DT-2026-001',
      salinity: 28.5,
      waterTemperature: 22.3,
      sampledAt: new Date(Date.now() - 86400000).toISOString(),
      notes: '表层沉积物取样',
    },
    {
      id: generateId(),
      siteId: sites[0].id,
      sampleNumber: 'DT-2026-002',
      salinity: 29.1,
      waterTemperature: 21.8,
      sampledAt: new Date(Date.now() - 86400000).toISOString(),
      notes: '低潮线附近',
    },
  ];
};

export const useSamplingStore = create<SamplingState>()(
  persist(
    (set) => {
      const initialSites = getInitialSites();
      return {
        sites: initialSites,
        sampleRecords: getInitialSampleRecords(initialSites),
        selectedSiteId: initialSites.length > 0 ? initialSites[0].id : null,

        addSite: (siteData) => {
          const newSite: SamplingSite = {
            ...siteData,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            sites: [...state.sites, newSite],
            selectedSiteId: newSite.id,
          }));
        },

        updateSite: (id, updates) => {
          set((state) => ({
            sites: state.sites.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          }));
        },

        deleteSite: (id) => {
          set((state) => {
            const newSites = state.sites.filter((s) => s.id !== id);
            const newRecords = state.sampleRecords.filter((r) => r.siteId !== id);
            return {
              sites: newSites,
              sampleRecords: newRecords,
              selectedSiteId:
                state.selectedSiteId === id
                  ? newSites.length > 0
                    ? newSites[0].id
                    : null
                  : state.selectedSiteId,
            };
          });
        },

        setSelectedSiteId: (id) => {
          set({ selectedSiteId: id });
        },

        addSampleRecord: (recordData) => {
          const newRecord: SampleRecord = {
            ...recordData,
            id: generateId(),
            sampledAt: new Date().toISOString(),
          };
          set((state) => ({
            sampleRecords: [...state.sampleRecords, newRecord],
          }));
        },

        updateSampleRecord: (id, updates) => {
          set((state) => ({
            sampleRecords: state.sampleRecords.map((r) =>
              r.id === id ? { ...r, ...updates } : r
            ),
          }));
        },

        deleteSampleRecord: (id) => {
          set((state) => ({
            sampleRecords: state.sampleRecords.filter((r) => r.id !== id),
          }));
        },
      };
    },
    {
      name: 'tidal-sampling-storage',
      partialize: (state) => ({
        sites: state.sites,
        sampleRecords: state.sampleRecords,
        selectedSiteId: state.selectedSiteId,
      }),
    }
  )
);
