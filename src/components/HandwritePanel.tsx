import { useRef, useState, useCallback, useEffect } from 'react'
import { useStore } from '../store'

const MOCK_RESULTS = [
  'E = mc^2',
  'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
  '\\int_0^1 f(x) \\, dx',
  '\\sum_{n=1}^{\\infty} \\frac{1}{n^2}',
  '\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}',
  'a^2 + b^2 = c^2',
  'f(x) = ax^2 + bx + c',
  '\\frac{d}{dx} \\int_a^x f(t) \\, dt = f(x)',
]

function getStrokeColor(theme: 'light' | 'dark'): string {
  return theme === 'dark' ? '#f0f0f0' : '#1a1b2e'
}

export default function HandwritePanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasContent, setHasContent] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const { insertAtCursor, theme } = useStore()

  const applyStrokeColor = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = getStrokeColor(theme)
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    applyStrokeColor(ctx)
  }, [applyStrokeColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    applyStrokeColor(ctx)
  }, [theme, applyStrokeColor])

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    setHasContent(true)
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }, [getPos])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }, [isDrawing, getPos])

  const endDraw = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    applyStrokeColor(ctx)
    setHasContent(false)
  }, [applyStrokeColor])

  const recognize = useCallback(() => {
    setRecognizing(true)
    setTimeout(() => {
      const result = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
      insertAtCursor(result)
      setRecognizing(false)
      clearCanvas()
    }, 1200)
  }, [insertAtCursor, clearCanvas])

  return (
    <div className="h-full flex flex-col p-3 gap-3">
      <div className="text-sm font-medium text-[var(--text-secondary)]">手写识别</div>
      <div className="flex-1 border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={clearCanvas}
          disabled={!hasContent}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 transition-all"
        >
          清除
        </button>
        <button
          onClick={recognize}
          disabled={!hasContent || recognizing}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-amber-400/90 text-ink-950 font-medium hover:bg-amber-400 disabled:opacity-30 transition-all"
        >
          {recognizing ? '识别中...' : '识别'}
        </button>
      </div>
      {!hasContent && (
        <div className="text-xs text-[var(--text-muted)] text-center">
          在上方画板中用鼠标手写公式，然后点击识别
        </div>
      )}
    </div>
  )
}
