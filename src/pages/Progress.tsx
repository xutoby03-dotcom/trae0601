import React from 'react'
import { useSeriesProgress } from '@/store/useCollectionStore'
import { RARITY_CONFIG } from '@/types'
import { CheckCircle, Circle, Trophy, Package, Star } from 'lucide-react'

export default function Progress() {
  const seriesProgress = useSeriesProgress()

  const totalCollected = seriesProgress.reduce((sum, s) => sum + s.collectedCount, 0)
  const totalItems = seriesProgress.reduce((sum, s) => sum + s.totalItems, 0)
  const overallProgress = totalItems > 0 ? (totalCollected / totalItems) * 100 : 0

  if (seriesProgress.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package size={64} className="text-amber-primary/30 mb-4" />
        <h2 className="text-xl font-extrabold text-amber-light mb-2">还没有系列</h2>
        <p className="text-amber-light/50 text-center">添加系列后即可查看收集进度</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="cabinet-shelf rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold text-amber-light">总进度</h2>
          <span className="text-2xl font-extrabold text-gold">{overallProgress.toFixed(1)}%</span>
        </div>
        <div className="progress-bar-bg h-4 rounded-full mb-2">
          <div
            className="progress-bar-fill h-full rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-sm text-amber-light/60">
          已收集 <span className="text-gold font-bold">{totalCollected}</span> / {totalItems} 款
        </p>
      </div>

      {seriesProgress.map((series) => (
        <div key={series.id} className="card-collectible rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-amber-light">{series.name}</h3>
                {series.isComplete && (
                  <Trophy size={20} className="text-gold" />
                )}
              </div>
              {series.description && (
                <p className="text-sm text-amber-light/50 mt-0.5">{series.description}</p>
              )}
            </div>
            {series.isComplete && (
              <span className="text-gold font-extrabold text-sm flex items-center gap-1">
                <Trophy size={16} />
                已集齐!
              </span>
            )}
          </div>

          <div className="progress-bar-bg h-5 rounded-full mb-2">
            <div
              className="progress-bar-fill h-full rounded-full transition-all duration-500"
              style={{ width: `${series.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-amber-primary">{series.progress.toFixed(1)}%</span>
            <span className="text-sm text-amber-light/60">
              已收集 <span className="text-amber-light font-semibold">{series.collectedCount}</span> / {series.totalItems} 款
              {series.missingCount > 0 && (
                <span className="text-coral/70 ml-2">缺 {series.missingCount} 款</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
              <span className="text-xs text-amber-light/60">常规 {series.rarityBreakdown.common}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
              <span className="text-xs text-amber-light/60">稀有 {series.rarityBreakdown.rare}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
              <span className="text-xs text-amber-light/60">隐藏 {series.rarityBreakdown.hidden}</span>
            </div>
          </div>

          {series.collections.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {series.collections.map((c) => (
                <span
                  key={c.id}
                  className={`text-xs px-2 py-0.5 rounded-md font-semibold badge-rarity-${c.rarity}`}
                >
                  {c.characterName}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
