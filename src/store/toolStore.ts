import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tool, ToolCategory, ToolStatus } from '@/types'
import { MOCK_TOOLS } from '@/data/mockData'
import { useUserStore } from './userStore'

interface ToolState {
  tools: Tool[]
  addTool: (tool: Omit<Tool, 'id' | 'createdAt' | 'ownerId' | 'status'>) => void
  updateToolStatus: (toolId: string, status: ToolStatus) => void
  getToolById: (id: string) => Tool | undefined
  getFilteredTools: (filters: ToolFilters) => Tool[]
  setToolMaintenance: (toolId: string) => void
  setToolAvailable: (toolId: string) => void
  initMockData: () => void
}

export interface ToolFilters {
  search: string
  category: ToolCategory | 'all'
  status: ToolStatus | 'all'
}

export const useToolStore = create<ToolState>()(
  persist(
    (set, get) => ({
      tools: MOCK_TOOLS,

      addTool: (toolData) => {
        const tool: Tool = {
          ...toolData,
          id: `tool-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ownerId: useUserStore.getState().currentUserId,
          status: 'available',
          createdAt: new Date().toISOString(),
        }
        set(state => ({ tools: [...state.tools, tool] }))
        useUserStore.getState().updateCreditScore(
          useUserStore.getState().currentUserId,
          3,
          '登记工具贡献'
        )
      },

      updateToolStatus: (toolId, status) => {
        set(state => ({
          tools: state.tools.map(t => t.id === toolId ? { ...t, status } : t),
        }))
      },

      getToolById: (id) => {
        return get().tools.find(t => t.id === id)
      },

      getFilteredTools: (filters: ToolFilters) => {
        return get().tools.filter(tool => {
          if (filters.search && !tool.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false
          }
          if (filters.category !== 'all' && tool.category !== filters.category) {
            return false
          }
          if (filters.status !== 'all' && tool.status !== filters.status) {
            return false
          }
          return true
        })
      },

      setToolMaintenance: (toolId) => {
        get().updateToolStatus(toolId, 'maintenance')
      },

      setToolAvailable: (toolId) => {
        get().updateToolStatus(toolId, 'available')
      },

      initMockData: () => {
        set({ tools: MOCK_TOOLS })
      },
    }),
    { name: 'tool-cabinet-tools' }
  )
)
