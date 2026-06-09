import { useState } from 'react'
import { Plus, Clock, JapaneseYen, Pencil, Trash2, X } from 'lucide-react'
import { useStore } from '@/store'
import { RECIPE_ICONS, PREFERENCE_OPTIONS } from '@/utils'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/types'

const PREF_COLORS: Record<string, string> = {
  '咸口': 'bg-red-100 text-red-700',
  '甜口': 'bg-pink-100 text-pink-700',
  '辣': 'bg-orange-100 text-orange-700',
  '清淡': 'bg-green-100 text-green-700',
  '快节奏': 'bg-blue-100 text-blue-700',
  '养胃': 'bg-purple-100 text-purple-700',
}

interface FormState {
  name: string
  icon: string
  prepTime: number
  costPerServing: number
  suitableFor: string[]
  ingredientIds: string[]
}

const emptyForm: FormState = {
  name: '',
  icon: RECIPE_ICONS[0],
  prepTime: 10,
  costPerServing: 5,
  suitableFor: [],
  ingredientIds: [],
}

export default function Recipes() {
  const { recipes, ingredients, addRecipe, updateRecipe, deleteRecipe, isRecipeAvailable } = useStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDrawerOpen(true)
  }

  const openEdit = (id: string) => {
    const r = recipes.find((x: Recipe) => x.id === id)
    if (!r) return
    setEditingId(id)
    setForm({
      name: r.name,
      icon: r.icon,
      prepTime: r.prepTime,
      costPerServing: r.costPerServing,
      suitableFor: [...r.suitableFor],
      ingredientIds: [...r.ingredientIds],
    })
    setDrawerOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateRecipe(editingId, form)
    } else {
      addRecipe(form)
    }
    setDrawerOpen(false)
  }

  const toggleSuitable = (pref: string) => {
    setForm((f) => ({
      ...f,
      suitableFor: f.suitableFor.includes(pref)
        ? f.suitableFor.filter((p) => p !== pref)
        : [...f.suitableFor, pref],
    }))
  }

  const addIngredientRow = () => {
    setForm((f) => ({ ...f, ingredientIds: [...f.ingredientIds, ''] }))
  }

  const removeIngredientRow = (idx: number) => {
    setForm((f) => ({ ...f, ingredientIds: f.ingredientIds.filter((_, i) => i !== idx) }))
  }

  const setIngredientAt = (idx: number, id: string) => {
    setForm((f) => ({
      ...f,
      ingredientIds: f.ingredientIds.map((v, i) => (i === idx ? id : v)),
    }))
  }

  const getIngName = (id: string) => ingredients.find((i: { id: string; name: string }) => i.id === id)?.name ?? ''

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#78350F]">早餐菜谱</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-gradient-to-r from-orange-400 to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md active:scale-95 transition-transform"
        >
          <Plus size={16} />
          添加菜谱
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe: Recipe) => {
            const available = isRecipeAvailable(recipe.id)
            return (
              <div
                key={recipe.id}
                className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-3xl">
                    {recipe.icon}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(recipe.id)}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-orange-50 hover:text-[#F97316]"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-bold text-[#78350F]">{recipe.name}</h3>

                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs text-[#78350F]">
                    <Clock size={12} />
                    {recipe.prepTime}分钟
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs text-[#78350F]">
                    <JapaneseYen size={12} />
                    ¥{recipe.costPerServing}/份
                  </span>
                </div>

                <div className="mb-2 flex flex-wrap gap-1">
                  {recipe.suitableFor.map((pref: string) => (
                    <span
                      key={pref}
                      className={cn('rounded-full px-2 py-0.5 text-xs font-medium', PREF_COLORS[pref] ?? 'bg-gray-100 text-gray-600')}
                    >
                      {pref}
                    </span>
                  ))}
                </div>

                <p className="mb-2 text-xs text-gray-400">
                  {recipe.ingredientIds.map(getIngName).join('、')}
                </p>

                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-block h-2 w-2 rounded-full',
                      available ? 'bg-green-500' : 'bg-red-500'
                    )}
                  />
                  <span className={cn('text-xs', available ? 'text-green-600' : 'text-red-500')}>
                    {available ? '食材充足' : '食材不足'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-white shadow-xl transition-transform">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-lg font-bold text-[#78350F]">
                {editingId ? '编辑菜谱' : '添加菜谱'}
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#78350F]">名称</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#78350F]">图标</label>
                <div className="grid grid-cols-6 gap-2">
                  {RECIPE_ICONS.map((icon: string) => (
                    <button
                      key={icon}
                      onClick={() => setForm((f) => ({ ...f, icon }))}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg text-xl transition',
                        form.icon === icon
                          ? 'bg-[#F97316] text-white shadow-md'
                          : 'bg-orange-50 hover:bg-orange-100'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#78350F]">准备时间(分钟)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.prepTime}
                    onChange={(e) => setForm((f) => ({ ...f, prepTime: +e.target.value }))}
                    className="w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#78350F]">每份成本(元)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.costPerServing}
                    onChange={(e) => setForm((f) => ({ ...f, costPerServing: +e.target.value }))}
                    className="w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#78350F]">适合口味</label>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_OPTIONS.map((pref: string) => (
                    <button
                      key={pref}
                      onClick={() => toggleSuitable(pref)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition',
                        form.suitableFor.includes(pref)
                          ? 'bg-[#F97316] text-white'
                          : 'bg-orange-50 text-[#78350F] hover:bg-orange-100'
                      )}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-[#78350F]">食材</label>
                  <button
                    onClick={addIngredientRow}
                    className="flex items-center gap-0.5 text-xs text-[#F97316] hover:underline"
                  >
                    <Plus size={12} /> 添加
                  </button>
                </div>
                <div className="space-y-2">
                  {form.ingredientIds.map((ingId, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={ingId}
                        onChange={(e) => setIngredientAt(idx, e.target.value)}
                        className="flex-1 rounded-lg border border-orange-200 px-2 py-1.5 text-sm outline-none focus:border-[#F97316]"
                      >
                        <option value="">选择食材</option>
                        {ingredients.map((ing: { id: string; name: string }) => (
                          <option key={ing.id} value={ing.id}>{ing.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeIngredientRow(idx)}
                        className="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t px-5 py-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 rounded-lg border border-orange-200 py-2 text-sm font-medium text-[#78350F] hover:bg-orange-50"
              >
                取消
              </button>
              <button
                onClick={save}
                className="flex-1 rounded-lg bg-[#F97316] py-2 text-sm font-medium text-white shadow-md hover:bg-orange-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
