import { create } from 'zustand'
import type { Project, Page, CanvasElement, Interaction, CustomComponent } from '@/types'

interface StoreState {
  projects: Project[]
  currentProjectId: string | null
  pages: Page[]
  currentPageId: string | null
  elements: Record<string, CanvasElement[]>
  selectedElementIds: string[]
  interactions: Interaction[]
  customComponents: CustomComponent[]
  zoom: number
  panX: number
  panY: number
  theme: 'light' | 'dark'
  isPreview: boolean
}

interface StoreActions {
  addProject: (project: Project) => void
  deleteProject: (id: string) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  setCurrentProject: (id: string | null) => void
  addPage: (page: Page) => void
  deletePage: (id: string) => void
  updatePage: (id: string, updates: Partial<Page>) => void
  setCurrentPage: (id: string | null) => void
  reorderPages: (pages: Page[]) => void
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  updateElements: (updates: Array<{ id: string; updates: Partial<CanvasElement> }>) => void
  deleteElement: (id: string) => void
  deleteSelectedElements: () => void
  selectElement: (id: string) => void
  deselectAll: () => void
  selectMultiple: (ids: string[]) => void
  duplicateElement: (id: string) => void
  lockElement: (id: string) => void
  groupElements: (ids: string[], groupId: string) => void
  ungroupElements: (groupId: string) => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  addInteraction: (interaction: Interaction) => void
  deleteInteraction: (id: string) => void
  updateInteraction: (id: string, updates: Partial<Interaction>) => void
  addCustomComponent: (component: CustomComponent) => void
  deleteCustomComponent: (id: string) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  resetView: () => void
  setTheme: () => void
  setPreview: (value: boolean) => void
  loadProject: (
    projectId: string,
    pages: Page[],
    elements: Record<string, CanvasElement[]>,
    interactions: Interaction[],
    customComponents: CustomComponent[],
  ) => void
  getElementsByPageId: (pageId: string) => CanvasElement[]
}

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  projects: [],
  currentProjectId: null,
  pages: [],
  currentPageId: null,
  elements: {},
  selectedElementIds: [],
  interactions: [],
  customComponents: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  theme: 'light',
  isPreview: false,

  addProject: (project) =>
    set((s) => ({ projects: [...s.projects, project] })),

  deleteProject: (id) =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
    })),

  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  setCurrentProject: (id) => set({ currentProjectId: id }),

  addPage: (page) =>
    set((s) => ({ pages: [...s.pages, page] })),

  deletePage: (id) =>
    set((s) => {
      const newPages = s.pages.filter((p) => p.id !== id)
      const newElements = { ...s.elements }
      delete newElements[id]
      return {
        pages: newPages,
        elements: newElements,
        currentPageId: s.currentPageId === id ? (newPages[0]?.id ?? null) : s.currentPageId,
      }
    }),

  updatePage: (id, updates) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  setCurrentPage: (id) => set({ currentPageId: id }),

  reorderPages: (pages) => set({ pages }),

  addElement: (element) =>
    set((s) => ({
      elements: {
        ...s.elements,
        [element.pageId]: [...(s.elements[element.pageId] ?? []), element],
      },
    })),

  updateElement: (id, updates) =>
    set((s) => {
      const newElements: Record<string, CanvasElement[]> = {}
      for (const [pageId, els] of Object.entries(s.elements)) {
        newElements[pageId] = els.map((e) => (e.id === id ? { ...e, ...updates } : e))
      }
      return { elements: newElements }
    }),

  updateElements: (updates) =>
    set((s) => {
      const map = new Map<string, Partial<CanvasElement>>()
      for (const u of updates) map.set(u.id, u.updates)
      const newElements: Record<string, CanvasElement[]> = {}
      for (const [pageId, els] of Object.entries(s.elements)) {
        newElements[pageId] = els.map((e) => {
          const patch = map.get(e.id)
          return patch ? { ...e, ...patch } : e
        })
      }
      return { elements: newElements }
    }),

  deleteElement: (id) =>
    set((s) => {
      const newElements: Record<string, CanvasElement[]> = {}
      for (const [pageId, els] of Object.entries(s.elements)) {
        const filtered = els.filter((e) => e.id !== id)
        if (filtered.length > 0) newElements[pageId] = filtered
      }
      return {
        elements: newElements,
        selectedElementIds: s.selectedElementIds.filter((sid) => sid !== id),
      }
    }),

  deleteSelectedElements: () =>
    set((s) => {
      const ids = new Set(s.selectedElementIds)
      const newElements: Record<string, CanvasElement[]> = {}
      for (const [pageId, els] of Object.entries(s.elements)) {
        const filtered = els.filter((e) => !ids.has(e.id))
        if (filtered.length > 0) newElements[pageId] = filtered
      }
      return { elements: newElements, selectedElementIds: [] }
    }),

  selectElement: (id) =>
    set((s) => ({
      selectedElementIds: s.selectedElementIds.includes(id) ? s.selectedElementIds : [...s.selectedElementIds, id],
    })),

  deselectAll: () => set({ selectedElementIds: [] }),

  selectMultiple: (ids) => set({ selectedElementIds: ids }),

  duplicateElement: (id) =>
    set((s) => {
      for (const [pageId, els] of Object.entries(s.elements)) {
        const el = els.find((e) => e.id === id)
        if (el) {
          const newId = crypto.randomUUID()
          const dup: CanvasElement = {
            ...el,
            id: newId,
            x: el.x + 20,
            y: el.y + 20,
          }
          return {
            elements: {
              ...s.elements,
              [pageId]: [...els, dup],
            },
            selectedElementIds: [newId],
          }
        }
      }
      return s
    }),

  lockElement: (id) =>
    set((s) => {
      const newElements: Record<string, CanvasElement[]> = {}
      for (const [pageId, els] of Object.entries(s.elements)) {
        newElements[pageId] = els.map((e) =>
          e.id === id ? { ...e, locked: !e.locked } : e,
        )
      }
      return { elements: newElements }
    }),

  groupElements: (ids, groupId) =>
    set((s) => {
      const idSet = new Set(ids)
      const newElements: Record<string, CanvasElement[]> = {}
      for (const [pageId, els] of Object.entries(s.elements)) {
        newElements[pageId] = els.map((e) =>
          idSet.has(e.id) ? { ...e, groupId } : e,
        )
      }
      return { elements: newElements }
    }),

  ungroupElements: (groupId) =>
    set((s) => {
      const newElements: Record<string, CanvasElement[]> = {}
      for (const [pageId, els] of Object.entries(s.elements)) {
        newElements[pageId] = els.map((e) =>
          e.groupId === groupId ? { ...e, groupId: null } : e,
        )
      }
      return { elements: newElements }
    }),

  bringToFront: (id) =>
    set((s) => {
      const newElements: Record<string, CanvasElement[]> = {}
      for (const [pageId, els] of Object.entries(s.elements)) {
        const maxZ = Math.max(...els.map((e) => e.zIndex), 0)
        newElements[pageId] = els.map((e) =>
          e.id === id ? { ...e, zIndex: maxZ + 1 } : e,
        )
      }
      return { elements: newElements }
    }),

  sendToBack: (id) =>
    set((s) => {
      const newElements: Record<string, CanvasElement[]> = {}
      for (const [pageId, els] of Object.entries(s.elements)) {
        const minZ = Math.min(...els.map((e) => e.zIndex), 0)
        newElements[pageId] = els.map((e) =>
          e.id === id ? { ...e, zIndex: minZ - 1 } : e,
        )
      }
      return { elements: newElements }
    }),

  addInteraction: (interaction) =>
    set((s) => ({ interactions: [...s.interactions, interaction] })),

  deleteInteraction: (id) =>
    set((s) => ({ interactions: s.interactions.filter((i) => i.id !== id) })),

  updateInteraction: (id, updates) =>
    set((s) => ({
      interactions: s.interactions.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),

  addCustomComponent: (component) =>
    set((s) => ({ customComponents: [...s.customComponents, component] })),

  deleteCustomComponent: (id) =>
    set((s) => ({ customComponents: s.customComponents.filter((c) => c.id !== id) })),

  setZoom: (zoom) => set({ zoom }),

  setPan: (x, y) => set({ panX: x, panY: y }),

  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),

  setTheme: () =>
    set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

  setPreview: (value) => set({ isPreview: value }),

  loadProject: (projectId, pages, elements, interactions, customComponents) =>
    set({
      currentProjectId: projectId,
      pages,
      elements,
      interactions,
      customComponents,
      selectedElementIds: [],
      currentPageId: pages.length > 0 ? pages[0].id : null,
    }),

  getElementsByPageId: (pageId) => get().elements[pageId] ?? [],
}))
