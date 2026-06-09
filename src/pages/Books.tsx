import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Trash2 } from 'lucide-react'
import { useReadingStore } from '@/store'
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types'
import type { Book } from '@/types'

export default function Books() {
  const navigate = useNavigate()
  const books = useReadingStore((s) => s.books)
  const getBookProgress = useReadingStore((s) => s.getBookProgress)
  const deleteBook = useReadingStore((s) => s.deleteBook)

  const handleDelete = (book: Book) => {
    if (window.confirm(`确定要删除《${book.title}》吗？删除后无法恢复。`)) {
      deleteBook(book.id)
    }
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800 font-display">我的书架</h1>
        <button
          onClick={() => navigate('/books/add')}
          className="btn-primary flex items-center gap-1.5 !py-2.5 !px-4 text-sm"
        >
          <Plus size={18} />
          添加
        </button>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <BookOpen size={56} strokeWidth={1.2} className="mb-4 text-warm-300" />
          <p className="text-lg font-display text-stone-500 mb-2">书架空空如也</p>
          <p className="text-sm">点击上方「添加」开始你的阅读之旅</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {books.map((book) => {
            const progress = getBookProgress(book.id)
            const percent = Math.round(progress * 100)
            return (
              <div
                key={book.id}
                className="card group relative"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-warm-50">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                          ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        book.coverUrl ? 'hidden' : ''
                      }`}
                    >
                      <BookOpen size={36} className="text-warm-300" strokeWidth={1.5} />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-stone-800 leading-tight mb-1.5 line-clamp-2">
                    {book.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="badge bg-warm-100 text-warm-700 text-[10px]">
                      {book.theme}
                    </span>
                    <span className="badge bg-stone-100 text-stone-600 text-[10px]">
                      {book.ageRange}
                    </span>
                    <span className={`badge text-[10px] ${DIFFICULTY_COLORS[book.difficulty]}`}>
                      {DIFFICULTY_LABELS[book.difficulty]}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-stone-400">阅读进度</span>
                      <span className="text-[10px] font-medium text-warm-600">{percent}%</span>
                    </div>
                    <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warm-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(book)
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm
                             opacity-0 group-hover:opacity-100 transition-opacity duration-200
                             hover:bg-coral-100 text-stone-400 hover:text-coral-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
