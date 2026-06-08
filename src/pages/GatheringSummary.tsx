import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Star,
  Trophy,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Utensils,
  ArrowLeft,
  Plus,
  Trash2,
} from 'lucide-react'
import { useGatheringStore } from '@/store/useGatheringStore'
import { LEFTOVER_LABELS, CATEGORY_ICONS } from '@/types'
import type { LeftoverAmount } from '@/types'

const LEFTOVER_AMOUNT_OPTIONS: LeftoverAmount[] = ['none', 'little', 'some', 'lot']

const LEFTOVER_BADGE_STYLES: Record<LeftoverAmount, string> = {
  none: 'bg-sage/15 text-sage',
  little: 'bg-honey/20 text-amber-700',
  some: 'bg-primary/15 text-primary',
  lot: 'bg-red-100 text-red-600',
}

function StarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hover || rating)
                ? 'fill-honey text-honey'
                : 'fill-none text-stone-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default function GatheringSummary() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const gatherings = useGatheringStore((s) => s.gatherings)
  const allParticipants = useGatheringStore((s) => s.participants)
  const allDishes = useGatheringStore((s) => s.dishes)
  const allPayments = useGatheringStore((s) => s.payments)
  const allLeftovers = useGatheringStore((s) => s.leftovers)
  const getTopDishes = useGatheringStore((s) => s.getTopDishes)
  const getOverLeftoverDishes = useGatheringStore((s) => s.getOverLeftoverDishes)

  const addLeftover = useGatheringStore((s) => s.addLeftover)
  const updateLeftover = useGatheringStore((s) => s.updateLeftover)
  const removeLeftover = useGatheringStore((s) => s.removeLeftover)
  const updateDish = useGatheringStore((s) => s.updateDish)

  const gathering = useMemo(() => gatherings.find((g) => g.id === id), [gatherings, id])
  const participants = useMemo(() => allParticipants.filter((p) => p.gatheringId === id), [allParticipants, id])
  const dishes = useMemo(() => allDishes.filter((d) => d.gatheringId === id), [allDishes, id])
  const payments = useMemo(() => allPayments.filter((p) => p.gatheringId === id), [allPayments, id])
  const leftovers = useMemo(() => allLeftovers.filter((l) => l.gatheringId === id), [allLeftovers, id])

  const [newLeftoverDish, setNewLeftoverDish] = useState('')
  const [newLeftoverAmount, setNewLeftoverAmount] = useState<LeftoverAmount>('none')

  if (!gathering) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-stone-400 text-lg">聚会不存在</p>
      </div>
    )
  }

  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0)
  const perPersonCost = participants.length > 0 ? totalSpent / participants.length : 0
  const budgetRatio = gathering.budget > 0 ? Math.min((totalSpent / gathering.budget) * 100, 100) : 0

  const topDishList = useMemo(() => getTopDishes(3), [getTopDishes])
  const overLeftList = useMemo(() => getOverLeftoverDishes(), [getOverLeftoverDishes])

  const handleAddLeftover = () => {
    if (!newLeftoverDish) return
    addLeftover({
      gatheringId: id!,
      dishName: newLeftoverDish,
      amount: newLeftoverAmount,
    })
    setNewLeftoverDish('')
    setNewLeftoverAmount('none')
  }

  const getParticipantName = (participantId: string) => {
    const p = participants.find((pt) => pt.id === participantId)
    return p?.name ?? '未知'
  }

  return (
    <div className="min-h-screen bg-cream font-sans">
      <div className="bg-gradient-to-br from-primary to-primary/85 text-white">
        <div className="container px-4 py-8">
          <button
            type="button"
            onClick={() => navigate(`/gathering/${id}`)}
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回聚会详情
          </button>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">{gathering.name}</h1>
          <p className="text-white/70 mt-1">聚会总结与数据洞察</p>
        </div>
      </div>

      <div className="container px-4 py-8 space-y-6 max-w-3xl">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-serif text-xl text-bark font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            实际花费
          </h2>

          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-500">预算 ¥{gathering.budget}</span>
              <span className="text-bark font-semibold">实际 ¥{totalSpent}</span>
            </div>
            <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalSpent > gathering.budget ? 'bg-red-400' : 'bg-sage'
                }`}
                style={{ width: `${budgetRatio}%` }}
              />
            </div>
            {totalSpent > gathering.budget && (
              <p className="text-xs text-red-500 mt-1">超出预算 ¥{totalSpent - gathering.budget}</p>
            )}
          </div>

          <div className="space-y-2 mb-4">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2.5"
              >
                <div>
                  <span className="text-sm text-bark font-medium">
                    {getParticipantName(p.participantId)}
                  </span>
                  <span className="text-xs text-stone-400 ml-2">{p.description}</span>
                </div>
                <span className="text-sm font-semibold text-primary">¥{p.amount}</span>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-sm text-stone-400 py-2">暂无支付记录</p>
            )}
          </div>

          <div className="bg-primary/5 rounded-xl p-4">
            <p className="text-sm text-stone-500">人均花费</p>
            <p className="font-serif text-2xl font-bold text-primary">¥{perPersonCost.toFixed(2)}</p>
            <p className="text-xs text-stone-400 mt-0.5">{participants.length} 人参与</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-serif text-xl text-bark font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            剩菜记录
          </h2>

          <div className="space-y-2 mb-5">
            {leftovers.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-bark font-medium">{l.dishName}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      LEFTOVER_BADGE_STYLES[l.amount]
                    }`}
                  >
                    {LEFTOVER_LABELS[l.amount]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={l.amount}
                    onChange={(e) =>
                      updateLeftover(l.id, { amount: e.target.value as LeftoverAmount })
                    }
                    className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white text-bark focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {LEFTOVER_AMOUNT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {LEFTOVER_LABELS[opt]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeLeftover(l.id)}
                    className="text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {leftovers.length === 0 && (
              <p className="text-sm text-stone-400 py-2">暂无剩菜记录</p>
            )}
          </div>

          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-sm font-medium text-bark mb-3">添加剩菜记录</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newLeftoverDish}
                onChange={(e) => setNewLeftoverDish(e.target.value)}
                className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white text-bark focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">选择菜品</option>
                {dishes.map((d) => (
                  <option key={d.id} value={d.name}>
                    {CATEGORY_ICONS[d.category]} {d.name}
                  </option>
                ))}
              </select>
              <select
                value={newLeftoverAmount}
                onChange={(e) => setNewLeftoverAmount(e.target.value as LeftoverAmount)}
                className="text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white text-bark focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {LEFTOVER_AMOUNT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {LEFTOVER_LABELS[opt]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddLeftover}
                disabled={!newLeftoverDish}
                className="inline-flex items-center justify-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-serif text-xl text-bark font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-honey" />
            菜品评分
          </h2>

          <div className="space-y-3">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{CATEGORY_ICONS[dish.category]}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-bark font-medium truncate">{dish.name}</p>
                    <p className="text-xs text-stone-400">
                      {getParticipantName(dish.participantId)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StarRating
                    rating={dish.rating ?? 0}
                    onRate={(r) => updateDish(dish.id, { rating: r })}
                  />
                  {dish.rating !== undefined && dish.rating > 0 && (
                    <span className="text-xs text-stone-400 w-8 text-right">
                      {dish.rating}.0
                    </span>
                  )}
                </div>
              </div>
            ))}
            {dishes.length === 0 && (
              <p className="text-sm text-stone-400 py-2">暂无菜品</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-serif text-xl text-bark font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            数据洞察
          </h2>

          <div className="space-y-4">
            <div className="bg-honey/10 rounded-xl p-4">
              <h3 className="text-sm font-medium text-bark mb-3 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-honey" />
                最受欢迎菜品
              </h3>
              {topDishList.length === 0 ? (
                <p className="text-xs text-stone-400">暂无评分数据</p>
              ) : (
                <div className="space-y-2">
                  {topDishList.map((dish, i) => (
                    <div
                      key={dish.name}
                      className="flex items-center gap-3 bg-white/60 rounded-lg px-3 py-2"
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          i === 0 ? 'bg-primary' : i === 1 ? 'bg-honey' : 'bg-stone-400'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-bark flex-1 truncate">{dish.name}</span>
                      <span className="text-xs text-stone-400">
                        ★ {dish.avgRating.toFixed(1)} ({dish.count}次评分)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-primary/5 rounded-xl p-4">
              <h3 className="text-sm font-medium text-bark mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-primary" />
                下次建议减少的菜品
              </h3>
              {overLeftList.length === 0 ? (
                <p className="text-xs text-stone-400">暂无剩菜数据</p>
              ) : (
                <div className="space-y-2">
                  {overLeftList.map((dish) => (
                    <div
                      key={dish.name}
                      className="flex items-center gap-3 bg-white/60 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-bark flex-1 truncate">{dish.name}</span>
                      <span className="text-xs text-primary font-medium">
                        剩余 {dish.lotCount} 次
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-sage/10 rounded-xl p-4">
              <h3 className="text-sm font-medium text-bark mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sage" />
                预算效率
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-stone-400 mb-1">
                    <span>实际花费</span>
                    <span>预算</span>
                  </div>
                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        totalSpent > gathering.budget ? 'bg-red-400' : 'bg-sage'
                      }`}
                      style={{ width: `${budgetRatio}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-serif text-lg font-bold text-sage">
                    {gathering.budget > 0
                      ? ((totalSpent / gathering.budget) * 100).toFixed(0)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-stone-400">使用率</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
