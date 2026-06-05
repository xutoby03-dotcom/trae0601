import React, { useState, useRef } from 'react'
import { useStore } from '@/store'
import { useUndoStore } from '@/store/undo'
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Play, Sun, Moon, Download, Upload, Save, LayoutTemplate } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageTabs } from '@/components/PageTabs'

const btnClass = 'px-2 py-1 rounded hover:bg-[var(--wire-hover)] text-sm disabled:opacity-40 cursor-not-allowed'

const handleSave = async () => {
  const { currentProjectId, projects, pages, elements, interactions, customComponents } = useStore.getState()
  const project = projects.find(p => p.id === currentProjectId)
  if (!project) return
  const { saveProject, savePages, saveElements, saveInteractions, saveCustomComponents } = await import('@/utils/db')
  await saveProject({ ...project, updatedAt: Date.now() })
  const projectPages = pages.filter(p => p.projectId === currentProjectId)
  await savePages(projectPages)
  for (const page of projectPages) {
    await saveElements(page.id, elements[page.id] ?? [])
  }
  await saveInteractions(interactions.filter(i => projectPages.some(p => elements[p.id]?.some(e => e.id === i.elementId))))
  await saveCustomComponents(customComponents.filter(c => c.projectId === currentProjectId))
}

export const Toolbar: React.FC<{ onOpenTemplates?: () => void }> = ({ onOpenTemplates }) => {
  const { currentProjectId, projects, updateProject, zoom, setZoom, resetView, theme, setTheme, pages, elements, interactions, customComponents, loadProject } = useStore()
  const { canUndo, canRedo, undo, redo } = useUndoStore()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const project = projects.find(p => p.id === currentProjectId)

  const handleNameDoubleClick = () => {
    if (!project) return
    setNameValue(project.name)
    setEditingName(true)
  }

  const handleNameBlur = () => {
    setEditingName(false)
    if (project && nameValue.trim()) {
      updateProject(project.id, { name: nameValue.trim() })
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameBlur()
    if (e.key === 'Escape') setEditingName(false)
  }

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 3))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.1))
  const handleZoomReset = () => resetView()

  const handlePreview = () => {
    if (projectId) navigate(`/preview/${projectId}`)
  }

  const handleExportJSON = () => {
    setExportOpen(false)
    const { currentProjectId, projects, pages, elements, interactions, customComponents } = useStore.getState()
    const project = projects.find(p => p.id === currentProjectId)
    if (!project) return
    const data = {
      project,
      pages: pages.filter(p => p.projectId === currentProjectId),
      elements,
      interactions,
      customComponents: customComponents.filter(c => c.projectId === currentProjectId),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPNG = () => {
    setExportOpen(false)
    const canvas = document.querySelector<HTMLCanvasElement>('#wireframe-canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'page.png'
    a.click()
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.project && data.pages) {
          loadProject(
            data.project.id,
            data.pages,
            data.elements ?? {},
            data.interactions ?? [],
            data.customComponents ?? [],
          )
        }
      } catch {
        console.error('Failed to import project')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div
      style={{
        height: 48,
        background: 'var(--wire-panel)',
        borderBottom: '1px solid var(--wire-border)',
      }}
      className="flex items-center px-4 justify-between"
    >
      <div className="flex items-center gap-2">
        {project && (
          <>
            {editingName ? (
              <input
                className="bg-transparent border border-[var(--wire-accent)] outline-none px-1 py-0.5 text-sm rounded"
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                autoFocus
              />
            ) : (
              <span
                className="text-sm font-medium cursor-pointer"
                onDoubleClick={handleNameDoubleClick}
              >
                {project.name}
              </span>
            )}
          </>
        )}
        <div style={{ width: 1, height: 24, background: 'var(--wire-border)' }} className="mx-2" />
        <button className={btnClass} disabled={!canUndo} onClick={undo}>
          <Undo2 size={16} />
        </button>
        <button className={btnClass} disabled={!canRedo} onClick={redo}>
          <Redo2 size={16} />
        </button>
      </div>

      <div>
        <PageTabs />
      </div>

      <div className="flex items-center gap-2">
        <button className={btnClass} onClick={handleZoomOut}>
          <ZoomOut size={16} />
        </button>
        <span className="text-sm w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button className={btnClass} onClick={handleZoomIn}>
          <ZoomIn size={16} />
        </button>
        <button className={btnClass} onClick={handleZoomReset}>
          <Maximize size={16} />
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--wire-border)' }} className="mx-1" />

        <button className={`${btnClass} flex items-center gap-1`} onClick={handlePreview}>
          <Play size={16} />
          <span>Preview</span>
        </button>

        {onOpenTemplates && (
          <button className={`${btnClass} flex items-center gap-1`} onClick={onOpenTemplates}>
            <LayoutTemplate size={16} />
            <span>Templates</span>
          </button>
        )}

        <button className={btnClass} onClick={() => setTheme()}>
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button className={btnClass} onClick={handleSave}>
          <Save size={16} />
        </button>

        <div className="relative">
          <button className={btnClass} onClick={() => setExportOpen(!exportOpen)}>
            <Download size={16} />
          </button>
          {exportOpen && (
            <div
              className="absolute right-0 top-full mt-1 rounded shadow-lg z-50 py-1"
              style={{ background: 'var(--wire-panel)', border: '1px solid var(--wire-border)' }}
            >
              <button
                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--wire-hover)]"
                onClick={handleExportJSON}
              >
                Export JSON
              </button>
              <button
                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--wire-hover)]"
                onClick={handleExportPNG}
              >
                Export PNG
              </button>
            </div>
          )}
        </div>

        <button className={btnClass} onClick={handleImportClick}>
          <Upload size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>
    </div>
  )
}
