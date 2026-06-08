import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Package, TrendingDown, MessageSquare, Tag, Calendar, Star,
  Check, X, AlertCircle, Trash2, ShoppingCart, ChevronDown
} from 'lucide-react'

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const itemId = Number(id)

  const {
    currentItem, priceRecords, bargains, loading,
    fetchItem, fetchPriceRecords, fetchBargains,
    updateItemPrice, markAsSold, deleteItem,
    submitBargain, handleBargain
  } = useStore()

  const [priceModalOpen, setPriceModalOpen] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const [priceReason, setPriceReason] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [sellerNotes, setSellerNotes] = useState<Record<number, string>>({})

  useEffect(() => {
    if (itemId) {
      fetchItem(itemId)
      fetchPriceRecords(itemId)
      fetchBargains(itemId)
    }
  }, [itemId])

  useEffect(() => {
    if (currentItem) {
      setNewPrice(String(currentItem.currentPrice))
    }
  }, [currentItem])

  if (loading && !currentItem) {
    return <div className="flex items-center justify-center h-screen text-carbon-400">加载中...</div>
  }

  if (!currentItem) {
    return <div className="flex items-center justify-center h-screen text-carbon-400">物品不存在</div>
  }

  const discount = currentItem.originalPrice > 0
    ? Math.round((1 - currentItem.currentPrice / currentItem.originalPrice) * 100)
    : 0

  const chartData = priceRecords.map((r) => ({
    date: new Date(r.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    price: r.price,
  }))

  const handlePriceSubmit = async () => {
    const price = Number(newPrice)
    if (!price || price <= 0) return
    await updateItemPrice(itemId, price, priceReason)
    setPriceModalOpen(false)
    setPriceReason('')
  }

  const handleMarkSold = async () => {
    if (!confirm('确定标记为已售？')) return
    await markAsSold(itemId)
  }

  const handleDelete = async () => {
    if (!confirm('确定删除此物品？删除后不可恢复。')) return
    await deleteItem(itemId)
    navigate('/')
  }

  const handleSubmitOffer = async () => {
    const price = Number(offerPrice)
    if (!price || price <= 0) return
    await submitBargain(itemId, price, offerMessage)
    setOfferPrice('')
    setOfferMessage('')
  }

  const handleBargainAction = async (bargainId: number, status: 'accepted' | 'rejected') => {
    const note = sellerNotes[bargainId] || ''
    await handleBargain(bargainId, status, note)
  }

  const infoItems = [
    { icon: Calendar, label: '购买时间', value: currentItem.purchaseDate },
    { icon: Star, label: '成色', value: currentItem.condition },
    { icon: ShoppingCart, label: '配件', value: currentItem.accessoriesComplete ? '齐全' : '不齐全' },
    { icon: Tag, label: '分类', value: currentItem.category },
    { icon: ChevronDown, label: '邮费', value: currentItem.freeShipping ? '包邮' : '不包邮' },
  ]

  const statusBadge = currentItem.status === 'selling'
    ? <span className="bg-mint/10 text-mint px-3 py-1 rounded-full text-sm">在售</span>
    : <span className="bg-carbon-200 text-carbon-500 px-3 py-1 rounded-full text-sm">已售</span>

  const bargainStatusMap: Record<string, { text: string; className: string }> = {
    pending: { text: '待处理', className: 'bg-gold/20 text-gold' },
    accepted: { text: '已接受', className: 'bg-mint/20 text-mint' },
    rejected: { text: '已拒绝', className: 'bg-red-100 text-red-500' },
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Top Section - Item Info */}
      <div className="flex gap-8 bg-white rounded-2xl p-6 shadow-sm">
        {/* Left - Photo */}
        <div className="w-96 h-80 bg-carbon-50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
          {currentItem.photos && currentItem.photos.length > 0 ? (
            <img src={currentItem.photos[0]} alt={currentItem.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <Package className="w-20 h-20 text-carbon-200" />
          )}
        </div>

        {/* Right - Details */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-carbon-700">{currentItem.name}</h1>
            {currentItem.brand && (
              <span className="bg-carbon-100 text-carbon-500 px-3 py-1 rounded-full text-sm">{currentItem.brand}</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-3xl font-bold text-brand-500">¥{currentItem.currentPrice}</span>
            <span className="line-through text-carbon-300 text-lg">¥{currentItem.originalPrice}</span>
            {discount > 0 && <span className="text-mint text-sm font-medium">-{discount}%</span>}
          </div>
          <p className="text-carbon-400 text-sm">
            建议价 ¥{currentItem.suggestedPriceMin} - ¥{currentItem.suggestedPriceMax}
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-1">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <Icon className="w-4 h-4 text-carbon-300" />
                <span className="text-carbon-400">{label}:</span>
                <span className="text-carbon-600">{value}</span>
              </div>
            ))}
          </div>

          {/* Flaws */}
          {currentItem.flaws && (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-carbon-300 mt-0.5 shrink-0" />
              <span className="text-carbon-500">{currentItem.flaws}</span>
            </div>
          )}

          {/* Status */}
          <div className="mt-1">{statusBadge}</div>

          {/* Actions */}
          {currentItem.status === 'selling' && (
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setPriceModalOpen(true)}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
              >
                降价
              </button>
              <button
                onClick={handleMarkSold}
                className="px-4 py-2 bg-carbon-100 text-carbon-600 rounded-lg hover:bg-carbon-200 transition"
              >
                标记已售
              </button>
            </div>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition w-fit"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      {/* Price Modal */}
      {priceModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-carbon-700">降价</h3>
            <div>
              <label className="text-sm text-carbon-500">新价格</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-carbon-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              <label className="text-sm text-carbon-500">降价原因</label>
              <input
                type="text"
                value={priceReason}
                onChange={(e) => setPriceReason(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-carbon-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPriceModalOpen(false)}
                className="px-4 py-2 text-carbon-400 hover:text-carbon-600"
              >
                取消
              </button>
              <button
                onClick={handlePriceSubmit}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
              >
                确认降价
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Middle Section - Price Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-bold text-carbon-700">价格变化</h2>
        </div>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8763A" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#E8763A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#808080' }} />
              <YAxis tick={{ fontSize: 12, fill: '#808080' }} />
              <Tooltip
                formatter={(value: number) => [`¥${value}`, '价格']}
                labelFormatter={(label: string) => `日期: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#E8763A"
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-carbon-300 text-center py-10">暂无价格变化</p>
        )}
      </div>

      {/* Bottom Section - Bargain Zone */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-bold text-carbon-700">砍价模拟</h2>
        </div>
        <div className="flex gap-6">
          {/* Left - Submit Offer */}
          <div className="w-72 shrink-0 space-y-3">
            <div>
              <label className="text-sm text-carbon-500">出价</label>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="输入出价金额"
                className="w-full mt-1 px-3 py-2 border border-carbon-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              <label className="text-sm text-carbon-500">留言（可选）</label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="说点什么..."
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-carbon-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
              />
            </div>
            <button
              onClick={handleSubmitOffer}
              className="w-full py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
            >
              出价
            </button>
          </div>

          {/* Right - Bargain History */}
          <div className="flex-1 space-y-3 max-h-96 overflow-y-auto">
            {bargains.length === 0 && (
              <p className="text-carbon-300 text-center py-6">暂无砍价记录</p>
            )}
            {bargains.map((b) => {
              const statusInfo = bargainStatusMap[b.status] || bargainStatusMap.pending
              const isBuyer = true
              return (
                <div key={b.id} className={`flex ${isBuyer ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-3 ${isBuyer ? 'bg-carbon-50' : 'bg-brand-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-carbon-700">¥{b.offerPrice}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    {b.message && <p className="text-sm text-carbon-500">{b.message}</p>}
                    {b.sellerNote && (
                      <p className="text-sm text-brand-600 mt-1 italic">卖家: {b.sellerNote}</p>
                    )}
                    {b.status === 'pending' && (
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          placeholder="卖家备注（可选）"
                          value={sellerNotes[b.id] || ''}
                          onChange={(e) => setSellerNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-carbon-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-300"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBargainAction(b.id, 'accepted')}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-mint/10 text-mint rounded-lg hover:bg-mint/20 transition"
                          >
                            <Check className="w-3 h-3" /> 接受
                          </button>
                          <button
                            onClick={() => handleBargainAction(b.id, 'rejected')}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition"
                          >
                            <X className="w-3 h-3" /> 拒绝
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
