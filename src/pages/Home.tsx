import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, X, Wallet, TrendingDown, PiggyBank } from 'lucide-react'
import { useStore } from '@/store'
import { getWeekDates, formatDate, getDayName, isToday } from '@/utils'
import { cn } from '@/lib/utils'

export default function Home() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [modalDate, setModalDate] = useState<string | null>(null)
  const [formRecipes, setFormRecipes] = useState<string[]>([])
  const [formShopper, setFormShopper] = useState('')
  const [formCook, setFormCook] = useState('')
  const [formCleaner, setFormCleaner] = useState('')
  const [tooltipContent, setTooltipContent] = useState<{ x: number; y: number; items: string[] } | null>(null)

  const { members, recipes, ingredients, dayPlans, setDayPlan, removeDayPlan, getMissingIngredients, isRecipeAvailable, getWeekStats } = useStore()

  const weekDates = getWeekDates(weekOffset)
  const stats = getWeekStats(weekDates[0])
  const remaining = stats.totalBudget - stats.totalSpent

  const openModal = useCallback((date: string) => {
    const existing = dayPlans.find((p) => p.date === date)
    setFormRecipes(existing?.recipeIds ?? [])
    setFormShopper(existing?.shopperId ?? '')
    setFormCook(existing?.cookId ?? '')
    setFormCleaner(existing?.cleanerId ?? '')
    setModalDate(date)
  }, [dayPlans])

  const closeModal = useCallback(() => {
    setModalDate(null)
    setFormRecipes([])
    setFormShopper('')
    setFormCook('')
    setFormCleaner('')
  }, [])

  const handleSave = useCallback(() => {
    if (!modalDate) return
    const filtered = formRecipes.filter((rid) => isRecipeAvailable(rid))
    setDayPlan({ date: modalDate, recipeIds: filtered, shopperId: formShopper, cookId: formCook, cleanerId: formCleaner })
    closeModal()
  }, [modalDate, formRecipes, formShopper, formCook, formCleaner, setDayPlan, isRecipeAvailable, closeModal])

  const toggleRecipe = useCallback((id: string) => {
    if (!isRecipeAvailable(id)) return
    setFormRecipes((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id])
  }, [isRecipeAvailable])

  const handleMissingHover = useCallback((e: React.MouseEvent, recipeId: string) => {
    const missing = getMissingIngredients(recipeId)
    if (missing.length === 0) return
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setTooltipContent({ x: rect.left, y: rect.bottom + 4, items: missing.map((i) => `${i.name} (缺${i.threshold - i.stock}${i.unit})`) })
  }, [getMissingIngredients])

  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name ?? ''

  return (
    <div className="space-y-5" onMouseLeave={() => setTooltipContent(null)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-orange-900">排班日历</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 rounded-lg hover:bg-orange-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-orange-700" />
          </button>
          <span className="text-sm font-semibold text-orange-800 min-w-[120px] text-center font-['DM_Sans',system-ui]">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 rounded-lg hover:bg-orange-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-orange-700" />
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-orange-500 hover:text-orange-700 transition-colors">
              回到本周
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '本周预算', value: stats.totalBudget, icon: Wallet, color: 'text-blue-500' },
          { label: '已花费', value: stats.totalSpent, icon: TrendingDown, color: 'text-orange-500' },
          { label: '剩余', value: remaining, icon: PiggyBank, color: 'text-emerald-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <card.icon className={cn('w-4 h-4', card.color)} />
              <span className="text-xs text-orange-400">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 font-['DM_Sans',system-ui]">¥{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-orange-400">预算使用</span>
          <span className="text-xs font-medium text-orange-600 font-['DM_Sans',system-ui]">
            {stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0}%
          </span>
        </div>
        <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const plan = dayPlans.find((p) => p.date === date)
          const today = isToday(date)
          return (
            <div
              key={date}
              className={cn(
                'bg-white border rounded-2xl p-3 min-h-[220px] shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]',
                today ? 'border-orange-300 ring-2 ring-orange-100' : 'border-orange-100'
              )}
              onClick={() => openModal(date)}
            >
              <div className={cn('text-center mb-2 pb-2 border-b border-orange-50', today && 'bg-orange-50 -mx-3 -mt-3 px-3 pt-3 rounded-t-2xl')}>
                <p className={cn('text-xs', today ? 'text-orange-500 font-bold' : 'text-orange-300')}>{getDayName(date)}</p>
                <p className={cn('text-lg font-bold font-["DM_Sans",system-ui]', today ? 'text-orange-500' : 'text-orange-900')}>{formatDate(date)}</p>
              </div>

              {plan ? (
                <div className="space-y-2">
                  {plan.recipeIds.map((rid) => {
                    const recipe = recipes.find((r) => r.id === rid)
                    if (!recipe) return null
                    const hasMissing = !useStore.getState().isRecipeAvailable(rid)
                    return (
                      <div key={rid} className={cn('flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg', hasMissing ? 'bg-red-50 border border-red-200' : 'bg-orange-50')}>
                        <span>{recipe.icon}</span>
                        <span className="truncate text-orange-800">{recipe.name}</span>
                        {hasMissing && (
                          <AlertTriangle
                            className="w-3 h-3 text-red-500 flex-shrink-0 cursor-help"
                            onMouseEnter={(e) => handleMissingHover(e, rid)}
                            onMouseLeave={() => setTooltipContent(null)}
                          />
                        )}
                      </div>
                    )
                  })}
                  <div className="space-y-1 pt-1">
                    {[
                      { emoji: '🛒', id: plan.shopperId, label: '买菜' },
                      { emoji: '👨‍🍳', id: plan.cookId, label: '做饭' },
                      { emoji: '🧹', id: plan.cleanerId, label: '收拾' },
                    ].map((role) => (
                      <div key={role.label} className="flex items-center gap-1 text-[10px]">
                        <span>{role.emoji}</span>
                        <span className={cn('px-1.5 py-0.5 rounded-full', role.id ? 'bg-amber-50 text-amber-700' : 'text-orange-300')}>
                          {role.id ? getMemberName(role.id) : '未分配'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-28 text-orange-200">
                  <Plus className="w-6 h-6" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {tooltipContent && (
        <div className="fixed z-50 bg-white border border-red-200 rounded-xl shadow-lg p-2.5 text-xs space-y-1" style={{ left: tooltipContent.x, top: tooltipContent.y }}>
          <p className="font-semibold text-red-600 mb-1">缺少食材:</p>
          {tooltipContent.items.map((item) => (
            <p key={item} className="text-red-500">{item}</p>
          ))}
        </div>
      )}

      {modalDate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-h-[80vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-orange-900">{formatDate(modalDate)} {getDayName(modalDate)}</h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-orange-100 transition-colors">
                <X className="w-4 h-4 text-orange-400" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-orange-500 mb-2">选择菜谱</p>
              <div className="space-y-1.5">
                {recipes.map((r) => {
                  const available = isRecipeAvailable(r.id)
                  const missing = getMissingIngredients(r.id)
                  const selected = formRecipes.includes(r.id)
                  return (
                    <div key={r.id}>
                      <label className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl transition-colors',
                        available ? 'hover:bg-orange-50 cursor-pointer' : 'bg-red-50/60 cursor-not-allowed opacity-60'
                      )}>
                        <input
                          type="checkbox"
                          checked={selected && available}
                          onChange={() => toggleRecipe(r.id)}
                          disabled={!available}
                          className={available ? 'accent-orange-500' : 'accent-red-300'}
                        />
                        <span>{r.icon}</span>
                        <span className={cn('text-sm', available ? 'text-orange-800' : 'text-red-400')}>{r.name}</span>
                        <span className={cn('ml-auto text-xs font-["DM_Sans",system-ui]', available ? 'text-orange-300' : 'text-red-300')}>
                          ¥{r.costPerServing}
                        </span>
                        {!available && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        )}
                      </label>
                      {!available && (
                        <div className="flex flex-wrap gap-1 px-3 pb-1.5">
                          {missing.map((ing) => (
                            <span key={ing.id} className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-500 leading-tight">
                              {ing.name}缺{ing.threshold - ing.stock}{ing.unit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {[
              { label: '🛒 买菜', value: formShopper, setter: setFormShopper },
              { label: '👨‍🍳 做饭', value: formCook, setter: setFormCook },
              { label: '🧹 收拾', value: formCleaner, setter: setFormCleaner },
            ].map((field) => (
              <div key={field.label} className="mb-3">
                <p className="text-xs font-semibold text-orange-500 mb-1">{field.label}</p>
                <select
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 text-sm text-orange-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="">未分配</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-[1.02] transition-all">
                保存
              </button>
              {dayPlans.find((p) => p.date === modalDate) && (
                <button
                  onClick={() => { removeDayPlan(modalDate); closeModal() }}
                  className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 transition-colors"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
