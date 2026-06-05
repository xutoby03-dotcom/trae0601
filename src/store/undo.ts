import { create } from 'zustand'
import { useStore } from './index'
import type { Page, CanvasElement, Interaction, CustomComponent } from '@/types'

const MAX_HISTORY = 30

interface HistoryEntry {
  pages: Page[]
  elements: Record<string, CanvasElement[]>
  interactions: Interaction[]
  customComponents: CustomComponent[]
}

interface UndoStore {
  past: HistoryEntry[]
  future: HistoryEntry[]
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  clearHistory: () => void
}

let isUndoRedo = false

const captureState = (): HistoryEntry => {
  const s = useStore.getState()
  return {
    pages: structuredClone(s.pages),
    elements: structuredClone(s.elements),
    interactions: structuredClone(s.interactions),
    customComponents: structuredClone(s.customComponents),
  }
}

const applyState = (entry: HistoryEntry) => {
  useStore.setState({
    pages: entry.pages,
    elements: entry.elements,
    interactions: entry.interactions,
    customComponents: entry.customComponents,
  })
}

useStore.subscribe((state, prevState) => {
  if (isUndoRedo) return
  if (
    state.pages === prevState.pages &&
    state.elements === prevState.elements &&
    state.interactions === prevState.interactions &&
    state.customComponents === prevState.customComponents
  ) {
    return
  }
  const { past } = useUndoStore.getState()
  const entry: HistoryEntry = {
    pages: structuredClone(prevState.pages),
    elements: structuredClone(prevState.elements),
    interactions: structuredClone(prevState.interactions),
    customComponents: structuredClone(prevState.customComponents),
  }
  useUndoStore.setState({
    past: past.length >= MAX_HISTORY ? [...past.slice(1), entry] : [...past, entry],
    future: [],
    canUndo: true,
    canRedo: false,
  })
})

export const useUndoStore = create<UndoStore>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  undo: () => {
    const { past, future } = get()
    if (past.length === 0) return
    isUndoRedo = true
    const current = captureState()
    const previous = past[past.length - 1]
    applyState(previous)
    set({
      past: past.slice(0, -1),
      future: [...future, current],
      canUndo: past.length > 1,
      canRedo: true,
    })
    isUndoRedo = false
  },

  redo: () => {
    const { past, future } = get()
    if (future.length === 0) return
    isUndoRedo = true
    const current = captureState()
    const next = future[future.length - 1]
    applyState(next)
    set({
      past: [...past, current],
      future: future.slice(0, -1),
      canUndo: true,
      canRedo: future.length > 1,
    })
    isUndoRedo = false
  },

  clearHistory: () => {
    set({ past: [], future: [], canUndo: false, canRedo: false })
  },
}))
