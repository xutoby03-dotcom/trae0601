import { useCallback, useState } from 'react'
import { useStore } from '../store'
import { copyToClipboard } from '../utils/helpers'
import katex from 'katex'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, Copy, FileImage, FileText, FileCode, Palette } from 'lucide-react'

export default function ExportToolbar() {
  const { latexCode, renderSettings } = useStore()
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyLatex = useCallback(async () => {
    const ok = await copyToClipboard(latexCode)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [latexCode])

  const exportPNG = useCallback(async () => {
    const container = document.createElement('div')
    container.style.cssText = `position:absolute;left:-9999px;padding:20px;background:${renderSettings.bgColor};`
    document.body.appendChild(container)
    try {
      katex.render(latexCode, container, {
        displayMode: true,
        throwOnError: false,
        output: 'htmlAndMathml',
      })
      const canvas = await html2canvas(container, {
        backgroundColor: renderSettings.bgColor === 'transparent' ? null : renderSettings.bgColor,
        scale: 3,
      })
      const link = document.createElement('a')
      link.download = 'formula.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      document.body.removeChild(container)
    }
  }, [latexCode, renderSettings])

  const exportSVG = useCallback(() => {
    const container = document.createElement('div')
    container.style.cssText = `position:absolute;left:-9999px;padding:20px;`
    document.body.appendChild(container)
    try {
      katex.render(latexCode, container, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      })
      const html = container.innerHTML
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${renderSettings.fontSize * 16}px;color:${renderSettings.fontColor};background:${renderSettings.bgColor};padding:20px;display:flex;align-items:center;justify-content:center;">
      ${html}
    </div>
  </foreignObject>
</svg>`
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const link = document.createElement('a')
      link.download = 'formula.svg'
      link.href = URL.createObjectURL(blob)
      link.click()
    } finally {
      document.body.removeChild(container)
    }
  }, [latexCode, renderSettings])

  const exportPDF = useCallback(async () => {
    const container = document.createElement('div')
    container.style.cssText = `position:absolute;left:-9999px;padding:20px;background:${renderSettings.bgColor};`
    document.body.appendChild(container)
    try {
      katex.render(latexCode, container, {
        displayMode: true,
        throwOnError: false,
        output: 'htmlAndMathml',
      })
      const canvas = await html2canvas(container, {
        backgroundColor: renderSettings.bgColor === 'transparent' ? '#ffffff' : renderSettings.bgColor,
        scale: 3,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 3, canvas.height / 3] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3)
      pdf.save('formula.pdf')
    } finally {
      document.body.removeChild(container)
    }
  }, [latexCode, renderSettings])

  const exportMathML = useCallback(async () => {
    const mathml = katex.renderToString(latexCode, {
      displayMode: true,
      throwOnError: false,
      output: 'mathml',
    })
    await copyToClipboard(mathml)
  }, [latexCode])

  return (
    <div className="relative flex items-center gap-1">
      <button
        onClick={copyLatex}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
        title="复制LaTeX源码"
      >
        <Copy size={12} />
        {copied ? '已复制' : '复制LaTeX'}
      </button>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-400/90 text-ink-950 font-medium hover:bg-amber-400 transition-all"
        >
          <Download size={12} />
          导出
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-xl z-20 py-1 min-w-[160px]">
              <button onClick={() => { exportPNG(); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">
                <FileImage size={14} /> 导出为 PNG
              </button>
              <button onClick={() => { exportSVG(); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">
                <Palette size={14} /> 导出为 SVG
              </button>
              <button onClick={() => { exportPDF(); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">
                <FileText size={14} /> 导出为 PDF
              </button>
              <button onClick={() => { exportMathML(); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all">
                <FileCode size={14} /> 复制 MathML
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
