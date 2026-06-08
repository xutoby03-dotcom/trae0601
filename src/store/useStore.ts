import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Equipment, BorrowRecord, CampingTrip, SelectedEquipment, SceneType } from './types'

interface CampingStore {
  equipment: Equipment[]
  borrowRecords: BorrowRecord[]
  currentTrip: CampingTrip | null

  addEquipment: (eq: Omit<Equipment, 'id' | 'createdAt'>) => void
  updateEquipment: (id: string, updates: Partial<Equipment>) => void
  deleteEquipment: (id: string) => void

  borrowEquipment: (record: Omit<BorrowRecord, 'id' | 'actualReturnDate' | 'isIntact' | 'damageDescription' | 'repairCost'>) => void
  returnEquipment: (recordId: string, data: { actualReturnDate: string; isIntact: boolean; damageDescription: string; repairCost: number }) => void
  checkOverdue: () => void

  setCurrentTrip: (trip: CampingTrip | null) => void
  addToChecklist: (equipmentId: string, quantity?: number) => void
  removeFromChecklist: (equipmentId: string) => void
  updateChecklistQuantity: (equipmentId: string, quantity: number) => void
  clearChecklist: () => void
  applySceneTemplate: (scene: SceneType, tripName: string, tripDate: string) => void
}

const genId = () => Math.random().toString(36).substring(2, 11)
const today = () => new Date().toISOString().split('T')[0]

const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq1',
    name: '双层帐篷(4人)',
    category: 'shelter',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20tent%20in%20forest%20outdoor%20gear%20product%20photo%20white%20background&image_size=square',
    totalQuantity: 2,
    availableQuantity: 2,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq2',
    name: '天幕遮阳篷',
    category: 'shelter',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20tarp%20sunshade%20outdoor%20gear%20product%20photo&image_size=square',
    totalQuantity: 1,
    availableQuantity: 1,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq3',
    name: '便携炉具',
    category: 'cooking',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portable%20camping%20stove%20outdoor%20cooking%20gear%20product%20photo&image_size=square',
    totalQuantity: 2,
    availableQuantity: 2,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq4',
    name: '气罐(230g)',
    category: 'cooking',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20gas%20canister%20fuel%20outdoor%20product%20photo&image_size=square',
    totalQuantity: 4,
    availableQuantity: 4,
    status: 'available',
    notes: '剩余量需检查',
    createdAt: today(),
  },
  {
    id: 'eq5',
    name: '套锅餐具组',
    category: 'cooking',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20cookware%20set%20pots%20pans%20outdoor%20product%20photo&image_size=square',
    totalQuantity: 1,
    availableQuantity: 1,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq6',
    name: 'LED营地灯',
    category: 'lighting',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=LED%20camping%20lantern%20outdoor%20lighting%20product%20photo&image_size=square',
    totalQuantity: 3,
    availableQuantity: 3,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq7',
    name: '头灯',
    category: 'lighting',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=headlamp%20outdoor%20camping%20lighting%20product%20photo&image_size=square',
    totalQuantity: 4,
    availableQuantity: 4,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq8',
    name: '折叠桌',
    category: 'furniture',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=folding%20camping%20table%20outdoor%20furniture%20product%20photo&image_size=square',
    totalQuantity: 1,
    availableQuantity: 1,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq9',
    name: '折叠椅',
    category: 'furniture',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=folding%20camping%20chair%20outdoor%20furniture%20product%20photo&image_size=square',
    totalQuantity: 6,
    availableQuantity: 6,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq10',
    name: '睡袋(-10°C)',
    category: 'sleeping',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sleeping%20bag%20camping%20outdoor%20gear%20product%20photo&image_size=square',
    totalQuantity: 3,
    availableQuantity: 3,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq11',
    name: '防潮垫',
    category: 'sleeping',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20sleeping%20pad%20mat%20outdoor%20gear%20product%20photo&image_size=square',
    totalQuantity: 3,
    availableQuantity: 3,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq12',
    name: '急救包',
    category: 'safety',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=first%20aid%20kit%20outdoor%20camping%20safety%20product%20photo&image_size=square',
    totalQuantity: 1,
    availableQuantity: 1,
    status: 'available',
    notes: '需定期检查药品有效期',
    createdAt: today(),
  },
  {
    id: 'eq13',
    name: '冰桶',
    category: 'other',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20cooler%20ice%20chest%20outdoor%20product%20photo&image_size=square',
    totalQuantity: 1,
    availableQuantity: 1,
    status: 'available',
    notes: '',
    createdAt: today(),
  },
  {
    id: 'eq14',
    name: '烧烤炉',
    category: 'cooking',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portable%20BBQ%20grill%20camping%20outdoor%20cooking%20product%20photo&image_size=square',
    totalQuantity: 1,
    availableQuantity: 1,
    status: 'available',
    notes: '含炭网',
    createdAt: today(),
  },
]

