import React, { useEffect, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { useUndoStore } from '@/store/undo'
import ComponentLibrary from '@/components/ComponentLibrary'
import Canvas from '@/components/Canvas'
import PropertiesPanel from '@/components/PropertiesPanel'
import { Toolbar } from '@/components/Toolbar'
import { TemplateSelector } from '@/components/TemplateSelector'
import { ElementType, CanvasElement } from '@/types'
import { COMPONENT_DEFS } from '@/types/components'
import {
  loadPages,
  loadElementsByProject,
  loadInteractions,
  loadCustomComponents,
  saveProject,
  savePages,
  saveElements,
  saveInteractions,
  saveCustomComponents,
} from '@/utils/db'

const Editor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const theme = useStore((s: any) => s.theme)
  const pages = useStore((s: any) => s.pages)
  const currentPageId = useStore((s: any) => s.currentPageId)
  const elements = useStore((s: any) => s.elements)
  const interactions = useStore((s: any) => s.interactions)
  const customComponents = useStore((s: any) => s.customComponents)
  const selectedElementIds = useStore((s: any) => s.selectedElementIds)
  const loadProject = useStore((s: any) => s.loadProject)
  const addElement = useStore((s: any) => s.addElement)
  const addPage = useStore((s: any) => s.addPage)
  const deleteSelectedElements = useStore((s: any) => s.deleteSelectedElements)
  const duplicateElement = useStore((s: any) => s.duplicateElement)
  const groupElements = useStore((s: any) => s.groupElements)
  const ungroupElements = useStore((s: any) => s.ungroupElements)
  const getElementsByPageId = useStore((s: any) => s.getElementsByPageId)
  const undo = useUndoStore((s) => s.undo)
  const redo = useUndoStore((s) => s.redo)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    if (!projectId) return

    const load = async () => {
      const pagesData = await loadPages(projectId)
      const elementsData = await loadElementsByProject(projectId)
      const interactionsData = await loadInteractions(projectId)
      const customComponentsData = await loadCustomComponents(projectId)

      loadProject(projectId, pagesData, elementsData, interactionsData, customComponentsData)

      if (pagesData.length === 0) {
        const defaultPage = {
          id: crypto.randomUUID(),
          projectId,
          name: 'Page 1',
          order: 0,
        }
        addPage(defaultPage)
        useStore.getState().setCurrentPage(defaultPage.id)
      }
    }

    load()
  }, [projectId])

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useStore.getState()
      if (!state.currentProjectId) return

      saveProject({
        id: state.currentProjectId,
        name: '',
        createdAt: 0,
        updatedAt: Date.now(),
        theme: state.theme,
      })
      savePages(state.pages)
      for (const [pageId, els] of Object.entries(state.elements)) {
        saveElements(pageId, els as CanvasElement[])
      }
      saveInteractions(state.interactions)
      saveCustomComponents(state.customComponents)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const handleDropComponent = useCallback((type: string, canvasX: number, canvasY: number) => {
    const { currentPageId, addElement } = useStore.getState()
    if (!currentPageId) return

    let componentType = type as ElementType
    let def = COMPONENT_DEFS.find((d) => d.type === componentType)

    if (type.startsWith('CUSTOM:')) {
      const compId = type.replace('CUSTOM:', '')
      const { customComponents } = useStore.getState()
      const custom = customComponents.find((c: any) => c.id === compId)
      if (custom) {
        for (const el of custom.elements) {
          addElement({
            ...el,
            id: crypto.randomUUID(),
            pageId: currentPageId,
            x: canvasX + el.x,
            y: canvasY + el.y,
          })
        }
        return
      }
    }

    if (!def) return

    const element: CanvasElement = {
      id: crypto.randomUUID(),
      pageId: currentPageId,
      parentId: null,
      type: def.type,
      x: canvasX - def.defaultWidth / 2,
      y: canvasY - def.defaultHeight / 2,
      width: def.defaultWidth,
      height: def.defaultHeight,
      rotation: 0,
      fill: def.defaultProps.fill ?? '#ffffff',
      stroke: def.defaultProps.stroke ?? '#333333',
      strokeWidth: def.defaultProps.strokeWidth ?? 1,
      cornerRadius: def.defaultProps.cornerRadius ?? 0,
      shadow: def.defaultProps.shadow ?? '',
      text: def.defaultProps.text ?? '',
      locked: false,
      visible: true,
      zIndex: 0,
      groupId: null,
      styleProps: def.defaultProps.styleProps ?? {},
      opacity: def.defaultProps.opacity ?? 1,
    }
    addElement(element)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
        return
      }

      if (mod && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        e.preventDefault()
        deleteSelectedElements()
        return
      }

      if (mod && e.key === 'd') {
        e.preventDefault()
        const ids = useStore.getState().selectedElementIds
        if (ids.length > 0) duplicateElement(ids[0])
        return
      }

      if (mod && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        const ids = useStore.getState().selectedElementIds
        if (ids.length > 0) {
          const groupId = ids[0]
          ungroupElements(groupId)
        }
        return
      }

      if (mod && e.key === 'g') {
        e.preventDefault()
        const ids = useStore.getState().selectedElementIds
        if (ids.length > 1) {
          groupElements(ids, crypto.randomUUID())
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, deleteSelectedElements, duplicateElement, groupElements, ungroupElements])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toolbar onOpenTemplates={() => setShowTemplates(true)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ComponentLibrary />
        <Canvas onDropComponent={handleDropComponent} />
        <PropertiesPanel />
      </div>
      <TemplateSelector open={showTemplates} onClose={() => setShowTemplates(false)} />
    </div>
  )
}

export default Editor
