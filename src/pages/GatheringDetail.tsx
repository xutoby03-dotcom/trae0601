import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, MapPin, Users, UtensilsCrossed,
  AlertTriangle, Wallet, ClipboardList, Plus, X, Trash2,
  Check, ChevronRight, User, Flame, Leaf, Eye,
} from 'lucide-react'
import { useGatheringStore } from '@/store/useGatheringStore'
import {
  CATEGORY_LABELS, CATEGORY_ICONS, SPICE_LABELS,
  type DishCategory, type GatheringStatus, type Participant,
} from '@/types'

type TabKey = 'dishes' | 'diet' | 'budget' | 'prep'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dishes', label: '菜品看板', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { key: 'diet', label: '忌口面板', icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'budget', label: '预算面板', icon: <Wallet className="w-4 h-4" /> },
  { key: 'prep', label: '准备清单', icon: <ClipboardList className="w-4 h-4" /> },
]

const STATUS_CONFIG: Record<GatheringStatus, { label: string; bg: string; text: string; dot: string }> = {
  preparing: { label: '筹备中', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  ongoing: { label: '进行中', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  completed: { label: '已完成', bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' },
}

const STATUS_FLOW: GatheringStatus[] = ['preparing', 'ongoing', 'completed']

const CATEGORIES: DishCategory[] = ['staple', 'hot', 'cold', 'dessert', 'drink']

function StatusBadge({ status }: { status: GatheringStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function ParticipantAvatar({ participant, size = 'md' }: { participant: Participant; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center text-white font-medium shrink-0`}
      style={{ backgroundColor: participant.avatar }}
    >
      {participant.name.charAt(0)}
    </div>
  )
}

function DishBoard({ gatheringId }: { gatheringId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState<DishCategory>('staple')
  const [dishName, setDishName] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [isBringing, setIsBringing] = useState(false)

  const allDishes = useGatheringStore((s) => s.dishes)
  const allParticipants = useGatheringStore((s) => s.participants)
  const addDish = useGatheringStore((s) => s.addDish)
  const removeDish = useGatheringStore((s) => s.removeDish)

  const dishes = useMemo(() => allDishes.filter((d) => d.gatheringId === gatheringId), [allDishes, gatheringId])
  const participants = useMemo(() => allParticipants.filter((p) => p.gatheringId === gatheringId), [allParticipants, gatheringId])

  const byCategory = useMemo(() => {
    const result: Record<DishCategory, typeof dishes> = { staple: [], hot: [], cold: [], dessert: [], drink: [] }
    dishes.forEach((d) => result[d.category].push(d))
    return result
  }, [dishes])

  const dupes = useMemo(() => {
    const map = new Map<string, typeof dishes>()
    dishes.forEach((d) => {
      const key = d.name.toLowerCase().trim()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(d)
    })
    const result = new Map<string, typeof dishes>()
    map.forEach((v, k) => { if (v.length > 1) result.set(k, v) })
    return result
  }, [dishes])

  const handleSubmit = () => {
    if (!dishName.trim() || !participantId) return
    addDish({ gatheringId, category, name: dishName.trim(), participantId, isBringing })
    setDishName('')
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-bark font-semibold">菜品看板</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加菜品
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-bark">添加菜品</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DishCategory)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">菜名</label>
              <input
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="输入菜名"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">参与者</label>
              <select
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">选择参与者</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBringing}
                  onChange={(e) => setIsBringing(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-primary/30"
                />
                <span className="text-sm text-bark">自带</span>
              </label>
              <span className="text-xs text-stone-400 ml-2">{isBringing ? '参与者自带' : '主厨做'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!dishName.trim() || !participantId}
            className="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认添加
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const dishes = byCategory[cat]
          return (
            <div key={cat} className="bg-white rounded-xl border border-stone-100 overflow-hidden">
              <div className="px-3 py-2 bg-stone-50 border-b border-stone-100 flex items-center gap-1.5">
                <span>{CATEGORY_ICONS[cat]}</span>
                <span className="text-sm font-medium text-bark">{CATEGORY_LABELS[cat]}</span>
                <span className="text-xs text-stone-400 ml-auto">{dishes.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[80px]">
                {dishes.length === 0 && (
                  <p className="text-xs text-stone-300 text-center py-4">暂无菜品</p>
                )}
                {dishes.map((dish) => {
                  const isDuplicate = dupes.has(dish.name.toLowerCase().trim())
                  const dupeCount = dupes.get(dish.name.toLowerCase().trim())?.length
                  const participant = participants.find((p) => p.id === dish.participantId)
                  return (
                    <div
                      key={dish.id}
                      className={`rounded-lg p-2 text-sm border ${
                        isDuplicate ? 'border-honey bg-honey/5' : 'border-stone-100 bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="truncate text-bark font-medium">{dish.name}</span>
                            {isDuplicate && dupeCount && (
                              <span className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-honey text-white text-[10px] font-bold">
                                {dupeCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {participant && (
                              <span className="text-[10px] text-stone-400">{participant.name}</span>
                            )}
                            <span className={`text-[10px] px-1 rounded ${dish.isBringing ? 'bg-sage/10 text-sage' : 'bg-primary/10 text-primary'}`}>
                              {dish.isBringing ? '自带' : '主厨做'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDish(dish.id)}
                          className="shrink-0 text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DietPanel({ gatheringId }: { gatheringId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [spiceLevel, setSpiceLevel] = useState<0 | 1 | 2 | 3>(0)
  const [isVegetarian, setIsVegetarian] = useState(false)
  const [allergies, setAllergies] = useState('')

  const allParticipants = useGatheringStore((s) => s.participants)
  const addParticipant = useGatheringStore((s) => s.addParticipant)
  const removeParticipant = useGatheringStore((s) => s.removeParticipant)

  const participants = useMemo(() => allParticipants.filter((p) => p.gatheringId === gatheringId), [allParticipants, gatheringId])

  const handleSubmit = () => {
    if (!name.trim()) return
    addParticipant({ gatheringId, name: name.trim(), spiceLevel, isVegetarian, allergies })
    setName('')
    setSpiceLevel(0)
    setIsVegetarian(false)
    setAllergies('')
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-bark font-semibold">忌口面板</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加参与者
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-bark">添加参与者</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">姓名</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入姓名"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">辣度</label>
              <div className="flex gap-2">
                {([0, 1, 2, 3] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSpiceLevel(level)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      spiceLevel === level
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {SPICE_LABELS[level]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-sage focus:ring-sage/30"
                />
                <span className="text-sm text-bark flex items-center gap-1">
                  <Leaf className="w-4 h-4 text-sage" />
                  素食
                </span>
              </label>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">过敏信息</label>
              <input
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="如：花生、海鲜等"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认添加
          </button>
        </div>
      )}

      {participants.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <User className="w-10 h-10 mx-auto mb-2 text-stone-300" />
          <p className="text-sm">暂无参与者</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {participants.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 border border-stone-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <ParticipantAvatar participant={p} />
                  <div>
                    <p className="font-medium text-bark">{p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: p.spiceLevel }).map((_, i) => (
                        <span key={i} className="text-sm">🌶️</span>
                      ))}
                      {p.spiceLevel === 0 && <span className="text-xs text-stone-400">{SPICE_LABELS[0]}</span>}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeParticipant(p.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.isVegetarian && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sage/10 text-sage text-xs">
                    🥬 素食
                  </span>
                )}
                {p.allergies && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">
                    ⚠️ {p.allergies}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BudgetPanel({ gatheringId }: { gatheringId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [payParticipantId, setPayParticipantId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const gatherings = useGatheringStore((s) => s.gatherings)
  const allParticipants = useGatheringStore((s) => s.participants)
  const allPayments = useGatheringStore((s) => s.payments)
  const addPayment = useGatheringStore((s) => s.addPayment)
  const removePayment = useGatheringStore((s) => s.removePayment)

  const gathering = useMemo(() => gatherings.find((g) => g.id === gatheringId)!, [gatherings, gatheringId])
  const participants = useMemo(() => allParticipants.filter((p) => p.gatheringId === gatheringId), [allParticipants, gatheringId])
  const payments = useMemo(() => allPayments.filter((p) => p.gatheringId === gatheringId), [allPayments, gatheringId])

  const totalBudget = gathering.budget
  const perPerson = gathering.headCount > 0 ? totalBudget / gathering.headCount : 0
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const balance = totalBudget - totalPaid
  const progressPct = totalBudget > 0 ? Math.min((totalPaid / totalBudget) * 100, 100) : 0

  const handleSubmit = () => {
    const amt = parseFloat(amount)
    if (!payParticipantId || isNaN(amt) || amt <= 0) return
    addPayment({ gatheringId, participantId: payParticipantId, amount: amt, description })
    setPayParticipantId('')
    setAmount('')
    setDescription('')
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-bark font-semibold">预算面板</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加付款
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-bark">添加付款</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">付款人</label>
              <select
                value={payParticipantId}
                onChange={(e) => setPayParticipantId(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">选择参与者</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">金额 (¥)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">说明</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="付款说明"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!payParticipantId || !amount || parseFloat(amount) <= 0}
            className="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认添加
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 border border-stone-100 text-center">
          <p className="text-xs text-stone-400 mb-1">人均预算</p>
          <p className="font-serif text-xl font-bold text-bark">¥{perPerson.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100 text-center">
          <p className="text-xs text-stone-400 mb-1">总预算</p>
          <p className="font-serif text-xl font-bold text-primary">¥{totalBudget}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100 text-center">
          <p className="text-xs text-stone-400 mb-1">已付款</p>
          <p className="font-serif text-xl font-bold text-sage">¥{totalPaid.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100 text-center">
          <p className="text-xs text-stone-400 mb-1">余额</p>
          <p className={`font-serif text-xl font-bold ${balance >= 0 ? 'text-sage' : 'text-red-500'}`}>
            ¥{balance.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-stone-100 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-stone-500">预算使用</span>
          <span className="text-sm font-medium text-bark">{progressPct.toFixed(0)}%</span>
        </div>
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPct > 100 ? 'bg-red-500' : progressPct > 80 ? 'bg-honey' : 'bg-sage'
            }`}
            style={{ width: `${Math.min(progressPct, 100)}%` }}
          />
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8 text-stone-400">
          <Wallet className="w-10 h-10 mx-auto mb-2 text-stone-300" />
          <p className="text-sm">暂无付款记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => {
            const participant = participants.find((p) => p.id === payment.participantId)
            return (
              <div key={payment.id} className="bg-white rounded-xl p-3 border border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {participant ? (
                    <ParticipantAvatar participant={participant} size="sm" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs text-stone-400">
                      ?
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-bark">{participant?.name || '未知'}</p>
                    {payment.description && <p className="text-xs text-stone-400">{payment.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm font-bold text-primary">¥{payment.amount}</span>
                  <button
                    type="button"
                    onClick={() => removePayment(payment.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PrepTimeline({ gatheringId }: { gatheringId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [timeBefore, setTimeBefore] = useState('')
  const [assignee, setAssignee] = useState('')

  const allTasks = useGatheringStore((s) => s.prepTasks)
  const allParticipants = useGatheringStore((s) => s.participants)
  const addPrepTask = useGatheringStore((s) => s.addPrepTask)
  const updatePrepTask = useGatheringStore((s) => s.updatePrepTask)
  const removePrepTask = useGatheringStore((s) => s.removePrepTask)

  const tasks = useMemo(() => allTasks.filter((t) => t.gatheringId === gatheringId), [allTasks, gatheringId])
  const participants = useMemo(() => allParticipants.filter((p) => p.gatheringId === gatheringId), [allParticipants, gatheringId])

  function parseTimeToMinutes(timeBefore: string): number {
    const str = timeBefore.replace(/提前/g, '')
    let total = 0
    let remaining = str
    const dayMatch = remaining.match(/(\d+)\s*天/)
    if (dayMatch) {
      total += parseInt(dayMatch[1], 10) * 1440
      remaining = remaining.replace(/\d+\s*天/, '')
    }
    const hourMatch = remaining.match(/(\d+)\s*小?时/)
    if (hourMatch) {
      total += parseInt(hourMatch[1], 10) * 60
      remaining = remaining.replace(/\d+\s*小?时/, '')
    }
    const minMatch = remaining.match(/(\d+)\s*分[钟]?/)
    if (minMatch) {
      total += parseInt(minMatch[1], 10)
      remaining = remaining.replace(/\d+\s*分[钟]?/, '')
    }
    if (total === 0) {
      const numMatch = str.match(/(\d+)/)
      if (numMatch) total = parseInt(numMatch[1], 10)
    }
    return total
  }

  const sorted = [...tasks].map((t, i) => ({ task: t, index: i })).sort((a, b) => {
    const diff = parseTimeToMinutes(b.task.timeBefore) - parseTimeToMinutes(a.task.timeBefore)
    return diff !== 0 ? diff : a.index - b.index
  }).map((entry) => entry.task)
  const completedCount = tasks.filter((t) => t.completed).length

  const handleSubmit = () => {
    if (!title.trim() || !timeBefore.trim()) return
    addPrepTask({ gatheringId, title: title.trim(), timeBefore: timeBefore.trim(), completed: false, assignee: assignee || undefined })
    setTitle('')
    setTimeBefore('')
    setAssignee('')
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-lg text-bark font-semibold">准备清单</h3>
          {tasks.length > 0 && (
            <p className="text-xs text-stone-400 mt-0.5">
              已完成 {completedCount}/{tasks.length}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加任务
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-bark">添加任务</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">任务名</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入任务"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">提前时间</label>
              <input
                value={timeBefore}
                onChange={(e) => setTimeBefore(e.target.value)}
                placeholder="如：提前2天"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">负责人</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">不指定</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !timeBefore.trim()}
            className="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认添加
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-stone-300" />
          <p className="text-sm">暂无准备任务</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-stone-200" />
          <div className="space-y-3">
            {sorted.map((task) => (
              <div key={task.id} className="relative pl-10">
                <button
                  type="button"
                  onClick={() => updatePrepTask(task.id, { completed: !task.completed })}
                  className={`absolute left-0 top-1 w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center transition-colors z-10 ${
                    task.completed
                      ? 'bg-sage border-sage text-white'
                      : 'bg-white border-stone-300 text-transparent hover:border-sage'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <div className={`bg-white rounded-xl p-3 border ${task.completed ? 'border-sage/30 bg-sage/5' : 'border-stone-100'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-medium ${task.completed ? 'text-stone-400 line-through' : 'text-bark'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{task.timeBefore}</span>
                        {task.assignee && (
                          <span className="text-xs text-stone-400">{task.assignee}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePrepTask(task.id)}
                      className="text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function GatheringDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('dishes')

  const gatherings = useGatheringStore((s) => s.gatherings)
  const setGatheringStatus = useGatheringStore((s) => s.setGatheringStatus)

  const gathering = useMemo(() => gatherings.find((g) => g.id === id), [gatherings, id])

  if (!gathering) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-bark mb-2">聚会未找到</h2>
          <p className="text-stone-400 mb-6">该聚会不存在或已被删除</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_FLOW.indexOf(gathering.status)
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null

  return (
    <div className="min-h-screen bg-cream font-sans">
      <div className="bg-gradient-to-br from-primary to-primary/85 text-white">
        <div className="container px-4 py-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回首页</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-serif text-2xl md:text-3xl font-bold">{gathering.name}</h1>
                <StatusBadge status={gathering.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/75 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {gathering.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {gathering.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {gathering.headCount} 人
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {nextStatus && (
                <button
                  type="button"
                  onClick={() => setGatheringStatus(gathering.id, nextStatus)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                  {STATUS_CONFIG[nextStatus].label}
                </button>
              )}
              {gathering.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => navigate(`/gathering/${gathering.id}/summary`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-honey text-bark text-sm font-medium hover:bg-honey/90 transition-colors"
                >
                  查看总结
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-4">
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-stone-500 hover:text-bark border border-stone-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container px-4 pb-8">
        {activeTab === 'dishes' && <DishBoard gatheringId={gathering.id} />}
        {activeTab === 'diet' && <DietPanel gatheringId={gathering.id} />}
        {activeTab === 'budget' && <BudgetPanel gatheringId={gathering.id} />}
        {activeTab === 'prep' && <PrepTimeline gatheringId={gathering.id} />}
      </div>
    </div>
  )
}
