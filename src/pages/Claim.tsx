import { useState, useEffect } from 'react'
import { useFridgeStore } from '@/store/fridgeStore'
import { getExpiryStatus, getDaysUntilExpiry } from '@/utils/fridge'
import { HandCoins, Snowflake, Minus, Plus, Search, CheckCircle2 } from 'lucide-react'

function ClaimPhoto({ src, name }: { src: string; name: string }) {
  if (src) {
    return <img src={src} alt={name} className="w-11 h-11 rounded-lg object-cover shrink-0" />
  }
  return (
    <div className="w-11 h-11 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
      <span className="text-stone-300 text-sm font-medium">{name.charAt(0)}</span>
    </div>
  )
}

export default function Claim() {
  const { getAvailableItems, claimFood, checkExpiry } = useFridgeStore()
  useEffect(() => { checkExpiry() }, [checkExpiry])

  const availableItems = getAvailableItems()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [claimerName, setClaimerName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const filteredItems = availableItems.filter(
    (f) => f.name.includes(search) || f.source.includes(search)
  )

  const selectedItem = availableItems.find((f) => f.id === selectedId)

  const handleClaim = () => {
    if (!selectedId || !claimerName) {
      setError('请填写领取人姓名并选择食物')
      return
    }
    if (quantity < 1) {
      setError('领取数量至少为1')
      return
    }
    if (selectedItem && quantity > selectedItem.quantity) {
      setError(`库存不足，当前仅剩 ${selectedItem.quantity} 份`)
      return
    }

    const ok = claimFood(selectedId, quantity, claimerName, notes)
    if (ok) {
      setSuccess(true)
      setSelectedId(null)
      setQuantity(1)
      setClaimerName('')
      setNotes('')
      setError('')
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError('领取失败，请检查库存')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-1">🤲 领取食物</h2>
        <p className="text-sm text-stone-400">选择需要的食物，登记领取数量</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          领取成功！感谢使用社区共享冰箱
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="搜索食物名称或来源..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition bg-white"
            />
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm">
              暂无可领取的食物
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const status = getExpiryStatus(item.expiryDate, item.status)
                const days = getDaysUntilExpiry(item.expiryDate)
                const isSelected = selectedId === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id)
                      setQuantity(1)
                      setError('')
                    }}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <ClaimPhoto src={item.photoUrl} name={item.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-800">{item.name}</span>
                          {item.coldChain && <Snowflake className="w-3.5 h-3.5 text-blue-500" />}
                          {status === 'today' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full font-bold">
                              今日到期
                            </span>
                          )}
                          {status === 'soon' && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-bold">
                              {days}天后到期
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-stone-400">{item.source}</span>
                          <span className="text-xs text-stone-300">·</span>
                          <span className="text-xs text-stone-400">第{item.shelfLayer}层</span>
                          {item.allergens && (
                            <>
                              <span className="text-xs text-stone-300">·</span>
                              <span className="text-[10px] text-orange-500">含 {item.allergens}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 self-center">
                        <span className="text-lg font-bold text-emerald-600">×{item.quantity}</span>
                        <p className="text-[10px] text-stone-400">可领取</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2 mb-4">
              <HandCoins className="w-4 h-4 text-emerald-600" />
              领取详情
            </h3>

            {selectedItem ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-lg p-3 flex items-center gap-3">
                  <ClaimPhoto src={selectedItem.photoUrl} name={selectedItem.name} />
                  <div>
                    <p className="text-sm font-bold text-emerald-700">{selectedItem.name}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      来源：{selectedItem.source} · 库存：{selectedItem.quantity}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">领取数量</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-bold text-stone-800 w-12 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(selectedItem.quantity, q + 1))}
                      className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-stone-400">/ {selectedItem.quantity} 可用</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">领取人姓名 *</label>
                  <input
                    type="text"
                    value={claimerName}
                    onChange={(e) => setClaimerName(e.target.value)}
                    placeholder="请输入您的姓名"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">备注</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="选填，如特殊需求等"
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition resize-none"
                  />
                </div>

                <button
                  onClick={handleClaim}
                  disabled={quantity > selectedItem.quantity}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                >
                  确认领取
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400 text-sm">
                <HandCoins className="w-8 h-8 mx-auto mb-2 opacity-30" />
                请从左侧选择要领取的食物
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
