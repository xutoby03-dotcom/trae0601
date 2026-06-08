import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import MediaCard from '@/components/MediaCard'
import MediaForm from '@/components/MediaForm'
import { MEDIA_TYPE_CONFIG, type MediaType, type MediaItem } from '@/lib/types'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | MediaType

const TABS: { key: FilterTab; label: string; icon?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'book', label: '📖 书' },
  { key: 'movie', label: '🎬 电影' },
  { key: 'series', label: '📺 剧' },
  { key: 'music', label: '🎵 音乐' },
]

export default function Library() {
  const mediaItems = useAppStore((s) => s.mediaItems)
  const addMediaItem = useAppStore((s) => s.addMediaItem)
  const updateMediaItem = useAppStore((s) => s.updateMediaItem)
  const deleteMediaItem = useAppStore((s) => s.deleteMediaItem)

  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MediaItem | undefined>(undefined)

  const filtered = useMemo(() => {
    let items = mediaItems
    if (activeTab !== 'all') {
      items = items.filter((i) => i.type === activeTab)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      items = items.filter((i) => i.title.toLowerCase().includes(q))
    }
    return items
  }, [mediaItems, activeTab, search])

  const handleSubmit = (data: Omit<MediaItem, 'id' | 'createdAt'>) => {
    if (editingItem) {
      updateMediaItem(editingItem.id, data)
    } else {
      addMediaItem(data)
    }
    setShowForm(false)
    setEditingItem(undefined)
  }

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    deleteMediaItem(id)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-serif text-amber-100/90">我的清单</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              共 {mediaItems.length} 条 · {mediaItems.filter((i) => !i.consumed).length} 条未看
            </p>
          </div>
          <button
            onClick={() => {
              setEditingItem(undefined)
              setShowForm(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-600/30 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            添加
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索标题..."
            className="w-full bg-slate-800/40 border border-slate-700/40 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/30"
          />
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer',
                activeTab === tab.key
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-600/30'
                  : 'text-slate-500 hover:text-slate-400 border border-transparent'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-600 text-sm">
              {mediaItems.length === 0
                ? '清单还是空的，添加你喜欢的书影音吧'
                : '没有匹配的结果'}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <MediaForm
            item={editingItem}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false)
              setEditingItem(undefined)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
