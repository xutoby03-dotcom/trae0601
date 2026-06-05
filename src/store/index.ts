import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RenderSettings, Theme } from '../types'

interface EditorState {
  latexCode: string
  cursorPosition: number
  renderSettings: RenderSettings
  theme: Theme
  currentProjectId: string | null
  undoStack: string[]
  redoStack: string[]
  rightPanelTab: 'symbols' | 'templates' | 'handwrite' | 'image' | 'settings'

  setLatexCode: (code: string) => void
  setCursorPosition: (pos: number) => void
  setRenderSettings: (settings: Partial<RenderSettings>) => void
  setTheme: (theme: Theme) => void
  setCurrentProjectId: (id: string | null) => void
  insertAtCursor: (text: string) => void
  undo: () => void
  redo: () => void
  setRightPanelTab: (tab: EditorState['rightPanelTab']) => void
  replacePlaceholder: (template: string) => void
}

const MAX_UNDO = 100

export const useStore = create<EditorState>()(
  persist(
    (set, get) => ({
      latexCode: 'E = mc^2',
      cursorPosition: 0,
      renderSettings: {
        fontSize: 1.4,
        fontFamily: 'KaTeX_Main',
        fontColor: '#1a1b2e',
        bgColor: '#ffffff',
      },
      theme: 'dark' as Theme,
      currentProjectId: null,
      undoStack: [],
      redoStack: [],
      rightPanelTab: 'symbols' as const,

      setLatexCode: (code: string) => {
        const state = get()
        const newUndoStack = [...state.undoStack, state.latexCode].slice(-MAX_UNDO)
        set({ latexCode: code, undoStack: newUndoStack, redoStack: [] })
      },

      setCursorPosition: (pos: number) => set({ cursorPosition: pos }),

      setRenderSettings: (settings: Partial<RenderSettings>) =>
        set((state) => ({
          renderSettings: { ...state.renderSettings, ...settings },
        })),

      setTheme: (theme: Theme) => {
        set({ theme })
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      setCurrentProjectId: (id: string | null) => set({ currentProjectId: id }),

      insertAtCursor: (text: string) => {
        const state = get()
        const code = state.latexCode
        const pos = state.cursorPosition
        const newCode = code.slice(0, pos) + text + code.slice(pos)
        const newPos = pos + text.length
        const newUndoStack = [...state.undoStack, code].slice(-MAX_UNDO)
        set({
          latexCode: newCode,
          cursorPosition: newPos,
          undoStack: newUndoStack,
          redoStack: [],
        })
      },

      undo: () => {
        const state = get()
        if (state.undoStack.length === 0) return
        const prev = state.undoStack[state.undoStack.length - 1]
        set({
          latexCode: prev,
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, state.latexCode],
        })
      },

      redo: () => {
        const state = get()
        if (state.redoStack.length === 0) return
        const next = state.redoStack[state.redoStack.length - 1]
        set({
          latexCode: next,
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [...state.undoStack, state.latexCode],
        })
      },

      setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

      replacePlaceholder: (template: string) => {
        const state = get()
        const code = state.latexCode
        const pos = state.cursorPosition
        const newCode = code.slice(0, pos) + template + code.slice(pos)
        const placeholderIdx = newCode.indexOf('◆', pos)
        const newUndoStack = [...state.undoStack, code].slice(-MAX_UNDO)
        set({
          latexCode: newCode,
          cursorPosition: placeholderIdx >= 0 ? placeholderIdx : pos + template.length,
          undoStack: newUndoStack,
          redoStack: [],
        })
      },
    }),
    {
      name: 'latex-editor-store',
      partialize: (state) => ({
        theme: state.theme,
        renderSettings: state.renderSettings,
        currentProjectId: state.currentProjectId,
      }),
    }
  )
)
