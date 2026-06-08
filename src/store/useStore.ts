import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Material, Project, ProjectMaterial, UsageRecord, ShoppingItem } from '@/types'
import { generateId } from '@/utils/helpers'

interface CraftStore {
  materials: Material[]
  projects: Project[]
  projectMaterials: ProjectMaterial[]
  usageRecords: UsageRecord[]
  shoppingItems: ShoppingItem[]

  addMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateMaterial: (id: string, updates: Partial<Material>) => void
  deleteMaterial: (id: string) => void

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  addProjectMaterial: (pm: Omit<ProjectMaterial, 'id'>) => void
  updateProjectMaterial: (id: string, updates: Partial<ProjectMaterial>) => void
  removeProjectMaterial: (id: string) => void
  consumeMaterial: (projectMaterialId: string) => void

  addUsageRecord: (record: Omit<UsageRecord, 'id'>) => void

  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => void
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void
  deleteShoppingItem: (id: string) => void
  markShoppingItemPurchased: (id: string) => void
  generateShoppingList: () => void
}

export const useStore = create<CraftStore>()(
  persist(
    (set, get) => ({
      materials: [],
      projects: [],
      projectMaterials: [],
      usageRecords: [],
      shoppingItems: [],

      addMaterial: (materialData) => {
        const id = generateId()
        const now = new Date().toISOString()
        const material: Material = { ...materialData, id, createdAt: now, updatedAt: now }
        set((state) => ({ materials: [...state.materials, material] }))
        return id
      },

      updateMaterial: (id, updates) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
          ),
        }))
      },

      deleteMaterial: (id) => {
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
          projectMaterials: state.projectMaterials.filter((pm) => pm.materialId !== id),
          usageRecords: state.usageRecords.filter((r) => r.materialId !== id),
          shoppingItems: state.shoppingItems.filter((s) => s.materialId !== id),
        }))
      },

      addProject: (projectData) => {
        const id = generateId()
        const now = new Date().toISOString()
        const project: Project = { ...projectData, id, createdAt: now, updatedAt: now }
        set((state) => ({ projects: [...state.projects, project] }))
        return id
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          projectMaterials: state.projectMaterials.filter((pm) => pm.projectId !== id),
          usageRecords: state.usageRecords.filter((r) => r.projectId !== id),
        }))
      },

      addProjectMaterial: (pm) => {
        const id = generateId()
        set((state) => ({
          projectMaterials: [...state.projectMaterials, { ...pm, id }],
        }))
      },

      updateProjectMaterial: (id, updates) => {
        set((state) => ({
          projectMaterials: state.projectMaterials.map((pm) =>
            pm.id === id ? { ...pm, ...updates } : pm
          ),
        }))
      },

      removeProjectMaterial: (id) => {
        set((state) => ({
          projectMaterials: state.projectMaterials.filter((pm) => pm.id !== id),
        }))
      },

      consumeMaterial: (projectMaterialId) => {
        const state = get()
        const pm = state.projectMaterials.find((p) => p.id === projectMaterialId)
        if (!pm) return

        const material = state.materials.find((m) => m.id === pm.materialId)
        if (!material) return

        const remaining = pm.requiredQuantity - pm.usedQuantity
        if (remaining <= 0) return

        const actualConsume = Math.min(remaining, material.quantity)

        set((state) => ({
          projectMaterials: state.projectMaterials.map((p) =>
            p.id === projectMaterialId
              ? { ...p, usedQuantity: p.usedQuantity + actualConsume }
              : p
          ),
          materials: state.materials.map((m) =>
            m.id === pm.materialId
              ? { ...m, quantity: Math.max(0, m.quantity - actualConsume), updatedAt: new Date().toISOString() }
              : m
          ),
          usageRecords: [
            ...state.usageRecords,
            {
              id: generateId(),
              materialId: pm.materialId,
              projectId: pm.projectId,
              quantity: actualConsume,
              date: new Date().toISOString(),
              note: '项目扣料',
            },
          ],
        }))
      },

      addUsageRecord: (record) => {
        set((state) => ({
          usageRecords: [...state.usageRecords, { ...record, id: generateId() }],
        }))
      },

      addShoppingItem: (item) => {
        set((state) => ({
          shoppingItems: [
            ...state.shoppingItems,
            { ...item, id: generateId(), createdAt: new Date().toISOString() },
          ],
        }))
      },

      updateShoppingItem: (id, updates) => {
        set((state) => ({
          shoppingItems: state.shoppingItems.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
      },

      deleteShoppingItem: (id) => {
        set((state) => ({
          shoppingItems: state.shoppingItems.filter((s) => s.id !== id),
        }))
      },

      markShoppingItemPurchased: (id) => {
        const state = get()
        const item = state.shoppingItems.find((s) => s.id === id)
        if (!item) return

        const material = state.materials.find((m) => m.id === item.materialId)
        if (material) {
          set((state) => ({
            shoppingItems: state.shoppingItems.map((s) =>
              s.id === id ? { ...s, purchased: true } : s
            ),
            materials: state.materials.map((m) =>
              m.id === item.materialId
                ? { ...m, quantity: m.quantity + item.quantity, updatedAt: new Date().toISOString() }
                : m
            ),
          }))
        }
      },

      generateShoppingList: () => {
        const state = get()
        const newItems: Omit<ShoppingItem, 'id' | 'createdAt'>[] = []

        state.materials.forEach((m) => {
          if (m.quantity <= m.lowStockThreshold) {
            const existing = state.shoppingItems.find(
              (s) => s.materialId === m.id && !s.purchased
            )
            if (!existing) {
              newItems.push({
                materialId: m.id,
                quantity: m.lowStockThreshold - m.quantity + 5,
                reason: '低库存',
                purchased: false,
              })
            }
          }
        })

        state.projects
          .filter((p) => p.status === '进行中')
          .forEach((project) => {
            const pms = state.projectMaterials.filter((pm) => pm.projectId === project.id)
            pms.forEach((pm) => {
              const material = state.materials.find((m) => m.id === pm.materialId)
              if (!material) return
              const shortage = pm.requiredQuantity - pm.usedQuantity - material.quantity
              if (shortage > 0) {
                const existing = state.shoppingItems.find(
                  (s) => s.materialId === pm.materialId && !s.purchased && s.reason === '项目缺料'
                )
                if (!existing) {
                  newItems.push({
                    materialId: pm.materialId,
                    quantity: shortage,
                    reason: '项目缺料',
                    purchased: false,
                  })
                }
              }
            })
          })

        if (newItems.length > 0) {
          set((state) => ({
            shoppingItems: [
              ...state.shoppingItems,
              ...newItems.map((item) => ({
                ...item,
                id: generateId(),
                createdAt: new Date().toISOString(),
              })),
            ],
          }))
        }
      },
    }),
    {
      name: 'craft-inventory-storage',
    }
  )
)
