import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import katex from 'katex'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  ArrowLeft, FileText, Download, Eye, Pen,
  Menu, X, Plus, Trash2, File, Save
} from 'lucide-react'
import { getAllDocs, saveDoc, deleteDoc } from '../utils/db'
import { Doc } from '../types'
import { generateId, debounce } from '../utils/helpers'

const DEFAULT_DOC_CONTENT = `# 数学公式文档

这是一个简单的文档编辑器，支持混合文本与 LaTeX 公式。

## 示例公式

行内公式：$E = mc^2$，以及 $a^2 + b^2 = c^2$。

独立公式块：

$$
\\int_0^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

## 矩阵

$$
A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}
$$

## 求和

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$
`

export default function DocumentPage() {
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [showDrawer, setShowDrawer] = useState(false)
  const [docs, setDocs] = useState<Doc[]>([])
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [docTitle, setDocTitle] = useState('未命名文档')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const previewRef = useRef<HTMLDivElement>(null)
  const { currentProjectId } = useStore()

  useEffect(() => {
    loadDocs()
  }, [currentProjectId])

  useEffect(() => {
    if (!currentDocId && docs.length > 0) {
      loadDoc(docs[0])
    }
  }, [docs, currentDocId])

  const loadDocs = async () => {
    const data = await getAllDocs(currentProjectId || undefined)
    setDocs(data.sort((a, b) => b.updatedAt - a.updatedAt))
    if (data.length === 0) {
      setContent(DEFAULT_DOC_CONTENT)
      setDocTitle('未命名文档')
      setCurrentDocId(null)
    }
  }

  const loadDoc = (doc: Doc) => {
    setContent(doc.content)
    setDocTitle(doc.title)
    setCurrentDocId(doc.id)
    setShowDrawer(false)
  }

  const createNewDoc = async () => {
    const newDoc: Doc = {
      id: generateId(),
      projectId: currentProjectId || 'default',
      title: `文档 ${docs.length + 1}`,
      content: DEFAULT_DOC_CONTENT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await saveDoc(newDoc)
    setDocs((prev) => [newDoc, ...prev])
    loadDoc(newDoc)
  }

  const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定删除该文档？')) return
    await deleteDoc(id)
    setDocs((prev) => prev.filter((d) => d.id !== id))
    if (currentDocId === id) {
      setCurrentDocId(null)
      setContent('')
      setDocTitle('未命名文档')
    }
  }

  const debouncedSave = useCallback(
    debounce(async (...args: unknown[]) => {
      const title = args[0] as string
      const text = args[1] as string
      if (!text.trim()) return
      setSaving(true)
      setSaved(false)
      const doc: Doc = {
        id: currentDocId || generateId(),
        projectId: currentProjectId || 'default',
        title,
        content: text,
        createdAt: currentDocId
          ? docs.find((d) => d.id === currentDocId)?.createdAt || Date.now()
          : Date.now(),
        updatedAt: Date.now(),
      }
      await saveDoc(doc)
      if (!currentDocId) {
        setCurrentDocId(doc.id)
        setDocs((prev) => [doc, ...prev])
      } else {
        setDocs((prev) => prev.map((d) => (d.id === doc.id ? doc : d)))
      }
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 800),
    [currentDocId, currentProjectId, docs]
  )

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    debouncedSave(docTitle, text)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value || '未命名文档'
    setDocTitle(title)
    debouncedSave(title, content)
  }

  const renderMarkdown = useCallback((text: string): string => {
    let html = text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')

    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false, output: 'htmlAndMathml' })
      } catch {
        return `<code class="text-red-400">${latex}</code>`
      }
    })

    html = html.replace(/\$([^\$]+?)\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false, output: 'htmlAndMathml' })
      } catch {
        return `<code class="text-red-400">${latex}</code>`
      }
    })

    html = html
      .replace(/\n\n/g, '</p><p class="mb-3 text-gray-700 leading-relaxed">')
      .replace(/\n/g, '<br/>')

    return `<p class="mb-3 text-gray-700 leading-relaxed">${html}</p>`
  }, [])

  const exportPDF = useCallback(async () => {
    if (!previewRef.current) return
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${docTitle}.pdf`)
  }, [docTitle])

  return (
    <div className="h-screen w-screen flex bg-[var(--bg-primary)]">
      {/* Document List Drawer */}
      {showDrawer && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setShowDrawer(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-50 transform transition-transform duration-200 ${
          showDrawer ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
          <span className="text-sm font-semibold text-[var(--text-primary)]">文档列表</span>
          <button onClick={() => setShowDrawer(false)} className="p-1 rounded hover:bg-[var(--bg-tertiary)]">
            <X size={14} className="text-[var(--text-muted)]" />
          </button>
        </div>
        <div className="p-3 border-b border-[var(--border-color)]">
          <button
            onClick={createNewDoc}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-amber-400/90 text-ink-950 font-medium hover:bg-amber-400 transition-all"
          >
            <Plus size={12} /> 新建文档
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {docs.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">
              <File size={28} className="mx-auto mb-2 opacity-30" />
              暂无文档，点击上方新建
            </div>
          ) : (
            docs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => loadDoc(doc)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-all border-b border-[var(--border-color)] cursor-pointer ${
                  doc.id === currentDocId
                    ? 'bg-amber-400/10 text-amber-400'
                    : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}
              >
                <File size={14} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{doc.title}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {new Date(doc.updatedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteDoc(doc.id, e)}
                  className="p-1 rounded opacity-100 hover:bg-red-500/10 text-red-400 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-11 flex items-center justify-between px-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-all">
              <ArrowLeft size={16} className="text-[var(--text-secondary)]" />
            </button>
            <button onClick={() => setShowDrawer(true)} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-all">
              <Menu size={16} className="text-[var(--text-secondary)]" />
            </button>
            <FileText size={16} className="text-amber-400" />
            <input
              type="text"
              value={docTitle}
              onChange={handleTitleChange}
              className="bg-transparent text-sm font-semibold text-[var(--text-primary)] outline-none border-b border-transparent hover:border-[var(--border-color)] focus:border-amber-400 w-40"
              placeholder="文档标题"
            />
            {(saving || saved) && (
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                <Save size={10} />
                {saving ? '保存中...' : '已保存'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-all ${
                showPreview ? 'bg-amber-400/90 text-ink-950' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
              }`}
            >
              <Eye size={12} /> 预览
            </button>
            <button onClick={exportPDF} className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
              <Download size={12} /> 导出PDF
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col border-r border-[var(--border-color)]`}>
            <div className="h-8 flex items-center px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shrink-0">
              <Pen size={12} className="mr-1.5" />
              Markdown + LaTeX 编辑
            </div>
            <textarea
              value={content}
              onChange={handleContentChange}
              className="flex-1 p-4 bg-[var(--editor-bg)] text-[var(--editor-text)] font-mono text-sm resize-none outline-none leading-relaxed"
              placeholder="使用 Markdown 编写，$...$ 为行内公式，$$...$$ 为独立公式块"
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="h-8 flex items-center px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shrink-0">
                <Eye size={12} className="mr-1.5" />
                实时预览
              </div>
              <div
                ref={previewRef}
                className="flex-1 overflow-y-auto p-6 bg-white text-gray-900"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
