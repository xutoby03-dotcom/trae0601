import { useRef, useState, useCallback } from 'react'
import { useStore } from '../store'
import { Upload, ImageIcon } from 'lucide-react'

const MOCK_RESULTS = [
  '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
  '\\int_0^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
  '\\lim_{n \\to \\infty} (1 + \\frac{1}{n})^n = e',
  '\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0}',
  'PV = nRT',
  'F = ma',
]

export default function ImageRecognize() {
  const [preview, setPreview] = useState<string | null>(null)
  const [recognizing, setRecognizing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { insertAtCursor } = useStore()

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setResult(null)
  }, [])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }, [handleFile])

  const recognize = useCallback(() => {
    setRecognizing(true)
    setTimeout(() => {
      const mockResult = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
      setResult(mockResult)
      setRecognizing(false)
    }, 1500)
  }, [])

  const applyResult = useCallback(() => {
    if (result) {
      insertAtCursor(result)
      setResult(null)
      setPreview(null)
    }
  }, [result, insertAtCursor])

  return (
    <div className="h-full flex flex-col p-3 gap-3">
      <div className="text-sm font-medium text-[var(--text-secondary)]">图片识别</div>

      {!preview ? (
        <div
          className="flex-1 border-2 border-dashed border-[var(--border-color)] rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-amber-400/50 transition-all"
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload size={32} className="text-[var(--text-muted)]" />
          <div className="text-sm text-[var(--text-muted)]">点击或拖拽上传图片</div>
          <div className="text-xs text-[var(--text-muted)]">支持 JPG、PNG、GIF</div>
        </div>
      ) : (
        <div className="flex-1 border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--card-bg)] flex items-center justify-center">
          <img src={preview} alt="uploaded" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {result && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3">
          <div className="text-xs text-[var(--text-muted)] mb-1">识别结果：</div>
          <code className="text-sm text-amber-400 break-all">{result}</code>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => { setPreview(null); setResult(null) }}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
        >
          重置
        </button>
        {preview && !result && (
          <button
            onClick={recognize}
            disabled={recognizing}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-amber-400/90 text-ink-950 font-medium hover:bg-amber-400 disabled:opacity-30 transition-all"
          >
            {recognizing ? '识别中...' : '识别'}
          </button>
        )}
        {result && (
          <button
            onClick={applyResult}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-mint-400/90 text-ink-950 font-medium hover:bg-mint-400 transition-all"
          >
            插入编辑器
          </button>
        )}
      </div>
    </div>
  )
}
