import { useState } from 'react'
import { X, BookPlus, Image } from 'lucide-react'
import { Book, THEME_PRESETS, THEME_ICONS, AGE_RANGES, DEFAULT_COVER } from '@/types'
import { cn } from '@/lib/utils'

interface BookFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Book, 'id' | 'readCount' | 'lastReadAt' | 'createdAt'>) => void
  initialData?: Book
}

export default function BookForm({ open, onClose, onSubmit, initialData }: BookFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [author, setAuthor] = useState(initialData?.author ?? '')
  const [themes, setThemes] = useState<string[]>(initialData?.themes ?? [])
  const [ageRange, setAgeRange] = useState(initialData?.ageRange ?? AGE_RANGES[0])
  const [pages, setPages] = useState(initialData?.pages ?? 0)
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl ?? '')
  const [adultNote, setAdultNote] = useState(initialData?.adultNote ?? '')

  if (!open) return null

  const toggleTheme = (theme: string) => {
    setThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), author: author.trim(), themes, ageRange, pages, coverUrl, adultNote: adultNote.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-stone-900/30" onClick={onClose}>
      <div
        className={cn('card-base max-w-lg w-full mx-4 animate-scale-in flex flex-col max-h-[90vh]')}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C4854C]/20">
          <h2 className="font-display text-xl text-[#C4854C] flex items-center gap-2">
            <BookPlus className="w-5 h-5" />
            {initialData ? '编辑绘本' : '添加绘本'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#C4854C]/10 transition-colors text-[#C4854C]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#8B6914] mb-1">书名 *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-base w-full"
                placeholder="输入绘本名称"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B6914] mb-1">作者</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="input-base w-full"
                placeholder="输入作者名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B6914] mb-1">主题</label>
              <div className="flex flex-wrap gap-2">
                {THEME_PRESETS.map(theme => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    className={cn('tag-pill', themes.includes(theme) ? 'tag-active' : 'tag-inactive')}
                  >
                    {THEME_ICONS[theme]} {theme}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B6914] mb-1">适读年龄</label>
              <select
                value={ageRange}
                onChange={e => setAgeRange(e.target.value)}
                className="input-base w-full"
              >
                {AGE_RANGES.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B6914] mb-1">页数</label>
              <input
                type="number"
                value={pages || ''}
                onChange={e => setPages(Number(e.target.value))}
                className="input-base w-full"
                placeholder="输入页数"
                min={0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B6914] mb-1">封面 URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  className="input-base flex-1"
                  placeholder="输入封面图片 URL"
                />
                <button
                  type="button"
                  onClick={() => setCoverUrl(DEFAULT_COVER)}
                  className="btn-secondary text-xs whitespace-nowrap"
                >
                  使用默认封面
                </button>
              </div>
              {coverUrl && (
                <div className="mt-2 relative w-24 h-32 rounded-lg overflow-hidden border border-[#C4854C]/20">
                  <img src={coverUrl} alt="封面预览" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Image className="w-5 h-5 text-white/70" />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B6914] mb-1">家长备注</label>
              <textarea
                value={adultNote}
                onChange={e => setAdultNote(e.target.value)}
                className="input-base w-full min-h-[80px] resize-y"
                placeholder="输入给家长的备注信息"
              />
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-[#C4854C]/20">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">取消</button>
            <button type="submit" className="btn-primary flex-1">保存</button>
          </div>
        </form>
      </div>
    </div>
  )
}
