import { useEffect, useRef, useState, useCallback } from 'react'
import katex from 'katex'
import { useStore } from '../store'
import { debounce } from '../utils/helpers'

export default function PreviewPanel() {
  const { latexCode, renderSettings } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  const renderLatex = useCallback(
    debounce((...args: unknown[]) => {
      const code = args[0] as string
      if (!containerRef.current) return
      try {
        katex.render(code, containerRef.current, {
          displayMode: true,
          throwOnError: false,
          strict: false,
          trust: true,
          output: 'htmlAndMathml',
        })
        setError(null)
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        }
      }
    }, 200),
    []
  )

  useEffect(() => {
    renderLatex(latexCode)
  }, [latexCode, renderLatex])

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center overflow-auto p-6"
      style={{ backgroundColor: renderSettings.bgColor }}
    >
      <div
        ref={containerRef}
        className="max-w-full overflow-auto transition-opacity duration-200"
        style={{
          fontSize: `${renderSettings.fontSize}em`,
          fontFamily: renderSettings.fontFamily,
          color: renderSettings.fontColor,
        }}
      />
      {error && (
        <div className="mt-4 text-red-500 text-sm bg-red-500/10 px-3 py-2 rounded-lg max-w-md text-center">
          {error}
        </div>
      )}
      {!latexCode && (
        <div className="text-[var(--text-muted)] text-sm">
          在左侧编辑器输入 LaTeX 代码即可实时预览
        </div>
      )}
    </div>
  )
}