export const useStore = create<CampingStore>()(
  persist(
    (set, get) => ({
      equipment: INITIAL_EQUIPMENT,
      borrowRecords: [],
      currentTrip: null,

      addEquipment: (eq) =>
        set((state) => ({
          equipment: [
            ...state.equipment,
            { ...eq, id: genId(), createdAt: today() },
          ],
        })),

      updateEquipment: (id, updates) =>
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteEquipment: (id) =>
        set((state) => ({
          equipment: state.equipment.filter((e) => e.id !== id),
        })),

      borrowEquipment: (record) =>
        set((state) => {
          const newRecord: BorrowRecord = {
            ...record,
            id: genId(),
            actualReturnDate: null,
            isIntact: null,
            damageDescription: '',
            repairCost: 0,
          }
          const eq = state.equipment.find((e) => e.id === record.equipmentId)
          if (!eq) return state
          const borrowedQty = record.quantity
          return {
            borrowRecords: [...state.borrowRecords, newRecord],
            equipment: state.equipment.map((e) =>
              e.id === record.equipmentId
                ? {
                    ...e,
                    availableQuantity: Math.max(0, e.availableQuantity - borrowedQty),
                    status: e.availableQuantity - borrowedQty <= 0 ? 'borrowed' : e.status,
                  }
                : e
            ),
          }
        }),

      returnEquipment: (recordId, data) =>
        set((state) => {
          const record = state.borrowRecords.find((r) => r.id === recordId)
          if (!record) return state
          const returnedQty = record.quantity
          return {
            borrowRecords: state.borrowRecords.map((r) =>
              r.id === recordId
                ? { ...r, ...data, status: 'returned' as const }
                : r
            ),
            equipment: state.equipment.map((e) =>
              e.id === record.equipmentId
                ? {
                    ...e,
                    availableQuantity: Math.min(e.totalQuantity, e.availableQuantity + returnedQty),
                    status: data.isIntact
                      ? (e.availableQuantity + returnedQty >= e.totalQuantity ? 'available' as const : 'borrowed' as const)
                      : 'maintenance' as const,
                    notes: !data.isIntact && data.damageDescription
                      ? `${e.notes ? e.notes + '; ' : ''}损坏: ${data.damageDescription}${data.repairCost > 0 ? ` (维修费: ¥${data.repairCost})` : ''}`
                      : e.notes,
                  }
                : e
            ),
          }
        }),

      checkOverdue: () =>
        set((state) => {
          const todayStr = today()
          const updatedRecords = state.borrowRecords.map((r) => {
            if (r.status === 'borrowed' && r.plannedReturnDate < todayStr) {
              return { ...r, status: 'overdue' as const }
            }
            return r
          })
          const overdueEquipmentIds = new Set(
            updatedRecords
              .filter((r) => r.status === 'overdue')
              .map((r) => r.equipmentId)
          )
          return {
            borrowRecords: updatedRecords,
            equipment: state.equipment.map((e) =>
              overdueEquipmentIds.has(e.id) ? { ...e, status: 'overdue' as const } : e
            ),
          }
        }),

      setCurrentTrip: (trip) => set({ currentTrip: trip }),

      addToChecklist: (equipmentId, quantity = 1) =>
        set((state) => {
          if (!state.currentTrip) return state
          const existing = state.currentTrip.selectedEquipment.find(
            (se) => se.equipmentId === equipmentId
          )
          if (existing) {
            return {
              currentTrip: {
                ...state.currentTrip,
                selectedEquipment: state.currentTrip.selectedEquipment.map((se) =>
                  se.equipmentId === equipmentId
                    ? { ...se, quantity: se.quantity + quantity }
                    : se
                ),
              },
            }
          }
          return {
            currentTrip: {
              ...state.currentTrip,
              selectedEquipment: [
                ...state.currentTrip.selectedEquipment,
                { equipmentId, quantity },
              ],
            },
          }
        }),

      removeFromChecklist: (equipmentId) =>
        set((state) => {
          if (!state.currentTrip) return state
          return {
            currentTrip: {
              ...state.currentTrip,
              selectedEquipment: state.currentTrip.selectedEquipment.filter(
                (se) => se.equipmentId !== equipmentId
              ),
            },
          }
        }),

      updateChecklistQuantity: (equipmentId, quantity) =>
        set((state) => {
          if (!state.currentTrip) return state
          if (quantity <= 0) {
            return {
              currentTrip: {
                ...state.currentTrip,
                selectedEquipment: state.currentTrip.selectedEquipment.filter(
                  (se) => se.equipmentId !== equipmentId
                ),
              },
            }
          }
          return {
            currentTrip: {
              ...state.currentTrip,
              selectedEquipment: state.currentTrip.selectedEquipment.map((se) =>
                se.equipmentId === equipmentId ? { ...se, quantity } : se
              ),
            },
          }
        }),

      clearChecklist: () =>
        set((state) => {
          if (!state.currentTrip) return state
          return {
            currentTrip: { ...state.currentTrip, selectedEquipment: [] },
          }
        }),

      applySceneTemplate: (scene, tripName, tripDate) =>
        set((state) => {
          const trip: CampingTrip = {
            id: genId(),
            name: tripName,
            date: tripDate,
            scene,
            selectedEquipment: [],
            createdAt: today(),
          }
          return { currentTrip: trip }
        }),
    }),
    {
      name: 'camping-equipment-store',
    }
  )
)
