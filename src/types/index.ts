export type MedicineCategory = 'regular' | 'children' | 'topical' | 'chronic' | 'emergency'

export type ExpiryStatus = 'normal' | 'expiring_soon' | 'expired'

export interface Medicine {
  id: string
  name: string
  purpose: string
  suitableFor: string[]
  quantity: number
  unit: string
  purchaseDate: string
  expiryDate: string
  storageLocation: string
  notes: string
  category: MedicineCategory
  photoUrl: string
  dosage: string
  contraindications: string
  lowStockThreshold: number
  createdAt: string
  updatedAt: string
}

export interface UsageRecord {
  id: string
  medicineId: string
  usageDate: string
  amount: number
  note: string
}

export interface FamilyMember {
  id: string
  name: string
  tag: string
  avatar: string
}

export interface RestockItem {
  id: string
  medicineId: string
  reason: 'low_stock' | 'expiring_soon'
  resolved: boolean
  createdAt: string
}

export const CATEGORY_CONFIG: Record<MedicineCategory, { label: string; icon: string; color: string; bgColor: string }> = {
  regular: { label: '常用药', icon: '💊', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  children: { label: '儿童药', icon: '👶', color: 'text-sky-600', bgColor: 'bg-sky-50' },
  topical: { label: '外用药', icon: '🩹', color: 'text-violet-600', bgColor: 'bg-violet-50' },
  chronic: { label: '慢病药', icon: '❤️‍🩹', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  emergency: { label: '急救用品', icon: '🚑', color: 'text-rose-600', bgColor: 'bg-rose-50' },
}
