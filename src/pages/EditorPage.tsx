import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store'
import LatexEditor from '../components/LatexEditor'
import PreviewPanel from '../components/PreviewPanel'
import SymbolPanel from '../components/SymbolPanel'
import TemplatePanel from '../components/TemplatePanel'
import HandwritePanel from '../components/HandwritePanel'
import ImageRecognize from '../components/ImageRecognize'
import FormulaSettings from '../components/FormulaSettings'
import ExportToolbar from '../components/ExportToolbar'
import { generateId } from '../utils/helpers'
import { saveFormula, getAllProjects, createProject } from '../utils/db'
import { Formula, Project, CATEGORIES } from '../types'
import {
  Sun, Moon, Sigma, Grid3X3, Pen, Camera, Settings,
  Undo2, Redo2, Save, BookOpen, FolderOpen, Hash,
  FileText, X
} from 'lucide-react'

const RIGHT_PANEL_TABS = [
  { key: 'symbols', label: '符号', icon: Hash },
  { key: 'templates', label: '模板', icon: Grid3X3 },
  { key: 'handwrite', label: '手写', icon: Pen },
  { key: 'image', label: '图片', icon: Camera },
  { key: 'settings', label: '设置', icon: Settings },
] as const

export default function EditorPage() {
  const {
    theme, setTheme, rightPanelTab, setRightPanelTab,
    latexCode, undo, redo, undoStack, redoStack,
    currentProjectId, setCurrentProjectId,
  } = useStore()

  const [leftWidth, setLeftWidth] = useState(33)
  const [rightWidth, setRightWidth] = useState(30)
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [formulaName, setFormulaName] = useState('')
  const [formulaCategory, setFormulaCategory] = useState('未分类')
  const [projects, setProjects] = useState<Project[]>([])
  const [showProjectPicker, setShowProjectPicker] = useState(false)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    getAllProjects().then(setProjects)
  }, [])

  const onMouseDown = useCallback((side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(side)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const onMouseMove = (e: MouseEvent) => {
      const totalWidth = window.innerWidth
      const x = e.clientX
      if (isDragging === 'left') {
        setLeftWidth(Math.max(20, Math.min(50, (x / totalWidth) * 100)))
      } else {
        setRightWidth(Math.max(20, Math.min(50, ((totalWidth - x) / totalWidth) * 100)))
      }
    }
    const onMouseUp = () => setIsDragging(null)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging])

  const handleSave = useCallback(async () => {
    if (!formulaName.trim()) return
    const formula: Formula = {
      id: generateId(),
      projectId: currentProjectId || 'default',
      name: formulaName,
      category: formulaCategory,
      latex: latexCode,
      fontSize: useStore.getState().renderSettings.fontSize,
      fontFamily: useStore.getState().renderSettings.fontFamily,
      fontColor: useStore.getState().renderSettings.fontColor,
      bgColor: useStore.getState().renderSettings.bgColor,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await saveFormula(formula)
    setShowSaveDialog(false)
    setFormulaName('')
  }, [formulaName, formulaCategory, latexCode, currentProjectId])

  const handleCreateProject = useCallback(async () => {
    const project: Project = {
      id: generateId(),
      name: `项目 ${projects.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await createProject(project)
    setProjects(await getAllProjects())
    setCurrentProjectId(project.id)
  }, [projects, setCurrentProjectId])

  const midWidth = 100 - leftWidth - rightWidth

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Top Bar */}
      <div className="h-11 flex items-center justify-between px-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
        <div className="flex items-center gap-2">
          <Sigma size={18} className="text-amber-400" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">LaTeX 公式编辑器</span>
          <div className="w-px h-5 bg-[var(--border-color)] mx-2" />
          <button
            onClick={() => setShowProjectPicker(!showProjectPicker)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            <FolderOpen size={12} />
            {currentProjectId ? projects.find((p) => p.id === currentProjectId)?.name || '选择项目' : '选择项目'}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={undo} disabled={undoStack.length === 0} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-30 transition-all" title="撤销">
            <Undo2 size={14} className="text-[var(--text-secondary)]" />
          </button>
          <button onClick={redo} disabled={redoStack.length === 0} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-30 transition-all" title="重做">
            <Redo2 size={14} className="text-[var(--text-secondary)]" />
          </button>
          <div className="w-px h-5 bg-[var(--border-color)] mx-1" />
          <button onClick={() => setShowSaveDialog(true)} className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-mint-400/90 text-ink-950 font-medium hover:bg-mint-400 transition-all">
            <Save size={12} /> 保存公式
          </button>
          <ExportToolbar />
          <div className="w-px h-5 bg-[var(--border-color)] mx-1" />
          <a href="/formulas" className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all" title="公式库">
            <BookOpen size={14} />
          </a>
          <a href="/document" className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all" title="文档模式">
            <FileText size={14} />
          </a>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-all" title="切换主题">
            {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-[var(--text-muted)]" />}
          </button>
        </div>
      </div>

      {/* Project Picker Dropdown */}
      {showProjectPicker && (
        <div className="absolute top-11 left-3 z-50 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 min-w-[200px]">
          <div className="px-3 py-1.5 text-xs text-[var(--text-muted)]">切换项目</div>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { setCurrentProjectId(p.id); setShowProjectPicker(false) }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-all ${
                p.id === currentProjectId ? 'text-amber-400 bg-amber-400/10' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {p.name}
            </button>
          ))}
          <div className="border-t border-[var(--border-color)] my-1" />
          <button onClick={() => { handleCreateProject(); setShowProjectPicker(false) }} className="w-full text-left px-3 py-1.5 text-xs text-mint-400 hover:bg-[var(--bg-secondary)] transition-all">
            + 新建项目
          </button>
        </div>
      )}

      {/* Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col border-r border-[var(--border-color)] overflow-hidden">
          <div className="h-8 flex items-center px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shrink-0">
            <span className="font-mono">LaTeX 源码</span>
          </div>
          <div className="flex-1 bg-[var(--editor-bg)] overflow-hidden">
            <LatexEditor />
          </div>
        </div>

        {/* Left Drag Handle */}
        <div
          className="w-1.5 cursor-col-resize hover:bg-amber-400/30 active:bg-amber-400/50 transition-colors shrink-0 z-10"
          onMouseDown={onMouseDown('left')}
        />

        {/* Middle: Preview */}
        <div style={{ width: `${midWidth}%` }} className="flex flex-col overflow-hidden">
          <div className="h-8 flex items-center px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shrink-0">
            实时预览
          </div>
          <div className="flex-1 overflow-hidden">
            <PreviewPanel />
          </div>
        </div>

        {/* Right Drag Handle */}
        <div
          className="w-1.5 cursor-col-resize hover:bg-amber-400/30 active:bg-amber-400/50 transition-colors shrink-0 z-10"
          onMouseDown={onMouseDown('right')}
        />

        {/* Right: Symbol/Template/Settings Panel */}
        <div style={{ width: `${rightWidth}%` }} className="flex flex-col border-l border-[var(--border-color)] overflow-hidden">
          {/* Right Tab Bar */}
          <div className="h-8 flex items-center bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shrink-0">
            {RIGHT_PANEL_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setRightPanelTab(tab.key as typeof rightPanelTab)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs transition-all ${
                    rightPanelTab === tab.key
                      ? 'text-amber-400 border-b-2 border-amber-400'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              )
            })}
          </div>
          <div className="flex-1 overflow-hidden">
            {rightPanelTab === 'symbols' && <SymbolPanel />}
            {rightPanelTab === 'templates' && <TemplatePanel />}
            {rightPanelTab === 'handwrite' && <HandwritePanel />}
            {rightPanelTab === 'image' && <ImageRecognize />}
            {rightPanelTab === 'settings' && <FormulaSettings />}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-5 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">保存公式</h3>
              <button onClick={() => setShowSaveDialog(false)} className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-all">
                <X size={14} className="text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">公式名称</label>
                <input
                  type="text"
                  value={formulaName}
                  onChange={(e) => setFormulaName(e.target.value)}
                  placeholder="例如：欧拉公式"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-400 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">分类</label>
                <select
                  value={formulaCategory}
                  onChange={(e) => setFormulaCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 transition-all"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                <div className="text-xs text-[var(--text-muted)] mb-1">LaTeX:</div>
                <code className="text-xs text-amber-400 break-all line-clamp-3">{latexCode}</code>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formulaName.trim()}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-amber-400/90 text-ink-950 font-medium hover:bg-amber-400 disabled:opacity-30 transition-all"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
