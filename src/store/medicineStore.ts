import { create } from 'zustand'
import type { Medicine, UsageRecord, RestockItem } from '@/types'
import { isLowStock, getExpiryStatus } from '@/utils/expiry'

const MEDICINES_KEY = 'family_medicine_cabinet_medicines'
const USAGE_KEY = 'family_medicine_cabinet_usage'
const RESTOCK_KEY = 'family_medicine_cabinet_restock'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}

interface MedicineStore {
  medicines: Medicine[]
  usageRecords: UsageRecord[]
  restockItems: RestockItem[]
  selectedMemberTag: string | null

  setSelectedMemberTag: (tag: string | null) => void
  addMedicine: (medicine: Medicine) => void
  updateMedicine: (id: string, updates: Partial<Medicine>) => void
  deleteMedicine: (id: string) => void
  addUsageRecord: (record: UsageRecord) => void
  useMedicine: (medicineId: string, amount: number, note: string) => void
  resolveRestockItem: (id: string) => void
  resolveRestockAndRestock: (id: string, newQuantity: number) => void
  syncRestockItems: () => void
  getFilteredMedicines: () => Medicine[]
  getExpiredMedicines: () => Medicine[]
  getExpiringSoonMedicines: () => Medicine[]
}

export const useMedicineStore = create<MedicineStore>((set, get) => ({
  medicines: loadFromStorage<Medicine[]>(MEDICINES_KEY, []),
  usageRecords: loadFromStorage<UsageRecord[]>(USAGE_KEY, []),
  restockItems: loadFromStorage<RestockItem[]>(RESTOCK_KEY, []),
  selectedMemberTag: null,

  setSelectedMemberTag: (tag) => set({ selectedMemberTag: tag }),

  addMedicine: (medicine) => {
    set((state) => {
      const medicines = [...state.medicines, medicine]
      saveToStorage(MEDICINES_KEY, medicines)
      return { medicines }
    })
    get().syncRestockItems()
  },

  updateMedicine: (id, updates) => {
    set((state) => {
      const medicines = state.medicines.map(m =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      )
      saveToStorage(MEDICINES_KEY, medicines)
      return { medicines }
    })
    get().syncRestockItems()
  },

  deleteMedicine: (id) => {
    set((state) => {
      const medicines = state.medicines.filter(m => m.id !== id)
      const usageRecords = state.usageRecords.filter(r => r.medicineId !== id)
      const restockItems = state.restockItems.filter(r => r.medicineId !== id)
      saveToStorage(MEDICINES_KEY, medicines)
      saveToStorage(USAGE_KEY, usageRecords)
      saveToStorage(RESTOCK_KEY, restockItems)
      return { medicines, usageRecords, restockItems }
    })
  },

  addUsageRecord: (record) => {
    set((state) => {
      const usageRecords = [...state.usageRecords, record]
      saveToStorage(USAGE_KEY, usageRecords)
      return { usageRecords }
    })
  },

  useMedicine: (medicineId, amount, note) => {
    const record: UsageRecord = {
      id: crypto.randomUUID(),
      medicineId,
      usageDate: new Date().toISOString().split('T')[0],
      amount,
      note,
    }
    get().addUsageRecord(record)

    set((state) => {
      const medicine = state.medicines.find(m => m.id === medicineId)
      if (!medicine) return state
      const newQuantity = Math.max(0, medicine.quantity - amount)
      const medicines = state.medicines.map(m =>
        m.id === medicineId ? { ...m, quantity: newQuantity, updatedAt: new Date().toISOString() } : m
      )
      saveToStorage(MEDICINES_KEY, medicines)
      return { medicines }
    })
    get().syncRestockItems()
  },

  resolveRestockItem: (id) => {
    set((state) => {
      const restockItems = state.restockItems.map(r =>
        r.id === id ? { ...r, resolved: true } : r
      )
      saveToStorage(RESTOCK_KEY, restockItems)
      return { restockItems }
    })
  },

  resolveRestockAndRestock: (id, newQuantity) => {
    const state = get()
    const item = state.restockItems.find(r => r.id === id)
    if (!item) return
    get().resolveRestockItem(id)
    get().updateMedicine(item.medicineId, { quantity: newQuantity })
  },

  syncRestockItems: () => {
    set((state) => {
      const medicineMap = new Map(state.medicines.map(m => [m.id, m]))
      const cleaned = state.restockItems.filter(r => {
        if (r.resolved) return true
        const med = medicineMap.get(r.medicineId)
        if (!med) return false
        if (r.reason === 'low_stock' && isLowStock(med)) return true
        if (r.reason === 'expiring_soon' && getExpiryStatus(med.expiryDate) === 'expiring_soon') return true
        return false
      })
      const stillUnresolved = new Set(
        cleaned.filter(r => !r.resolved).map(r => r.medicineId)
      )

      const newItems: RestockItem[] = []
      for (const medicine of state.medicines) {
        if (stillUnresolved.has(medicine.id)) continue
        const status = getExpiryStatus(medicine.expiryDate)
        if (isLowStock(medicine)) {
          newItems.push({
            id: crypto.randomUUID(),
            medicineId: medicine.id,
            reason: 'low_stock',
            resolved: false,
            createdAt: new Date().toISOString(),
          })
        } else if (status === 'expiring_soon') {
          newItems.push({
            id: crypto.randomUUID(),
            medicineId: medicine.id,
            reason: 'expiring_soon',
            resolved: false,
            createdAt: new Date().toISOString(),
          })
        }
      }

      const restockItems = [...cleaned, ...newItems]
      saveToStorage(RESTOCK_KEY, restockItems)
      return { restockItems }
    })
  },

  getFilteredMedicines: () => {
    const { medicines, selectedMemberTag } = get()
    if (!selectedMemberTag) return medicines
    return medicines.filter(m =>
      m.suitableFor.length === 0
      || m.suitableFor.includes(selectedMemberTag)
      || m.suitableFor.includes('all')
    )
  },

  getExpiredMedicines: () => {
    return get().medicines.filter(m => getExpiryStatus(m.expiryDate) === 'expired')
  },

  getExpiringSoonMedicines: () => {
    return get().medicines.filter(m => getExpiryStatus(m.expiryDate) === 'expiring_soon')
  },
}))
