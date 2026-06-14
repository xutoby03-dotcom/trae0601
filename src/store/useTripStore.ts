import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Trip, Person, Document, DocumentType } from '@/types';
import { generateId } from '@/utils/dateUtils';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const mockTrip: Trip = {
  id: 'trip-001',
  destination: '东京',
  departureTime: addDays(15),
  transport: '飞机 · 东京成田机场',
  accommodation: '新宿华盛顿酒店',
  notes: '五天四晚自由行',
};

const mockPersons: Person[] = [
  {
    id: 'person-001',
    name: '张明',
    avatar: '👨',
    emergencyContact: '张妈妈 13800138001',
    notes: '队长，负责行程规划',
  },
  {
    id: 'person-002',
    name: '李华',
    avatar: '👩',
    emergencyContact: '李爸爸 13900139002',
    notes: '负责订机票酒店',
  },
  {
    id: 'person-003',
    name: '王芳',
    avatar: '👧',
    emergencyContact: '王姐姐 13700137003',
    notes: '日语小能手',
  },
  {
    id: 'person-004',
    name: '赵强',
    avatar: '🧑',
    emergencyContact: '赵弟弟 13600136004',
    notes: '摄影师',
  },
];

const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    personId: 'person-001',
    type: '身份证',
    number: '110101199001011234',
    expiryDate: addDays(365),
    photoBackup: true,
    inLuggage: true,
    notes: '',
  },
  {
    id: 'doc-002',
    personId: 'person-001',
    type: '护照',
    number: 'E12345678',
    expiryDate: addDays(200),
    photoBackup: true,
    inLuggage: true,
    notes: '有效期还有半年多',
  },
  {
    id: 'doc-003',
    personId: 'person-001',
    type: '签证',
    number: 'V9876543210',
    expiryDate: addDays(90),
    photoBackup: false,
    inLuggage: true,
    notes: '日本三年多次签',
  },
  {
    id: 'doc-004',
    personId: 'person-002',
    type: '身份证',
    number: '310101199203045678',
    expiryDate: addDays(-10),
    photoBackup: true,
    inLuggage: false,
    notes: '已过期！需要补办',
  },
  {
    id: 'doc-005',
    personId: 'person-002',
    type: '护照',
    number: 'E23456789',
    expiryDate: addDays(20),
    photoBackup: true,
    inLuggage: false,
    notes: '快过期了，回来再换',
  },
  {
    id: 'doc-006',
    personId: 'person-002',
    type: '签证',
    number: 'V1234567890',
    expiryDate: addDays(60),
    photoBackup: false,
    inLuggage: false,
    notes: '',
  },
  {
    id: 'doc-007',
    personId: 'person-003',
    type: '身份证',
    number: '440101199505067890',
    expiryDate: addDays(500),
    photoBackup: true,
    inLuggage: true,
    notes: '',
  },
  {
    id: 'doc-008',
    personId: 'person-003',
    type: '护照',
    number: 'E34567890',
    expiryDate: addDays(400),
    photoBackup: true,
    inLuggage: true,
    notes: '',
  },
  {
    id: 'doc-009',
    personId: 'person-003',
    type: '签证',
    number: 'V5678901234',
    expiryDate: addDays(120),
    photoBackup: true,
    inLuggage: false,
    notes: '还没放进随身包',
  },
  {
    id: 'doc-010',
    personId: 'person-004',
    type: '身份证',
    number: '510101198807089012',
    expiryDate: addDays(300),
    photoBackup: false,
    inLuggage: false,
    notes: '',
  },
  {
    id: 'doc-011',
    personId: 'person-004',
    type: '护照',
    number: 'E45678901',
    expiryDate: addDays(-5),
    photoBackup: true,
    inLuggage: true,
    notes: '已过期！紧急办理中',
  },
  {
    id: 'doc-012',
    personId: 'person-004',
    type: '驾照',
    number: '510101198807089012',
    expiryDate: addDays(700),
    photoBackup: false,
    inLuggage: false,
    notes: '国际驾照还没办',
  },
];

