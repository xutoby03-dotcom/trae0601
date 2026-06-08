import React, { useState } from 'react'
import { useCollectionStore, useExchangeMatches } from '@/store/useCollectionStore'
import { RARITY_CONFIG } from '@/types'
import type { Rarity } from '@/types'
import { Plus, Heart, HeartOff, Search, ArrowRightLeft, Star, X, Package, Sparkles } from 'lucide-react'

type TabKey = 'publish' | 'marketplace' | 'matches'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'publish', label: '发布需求', icon: <Plus size={16} /> },
  { key: 'marketplace', label: '需求广场', icon: <Search size={16} /> },
  { key: 'matches', label: '匹配提示', icon: <Star size={16} /> },
]

function PublishTab() {
  const collections = useCollectionStore((s) => s.collections)
  const series = useCollectionStore((s) => s.series)
  const addExchangeRequest = useCollectionStore((s) => s.addExchangeRequest)

  const exchangeableCollections = collections.filter((c) => c.willingToExchange)

  const [selectedCollectionId, setSelectedCollectionId] = useState('')
  const [haveSeriesName, setHaveSeriesName] = useState('')
  const [haveCharacterName, setHaveCharacterName] = useState('')
  const [haveRarity, setHaveRarity] = useState<Rarity>('common')
  const [havePhoto, setHavePhoto] = useState('')
  const [wantSeriesName, setWantSeriesName] = useState('')
  const [wantCharacterName, setWantCharacterName] = useState('')
  const [maxPriceDifference, setMaxPriceDifference] = useState(0)
  const [notes, setNotes] = useState('')

  const handleSelectCollection = (id: string) => {
    setSelectedCollectionId(id)
    if (!id) {
      setHaveSeriesName('')
      setHaveCharacterName('')
      setHaveRarity('common')
      setHavePhoto('')
      return
    }
    const col = collections.find((c) => c.id === id)
    if (col) {
      const s = series.find((s) => s.id === col.seriesId)
      setHaveSeriesName(s?.name || '')
      setHaveCharacterName(col.characterName)
      setHaveRarity(col.rarity)
      setHavePhoto(col.photo)
    }
  }

  const handleSubmit = () => {
    if (!haveSeriesName || !haveCharacterName || !wantSeriesName || !wantCharacterName) return
    addExchangeRequest({
      haveCollectionId: selectedCollectionId,
      haveSeriesName,
      haveCharacterName,
      haveRarity,
      havePhoto,
      wantSeriesName,
      wantCharacterName,
      maxPriceDifference,
      notes,
      isActive: true,
    })
    setSelectedCollectionId('')
    setHaveSeriesName('')
    setHaveCharacterName('')
    setHaveRarity('common')
    setHavePhoto('')
    setWantSeriesName('')
    setWantCharacterName('')
    setMaxPriceDifference(0)
    setNotes('')
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-amber-primary mb-2">从收藏中选择</label>
        <select
          value={selectedCollectionId}
          onChange={(e) => handleSelectCollection(e.target.value)}
          className="input-field w-full"
        >
          <option value="">手动输入或选择收藏...</option>
          {exchangeableCollections.map((c) => {
            const s = series.find((s) => s.id === c.seriesId)
            return (
              <option key={c.id} value={c.id}>
                {s?.name || '未知系列'} - {c.characterName}
              </option>
            )
          })}
        </select>
      </div>

      <div className="cabinet-shelf rounded-xl p-4 space-y-3">
        <h3 className="font-extrabold text-amber-light flex items-center gap-2">
          <Package size={16} /> 我有的
        </h3>
        <input
          type="text"
          placeholder="系列名称"
          value={haveSeriesName}
          onChange={(e) => setHaveSeriesName(e.target.value)}
          className="input-field w-full"
        />
        <input
          type="text"
          placeholder="角色名称"
          value={haveCharacterName}
          onChange={(e) => setHaveCharacterName(e.target.value)}
          className="input-field w-full"
        />
        <select
          value={haveRarity}
          onChange={(e) => setHaveRarity(e.target.value as Rarity)}
          className="input-field w-full"
        >
          {(Object.keys(RARITY_CONFIG) as Rarity[]).map((key) => (
            <option key={key} value={key}>{RARITY_CONFIG[key].label}</option>
          ))}
        </select>
      </div>

      <div className="cabinet-shelf rounded-xl p-4 space-y-3">
        <h3 className="font-extrabold text-amber-light flex items-center gap-2">
          <Sparkles size={16} /> 我想要的
        </h3>
        <input
          type="text"
          placeholder="系列名称"
          value={wantSeriesName}
          onChange={(e) => setWantSeriesName(e.target.value)}
          className="input-field w-full"
        />
        <input
          type="text"
          placeholder="角色名称"
          value={wantCharacterName}
          onChange={(e) => setWantCharacterName(e.target.value)}
          className="input-field w-full"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-bold text-amber-primary">补差价上限</label>
        <div className="flex items-center gap-3">
          <span className="text-amber-light/50 text-sm">≤¥</span>
          <input
            type="number"
            value={maxPriceDifference}
            onChange={(e) => setMaxPriceDifference(Number(e.target.value))}
            className="input-field flex-1"
            placeholder="0"
          />
        </div>
        <p className="text-amber-light/40 text-xs">负数表示愿意接受对方价值更高的物品</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-amber-primary">备注（选填）</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="其他说明..."
          className="input-field w-full resize-none"
          rows={3}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!haveSeriesName || !haveCharacterName || !wantSeriesName || !wantCharacterName}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus size={18} /> 发布交换需求
      </button>
    </div>
  )
}

