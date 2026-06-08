import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { THEME_PRESETS, THEME_ICONS } from '@/types'
import { cn } from '@/lib/utils'
import BookCard from '@/components/BookCard'
import BookForm from '@/components/BookForm'

export default function Home() {
  const books = useStore(s => s.books)
  const sessions = useStore(s => s.sessions)
  const addBook = useStore(s => s.addBook)
  const navigate = useNavigate()
  const [selectedTheme, setSelectedTheme] = useState<string>('全部')
  const [formOpen, setFormOpen] = useState(false)

  const totalReadings = sessions.length

  const sortedBooks = useMemo(() => {
    let filtered = books
    if (selectedTheme !== '全部') {
      filtered = books.filter(b => b.themes.includes(selectedTheme))
    }
    const read = filtered
      .filter(b => b.readCount > 0)
      .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
    const unread = filtered.filter(b => b.readCount === 0)
    return [...read, ...unread]
  }, [books, selectedTheme, sessions])

  const handleAddBook = (data: Omit<import('@/types').Book, 'id' | 'readCount' | 'lastReadAt' | 'createdAt'>) => {
    addBook(data)
    setFormOpen(false)
  }

  return (
    <div className="min-h-screen bg-parchment px-4 pt-6 pb-24 md:px-8">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📚</span>
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-bark">我的小书架</h1>
            <p className="mt-1 text-sm text-warm-gray">
              {books.length} 本绘本 · {totalReadings} 次共读
            </p>
          </div>
        </div>
      </header>

      <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTheme('全部')}
            className={cn(
              'tag-pill whitespace-nowrap',
              selectedTheme === '全部' ? 'tag-active' : 'tag-inactive'
            )}
          >
            🌈 全部
          </button>
          {THEME_PRESETS.map(theme => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={cn(
                'tag-pill whitespace-nowrap',
                selectedTheme === theme ? 'tag-active' : 'tag-inactive'
              )}
            >
              {THEME_ICONS[theme]} {theme}
            </button>
          ))}
        </div>
      </div>

      {sortedBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {sortedBooks.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} onClick={() => navigate(`/book/${book.id}`)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="mb-4 text-6xl">📖</span>
          <p className="font-display text-lg text-bark">
            {selectedTheme === '全部' ? '书架还是空的' : '没有找到相关绘本'}
          </p>
          <p className="mt-2 text-sm text-warm-gray">
            {selectedTheme === '全部' ? '点击下方按钮，添加第一本绘本吧' : '换个主题试试，或者添加一本新绘本'}
          </p>
        </div>
      )}

      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 btn-primary rounded-full p-4 shadow-soft transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      <BookForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddBook}
      />
    </div>
  )
}
