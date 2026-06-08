import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCineQuoteStore } from '@/store'
import { EXCERPT_STYLES, EMOTIONS, EMOTION_COLORS } from '@/types'
import { ArrowLeft, Download, Sparkles, Type, Pen, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const STYLE_ICONS: Record<string, typeof Type> = {
  cinema: Sparkles,
  typewriter: Type,
  neon: Wand2,
  minimal: Pen,
}

const STYLE_HINTS: Record<string, string> = {
  cinema: '🎬 暗调经典',
  typewriter: '📄 复古纸感',
  neon: '💡 霓虹光影',
  minimal: '◻️ 留白极简',
}

function CinemaCard({ text, character, movieName, year }: {
  text: string
  character: string
  movieName: string
  year: number | ''
}) {
  return (
    <div className="w-[400px] h-[560px] rounded-lg overflow-hidden relative flex flex-col justify-center px-12 py-10"
      style={{ background: 'linear-gradient(135deg, #252540, #0d0d1a)' }}>
      <div className="absolute left-0 top-0 bottom-0 w-5"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 4px,
            rgba(226, 183, 20, 0.3) 4px,
            rgba(226, 183, 20, 0.3) 14px,
            transparent 14px,
            transparent 22px
          )`
        }}
      />
      <div className="w-12 h-px bg-amber-primary mb-6" />
      <p className="font-display italic text-2xl text-white leading-relaxed flex-1">
        {text || '在这里输入台词...'}
      </p>
      {character && (
        <p className="text-amber-primary font-display mt-4 text-lg">— {character}</p>
      )}
      <p className="text-cinema-500 text-sm mt-2">
        {movieName}{year ? ` (${year})` : ''}
      </p>
    </div>
  )
}

function TypewriterCard({ text, character, movieName, year }: {
  text: string
  character: string
  movieName: string
  year: number | ''
}) {
  return (
    <div className="w-[400px] h-[560px] rounded-lg overflow-hidden relative flex flex-col justify-center px-10 py-10"
      style={{ backgroundColor: '#f5f0e8' }}>
      <div className="absolute top-8 right-8 w-16 h-16 rounded-full opacity-10"
        style={{ backgroundColor: '#6b4c3b' }} />
      <p className="flex-1 text-lg leading-relaxed"
        style={{ color: '#3a2f27', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
        {text || '在这里输入台词...'}
      </p>
      <div className="mt-6">
        {character && (
          <p className="text-sm" style={{ color: '#6b5b50' }}>— {character}</p>
        )}
        <p className="text-xs mt-1" style={{ color: '#9a8a7a' }}>
          {movieName}{year ? ` (${year})` : ''}
        </p>
      </div>
    </div>
  )
}

function NeonCard({ text, character, movieName, year }: {
  text: string
  character: string
  movieName: string
  year: number | ''
}) {
  return (
    <div className="w-[400px] h-[560px] rounded-lg overflow-hidden relative flex flex-col justify-center px-10 py-10 bg-black"
      style={{ boxShadow: 'inset 0 0 20px rgba(0,255,255,0.1)' }}>
      <div className="absolute inset-0 border border-cyan-500/20 rounded-lg m-1" />
      <p className="flex-1 text-2xl leading-relaxed text-cyan-400"
        style={{ textShadow: '0 0 10px cyan, 0 0 20px cyan' }}>
        {text || '在这里输入台词...'}
      </p>
      {character && (
        <p className="text-pink-400 text-lg mt-4"
          style={{ textShadow: '0 0 10px rgba(244,114,182,0.8), 0 0 20px rgba(244,114,182,0.4)' }}>
          — {character}
        </p>
      )}
      <p className="text-amber-primary text-sm mt-2"
        style={{ textShadow: '0 0 8px rgba(226,183,20,0.6)' }}>
        {movieName}{year ? ` (${year})` : ''}
      </p>
    </div>
  )
}

function MinimalCard({ text, character, movieName, year }: {
  text: string
  character: string
  movieName: string
  year: number | ''
}) {
  return (
    <div className="w-[400px] h-[560px] rounded-lg overflow-hidden relative flex flex-col justify-center px-12 py-10 bg-white">
      <div className="w-16 h-px bg-gray-300 mb-8" />
      <p className="flex-1 text-gray-800 font-light text-xl leading-relaxed">
        {text || '在这里输入台词...'}
      </p>
      <div className="w-16 h-px bg-gray-300 mt-8 mb-4" />
      {character && (
        <p className="text-gray-500 text-sm">— {character}</p>
      )}
      <p className="text-gray-400 text-xs mt-1">
        {movieName}{year ? ` (${year})` : ''}
      </p>
    </div>
  )
}

function PreviewCard({ style, text, character, movieName, year }: {
  style: string
  text: string
  character: string
  movieName: string
  year: number | ''
}) {
  switch (style) {
    case 'cinema':
      return <CinemaCard text={text} character={character} movieName={movieName} year={year} />
    case 'typewriter':
      return <TypewriterCard text={text} character={character} movieName={movieName} year={year} />
    case 'neon':
      return <NeonCard text={text} character={character} movieName={movieName} year={year} />
    case 'minimal':
      return <MinimalCard text={text} character={character} movieName={movieName} year={year} />
    default:
      return <CinemaCard text={text} character={character} movieName={movieName} year={year} />
  }
}

function drawCardToCanvas(
  canvas: HTMLCanvasElement,
  style: string,
  text: string,
  character: string,
  movieName: string,
  year: string
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = 400
  const H = 560
  canvas.width = W * 2
  canvas.height = H * 2
  ctx.scale(2, 2)

  switch (style) {
    case 'cinema':
      drawCinema(ctx, W, H, text, character, movieName, year)
      break
    case 'typewriter':
      drawTypewriter(ctx, W, H, text, character, movieName, year)
      break
    case 'neon':
      drawNeon(ctx, W, H, text, character, movieName, year)
      break
    case 'minimal':
      drawMinimal(ctx, W, H, text, character, movieName, year)
      break
    default:
      drawCinema(ctx, W, H, text, character, movieName, year)
  }
}

function drawCinema(ctx: CanvasRenderingContext2D, W: number, H: number, text: string, character: string, movieName: string, year: string) {
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#252540')
  grad.addColorStop(1, '#0d0d1a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(226, 183, 20, 0.3)'
  for (let y = 0; y < H; y += 22) {
    ctx.fillRect(0, y + 4, 6, 10)
  }

  ctx.fillStyle = '#e2b714'
  ctx.fillRect(48, 120, 48, 1)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'italic 20px "Playfair Display", "Noto Serif SC", serif'
  wrapText(ctx, text || '在这里输入台词...', 48, 160, W - 96, 32)

  if (character) {
    ctx.fillStyle = '#e2b714'
    ctx.font = '18px "Playfair Display", "Noto Serif SC", serif'
    ctx.fillText(`— ${character}`, 48, H - 100)
  }

  ctx.fillStyle = '#3d3d5c'
  ctx.font = '13px "DM Sans", "Noto Sans SC", sans-serif'
  const label = `${movieName}${year ? ` (${year})` : ''}`
  ctx.fillText(label, 48, H - 60)
}

function drawTypewriter(ctx: CanvasRenderingContext2D, W: number, H: number, text: string, character: string, movieName: string, year: string) {
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, W, H)

  ctx.beginPath()
  ctx.arc(W - 50, 50, 30, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(107, 76, 59, 0.1)'
  ctx.fill()

  ctx.fillStyle = '#3a2f27'
  ctx.font = '17px monospace'
  wrapText(ctx, text || '在这里输入台词...', 40, 80, W - 80, 28)

  ctx.fillStyle = '#6b5b50'
  ctx.font = '13px "DM Sans", "Noto Sans SC", sans-serif'
  if (character) {
    ctx.fillText(`— ${character}`, 40, H - 80)
  }

  ctx.fillStyle = '#9a8a7a'
  ctx.font = '11px "DM Sans", "Noto Sans SC", sans-serif'
  ctx.fillText(`${movieName}${year ? ` (${year})` : ''}`, 40, H - 56)
}

function drawNeon(ctx: CanvasRenderingContext2D, W: number, H: number, text: string, character: string, movieName: string, year: string) {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(8, 8, W - 16, H - 16)

  ctx.shadowColor = 'cyan'
  ctx.shadowBlur = 20
  ctx.fillStyle = '#22d3ee'
  ctx.font = '20px "DM Sans", "Noto Sans SC", sans-serif'
  wrapText(ctx, text || '在这里输入台词...', 40, 100, W - 80, 32)

  if (character) {
    ctx.shadowColor = 'rgba(244, 114, 182, 0.8)'
    ctx.fillStyle = '#f472b6'
    ctx.font = '17px "DM Sans", "Noto Sans SC", sans-serif'
    ctx.fillText(`— ${character}`, 40, H - 100)
  }

  ctx.shadowColor = 'rgba(226, 183, 20, 0.6)'
  ctx.fillStyle = '#e2b714'
  ctx.font = '13px "DM Sans", "Noto Sans SC", sans-serif'
  ctx.fillText(`${movieName}${year ? ` (${year})` : ''}`, 40, H - 60)

  ctx.shadowBlur = 0
}

function drawMinimal(ctx: CanvasRenderingContext2D, W: number, H: number, text: string, character: string, movieName: string, year: string) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#d1d5db'
  ctx.fillRect(48, 130, 64, 1)

  ctx.fillStyle = '#1f2937'
  ctx.font = '300 19px "DM Sans", "Noto Sans SC", sans-serif'
  wrapText(ctx, text || '在这里输入台词...', 48, 170, W - 96, 30)

  ctx.fillStyle = '#d1d5db'
  const lineY = H - 140
  ctx.fillRect(48, lineY, 64, 1)

  ctx.fillStyle = '#6b7280'
  ctx.font = '13px "DM Sans", "Noto Sans SC", sans-serif'
  if (character) {
    ctx.fillText(`— ${character}`, 48, lineY + 24)
  }

  ctx.fillStyle = '#9ca3af'
  ctx.font = '11px "DM Sans", "Noto Sans SC", sans-serif'
  ctx.fillText(`${movieName}${year ? ` (${year})` : ''}`, 48, lineY + 44)
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const lines: string[] = []
  let currentLine = ''
  for (const char of text) {
    const testLine = currentLine + char
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight)
  }
}

export default function ExcerptMode() {
  const navigate = useNavigate()
  const { movies, findOrCreateMovie, addQuote, initialized, init } = useCineQuoteStore()

  useEffect(() => {
    if (!initialized) init()
  }, [initialized, init])

  const [movieName, setMovieName] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [character, setCharacter] = useState('')
  const [quoteText, setQuoteText] = useState('')
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('cinema')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const movieInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (movieName.trim()) {
      const filtered = movies
        .map(m => m.name)
        .filter(n => n.toLowerCase().includes(movieName.toLowerCase()))
        .slice(0, 5)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [movieName, movies])

  const toggleEmotion = useCallback((emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    )
  }, [])

  const handleSave = useCallback(async () => {
    if (!quoteText.trim() || !movieName.trim()) return

    const movie = await findOrCreateMovie(movieName.trim(), typeof year === 'number' ? year : new Date().getFullYear())
    await addQuote({
      movieId: movie.id,
      character: character.trim(),
      text: quoteText.trim(),
      timestamp: '',
      emotions: selectedEmotions,
      note: note.trim(),
      imageId: null,
      isExcerpt: true,
      excerptStyle: selectedStyle,
    })
    navigate('/')
  }, [movieName, year, character, quoteText, selectedEmotions, note, selectedStyle, findOrCreateMovie, addQuote, navigate])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    drawCardToCanvas(
      canvas,
      selectedStyle,
      quoteText || '在这里输入台词...',
      character,
      movieName,
      year ? String(year) : ''
    )

    const link = document.createElement('a')
    link.download = `excerpt-${selectedStyle}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [selectedStyle, quoteText, character, movieName, year])

  return (
    <div className="bg-cinema-900 min-h-screen pb-24">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-cinema-700">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg text-cinema-500 hover:text-white hover:bg-cinema-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display italic text-xl text-amber-primary">摘录模式</h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto">
        <div className="w-full lg:max-w-md space-y-5">
          <div className="relative">
            <label className="block text-sm text-cinema-500 mb-1">电影名</label>
            <input
              ref={movieInputRef}
              type="text"
              value={movieName}
              onChange={e => setMovieName(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="输入电影名称"
              className="w-full rounded-lg border border-cinema-600 bg-cinema-700 px-3 py-2 text-sm text-white placeholder-cinema-500 outline-none focus:border-amber-primary focus:ring-1 focus:ring-amber-primary"
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-cinema-800 border border-cinema-600 rounded-lg overflow-hidden shadow-lg">
                {suggestions.map(name => (
                  <button
                    key={name}
                    className="w-full text-left px-3 py-2 text-sm text-cinema-300 hover:bg-cinema-700 hover:text-white transition-colors"
                    onMouseDown={() => {
                      setMovieName(name)
                      const match = movies.find(m => m.name === name)
                      if (match) setYear(match.year)
                      setShowSuggestions(false)
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-cinema-500 mb-1">年份</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value ? Number(e.target.value) : '')}
              placeholder="上映年份"
              className="w-full rounded-lg border border-cinema-600 bg-cinema-700 px-3 py-2 text-sm text-white placeholder-cinema-500 outline-none focus:border-amber-primary focus:ring-1 focus:ring-amber-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-cinema-500 mb-1">角色</label>
            <input
              type="text"
              value={character}
              onChange={e => setCharacter(e.target.value)}
              placeholder="说话角色"
              className="w-full rounded-lg border border-cinema-600 bg-cinema-700 px-3 py-2 text-sm text-white placeholder-cinema-500 outline-none focus:border-amber-primary focus:ring-1 focus:ring-amber-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-cinema-500 mb-1">台词文字 <span className="text-amber-primary">*</span></label>
            <textarea
              rows={6}
              value={quoteText}
              onChange={e => setQuoteText(e.target.value)}
              placeholder="输入你喜爱的台词..."
              className="w-full rounded-lg border border-cinema-600 bg-cinema-700 px-3 py-2 text-sm text-white placeholder-cinema-500 outline-none focus:border-amber-primary focus:ring-1 focus:ring-amber-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-cinema-500 mb-2">情绪标签</label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(emotion => (
                <button
                  key={emotion}
                  onClick={() => toggleEmotion(emotion)}
                  className={cn(
                    'px-2.5 py-1 rounded-full border text-xs transition-all',
                    selectedEmotions.includes(emotion)
                      ? EMOTION_COLORS[emotion]
                      : 'border-cinema-600 text-cinema-500 hover:border-cinema-500'
                  )}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-cinema-500 mb-1">个人感想</label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="写下你的感想..."
              className="w-full rounded-lg border border-cinema-600 bg-cinema-700 px-3 py-2 text-sm text-white placeholder-cinema-500 outline-none focus:border-amber-primary focus:ring-1 focus:ring-amber-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-cinema-500 mb-2">风格模板</label>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {EXCERPT_STYLES.map(style => {
                const Icon = STYLE_ICONS[style.id]
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      'flex-shrink-0 w-[100px] h-[60px] rounded-lg border-2 flex flex-col items-center justify-center transition-all',
                      selectedStyle === style.id
                        ? 'border-amber-primary bg-cinema-700'
                        : 'border-cinema-600 bg-cinema-800 hover:border-cinema-500'
                    )}
                  >
                    <Icon size={14} className={selectedStyle === style.id ? 'text-amber-primary' : 'text-cinema-500'} />
                    <span className={cn(
                      'text-[10px] mt-1',
                      selectedStyle === style.id ? 'text-amber-primary' : 'text-cinema-500'
                    )}>
                      {STYLE_HINTS[style.id]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center pt-4">
          <div className="animate-fade-in">
            <PreviewCard
              style={selectedStyle}
              text={quoteText}
              character={character}
              movieName={movieName}
              year={year}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-cinema-900/95 backdrop-blur border-t border-cinema-700 px-6 py-3 flex justify-center gap-4">
        <button
          onClick={handleSave}
          disabled={!quoteText.trim() || !movieName.trim()}
          className="flex items-center gap-2 bg-amber-primary text-cinema-900 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-amber-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} />
          保存到收藏
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 border border-cinema-600 text-cinema-300 px-6 py-2.5 rounded-lg text-sm hover:border-cinema-500 hover:text-white transition-colors"
        >
          <Download size={16} />
          下载卡片
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <div className="grain-overlay" />
    </div>
  )
}
