import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Clothing,
  UpcycleIdea,
  Project,
  ProjectStep,
  Material,
  ClothingType,
  FabricType,
  DamageLocation,
  ClothingGroup,
} from '@/types'
import { getRecommendations, determineGroup } from '@/utils/recommendations'

const defaultMaterials: Material[] = [
  { id: 'scissors', name: '剪刀', category: '工具', owned: false, icon: '✂️' },
  { id: 'needle', name: '针线包', category: '工具', owned: false, icon: '🧵' },
  { id: 'sewing_machine', name: '缝纫机', category: '工具', owned: false, icon: '🪡' },
  { id: 'pins', name: '珠针', category: '工具', owned: false, icon: '📌' },
  { id: 'tape_measure', name: '卷尺', category: '工具', owned: false, icon: '📏' },
  { id: 'unpicker', name: '拆线器', category: '工具', owned: false, icon: '🔧' },
  { id: 'glue_gun', name: '热熔胶枪', category: '工具', owned: false, icon: '🔥' },
  { id: 'darning_needle', name: '织补针', category: '工具', owned: false, icon: '🪡' },
  { id: 'fabric_glue', name: '布料胶水', category: '辅料', owned: false, icon: '💧' },
  { id: 'zipper', name: '拉链', category: '辅料', owned: false, icon: '🔲' },
  { id: 'buttons', name: '纽扣', category: '辅料', owned: false, icon: '🔘' },
  { id: 'lace', name: '蕾丝花边', category: '辅料', owned: false, icon: '🎀' },
  { id: 'embroidery', name: '绣线', category: '辅料', owned: false, icon: '🧶' },
  { id: 'fabric', name: '旧布料', category: '布料', owned: false, icon: '🧶' },
]

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface AppState {
  clothing: Clothing[]
  ideas: UpcycleIdea[]
  projects: Project[]
  materials: Material[]

  addClothing: (
    type: ClothingType,
    fabric: FabricType,
    color: string,
    size: string,
    damageLocation: DamageLocation,
    photo: string,
    reason: string
  ) => Clothing
  removeClothing: (id: string) => void
  updateClothingGroup: (id: string, group: ClothingGroup) => void

  toggleFavorite: (ideaId: string) => void
  getIdeasByClothing: (clothingId: string) => UpcycleIdea[]
  getFavoriteIdeas: () => UpcycleIdea[]

  createProject: (clothingId: string, ideaId: string) => Project
  updateProjectStatus: (projectId: string, status: Project['status']) => void
  addProjectStep: (projectId: string, description: string) => void
  toggleProjectStep: (projectId: string, stepId: string) => void
  updateProjectPhotos: (projectId: string, before?: string, after?: string) => void
  getProjectsByClothing: (clothingId: string) => Project[]
  getProjectById: (projectId: string) => Project | undefined

  toggleMaterialOwned: (materialId: string) => void
  getMissingMaterials: () => Material[]
  getMissingMaterialsForIdea: (ideaId: string) => Material[]

  getStats: () => {
    totalClothes: number
    completedProjects: number
    inProgressProjects: number
    savedFromTrash: number
    bestType: ClothingType | null
    typeCount: Record<ClothingType, number>
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clothing: [],
      ideas: [],
      projects: [],
      materials: defaultMaterials,

      addClothing: (type, fabric, color, size, damageLocation, photo, reason) => {
        const id = generateId()
        const recommendations = getRecommendations(type, damageLocation)

        const ownedMaterialIds = get().materials.filter(m => m.owned).map(m => m.id)

        const primaryGroup = recommendations.length > 0
          ? determineGroup(recommendations[0].difficulty, ownedMaterialIds, recommendations[0].requiredMaterialIds)
          : 'inspiration' as ClothingGroup

        const clothing: Clothing = {
          id,
          type,
          fabric,
          color,
          size,
          damageLocation,
          photo,
          reason,
          group: primaryGroup,
          createdAt: new Date().toISOString(),
        }

        const newIdeas: UpcycleIdea[] = recommendations.map(rec => ({
          id: generateId(),
          clothingId: id,
          ...rec,
          favorited: false,
        }))

        set(state => ({
          clothing: [...state.clothing, clothing],
          ideas: [...state.ideas, ...newIdeas],
        }))

        return clothing
      },

      removeClothing: (id) => {
        set(state => ({
          clothing: state.clothing.filter(c => c.id !== id),
          ideas: state.ideas.filter(i => i.clothingId !== id),
          projects: state.projects.filter(p => p.clothingId !== id),
        }))
      },

      updateClothingGroup: (id, group) => {
        set(state => ({
          clothing: state.clothing.map(c =>
            c.id === id ? { ...c, group } : c
          ),
        }))
      },

      toggleFavorite: (ideaId) => {
        set(state => ({
          ideas: state.ideas.map(i =>
            i.id === ideaId ? { ...i, favorited: !i.favorited } : i
          ),
        }))
      },

      getIdeasByClothing: (clothingId) => {
        return get().ideas.filter(i => i.clothingId === clothingId)
      },

      getFavoriteIdeas: () => {
        return get().ideas.filter(i => i.favorited)
      },

      createProject: (clothingId, ideaId) => {
        const project: Project = {
          id: generateId(),
          clothingId,
          ideaId,
          status: 'planning',
          startedAt: new Date().toISOString(),
          completedAt: null,
          customSteps: [],
          beforePhoto: '',
          afterPhoto: '',
        }
        set(state => ({
          projects: [...state.projects, project],
        }))
        return project
      },

      updateProjectStatus: (projectId, status) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  status,
                  completedAt: status === 'completed' ? new Date().toISOString() : p.completedAt,
                }
              : p
          ),
        }))
      },

      addProjectStep: (projectId, description) => {
        const step: ProjectStep = {
          id: generateId(),
          description,
          photo: '',
          completed: false,
          order: get().projects.find(p => p.id === projectId)?.customSteps.length ?? 0,
        }
        set(state => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, customSteps: [...p.customSteps, step] }
              : p
          ),
        }))
      },

      toggleProjectStep: (projectId, stepId) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  customSteps: p.customSteps.map(s =>
                    s.id === stepId ? { ...s, completed: !s.completed } : s
                  ),
                }
              : p
          ),
        }))
      },

      updateProjectPhotos: (projectId, before, after) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  beforePhoto: before !== undefined ? before : p.beforePhoto,
                  afterPhoto: after !== undefined ? after : p.afterPhoto,
                }
              : p
          ),
        }))
      },

      getProjectsByClothing: (clothingId) => {
        return get().projects.filter(p => p.clothingId === clothingId)
      },

      getProjectById: (projectId) => {
        return get().projects.find(p => p.id === projectId)
      },

      toggleMaterialOwned: (materialId) => {
        set(state => ({
          materials: state.materials.map(m =>
            m.id === materialId ? { ...m, owned: !m.owned } : m
          ),
        }))
      },

      getMissingMaterials: () => {
        return get().materials.filter(m => !m.owned)
      },

      getMissingMaterialsForIdea: (ideaId) => {
        const idea = get().ideas.find(i => i.id === ideaId)
        if (!idea) return []
        return get().materials.filter(
          m => idea.requiredMaterialIds.includes(m.id) && !m.owned
        )
      },

      getStats: () => {
        const state = get()
        const now = new Date()
        const thisYear = now.getFullYear()
        const thisYearClothes = state.clothing.filter(
          c => new Date(c.createdAt).getFullYear() === thisYear
        )
        const thisYearProjects = state.projects.filter(
          p => p.completedAt && new Date(p.completedAt).getFullYear() === thisYear
        )
        const typeCount: Record<string, number> = {}
        state.clothing.forEach(c => {
          typeCount[c.type] = (typeCount[c.type] || 0) + 1
        })
        const typeEntries = Object.entries(typeCount) as [ClothingType, number][]
        const bestType = typeEntries.length > 0
          ? typeEntries.sort((a, b) => b[1] - a[1])[0][0]
          : null
        return {
          totalClothes: thisYearClothes.length,
          completedProjects: thisYearProjects.length,
          inProgressProjects: state.projects.filter(p => p.status === 'in_progress').length,
          savedFromTrash: thisYearClothes.length,
          bestType,
          typeCount: typeCount as Record<ClothingType, number>,
        }
      },
    }),
    {
      name: 'upcycle-inspiration-storage',
    }
  )
)