interface TripState {
  trip: Trip;
  persons: Person[];
  documents: Document[];
  showSensitive: boolean;

  setTrip: (trip: Trip) => void;
  updateTrip: (updates: Partial<Trip>) => void;

  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  removePerson: (id: string) => void;

  addDocument: (doc: Omit<Document, 'id'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  togglePhotoBackup: (id: string) => void;
  toggleInLuggage: (id: string) => void;

  toggleShowSensitive: () => void;

  resetData: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trip: mockTrip,
      persons: mockPersons,
      documents: mockDocuments,
      showSensitive: false,

      setTrip: (trip) => set({ trip }),
      updateTrip: (updates) =>
        set((state) => ({ trip: { ...state.trip, ...updates } })),

      addPerson: (person) =>
        set((state) => ({
          persons: [...state.persons, { ...person, id: generateId() }],
        })),
      updatePerson: (id, updates) =>
        set((state) => ({
          persons: state.persons.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removePerson: (id) =>
        set((state) => ({
          persons: state.persons.filter((p) => p.id !== id),
          documents: state.documents.filter((d) => d.personId !== id),
        })),

      addDocument: (doc) =>
        set((state) => ({
          documents: [...state.documents, { ...doc, id: generateId() }],
        })),
      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),
      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
      togglePhotoBackup: (id) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, photoBackup: !d.photoBackup } : d
          ),
        })),
      toggleInLuggage: (id) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, inLuggage: !d.inLuggage } : d
          ),
        })),

      toggleShowSensitive: () =>
        set((state) => ({ showSensitive: !state.showSensitive })),

      resetData: () =>
        set({
          trip: mockTrip,
          persons: mockPersons,
          documents: mockDocuments,
        }),
    }),
    {
      name: 'trip-doc-checker-data',
    }
  )
);

export function getDocumentsByPerson(personId: string, documents: Document[]) {
  return documents.filter((d) => d.personId === personId);
}

export function getPersonCompletionRate(
  personId: string,
  documents: Document[]
): number {
  const personDocs = documents.filter((d) => d.personId === personId);
  if (personDocs.length === 0) return 0;
  const confirmed = personDocs.filter(
    (d) => d.photoBackup && d.inLuggage
  ).length;
  return confirmed / personDocs.length;
}

export function getTeamCompletionRate(documents: Document[]): number {
  if (documents.length === 0) return 0;
  const confirmed = documents.filter(
    (d) => d.photoBackup && d.inLuggage
  ).length;
  return confirmed / documents.length;
}

export function getMissingItemsCount(documents: Document[]): number {
  let count = 0;
  documents.forEach((d) => {
    if (!d.photoBackup) count++;
    if (!d.inLuggage) count++;
  });
  return count;
}

export function getExpiredCount(
  documents: Document[],
  statusFn: (date: string) => string
): number {
  return documents.filter((d) => statusFn(d.expiryDate) === 'expired').length;
}

export function getWarningCount(
  documents: Document[],
  statusFn: (date: string) => string
): number {
  return documents.filter((d) => statusFn(d.expiryDate) === 'warning').length;
}

export function getPersonsNeedingReminder(
  persons: Person[],
  documents: Document[],
  statusFn: (date: string) => string
): Person[] {
  return persons.filter((p) => {
    const personDocs = documents.filter((d) => d.personId === p.id);
    return personDocs.some(
      (d) =>
        !d.photoBackup || !d.inLuggage || statusFn(d.expiryDate) !== 'normal'
    );
  });
}

export function getMissingDocumentTypes(
  documents: Document[],
  requiredTypes: DocumentType[]
): DocumentType[] {
  const existingTypes = new Set(documents.map((d) => d.type));
  return requiredTypes.filter((t) => !existingTypes.has(t));
}
