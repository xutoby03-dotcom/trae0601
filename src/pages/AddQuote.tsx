import { useState, useRef, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCineQuoteStore } from '@/store'
import { EMOTIONS, EMOTION_COLORS } from '@/types'
import { ArrowLeft, Upload, X, Film, Type, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AddQuote() {
  const navigate = useNavigate()
  const store = useCineQuoteStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [movieName, setMovieName] = useState('')
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [character, setCharacter] = useState('')
  const [text, setText] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = useMemo(() => {
    if (!movieName.trim()) return []
    const kw = movieName.toLowerCase()
    return store.movies.filter((m) => m.name.toLowerCase().includes(kw))
  }, [movieName, store.movies])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function removeFile() {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function toggleEmotion(emotion: string) {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    )
  }

  async function handleSave() {
    if (!movieName.trim() || !text.trim()) return

    const movie = await store.findOrCreateMovie(movieName.trim(), year)
    let imageId: string | null = null
    if (file) {
      imageId = await store.saveImage(file)
    }

    await store.addQuote({
      movieId: movie.id,
      character,
      text: text.trim(),
      timestamp,
      emotions: selectedEmotions,
      note,
      imageId,
      isExcerpt: false,
      excerptStyle: '',
    })

    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-cinema-900 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-cinema-500 hover:text-amber-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-display text-white">添加台词</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <span className="px-4 py-2 bg-amber-primary text-cinema-900 font-medium rounded-full text-sm">
          上传截图
        </span>
        <Link
          to="/excerpt"
          className="px-4 py-2 bg-cinema-700 text-cinema-500 hover:text-white rounded-full text-sm transition-colors"
        >
          摘录模式
        </Link>
      </div>

      <div
        className={cn(
          'relative rounded-lg overflow-hidden cursor-pointer mb-6',
          preview ? '' : 'border-dashed border-2 border-cinema-500'
        )}
        onClick={() => !preview && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="w-full max-h-80 object-contain bg-black" />
            <button
              onClick={(e) => { e.stopPropagation(); removeFile() }}
              className="absolute top-2 right-2 p-1 bg-cinema-900/80 rounded-full text-white hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-cinema-500">
            <Upload className="w-10 h-10 mb-3" />
            <span className="text-sm">拖拽或点击上传截图</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="flex items-center gap-2 text-sm text-cinema-500 mb-1.5">
            <Film className="w-4 h-4" />
            电影名
          </label>
          <input
            type="text"
            value={movieName}
            onChange={(e) => { setMovieName(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full px-3 py-2.5 bg-cinema-700 border border-cinema-600 text-white focus:border-amber-primary focus:ring-amber-primary/30 focus:outline-none focus:ring rounded-lg"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-cinema-700 border border-cinema-600 rounded-lg overflow-hidden shadow-lg">
              {suggestions.slice(0, 5).map((m) => (
                <button
                  key={m.id}
                  className="w-full px-3 py-2 text-left text-white text-sm hover:bg-cinema-600 transition-colors"
                  onMouseDown={() => {
                    setMovieName(m.name)
                    setYear(m.year)
                    setShowSuggestions(false)
                  }}
                >
                  {m.name} ({m.year})
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-cinema-500 mb-1.5 block">年份</label>
          <input
            type="number"
            min={1900}
            max={2030}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-cinema-700 border border-cinema-600 text-white focus:border-amber-primary focus:ring-amber-primary/30 focus:outline-none focus:ring rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm text-cinema-500 mb-1.5 block">角色</label>
          <input
            type="text"
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            className="w-full px-3 py-2.5 bg-cinema-700 border border-cinema-600 text-white focus:border-amber-primary focus:ring-amber-primary/30 focus:outline-none focus:ring rounded-lg"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-cinema-500 mb-1.5">
            <Type className="w-4 h-4" />
            台词文字
          </label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2.5 bg-cinema-700 border border-cinema-600 text-white focus:border-amber-primary focus:ring-amber-primary/30 focus:outline-none focus:ring rounded-lg resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-cinema-500 mb-1.5 block">时间点</label>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="01:23:45"
            className="w-full px-3 py-2.5 bg-cinema-700 border border-cinema-600 text-white focus:border-amber-primary focus:ring-amber-primary/30 focus:outline-none focus:ring rounded-lg"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-cinema-500 mb-1.5">
            <Sparkles className="w-4 h-4" />
            情绪标签
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion}
                onClick={() => toggleEmotion(emotion)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-all',
                  EMOTION_COLORS[emotion],
                  selectedEmotions.includes(emotion) && 'ring-2 ring-white/40'
                )}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-cinema-500 mb-1.5 block">个人感想</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2.5 bg-cinema-700 border border-cinema-600 text-white focus:border-amber-primary focus:ring-amber-primary/30 focus:outline-none focus:ring rounded-lg resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!movieName.trim() || !text.trim()}
        className="w-full mt-6 py-3 bg-amber-primary text-cinema-900 font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-light transition-colors"
      >
        保存台词
      </button>

      <div className="grain-overlay" />
    </div>
  )
}
