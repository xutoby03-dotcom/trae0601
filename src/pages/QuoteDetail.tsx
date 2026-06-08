import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCineQuoteStore } from '@/store'
import { useImageUrl } from '@/hooks/useImage'
import { ArrowLeft, Crop as CropIcon, Sun, Subtitles, Share2, Download, RotateCcw, Trash2, Film, Copy, Check } from 'lucide-react'
import { EMOTION_COLORS } from '@/types'
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { cn } from '@/lib/utils'
import { EmotionTag } from '@/components/EmotionTag'

export default function QuoteDetail() {
  const { quoteId } = useParams<{ quoteId: string }>()
  const navigate = useNavigate()
  const store = useCineQuoteStore()

  const [cropMode, setCropMode] = useState(false)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [brightness, setBrightness] = useState(100)
  const [showBrightness, setShowBrightness] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [subtitleText, setSubtitleText] = useState('')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [sharePreviewUrl, setSharePreviewUrl] = useState<string | null>(null)
  const [shareSize, setShareSize] = useState<'square' | 'portrait'>('square')
  const [copied, setCopied] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!store.initialized) {
      store.init()
    }
  }, [store])

  const quote = store.quotes.find((q) => q.id === quoteId)
  const movie = store.movies.find((m) => m.id === quote?.movieId)
  const imageUrl = useImageUrl(quote?.imageId ?? null)

  const initializedRef = useRef(false)

  useEffect(() => {
    if (quote && !initializedRef.current) {
      initializedRef.current = true
      setBrightness(quote.brightness ?? 100)
      setShowSubtitle(quote.showSubtitle ?? false)
      setSubtitleText(quote.subtitleText ?? quote.text)
      if (quote.cropArea) {
        const c: Crop = {
          unit: quote.cropArea.unit as '%' | 'px',
          x: quote.cropArea.x,
          y: quote.cropArea.y,
          width: quote.cropArea.width,
          height: quote.cropArea.height,
        }
        setCrop(c)
        setCompletedCrop(c)
      }
    }
  }, [quote])

  const handleReset = useCallback(() => {
    setCropMode(false)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setBrightness(100)
    setShowSubtitle(false)
    setSubtitleText(quote?.text ?? '')
  }, [quote])

  const handleSave = useCallback(async () => {
    if (!quote) return
    await store.updateQuote(quote.id, {
      brightness,
      cropArea: completedCrop
        ? {
            x: completedCrop.x,
            y: completedCrop.y,
            width: completedCrop.width,
            height: completedCrop.height,
            unit: completedCrop.unit,
          }
        : null,
      showSubtitle,
      subtitleText,
    })
  }, [quote, store, brightness, completedCrop, showSubtitle, subtitleText])

  const handleDelete = useCallback(async () => {
    if (!quote) return
    if (!window.confirm('确定要删除这条台词吗？')) return
    await store.deleteQuote(quote.id)
    navigate(-1)
  }, [quote, store, navigate])

  const generateShareCard = useCallback(async () => {
    if (!imageUrl || !imgRef.current) return

    const img = imgRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    let sx: number, sy: number, sw: number, sh: number

    if (completedCrop) {
      if (completedCrop.unit === 'px') {
        const scaleX = img.naturalWidth / img.width
        const scaleY = img.naturalHeight / img.height
        sx = completedCrop.x * scaleX
        sy = completedCrop.y * scaleY
        sw = completedCrop.width * scaleX
        sh = completedCrop.height * scaleY
      } else {
        sx = (completedCrop.x / 100) * img.naturalWidth
        sy = (completedCrop.y / 100) * img.naturalHeight
        sw = (completedCrop.width / 100) * img.naturalWidth
        sh = (completedCrop.height / 100) * img.naturalHeight
      }
    } else {
      sx = 0
      sy = 0
      sw = img.naturalWidth
      sh = img.naturalHeight
    }

    let outW: number, outH: number
    if (shareSize === 'square') {
      const side = Math.min(sw, sh)
      outW = side
      outH = side
    } else {
      outW = sw
      outH = Math.round(sw * 4 / 3)
    }

    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#0d0d1a'
    ctx.fillRect(0, 0, outW, outH)

    const drawH = shareSize === 'portrait' ? Math.min(sh, outH) : Math.min(sh, outH)
    const drawW = shareSize === 'portrait' ? Math.min(sw, outW) : Math.min(sw, outW)
    const dx = Math.round((outW - drawW) / 2)
    const dy = shareSize === 'square' ? Math.round((outH - drawH) / 2) : 0

    ctx.filter = `brightness(${brightness / 100})`
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, drawW, drawH)
    ctx.filter = 'none'

    if (showSubtitle && subtitleText) {
      const barHeight = outH * 0.1
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, outH - barHeight, outW, barHeight)

      const fontSize = Math.max(16, Math.floor(barHeight * 0.4))
      ctx.font = `${fontSize}px "Noto Serif SC", serif`
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(subtitleText, outW / 2, outH - barHeight / 2, outW - 40)
    }

    if (movie) {
      const watermarkSize = Math.max(12, Math.floor(outH * 0.028))
      ctx.font = `${watermarkSize}px "DM Sans", sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      const label = `${movie.name} (${movie.year}) · ${quote?.character ?? ''}`
      ctx.fillText(label, outW - 20, outH - (showSubtitle ? outH * 0.1 + 10 : 20))
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    )
    if (blob) {
      if (sharePreviewUrl) URL.revokeObjectURL(sharePreviewUrl)
      const url = URL.createObjectURL(blob)
      setSharePreviewUrl(url)
      setShareModalOpen(true)
    }
  }, [imageUrl, completedCrop, brightness, showSubtitle, subtitleText, movie, quote, sharePreviewUrl, shareSize])

  const handleDownload = useCallback(() => {
    if (!sharePreviewUrl) return
    const a = document.createElement('a')
    a.href = sharePreviewUrl
    a.download = `quote-${quoteId}.png`
    a.click()
  }, [sharePreviewUrl, quoteId])

  const handleCopy = useCallback(() => {
    if (!quote) return
    const parts: string[] = []
    if (movie) parts.push(`🎬 ${movie.name} (${movie.year})`)
    if (quote.character) parts.push(`🎭 ${quote.character}`)
    parts.push(`💬 「${quote.text}」`)
    if (quote.timestamp) parts.push(`⏱ ${quote.timestamp}`)
    navigator.clipboard.writeText(parts.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [quote, movie])

  if (!store.initialized) {
    return (
      <div className="min-h-screen bg-cinema-900 flex items-center justify-center">
        <Film className="w-12 h-12 text-amber-primary animate-spin" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-cinema-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">台词未找到</p>
          <button
            onClick={() => navigate(-1)}
            className="text-amber-primary hover:underline"
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cinema-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-amber-primary transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {imageUrl && (
              <div className="relative bg-cinema-800 rounded-lg overflow-hidden">
                {cropMode ? (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt={quote.text}
                      className="w-full"
                      style={{ filter: `brightness(${brightness / 100})` }}
                      crossOrigin="anonymous"
                    />
                  </ReactCrop>
                ) : (
                  <div className="relative">
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt={quote.text}
                      className="w-full"
                      style={{ filter: `brightness(${brightness / 100})` }}
                      crossOrigin="anonymous"
                    />
                    {showSubtitle && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                        <textarea
                          value={subtitleText}
                          onChange={(e) => setSubtitleText(e.target.value)}
                          className="w-full bg-transparent text-white text-center font-display resize-none outline-none text-sm sm:text-base"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setCropMode(!cropMode)}
                className={cn(
                  'p-2 rounded-lg transition',
                  cropMode
                    ? 'bg-amber-primary text-cinema-900'
                    : 'bg-cinema-700 text-gray-300 hover:text-amber-primary'
                )}
              >
                <CropIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowBrightness(!showBrightness)}
                className={cn(
                  'p-2 rounded-lg transition',
                  showBrightness
                    ? 'bg-amber-primary text-cinema-900'
                    : 'bg-cinema-700 text-gray-300 hover:text-amber-primary'
                )}
              >
                <Sun className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSubtitle(!showSubtitle)}
                className={cn(
                  'p-2 rounded-lg transition',
                  showSubtitle
                    ? 'bg-amber-primary text-cinema-900'
                    : 'bg-cinema-700 text-gray-300 hover:text-amber-primary'
                )}
              >
                <Subtitles className="w-5 h-5" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-cinema-700 text-gray-300 hover:text-amber-primary transition"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {showBrightness && (
              <div className="mt-3 flex items-center gap-3">
                <Sun className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="flex-1 accent-amber-primary"
                />
                <span className="text-sm text-gray-400 w-10 text-right">{brightness}%</span>
              </div>
            )}
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl text-white">
                  {movie?.name} <span className="text-gray-400 text-base">({movie?.year})</span>
                </h2>
                <p className="text-amber-primary mt-1">{quote.character}</p>
              </div>

              <blockquote className="font-display italic text-gray-200 leading-relaxed border-l-2 border-amber-primary pl-4">
                「{quote.text}」
              </blockquote>

              {quote.timestamp && (
                <p className="text-sm text-gray-500">{quote.timestamp}</p>
              )}

              <button
                onClick={handleCopy}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition',
                  copied
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-cinema-700 text-gray-400 hover:text-amber-primary border border-cinema-600 hover:border-amber-primary/30'
                )}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '已复制' : '复制台词'}
              </button>

              <div className="flex flex-wrap gap-1.5">
                {quote.emotions.map((e) => (
                  <EmotionTag key={e} emotion={e} size="sm" />
                ))}
              </div>

              {quote.note && (
                <div className="bg-cinema-700 border border-cinema-600 rounded-lg p-3">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{quote.note}</p>
                </div>
              )}

              <hr className="border-cinema-600" />

              <div className="space-y-3">
                <button
                  onClick={generateShareCard}
                  className="w-full flex items-center justify-center gap-2 bg-amber-primary text-cinema-900 font-medium py-2.5 rounded-lg hover:bg-amber-light transition"
                >
                  <Share2 className="w-4 h-4" />
                  生成分享卡片
                </button>

                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 border border-amber-primary text-amber-primary py-2.5 rounded-lg hover:bg-amber-primary/10 transition"
                >
                  保存编辑
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full text-red-400 hover:text-red-300 text-sm py-2 transition"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  删除台词
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grain-overlay" />

      <canvas ref={canvasRef} className="hidden" />

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-cinema-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto p-6">
            <h3 className="font-display text-lg text-white mb-4">分享卡片预览</h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShareSize('square')}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition',
                  shareSize === 'square'
                    ? 'bg-amber-primary text-cinema-900'
                    : 'bg-cinema-700 text-gray-400 hover:text-white'
                )}
              >
                方图 1:1
              </button>
              <button
                onClick={() => setShareSize('portrait')}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition',
                  shareSize === 'portrait'
                    ? 'bg-amber-primary text-cinema-900'
                    : 'bg-cinema-700 text-gray-400 hover:text-white'
                )}
              >
                竖图 3:4
              </button>
            </div>

            {sharePreviewUrl && (
              <img
                src={sharePreviewUrl}
                alt="Share card"
                className="w-full rounded-lg"
              />
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={generateShareCard}
                className="flex-1 flex items-center justify-center gap-2 border border-amber-primary text-amber-primary py-2.5 rounded-lg hover:bg-amber-primary/10 transition text-sm"
              >
                重新生成
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-primary text-cinema-900 font-medium py-2.5 rounded-lg hover:bg-amber-light transition"
              >
                <Download className="w-4 h-4" />
                下载图片
              </button>
              <button
                onClick={() => setShareModalOpen(false)}
                className="border border-gray-600 text-gray-300 py-2.5 px-4 rounded-lg hover:border-gray-400 transition text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
