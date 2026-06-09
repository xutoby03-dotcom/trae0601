import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { useReadingStore } from '@/store'
import { BOOK_THEMES, DIFFICULTY_LABELS } from '@/types'
import type { Book } from '@/types'

type FormData = {
  title: string
  ageRange: string
  totalPages: string
  theme: string
  difficulty: Book['difficulty']
  coverUrl: string
}

const initialForm: FormData = {
  title: '',
  ageRange: '',
  totalPages: '',
  theme: BOOK_THEMES[0],
  difficulty: 'easy',
  coverUrl: '',
}

export default function BookForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const books = useReadingStore((s) => s.books)
  const addBook = useReadingStore((s) => s.addBook)
  const updateBook = useReadingStore((s) => s.updateBook)

  const isEditing = Boolean(id)
  const existingBook = id ? books.find((b) => b.id === id) : null

  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<{ title?: string; totalPages?: string }>({})

  useEffect(() => {
    if (existingBook) {
      setForm({
        title: existingBook.title,
        ageRange: existingBook.ageRange,
        totalPages: String(existingBook.totalPages),
        theme: existingBook.theme,
        difficulty: existingBook.difficulty,
        coverUrl: existingBook.coverUrl,
      })
    }
  }, [existingBook])

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleGenerateCover = () => {
    if (!form.title.trim()) return
    const prompt = encodeURIComponent(`儿童绘本封面，书名《${form.title}》，温暖插画风格，高质量`)
    const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`
    setForm((prev) => ({ ...prev, coverUrl: url }))
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!form.title.trim()) {
      newErrors.title = '请输入书名'
    }
    if (!form.totalPages || Number(form.totalPages) <= 0) {
      newErrors.totalPages = '请输入有效的页数'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const bookData = {
      title: form.title.trim(),
      ageRange: form.ageRange.trim() || '3-6岁',
      totalPages: Number(form.totalPages),
      theme: form.theme,
      difficulty: form.difficulty,
      coverUrl: form.coverUrl,
    }

    if (isEditing && id) {
      updateBook(id, bookData)
    } else {
      addBook(bookData)
    }

    navigate('/books')
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/books')}
          className="p-2 rounded-xl text-stone-500 hover:bg-warm-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-stone-800 font-display">
          {isEditing ? '编辑书籍' : '添加书籍'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">书名 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="请输入书名"
            className={`input-field ${errors.title ? '!border-coral-400 !ring-coral-400' : ''}`}
          />
          {errors.title && (
            <p className="text-xs text-coral-500 mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">适读年龄</label>
          <input
            type="text"
            value={form.ageRange}
            onChange={(e) => handleChange('ageRange', e.target.value)}
            placeholder="例如：3-6岁"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">总页数 *</label>
          <input
            type="number"
            min="1"
            value={form.totalPages}
            onChange={(e) => handleChange('totalPages', e.target.value)}
            placeholder="请输入总页数"
            className={`input-field ${errors.totalPages ? '!border-coral-400 !ring-coral-400' : ''}`}
          />
          {errors.totalPages && (
            <p className="text-xs text-coral-500 mt-1">{errors.totalPages}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">主题</label>
          <select
            value={form.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="input-field appearance-none"
          >
            {BOOK_THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">难度</label>
          <div className="flex gap-3">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <label
                key={level}
                className={`flex-1 text-center py-2.5 rounded-xl2 border-2 cursor-pointer transition-all duration-200
                  ${
                    form.difficulty === level
                      ? 'border-warm-500 bg-warm-50 text-warm-700 font-medium'
                      : 'border-warm-200 bg-white text-stone-500 hover:border-warm-300'
                  }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={form.difficulty === level}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="sr-only"
                />
                {DIFFICULTY_LABELS[level]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">封面图片</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.coverUrl}
              onChange={(e) => handleChange('coverUrl', e.target.value)}
              placeholder="输入图片 URL"
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={handleGenerateCover}
              disabled={!form.title.trim()}
              className="btn-secondary flex items-center gap-1.5 !py-3 !px-3 text-sm whitespace-nowrap
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ImagePlus size={16} />
              生成
            </button>
          </div>
          {form.coverUrl && (
            <div className="mt-3 w-24 h-24 rounded-xl overflow-hidden bg-warm-50 border border-warm-100">
              <img
                src={form.coverUrl}
                alt="封面预览"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full text-base mt-6"
        >
          保存
        </button>
      </form>
    </div>
  )
}
