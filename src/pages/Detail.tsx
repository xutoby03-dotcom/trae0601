import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCollectionStore } from '@/store/useCollectionStore'
import { RARITY_CONFIG } from '@/types'
import { ArrowLeft, Edit3, Trash2, Calendar, Tag, DollarSign, ArrowRightLeft, FileText, TrendingUp, Package } from 'lucide-react'

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const collections = useCollectionStore((s) => s.collections)
  const series = useCollectionStore((s) => s.series)
  const deleteCollection = useCollectionStore((s) => s.deleteCollection)
  const exchangeRequests = useCollectionStore((s) => s.exchangeRequests)

  const collection = collections.find((c) => c.id === id)

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package size={64} className="text-amber-primary/20 mb-4" />
        <h2 className="text-xl font-bold text-amber-light mb-2">未找到</h2>
        <p className="text-amber-light/50 mb-6">该收藏品不存在或已被删除</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          返回首页
        </button>
      </div>
    )
  }

  const seriesData = series.find((s) => s.id === collection.seriesId)
  const rarityConfig = RARITY_CONFIG[collection.rarity]
  const relatedExchanges = exchangeRequests.filter(
    (r) => r.haveCollectionId === collection.id
  )

  const premiumRate =
    collection.purchasePrice > 0
      ? ((collection.currentValue - collection.purchasePrice) / collection.purchasePrice) * 100
      : 0

  const handleDelete = () => {
    if (window.confirm('确定要删除这个收藏品吗？删除后无法恢复。')) {
      deleteCollection(collection.id)
      navigate('/')
    }
  }

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-amber-primary hover:text-amber-light transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-semibold">返回</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/edit/${collection.id}`)}
            className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
          >
            <Edit3 size={14} />
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500/10 text-red-400 border border-red-500/30 rounded-full py-1.5 px-3 text-sm font-semibold flex items-center gap-1 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      </div>

      <div className="card-collectible rounded-2xl overflow-hidden mb-6">
        <div className="aspect-[4/3] bg-cabinet-wood relative overflow-hidden">
          {collection.photo ? (
            <img
              src={collection.photo}
              alt={collection.characterName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={80} className="text-amber-primary/20" />
            </div>
          )}
          {collection.rarity === 'hidden' && (
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          )}
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-amber-light mb-2">
          {collection.characterName}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {seriesData && (
            <span className="text-sm text-amber-light/60 font-semibold">
              {seriesData.name}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-md font-semibold badge-rarity-${collection.rarity}`}>
            {rarityConfig.label}
          </span>
          {collection.isDuplicate && (
            <span className="badge-duplicate text-xs font-bold px-2 py-0.5 rounded-full">
              重复款
            </span>
          )}
          {collection.willingToExchange && (
            <span className="badge-exchangeable text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowRightLeft size={10} />
              可交换
            </span>
          )}
        </div>
      </div>

      <div className="card-collectible rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-bold text-amber-primary mb-3 flex items-center gap-1.5">
          <DollarSign size={14} />
          入手记录
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-primary mt-1.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-amber-light/50 mb-0.5">入手价格</div>
              <div className="text-amber-light font-bold">¥{collection.purchasePrice}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-primary mt-1.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-amber-light/50 mb-0.5">入手日期</div>
              <div className="text-amber-light font-bold flex items-center gap-1">
                <Calendar size={12} className="text-amber-primary/50" />
                {collection.purchaseDate}
              </div>
            </div>
          </div>
          {collection.purchaseChannel && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-primary mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-amber-light/50 mb-0.5">入手渠道</div>
                <div className="text-amber-light font-bold flex items-center gap-1">
                  <Tag size={12} className="text-amber-primary/50" />
                  {collection.purchaseChannel}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {collection.currentValue > 0 && (
        <div className="card-collectible rounded-2xl p-4 mb-4">
          <h2 className="text-sm font-bold text-amber-primary mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} />
            估值信息
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-light/50 mb-0.5">当前估值</div>
              <div className="text-xl font-extrabold text-gold">¥{collection.currentValue}</div>
            </div>
            {collection.purchasePrice > 0 && (
              <div className="text-right">
                <div className="text-xs text-amber-light/50 mb-0.5">溢价率</div>
                <div
                  className={`text-lg font-extrabold ${
                    premiumRate >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {premiumRate >= 0 ? '+' : ''}
                  {premiumRate.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
          {collection.purchasePrice > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-primary/10 flex items-center justify-between text-xs text-amber-light/50">
              <span>入手价 ¥{collection.purchasePrice}</span>
              <span>
                {premiumRate >= 0 ? '升值' : '贬值'} ¥
                {Math.abs(collection.currentValue - collection.purchasePrice).toFixed(0)}
              </span>
            </div>
          )}
        </div>
      )}

      {collection.willingToExchange && (
        <div className="card-collectible rounded-2xl p-4 mb-4">
          <h2 className="text-sm font-bold text-amber-primary mb-3 flex items-center gap-1.5">
            <ArrowRightLeft size={14} />
            交换意愿
          </h2>
          {relatedExchanges.length > 0 ? (
            <div className="space-y-3">
              {relatedExchanges.map((req) => (
                <div
                  key={req.id}
                  className="bg-amber-primary/5 rounded-xl p-3 border border-amber-primary/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-amber-light">
                      想换：{req.wantCharacterName}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        req.isActive
                          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                          : 'bg-amber-light/10 text-amber-light/40 border border-amber-light/10'
                      }`}
                    >
                      {req.isActive ? '进行中' : '已结束'}
                    </span>
                  </div>
                  <div className="text-xs text-amber-light/50">
                    来自：{req.wantSeriesName}
                  </div>
                  {req.maxPriceDifference > 0 && (
                    <div className="text-xs text-amber-light/50 mt-1">
                      最大差价：¥{req.maxPriceDifference}
                    </div>
                  )}
                  {req.notes && (
                    <div className="text-xs text-amber-light/40 mt-1 italic">
                      {req.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-amber-light/40">
              暂无交换请求
            </div>
          )}
        </div>
      )}

      {collection.notes && (
        <div className="card-collectible rounded-2xl p-4 mb-4">
          <h2 className="text-sm font-bold text-amber-primary mb-3 flex items-center gap-1.5">
            <FileText size={14} />
            备注
          </h2>
          <p className="text-sm text-amber-light/70 whitespace-pre-wrap leading-relaxed">
            {collection.notes}
          </p>
        </div>
      )}
    </div>
  )
}
