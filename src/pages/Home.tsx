import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetStore } from '@/store/usePetStore'
import type { PetType, PetStatus } from '@/types'
import { STATUS_LABELS, TYPE_LABELS } from '@/types'
import { Plus, Map, LayoutGrid, Download, Upload, Search, PawPrint } from 'lucide-react'
import { cn } from '@/lib/utils'
import MapView from '@/components/MapView'
import PetCard from '@/components/PetCard'

export default function Home() {
  const navigate = useNavigate()
  const { posts, exportData, importData } = usePetStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map')
  const [statusFilter, setStatusFilter] = useState<PetStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<PetType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = posts.filter((post) => {
    if (statusFilter !== 'all' && post.status !== statusFilter) return false
    if (typeFilter !== 'all' && post.type !== typeFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        post.name.toLowerCase().includes(q) ||
        post.breed.toLowerCase().includes(q) ||
        post.furColor.toLowerCase().includes(q) ||
        post.locationDesc.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ok = await importData(file)
    alert(ok ? '导入成功' : '导入失败，请检查文件格式')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePostClick = (id: string) => {
    navigate(`/post/${id}`)
  }

  const statusOptions: (PetStatus | 'all')[] = ['all', 'searching', 'clue', 'reunited']
  const typeOptions: (PetType | 'all')[] = ['all', 'lost', 'found']

  const renderCards = (cols: string) => {
    if (filteredPosts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <PawPrint className="w-12 h-12 mb-3" />
          <p className="text-sm mb-4">还没有信息，快来发布第一条吧</p>
          <button
            onClick={() => navigate('/create')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
          >
            去发布
          </button>
        </div>
      )
    }
    return (
      <div className={cn('grid gap-3', cols)}>
        {filteredPosts.map((post) => (
          <PetCard key={post.id} post={post} onClick={() => handlePostClick(post.id)} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-stone-200 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-lg text-stone-800">宠物互助墙</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
              title="导入数据"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <button
              onClick={() => exportData()}
              className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
              title="导出数据"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/create')}
              className="hidden md:flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition ml-1"
            >
              <Plus className="w-4 h-4" />
              发布
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition',
                statusFilter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {status === 'all' ? '全部' : STATUS_LABELS[status]}
            </button>
          ))}
          <div className="w-px h-5 bg-stone-300 mx-1" />
          {typeOptions.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition',
                typeFilter === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {type === 'all' ? '全部' : TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="搜索宠物名称、品种、毛色、地点..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
          />
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto px-4 pb-2">
        <div className="flex bg-stone-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-sm font-medium transition',
              viewMode === 'map' ? 'bg-white shadow text-stone-900' : 'text-stone-500'
            )}
          >
            <Map className="w-4 h-4" />
            地图
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-sm font-medium transition',
              viewMode === 'cards' ? 'bg-white shadow text-stone-900' : 'text-stone-500'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            列表
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20 md:pb-4">
        <div className="hidden md:flex gap-4">
          <div className="w-[60%] h-[calc(100vh-180px)] rounded-xl overflow-hidden border border-stone-200">
            <MapView posts={filteredPosts} onPostClick={handlePostClick} />
          </div>
          <div className="w-[40%] max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {renderCards('grid-cols-2')}
          </div>
        </div>

        <div className="md:hidden">
          {viewMode === 'map' ? (
            <div className="h-[calc(100vh-280px)] rounded-xl overflow-hidden border border-stone-200">
              <MapView posts={filteredPosts} onPostClick={handlePostClick} />
            </div>
          ) : (
            <div className="pb-24">
              {renderCards('grid-cols-1')}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate('/create')}
        className="fixed bottom-6 right-6 bg-orange-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg md:hidden hover:bg-orange-600 transition active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