function MarketplaceTab() {
  const exchangeRequests = useCollectionStore((s) => s.exchangeRequests)
  const savedExchanges = useCollectionStore((s) => s.savedExchanges)
  const addSavedExchange = useCollectionStore((s) => s.addSavedExchange)
  const removeSavedExchange = useCollectionStore((s) => s.removeSavedExchange)

  const [searchQuery, setSearchQuery] = useState('')

  const activeRequests = exchangeRequests.filter((r) => r.isActive)

  const filtered = searchQuery
    ? activeRequests.filter(
        (r) =>
          r.haveSeriesName.includes(searchQuery) ||
          r.wantSeriesName.includes(searchQuery) ||
          r.haveCharacterName.includes(searchQuery) ||
          r.wantCharacterName.includes(searchQuery)
      )
    : activeRequests

  const isSaved = (requestId: string) =>
    savedExchanges.some((s) => s.exchangeRequestId === requestId)

  const toggleSave = (requestId: string) => {
    if (isSaved(requestId)) {
      removeSavedExchange(requestId)
    } else {
      addSavedExchange({ exchangeRequestId: requestId })
    }
  }

  if (activeRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ArrowRightLeft size={48} className="text-amber-primary/20 mb-4" />
        <p className="text-amber-light/40 text-center">还没有交换需求</p>
        <p className="text-amber-light/30 text-sm mt-1">去发布需求吧！</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-light/40" />
        <input
          type="text"
          placeholder="搜索系列或角色..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-light/40 hover:text-amber-primary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((req) => {
          const rarityCfg = RARITY_CONFIG[req.haveRarity]
          const saved = isSaved(req.id)

          return (
            <div key={req.id} className="card-collectible rounded-xl p-4">
              <div className="flex gap-3">
                {req.havePhoto ? (
                  <img
                    src={req.havePhoto}
                    alt={req.haveCharacterName}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-amber-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package size={24} className="text-amber-primary/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-amber-light font-bold text-sm truncate">
                        我有 <span className="text-amber-primary">{req.haveCharacterName}</span>
                        <span className="text-amber-light/40 text-xs ml-1">({req.haveSeriesName})</span>
                      </p>
                      <p className="text-amber-light font-bold text-sm truncate mt-0.5">
                        想换 <span className="text-amber-primary">{req.wantCharacterName}</span>
                        <span className="text-amber-light/40 text-xs ml-1">({req.wantSeriesName})</span>
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSave(req.id)}
                      className="flex-shrink-0 p-1.5 rounded-full hover:bg-amber-primary/10 transition-colors"
                    >
                      {saved ? (
                        <Heart size={18} className="text-red-400 fill-red-400" />
                      ) : (
                        <HeartOff size={18} className="text-amber-light/30" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`badge-rarity-${req.haveRarity} text-xs font-semibold px-2 py-0.5 rounded-full`}>
                      {rarityCfg.label}
                    </span>
                    {req.maxPriceDifference !== 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-primary/10 text-amber-primary border border-amber-primary/20">
                        补差价 ≤¥{Math.abs(req.maxPriceDifference)}
                      </span>
                    )}
                  </div>
                  {req.notes && (
                    <p className="text-amber-light/40 text-xs mt-2 line-clamp-2">{req.notes}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && searchQuery && (
          <div className="text-center py-8 text-amber-light/30 text-sm">
            没有找到匹配的需求
          </div>
        )}
      </div>
    </div>
  )
}

function MatchesTab() {
  const matches = useExchangeMatches()

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Star size={48} className="text-amber-primary/20 mb-4" />
        <p className="text-amber-light/40 text-center">暂无匹配</p>
        <p className="text-amber-light/30 text-sm mt-1">发布更多需求增加匹配机会</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div
          key={`${match.myRequest.id}-${match.matchedRequest.id}`}
          className="card-collectible match-glow rounded-xl p-4 border border-amber-primary/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="font-extrabold text-yellow-400 text-sm">匹配成功！</span>
          </div>
          <div className="space-y-3">
            <div className="bg-amber-primary/5 rounded-lg p-3">
              <p className="text-xs text-amber-light/40 mb-1">我的需求</p>
              <p className="text-sm font-bold text-amber-light">
                我有 <span className="text-amber-primary">{match.myRequest.haveCharacterName}</span>
                <span className="text-amber-light/40 text-xs ml-1">({match.myRequest.haveSeriesName})</span>
                {' → '}
                想换 <span className="text-amber-primary">{match.myRequest.wantCharacterName}</span>
                <span className="text-amber-light/40 text-xs ml-1">({match.myRequest.wantSeriesName})</span>
              </p>
            </div>
            <div className="flex justify-center">
              <ArrowRightLeft size={16} className="text-amber-primary/40" />
            </div>
            <div className="bg-amber-primary/5 rounded-lg p-3">
              <p className="text-xs text-amber-light/40 mb-1">对方需求</p>
              <p className="text-sm font-bold text-amber-light">
                对方有 <span className="text-amber-primary">{match.matchedRequest.haveCharacterName}</span>
                <span className="text-amber-light/40 text-xs ml-1">({match.matchedRequest.haveSeriesName})</span>
                {' → '}
                想换 <span className="text-amber-primary">{match.matchedRequest.wantCharacterName}</span>
                <span className="text-amber-light/40 text-xs ml-1">({match.matchedRequest.wantSeriesName})</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Exchange() {
  const [activeTab, setActiveTab] = useState<TabKey>('publish')

  return (
    <div className="space-y-5">
      <div className="flex gap-1 p-1 bg-amber-primary/5 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-amber-primary/15 text-amber-primary shadow-sm'
                : 'text-amber-light/40 hover:text-amber-light/60'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'publish' && <PublishTab />}
      {activeTab === 'marketplace' && <MarketplaceTab />}
      {activeTab === 'matches' && <MatchesTab />}
    </div>
  )
}
