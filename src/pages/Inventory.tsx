import { useState } from 'react'
import { useStore } from '@/store'
import { INGREDIENT_CATEGORIES, UNITS } from '@/utils'
import { cn } from '@/lib/utils'
import { Plus, Minus, Pencil, Trash2, ShoppingCart, Package, X } from 'lucide-react'
import type { Ingredient } from '@/types'

interface FormData {
  name: string
  category: string
  stock: number
  threshold: number
  unit: string
}

const emptyForm: FormData = { name: '', category: INGREDIENT_CATEGORIES[0], stock: 0, threshold: 1, unit: UNITS[0] }

export default function Inventory() {
  const ingredients = useStore((s) => s.ingredients)
  const addIngredient = useStore((s) => s.addIngredient)
  const updateIngredient = useStore((s) => s.updateIngredient)
  const deleteIngredient = useStore((s) => s.deleteIngredient)
  const getShoppingList = useStore((s) => s.getShoppingList)

  const [mode, setMode] = useState<'inventory' | 'shopping'>('inventory')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [boughtIds, setBoughtIds] = useState<Set<string>>(new Set())

  const shoppingList = getShoppingList()

  const grouped = INGREDIENT_CATEGORIES.map((cat) => ({
    category: cat,
    items: ingredients.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (item: Ingredient) => {
    setEditingId(item.id)
    setForm({ name: item.name, category: item.category, stock: item.stock, threshold: item.threshold, unit: item.unit })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateIngredient(editingId, form)
    } else {
      addIngredient(form)
    }
    setShowForm(false)
  }

  const adjustStock = (id: string, delta: number) => {
    const item = ingredients.find((i) => i.id === id)
    if (item) updateIngredient(id, { stock: Math.max(0, item.stock + delta) })
  }

  const restockAll = () => {
    shoppingList.forEach((item) => {
      updateIngredient(item.id, { stock: item.threshold })
    })
    setBoughtIds(new Set())
  }

  const handleBought = (item: Ingredient) => {
    updateIngredient(item.id, { stock: item.threshold })
    setBoughtIds((prev) => new Set(prev).add(item.id))
  }

  return (
    <div className="space-y-5">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#78350F]">食材库存</h1>
          <div className="flex gap-2">
            <button onClick={openAdd} className="flex items-center gap-1 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors text-sm font-medium">
              <Plus size={16} />添加食材
            </button>
            <button onClick={() => setMode(mode === 'inventory' ? 'shopping' : 'inventory')} className={cn('flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all', mode === 'shopping' ? 'bg-[#F97316] text-white' : 'bg-white text-[#78350F] border border-[#FDBA74]')}>
              <ShoppingCart size={16} />补货清单
            </button>
          </div>
        </div>

        {mode === 'inventory' ? (
          <div className="space-y-4 transition-opacity duration-300">
            {grouped.map(({ category, items }) => (
              <div key={category}>
                <h2 className="text-sm font-semibold text-[#9A3412] mb-2 px-1">{category}</h2>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-orange-100">
                  {items.map((item, idx) => {
                    const low = item.stock < item.threshold
                    return (
                      <div key={item.id} className={cn('flex items-center gap-3 px-4 py-3 border-b border-orange-50 last:border-b-0', idx % 2 === 1 && 'bg-orange-50/40', low && 'bg-red-50/50')}>
                        <span className="font-medium text-[#78350F] min-w-[60px]">{item.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-[#9A3412]">{item.category}</span>
                        <span className={cn('text-sm font-medium min-w-[60px]', low ? 'text-red-500' : 'text-[#78350F]')}>{item.stock} {item.unit}</span>
                        <span className="text-xs text-[#9A3412]/60 min-w-[50px]">≥{item.threshold}</span>
                        {low ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">⚠️ 不足</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓</span>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <button onClick={() => adjustStock(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-orange-100 hover:bg-orange-200 text-[#78350F] transition-colors"><Minus size={14} /></button>
                          <button onClick={() => adjustStock(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-orange-100 hover:bg-orange-200 text-[#78350F] transition-colors"><Plus size={14} /></button>
                          <button onClick={() => openEdit(item)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-orange-100 text-[#9A3412] transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => deleteIngredient(item.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-100 text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {grouped.length === 0 && (
              <div className="text-center py-12 text-[#9A3412]/50">
                <Package size={40} className="mx-auto mb-2 opacity-40" />
                <p>暂无食材，点击"添加食材"开始</p>
              </div>
            )}
          </div>
        ) : (
          <div className="transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
              {shoppingList.length === 0 ? (
                <div className="text-center py-12 text-[#9A3412]/50">
                  <ShoppingCart size={40} className="mx-auto mb-2 opacity-40" />
                  <p>库存充足，无需补货 🎉</p>
                </div>
              ) : (
                <>
                  {shoppingList.map((item) => {
                    const needed = item.threshold - item.stock
                    const bought = boughtIds.has(item.id)
                    return (
                      <div key={item.id} className={cn('flex items-center gap-3 px-4 py-3 border-b border-orange-50 last:border-b-0 transition-colors', bought && 'opacity-50')}>
                        <input type="checkbox" checked={bought} onChange={() => handleBought(item)} className="w-4 h-4 accent-[#F97316]" />
                        <span className={cn('font-medium text-[#78350F]', bought && 'line-through')}>{item.name}</span>
                        <span className="text-sm text-red-500 ml-auto">需补 {needed} {item.unit}</span>
                      </div>
                    )
                  })}
                  <div className="px-4 py-3 bg-orange-50/50">
                    <button onClick={restockAll} className="w-full py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors font-medium text-sm">一键补货</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#78350F]">{editingId ? '编辑食材' : '添加食材'}</h2>
                <button onClick={() => setShowForm(false)} className="text-[#9A3412]/50 hover:text-[#78350F]"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#78350F] mb-1">名称</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 text-[#78350F]" placeholder="食材名称" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#78350F] mb-1">分类</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 text-[#78350F] bg-white">
                    {INGREDIENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#78350F] mb-1">库存</label>
                    <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 text-[#78350F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#78350F] mb-1">最低需求</label>
                    <input type="number" min={0} value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 text-[#78350F]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#78350F] mb-1">单位</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 text-[#78350F] bg-white">
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-orange-200 text-[#78350F] hover:bg-orange-50 transition-colors font-medium text-sm">取消</button>
                <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors font-medium text-sm">保存</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
