import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollectionStore, useSeriesWithCollections, useDuplicateCounts } from '@/store/useCollectionStore'
import { RARITY_CONFIG } from '@/types'
import type { Collection, Rarity } from '@/types'
import { Star, Copy, ArrowRightLeft, Filter, Package, ChevronDown, ChevronUp } from 'lucide-react'

function CollectionCard({ collection, duplicateCount }: { collection: Collection; duplicateCount: number }) {
  const navigate = useNavigate()
  const rarityConfig = RARITY_CONFIG[collection.rarity]
  const isDuplicate = duplicateCount > 1

  return (
    <div
      onClick={() => navigate(`/detail/${collection.id}`)}
      className="card-collectible rounded-2xl overflow-hidden cursor-pointer relative group"
    >
      {isDuplicate && (
        <div className="absolute top-2 right-2 z-10 badge-duplicate text-xs font-bold px-2 py-0.5 rounded-full">
          ×{duplicateCount}
        </div>
      )}
      {collection.willingToExchange && (
        <div className="absolute top-2 left-2 z-10 badge-exchangeable text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <ArrowRightLeft size={10} />
          可换
        </div>
      )}
      <div className="aspect-square bg-cabinet-wood relative overflow-hidden">
        {collection.photo ? (
          <img
            src={collection.photo}
            alt={collection.characterName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-amber-primary/20" />
          </div>
        )}
        {collection.rarity === 'hidden' && (
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-amber-light truncate">{collection.characterName}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold badge-rarity-${collection.rarity}`}>
            {rarityConfig.label}
          </span>
          {collection.currentValue > 0 && (
            <span className="text-xs text-gold font-semibold">
              ¥{collection.currentValue}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

type FilterType = 'all' | Rarity | 'duplicate' | 'exchangeable'

export default function Home() {
  const seriesWithCollections = useSeriesWithCollections()
  const duplicateCounts = useDuplicateCounts()
  const collections = useCollectionStore((s) => s.collections)
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set())

  const toggleSeries = (id: string) => {
    setExpandedSeries((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filterChips: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'common', label: '常规' },
    { key: 'rare', label: '稀有' },
    { key: 'hidden', label: '隐藏' },
    { key: 'duplicate', label: '重复款' },
    { key: 'exchangeable', label: '可交换' },
  ]

  const filterCollections = (items: Collection[]) => {
    return items.filter((c) => {
      if (filter === 'all') return true
      if (filter === 'duplicate') return c.isDuplicate
      if (filter === 'exchangeable') return c.willingToExchange
      return c.rarity === filter
    })
  }

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-6 animate-float">🧸</div>
        <h2 className="text-2xl font-extrabold text-amber-primary mb-2">空空如也</h2>
        <p className="text-amber-light/50 mb-8 text-center">你的展示柜还是空的，快去添加第一个盲盒吧！</p>
        <a href="/add" className="btn-primary text-base py-3 px-8">开始收藏</a>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
        <Filter size={16} className="text-amber-primary/50 flex-shrink-0" />
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              filter === chip.key
                ? 'bg-amber-primary text-cabinet-bg'
                : 'bg-amber-primary/10 text-amber-primary/70 hover:bg-amber-primary/20'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {seriesWithCollections.map((series) => {
          const filtered = filterCollections(series.collections)
          if (filter !== 'all' && filtered.length === 0) return null

          const isExpanded = expandedSeries.has(series.id)

          return (
            <div key={series.id}>
              <div
                className="cabinet-shelf rounded-xl px-4 py-3 mb-3 cursor-pointer flex items-center justify-between"
                onClick={() => toggleSeries(series.id)}
              >
                <div className="flex items-center gap-3">
                  <h2 className="font-extrabold text-amber-light text-lg">{series.name}</h2>
                  <span className="text-xs text-amber-light/50 font-semibold">
                    {series.collectedCount}/{series.totalItems}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 progress-bar-bg h-2 hidden sm:block">
                    <div
                      className="progress-bar-fill h-full"
                      style={{ width: `${Math.min((series.collectedCount / series.totalItems) * 100, 100)}%` }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-amber-primary/50" />
                  ) : (
                    <ChevronDown size={18} className="text-amber-primary/50" />
                  )}
                </div>
              </div>

              <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 transition-all duration-300 ${
                isExpanded ? 'hidden' : ''
              }`}>
                {filtered.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    duplicateCount={duplicateCounts[`${collection.seriesId}-${collection.characterName}`] || 1}
                  />
                ))}
              </div>

              {filtered.length === 0 && filter === 'all' && (
                <div className="text-center py-6 text-amber-light/30 text-sm">
                  这个系列还没有收藏
                </div>
              )}
            </div>
          )
        })}

        {seriesWithCollections.length === 0 && collections.length > 0 && (
          <div>
            <div className="cabinet-shelf rounded-xl px-4 py-3 mb-3">
              <h2 className="font-extrabold text-amber-light text-lg">未分类</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filterCollections(collections.filter((c) => !c.seriesId)).map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  duplicateCount={duplicateCounts[`${collection.seriesId}-${collection.characterName}`] || 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
