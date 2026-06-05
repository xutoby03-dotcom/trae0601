import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import katex from 'katex'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { ArrowLeft, FileText, Download, Eye, Pen } from 'lucide-react'

const DEFAULT_DOC = `# 数学公式文档

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
  const [content, setContent] = useState(DEFAULT_DOC)
  const [showPreview, setShowPreview] = useState(true)
  const navigate = useNavigate()
  const previewRef = useRef<HTMLDivElement>(null)

  const renderMarkdown = useCallback((text: string): string => {
    let html = text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-[var(--text-primary)]">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-[var(--text-primary)]">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-[var(--text-primary)]">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--text-primary)]">$1</strong>')
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
      .replace(/\n\n/g, '</p><p class="mb-3 text-[var(--text-secondary)] leading-relaxed">')
      .replace(/\n/g, '<br/>')

    return `<p class="mb-3 text-[var(--text-secondary)] leading-relaxed">${html}</p>`
  }, [])

  const exportPDF = useCallback(async () => {
    if (!previewRef.current) return
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('document.pdf')
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-all">
            <ArrowLeft size={16} className="text-[var(--text-secondary)]" />
          </button>
          <FileText size={16} className="text-amber-400" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">文档模式</span>
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
            onChange={(e) => setContent(e.target.value)}
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
  )
}
