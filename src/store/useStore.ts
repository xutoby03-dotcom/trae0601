import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Patient, Visit, VisitRecord, MaterialItem } from '@/types';

interface AppState {
  patients: Patient[];
  visits: Visit[];
  records: VisitRecord[];
  companions: string[];
  
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  
  addVisit: (visit: Omit<Visit, 'id'>) => void;
  updateVisit: (id: string, visit: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;
  toggleMaterial: (visitId: string, materialId: string) => void;
  confirmVisit: (visitId: string) => void;
  completeVisit: (visitId: string) => void;
  
  addRecord: (record: Omit<VisitRecord, 'id'>) => void;
  updateRecord: (id: string, record: Partial<VisitRecord>) => void;
  
  addCompanion: (name: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultMaterials: MaterialItem[] = [
  { id: generateId(), name: '片子/影像资料', prepared: false },
  { id: generateId(), name: '医保卡', prepared: false },
  { id: generateId(), name: '上次化验单', prepared: false },
];

const initialPatients: Patient[] = [
  {
    id: 'p1',
    name: '张爷爷',
    disease: '高血压、糖尿病',
    hospital: '市第一人民医院',
    doctor: '李医生',
    medicationNotes: '早上饭前吃降压药，饭后吃降糖药',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=grandpa1',
  },
  {
    id: 'p2',
    name: '王奶奶',
    disease: '关节炎、心脏病',
    hospital: '市中心医院',
    doctor: '赵医生',
    medicationNotes: '饭后服用，注意保暖',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=grandma1',
  },
];

const initialVisits: Visit[] = [
  {
    id: 'v1',
    patientId: 'p1',
    department: '心内科',
    visitTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    checkItems: '血压测量、心电图、抽血化验',
    materials: [
      { id: 'm1', name: '片子/影像资料', prepared: true },
      { id: 'm2', name: '医保卡', prepared: true },
      { id: 'm3', name: '上次化验单', prepared: false },
    ],
    companion: '大儿子',
    transport: '自驾',
    status: 'upcoming',
    confirmed: false,
  },
  {
    id: 'v2',
    patientId: 'p2',
    department: '骨科',
    visitTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    checkItems: '膝关节X光、骨密度检查',
    materials: [
      { id: 'm4', name: '片子/影像资料', prepared: false },
      { id: 'm5', name: '医保卡', prepared: false },
      { id: 'm6', name: '上次化验单', prepared: false },
    ],
    companion: '女儿',
    transport: '打车',
    status: 'upcoming',
    confirmed: false,
  },
  {
    id: 'v3',
    patientId: 'p1',
    department: '内分泌科',
    visitTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    checkItems: '血糖检测、糖化血红蛋白',
    materials: [
      { id: 'm7', name: '片子/影像资料', prepared: true },
      { id: 'm8', name: '医保卡', prepared: true },
      { id: 'm9', name: '上次化验单', prepared: true },
    ],
    companion: '小儿子',
    transport: '公交',
    status: 'completed',
    confirmed: true,
  },
];

const initialRecords: VisitRecord[] = [
  {
    id: 'r1',
    visitId: 'v3',
    advice: '血糖控制良好，继续保持饮食控制。建议增加运动量。',
    nextVisit: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    dosageChange: '降糖药剂量不变，降压药维持原剂量',
  },
];

const initialCompanions = ['大儿子', '小儿子', '女儿', '女婿'];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      patients: initialPatients,
      visits: initialVisits,
      records: initialRecords,
      companions: initialCompanions,

      addPatient: (patient) =>
        set((state) => ({
          patients: [...state.patients, { ...patient, id: generateId() }],
        })),

      updatePatient: (id, patient) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...patient } : p
          ),
        })),

      deletePatient: (id) =>
        set((state) => ({
          patients: state.patients.filter((p) => p.id !== id),
          visits: state.visits.filter((v) => v.patientId !== id),
        })),

      addVisit: (visit) =>
        set((state) => ({
          visits: [
            ...state.visits,
            { ...visit, id: generateId(), materials: visit.materials || defaultMaterials.map(m => ({ ...m, id: generateId() })) },
          ].sort((a, b) => new Date(a.visitTime).getTime() - new Date(b.visitTime).getTime()),
        })),

      updateVisit: (id, visit) =>
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === id ? { ...v, ...visit } : v
          ),
        })),

      deleteVisit: (id) =>
        set((state) => ({
          visits: state.visits.filter((v) => v.id !== id),
        })),

      toggleMaterial: (visitId, materialId) =>
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  materials: v.materials.map((m) =>
                    m.id === materialId ? { ...m, prepared: !m.prepared } : m
                  ),
                }
              : v
          ),
        })),

      confirmVisit: (visitId) =>
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId ? { ...v, confirmed: true, status: 'confirmed' } : v
          ),
        })),

      completeVisit: (visitId) =>
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId ? { ...v, status: 'completed' } : v
          ),
        })),

      addRecord: (record) =>
        set((state) => ({
          records: [...state.records, { ...record, id: generateId() }],
        })),

      updateRecord: (id, record) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        })),

      addCompanion: (name) =>
        set((state) => ({
          companions: state.companions.includes(name)
            ? state.companions
            : [...state.companions, name],
        })),
    }),
    {
      name: 'visit-scheduler-storage',
    }
  )
);
