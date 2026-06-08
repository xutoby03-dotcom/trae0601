import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Smartphone, Tv, Shirt, BookOpen, Lamp, MoreHorizontal, Package, RotateCcw } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Category, Condition, Item } from '@/types'
import { cn } from '@/lib/utils'

const categories: { label: Category; icon: React.ElementType }[] = [
  { label: '数码', icon: Smartphone },
  { label: '家电', icon: Tv },
  { label: '服装', icon: Shirt },
  { label: '书籍', icon: BookOpen },
  { label: '家居', icon: Lamp },
  { label: '其他', icon: MoreHorizontal },
]

const conditions: Condition[] = ['全新', '9成新', '8成新', '7成新', '6成新及以下']

function ItemCard({ item }: { item: Item }) {
  const isSold = item.status === 'sold'

  return (
    <Link to={`/item/${item.id}`} className="block">
      <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
        {item.freeShipping && (
          <span className="absolute top-0 right-0 bg-brand-500 text-white text-xs px-2 py-0.5 rounded-bl-lg z-10">
           包邮
          </span>
        )}
        <div className="h-48 bg-gradient-to-br from-carbon-50 to-carbon-100 flex items-center justify-center overflow-hidden">
          {item.photos && item.photos.length > 0 ? (
            <img src={item.photos[0]} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-12 h-12 text-carbon-300" />
          )}
        </div>
        <div className="p-4">
          <p className="font-medium text-carbon-700 truncate">{item.name}</p>
          <p className="text-brand-500 font-bold text-lg mt-1">¥{item.currentPrice}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-mint/10 text-mint text-xs px-2 py-0.5 rounded-full">
              {item.condition}
            </span>
            <span className="bg-brand-50 text-brand-600 text-xs px-2 py-0.5 rounded-full">
              {item.category}
            </span>
          </div>
        </div>
        {isSold && (
          <div className="absolute inset-0 bg-carbon-700/50 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">已售</span>
          </div>
        )}
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-carbon-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-carbon-100 rounded w-3/4" />
        <div className="h-6 bg-carbon-100 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-5 w-14 bg-carbon-100 rounded-full" />
          <div className="h-5 w-14 bg-carbon-100 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function Marketplace() {
  const { items, filters, loading, setFilters, resetFilters, fetchItems } = useStore()

  useEffect(() => {
    fetchItems()
  }, [filters, fetchItems])

  return (
    <div className="flex gap-6 p-6 h-full">
      <aside className="w-64 shrink-0 h-[calc(100vh-3rem)] overflow-y-auto space-y-6 pr-4">
        <section>
          <h3 className="text-sm font-semibold text-carbon-500 mb-3">分类</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setFilters({ category: filters.category === label ? undefined : label })}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition',
                  filters.category === label
                    ? 'bg-brand-500 text-white'
                    : 'bg-white text-carbon-500 hover:bg-brand-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-carbon-500 mb-3">价格区间</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-carbon-300 text-sm">¥</span>
              <input
                type="number"
                placeholder="最低"
                value={filters.minPrice ?? ''}
                onChange={(e) => setFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-carbon-200 rounded-lg focus:border-brand-500 focus:outline-none transition"
              />
            </div>
            <span className="text-carbon-300">-</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-carbon-300 text-sm">¥</span>
              <input
                type="number"
                placeholder="最高"
                value={filters.maxPrice ?? ''}
                onChange={(e) => setFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-carbon-200 rounded-lg focus:border-brand-500 focus:outline-none transition"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-carbon-500 mb-3">成色</h3>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <button
                key={c}
                onClick={() => setFilters({ condition: filters.condition === c ? undefined : c })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition',
                  filters.condition === c
                    ? 'bg-brand-500 text-white'
                    : 'bg-white text-carbon-500 hover:bg-brand-50'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-carbon-500 mb-3">包邮</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.freeShipping ?? false}
              onChange={(e) => setFilters({ freeShipping: e.target.checked || undefined })}
              className="w-4 h-4 rounded border-carbon-300 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-sm text-carbon-600">仅看包邮</span>
          </label>
        </section>

        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 text-sm text-carbon-400 hover:text-brand-500 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置筛选
        </button>
      </aside>

      <main className="flex-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-carbon-300">
            <Package className="w-16 h-16 mb-4" />
            <p className="text-lg">暂无商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
