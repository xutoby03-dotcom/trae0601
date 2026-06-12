import { useState } from 'react'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import type { Clothing, Category, Season, Occasion } from '@/types'
import { CATEGORY_LABELS, SEASON_LABELS, OCCASION_LABELS } from '@/types'
import { useWardrobeStore } from '@/store/wardrobeStore'
import ClothingCard from '@/components/ClothingCard'
import AddClothingModal from '@/components/AddClothingModal'

type CategoryFilter = 'all' | Category
type SeasonFilter = 'all' | Season
type OccasionFilter = 'all' | Occasion

const CATEGORIES: CategoryFilter[] = ['all', ...Object.keys(CATEGORY_LABELS) as Category[]]
const SEASONS: SeasonFilter[] = ['all', ...Object.keys(SEASON_LABELS) as Season[]]
const OCCASIONS: OccasionFilter[] = ['all', ...Object.keys(OCCASION_LABELS) as Occasion[]]

export default function Wardrobe() {
  const { clothing, addClothing, updateClothing, deleteClothing } = useWardrobeStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('all')
  const [occasionFilter, setOccasionFilter] = useState<OccasionFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [modalItem, setModalItem] = useState<Clothing | null | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)

  const filtered = clothing.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    if (seasonFilter !== 'all' && !item.seasons.includes(seasonFilter as Season)) return false
    if (occasionFilter !== 'all' && !item.occasions.includes(occasionFilter as Occasion)) return false
    return true
  })

  const handleAdd = () => {
    setModalItem(null)
    setShowModal(true)
  }

  const handleEdit = (item: Clothing) => {
    setModalItem(item)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这件衣物吗？')) {
      deleteClothing(id)
    }
  }

  const handleSave = (item: Clothing) => {
    if (modalItem) {
      updateClothing(item.id, item)
    } else {
      addClothing(item)
    }
    setShowModal(false)
    setModalItem(undefined)
  }

  const handleClose = () => {
    setShowModal(false)
    setModalItem(undefined)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">我的衣橱</h1>
          <p className="text-sm text-charcoal/50 mt-1">共 {clothing.length} 件衣物</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-warm-500 text-white rounded-xl shadow-md shadow-warm-500/25 px-5 py-2.5 text-sm font-medium hover:bg-warm-600 transition-colors"
        >
          <Plus size={16} />
          添加衣物
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索衣物..."
              className="w-full pl-10 pr-4 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:border-warm-500 focus:ring-1 focus:ring-warm-500/20 placeholder:text-charcoal/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition-colors ${showFilters ? 'bg-warm-500 text-white' : 'bg-warm-50 border border-warm-200 text-charcoal/50 hover:text-charcoal/70'}`}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {showFilters && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    categoryFilter === c
                      ? 'bg-warm-500 text-white'
                      : 'bg-warm-100 text-charcoal/70 hover:bg-warm-200'
                  }`}
                >
                  {c === 'all' ? '全部' : CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeasonFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    seasonFilter === s
                      ? 'bg-warm-500 text-white'
                      : 'bg-warm-100 text-charcoal/70 hover:bg-warm-200'
                  }`}
                >
                  {s === 'all' ? '全部季节' : SEASON_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOccasionFilter(o)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    occasionFilter === o
                      ? 'bg-warm-500 text-white'
                      : 'bg-warm-100 text-charcoal/70 hover:bg-warm-200'
                  }`}
                >
                  {o === 'all' ? '全部场合' : OCCASION_LABELS[o]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-charcoal/30">
          <p className="text-lg font-display">衣橱空空如也</p>
          <p className="text-sm mt-1">点击「添加衣物」开始整理你的衣橱</p>
        </div>
      )}

      {showModal && (
        <AddClothingModal
          editingItem={modalItem}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
