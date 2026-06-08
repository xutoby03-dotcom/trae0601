import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { CATEGORIES, CATEGORY_COLORS, PRE_MOODS, MOOD_EMOJIS, MOOD_COLORS } from '@/types'
import type { Category, PreMood, CoolItem } from '@/types'
import { generateId } from '@/utils/helpers'
import CoolTimer from '@/components/CoolTimer'
import { Plus, X, ShoppingCart, ThumbsDown, Sparkles } from 'lucide-react'

export default function CoolZone() {
  const { coolItems, addCoolItem, updateCoolItem, deleteCoolItem } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0])
  const [selectedMood, setSelectedMood] = useState<PreMood>(PRE_MOODS[0])

  const handleSubmit = () => {
    if (!newItemName.trim() || !newItemPrice) return
    const now = new Date()
    const decideAfter = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    addCoolItem({
      id: generateId(),
      name: newItemName.trim(),
      estimatedPrice: Number(newItemPrice),
      category: selectedCategory,
      preMood: selectedMood,
      addedAt: now.toISOString(),
      decideAfter: decideAfter.toISOString(),
      decision: '',
    })
    setNewItemName('')
    setNewItemPrice('')
    setSelectedCategory(CATEGORIES[0])
    setSelectedMood(PRE_MOODS[0])
    setShowForm(false)
  }

  const sorted = [...coolItems].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  )

  const activeItems = sorted.filter((i) => !i.decision)
  const decidedItems = sorted.filter((i) => i.decision)

  const totalSaved = decidedItems
    .filter((i) => i.decision === '不买')
    .reduce((sum, i) => sum + i.estimatedPrice, 0)

  const decidedCount = decidedItems.length
  const noBuyCount = decidedItems.filter((i) => i.decision === '不买').length
  const rate = decidedCount > 0 ? Math.round((noBuyCount / decidedCount) * 100) : 0

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-2xl font-bold">冷静区 ❄️</h1>
        <p className="text-sm text-white/50 mt-1">24小时后再决定</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm(!showForm)}
          className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm hover:bg-white/10 transition"
        >
          <Plus size={16} />
          {showForm ? '收起' : '添加商品'}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in">
          <input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="想买什么？"
            className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 outline-none focus:border-white/20 placeholder:text-white/30"
          />
          <input
            type="number"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            placeholder="预估价格"
            className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 outline-none focus:border-white/20 placeholder:text-white/30"
          />

          <div>
            <p className="text-xs text-white/40 mb-2">分类</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition"
                  style={{
                    background: selectedCategory === cat ? CATEGORY_COLORS[cat] : 'rgba(255,255,255,0.06)',
                    color: selectedCategory === cat ? '#1a1a2e' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-white/40 mb-2">此刻心情</p>
            <div className="flex flex-wrap gap-2">
              {PRE_MOODS.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1"
                  style={{
                    background: selectedMood === mood ? MOOD_COLORS[mood] : 'rgba(255,255,255,0.06)',
                    color: selectedMood === mood ? '#1a1a2e' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {MOOD_EMOJIS[mood]} {mood}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="gradient-lavender w-full rounded-xl py-2.5 text-sm font-medium text-white"
          >
            放入冷静区
          </button>
        </div>
      )}

      <div className="glass rounded-2xl p-4 flex items-center justify-around">
        <div className="text-center">
          <p className="text-xs text-white/40">已省钱</p>
          <p className="text-lg font-bold text-gradient-mint">¥{totalSaved.toLocaleString()}</p>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="text-center">
          <p className="text-xs text-white/40">冷静成功率</p>
          <p className="text-lg font-bold text-lavender">{rate}%</p>
        </div>
      </div>

      {coolItems.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center space-y-3 animate-fade-in">
          <Sparkles size={32} className="mx-auto text-white/20" />
          <p className="text-white/40">没有在冷静的商品</p>
          <p className="text-xs text-white/25">想买东西？先放这里冷静一下</p>
        </div>
      )}

      {activeItems.length > 0 && (
        <div className="space-y-3">
          {activeItems.map((item) => {
            const isExpired = new Date(item.decideAfter).getTime() < Date.now()
            return (
              <div key={item.id} className="glass rounded-2xl p-4 relative animate-fade-in">
                <button
                  onClick={() => deleteCoolItem(item.id)}
                  className="absolute top-3 right-3 text-white/20 hover:text-white/60 transition"
                >
                  <X size={14} />
                </button>

                <div className="flex items-start gap-3">
                  <CoolTimer targetDate={item.decideAfter} isExpired={isExpired} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{item.name}</p>
                    </div>
                    <p className="text-sm text-white/50 mt-0.5">¥{item.estimatedPrice.toLocaleString()}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: CATEGORY_COLORS[item.category], color: '#1a1a2e' }}
                      >
                        {item.category}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: MOOD_COLORS[item.preMood], color: '#1a1a2e' }}
                      >
                        {MOOD_EMOJIS[item.preMood]} {item.preMood}
                      </span>
                    </div>

                    {!isExpired && !item.decision && (
                      <p className="text-xs mt-2 text-[#c4b5fd]">冷静中...</p>
                    )}

                    {isExpired && !item.decision && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => updateCoolItem(item.id, { decision: '买' })}
                          className="gradient-coral rounded-lg px-3 py-1 text-xs font-medium text-white"
                        >
                          买
                        </button>
                        <button
                          onClick={() => updateCoolItem(item.id, { decision: '不买' })}
                          className="gradient-mint rounded-lg px-3 py-1 text-xs font-medium text-white"
                        >
                          不买
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {decidedItems.length > 0 && (
        <div className="space-y-3 opacity-60">
          <p className="text-xs text-white/30 font-medium">已决定</p>
          {decidedItems.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-4 relative animate-fade-in">
              <button
                onClick={() => deleteCoolItem(item.id)}
                className="absolute top-3 right-3 text-white/20 hover:text-white/60 transition"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${item.decision === '不买' ? 'line-through text-white/40' : ''}`}>
                    {item.name}
                  </p>
                  <p className="text-sm text-white/30 mt-0.5">¥{item.estimatedPrice.toLocaleString()}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2 items-center">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: CATEGORY_COLORS[item.category], color: '#1a1a2e' }}
                    >
                      {item.category}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: MOOD_COLORS[item.preMood], color: '#1a1a2e' }}
                    >
                      {MOOD_EMOJIS[item.preMood]} {item.preMood}
                    </span>
                  </div>
                  <div className="mt-2">
                    {item.decision === '买' ? (
                      <span className="gradient-coral rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
                        已购买
                      </span>
                    ) : (
                      <span className="gradient-mint rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
                        已决定: {item.decision}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
