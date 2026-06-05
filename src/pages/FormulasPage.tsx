import { useState, useEffect, useCallback, useRef } from 'react'
import { getAllFormulas, deleteFormula, exportFormulas, importFormulas } from '../utils/db'
import { Formula, CATEGORIES } from '../types'
import katex from 'katex'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Trash2, Download, Upload, Plus, Tag } from 'lucide-react'

export default function FormulasPage() {
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { setLatexCode, setRenderSettings, currentProjectId } = useStore()
  const navigate = useNavigate()
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFormulas()
  }, [currentProjectId])

  const loadFormulas = async () => {
    const data = await getAllFormulas(currentProjectId || undefined)
    setFormulas(data.sort((a, b) => b.updatedAt - a.updatedAt))
  }

  const filtered = formulas.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.latex.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || f.category === categoryFilter
    return matchSearch && matchCategory
  })

  const loadFormula = useCallback((f: Formula) => {
    setLatexCode(f.latex)
    setRenderSettings({
      fontSize: f.fontSize,
      fontFamily: f.fontFamily,
      fontColor: f.fontColor,
      bgColor: f.bgColor,
    })
    navigate('/')
  }, [setLatexCode, setRenderSettings, navigate])

  const handleDelete = useCallback(async (id: string) => {
    await deleteFormula(id)
    await loadFormulas()
  }, [loadFormulas])

  const handleExport = useCallback(async () => {
    const json = await exportFormulas(currentProjectId || undefined)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'formulas.json'
    link.href = URL.createObjectURL(blob)
    link.click()
  }, [currentProjectId])

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      await importFormulas(text, currentProjectId || 'default')
      await loadFormulas()
    } catch {
      alert('导入失败，请检查文件格式')
    }
  }, [currentProjectId, loadFormulas])

  const renderPreview = (latex: string): string => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true })
    } catch {
      return latex
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-all">
            <ArrowLeft size={16} className="text-[var(--text-secondary)]" />
          </button>
          <span className="text-sm font-semibold text-[var(--text-primary)]">公式库</span>
          <span className="text-xs text-[var(--text-muted)]">{formulas.length} 个公式</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <Download size={12} /> 导出
          </button>
          <button onClick={() => importRef.current?.click()} className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <Upload size={12} /> 导入
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
        <div className="flex items-center gap-1.5 flex-1 bg-[var(--bg-tertiary)] rounded-lg px-3 py-1.5">
          <Search size={14} className="text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索公式..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
              categoryFilter === 'all' ? 'bg-amber-400/90 text-ink-950' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
                categoryFilter === c ? 'bg-amber-400/90 text-ink-950' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-3">
            <Search size={40} className="opacity-30" />
            <div className="text-sm">暂无公式，在编辑器中保存公式到此处</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-lg hover:border-amber-400/30 transition-all group cursor-pointer"
                onClick={() => loadFormula(f)}
              >
                <div
                  className="p-4 flex items-center justify-center min-h-[80px] overflow-hidden"
                  style={{ backgroundColor: f.bgColor }}
                  dangerouslySetInnerHTML={{ __html: renderPreview(f.latex) }}
                />
                <div className="px-3 py-2 border-t border-[var(--border-color)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">{f.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(f.id) }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Tag size={10} className="text-[var(--text-muted)]" />
                    <span className="text-[10px] text-[var(--text-muted)]">{f.category}</span>
                    <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                      {new Date(f.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
