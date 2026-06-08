export type Category = '滴胶' | '串珠' | '布艺' | '模型' | '工具' | '其他'
export type StorageType = '盒子' | '格子' | '袋子'
export type ProjectStatus = '进行中' | '已完成'
export type ShoppingReason = '低库存' | '项目缺料'

export interface Material {
  id: string
  name: string
  category: Category
  colorHex: string
  colorName: string
  specification: string
  quantity: number
  unit: string
  purchaseUrl: string
  price: number
  storageType: StorageType
  storageBox: string
  storageCompartment: string
  storageBag: string
  lowStockThreshold: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

export interface ProjectMaterial {
  id: string
  projectId: string
  materialId: string
  requiredQuantity: number
  usedQuantity: number
}

export interface UsageRecord {
  id: string
  materialId: string
  projectId: string
  quantity: number
  date: string
  note: string
}

export interface ShoppingItem {
  id: string
  materialId: string
  quantity: number
  reason: ShoppingReason
  purchased: boolean
  createdAt: string
}

export const CATEGORIES: Category[] = ['滴胶', '串珠', '布艺', '模型', '工具', '其他']
export const STORAGE_TYPES: StorageType[] = ['盒子', '格子', '袋子']
export const UNITS = ['个', '颗', '片', '米', '克', '毫升', '张', '根', '卷', '包', '瓶', '套', '条', '块', '组']
