import React, { useRef } from 'react'
import { useCollectionStore, useStats } from '@/store/useCollectionStore'
import { DollarSign, Copy, Star, ArrowRightLeft, TrendingUp, Download, Upload, Package, Trash2 } from 'lucide-react'

export default function Stats() {
  const stats = useStats()
  const store = useCollectionStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const json = store.exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `blind-box-backup-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const success = store.importData(text)
      if (!success) {
        alert('导入失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClear = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      useCollectionStore.setState({
        collections: [],
        series: [],
        exchangeRequests: [],
        savedExchanges: [],
      })
    }
  }

  const totalRarity = stats.rarityDistribution.common + stats.rarityDistribution.rare + stats.rarityDistribution.hidden
  const premiumRate = stats.totalSpent > 0
    ? ((stats.totalCurrentValue - stats.totalSpent) / stats.totalSpent * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="card-collectible rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-coral" />
            <span className="text-xs text-amber-light/60 font-semibold">总花费</span>
          </div>
          <p className="text-2xl font-extrabold text-coral">¥{stats.totalSpent.toFixed(0)}</p>
        </div>

        <div className="card-collectible rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package size={18} className="text-amber-primary" />
            <span className="text-xs text-amber-light/60 font-semibold">收藏总数</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-light">{stats.totalCollections}</p>
        </div>

        <div className="card-collectible rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Copy size={18} className="text-amber-primary" />
            <span className="text-xs text-amber-light/60 font-semibold">重复款</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-light">
            {stats.duplicateCount}
            <span className="text-sm text-amber-light/50 ml-1">({stats.duplicateRate.toFixed(1)}%)</span>
          </p>
        </div>

        <div className="card-collectible rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} className="text-gold" />
            <span className="text-xs text-amber-light/60 font-semibold">隐藏款</span>
          </div>
          <p className="text-2xl font-extrabold text-gold">{stats.hiddenCount}</p>
        </div>
      </div>

      <div className="card-collectible rounded-xl p-5">
        <h3 className="text-base font-extrabold text-amber-light mb-4">稀有度分布</h3>
        <div className="space-y-3">
          {[
            { label: '常规', count: stats.rarityDistribution.common, color: 'bg-gray-400', textColor: 'text-gray-400' },
            { label: '稀有', count: stats.rarityDistribution.rare, color: 'bg-blue-400', textColor: 'text-blue-400' },
            { label: '隐藏', count: stats.rarityDistribution.hidden, color: 'bg-gold', textColor: 'text-gold' },
          ].map((item) => {
            const pct = totalRarity > 0 ? (item.count / totalRarity) * 100 : 0
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-amber-light/70">{item.label}</span>
                  <span className={`text-sm font-bold ${item.textColor}`}>
                    {item.count} <span className="text-amber-light/40 text-xs">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="progress-bar-bg h-3 rounded-full">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card-collectible rounded-xl p-5">
        <h3 className="text-base font-extrabold text-amber-light mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-amber-primary" />
          消费分析
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-light/60">平均单价</span>
            <span className="text-sm font-bold text-amber-light">¥{stats.avgPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-light/60">最高单价</span>
            <span className="text-sm font-bold text-amber-light">
              {stats.mostExpensive
                ? `${stats.mostExpensive.characterName} ¥${stats.mostExpensive.purchasePrice}`
                : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-light/60">当前总估值</span>
            <span className="text-sm font-bold text-amber-light">¥{stats.totalCurrentValue.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-light/60">溢价率</span>
            <span className={`text-sm font-bold ${premiumRate >= 0 ? 'text-green-400' : 'text-coral'}`}>
              {premiumRate >= 0 ? '+' : ''}{premiumRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {stats.topWantList.length > 0 && (
        <div className="card-collectible rounded-xl p-5">
          <h3 className="text-base font-extrabold text-amber-light mb-4 flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-amber-primary" />
            最想换清单
          </h3>
          <div className="space-y-2">
            {stats.topWantList.map((item, i) => (
              <div key={i} className="flex items-center justify-between cabinet-shelf rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm font-semibold text-amber-light">{item.characterName}</span>
                  <span className="text-xs text-amber-light/40 ml-2">{item.seriesName}</span>
                </div>
                <span className="text-xs font-bold text-coral">×{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-collectible rounded-xl p-5">
        <h3 className="text-base font-extrabold text-amber-light mb-4">数据管理</h3>
        <div className="space-y-3">
          <button onClick={handleExport} className="btn-primary w-full flex items-center justify-center gap-2">
            <Download size={16} />
            导出备份
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button onClick={handleImport} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Upload size={16} />
            导入恢复
          </button>
          <button
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-2 rounded-full py-2 px-4 font-semibold text-coral border border-coral/30 bg-coral/10 hover:bg-coral/20 transition-all"
          >
            <Trash2 size={16} />
            清空数据
          </button>
        </div>
      </div>
    </div>
  )
}
