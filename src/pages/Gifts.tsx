import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { GIFT_CATEGORY_LABELS, GIFT_CATEGORY_COLORS, PURCHASE_CHANNEL_LABELS, type Gift, type GiftCategory, type PurchaseChannel } from '@/types'
import { Plus, Search, Edit2, Trash2, X, Check, ShoppingCart, Package } from 'lucide-react'

const CATEGORIES: GiftCategory[] = ['food', 'drink', 'health', 'fruit', 'tobacco_alcohol', 'other']
const CATEGORY_BORDER_COLORS: Record<GiftCategory, string> = {
  food: 'border-t-orange-500',
  drink: 'border-t-blue-500',
  health: 'border-t-green-500',
  fruit: 'border-t-pink-500',
  tobacco_alcohol: 'border-t-purple-500',
  other: 'border-t-stone-400',
}

const emptyGift: Omit<Gift, 'id'> = {
  name: '', category: 'food', unitPrice: 0, quantity: 1,
  suitableFor: '', shelfLife: '', purchaseChannel: 'online', purchased: false,
}

function getShelfLifeCountdown(shelfLife: string) {
  if (!shelfLife) return null
  const diff = Math.ceil((new Date(shelfLife).getTime() - Date.now()) / (86400000))
  if (diff < 0) return { text: '已过期', color: 'text-red-600' }
  if (diff <= 7) return { text: `${diff}天`, color: 'text-red-500' }
  if (diff <= 30) return { text: `${diff}天`, color: 'text-amber-500' }
  return { text: `${diff}天`, color: 'text-green-600' }
}

export default function Gifts() {
  const { gifts, addGift, updateGift, deleteGift } = useStore()
  const [category, setCategory] = useState<GiftCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [slideOpen, setSlideOpen] = useState(false)
  const [editing, setEditing] = useState<Gift | null>(null)
  const [form, setForm] = useState<Omit<Gift, 'id'>>(emptyGift)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = gifts.filter((g) => {
    if (category !== 'all' && g.category !== category) return false
    if (search && !g.name.includes(search)) return false
    return true
  })

  const openAdd = () => {
    setEditing(null)
    setForm(emptyGift)
    setSlideOpen(true)
  }

  const openEdit = (g: Gift) => {
    setEditing(g)
    const { id, ...rest } = g
    setForm(rest)
    setSlideOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editing) {
      updateGift({ ...form, id: editing.id })
    } else {
      addGift({ ...form, id: Date.now().toString() + Math.random().toString(36).slice(2) })
    }
    setSlideOpen(false)
  }

  const handleDelete = () => {
    if (deleteId) { deleteGift(deleteId); setDeleteId(null) }
  }

  const togglePurchased = (g: Gift) => {
    updateGift({ ...g, purchased: !g.purchased })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索礼品名称..."
              className="w-full pl-9 pr-4 py-2 bg-stone-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          <button onClick={() => setCategory('all')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${category === 'all' ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
            全部
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${category === c ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
              {GIFT_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {filtered.map((g) => {
          const countdown = getShelfLifeCountdown(g.shelfLife)
          return (
            <div key={g.id} className={`bg-white rounded-xl shadow-sm border-t-4 ${CATEGORY_BORDER_COLORS[g.category]} p-4 relative`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-stone-800">{g.name}</h3>
                <button onClick={() => togglePurchased(g)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${g.purchased ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {g.purchased ? <><Check className="w-3 h-3" />已购</> : <><ShoppingCart className="w-3 h-3" />未购</>}
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs ${GIFT_CATEGORY_COLORS[g.category]}`}>
                  {GIFT_CATEGORY_LABELS[g.category]}
                </span>
                <span className="text-xs text-stone-400">{PURCHASE_CHANNEL_LABELS[g.purchaseChannel]}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-sm text-stone-600">
                <div className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-amber-500" />单价: ¥{g.unitPrice}</div>
                <div>数量: {g.quantity}</div>
                {g.suitableFor && <div className="col-span-2">适合: {g.suitableFor}</div>}
                {countdown && <div className={`col-span-2 ${countdown.color}`}>保质期: {countdown.text}</div>}
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-amber-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(g.id)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-stone-400">暂无礼品数据</div>
        )}
      </div>

      <button onClick={openAdd}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30">
        <Plus className="w-6 h-6" />
      </button>

      {slideOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSlideOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl slide-over flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-stone-800">{editing ? '编辑礼品' : '添加礼品'}</h2>
              <button onClick={() => setSlideOpen(false)} className="p-1 hover:bg-stone-100 rounded"><X className="w-5 h-5 text-stone-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">名称</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">类别</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as GiftCategory })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{GIFT_CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">单价</label>
                  <input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: +e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">数量</label>
                  <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">适合人群</label>
                <input value={form.suitableFor} onChange={(e) => setForm({ ...form, suitableFor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">保质期</label>
                <input type="date" value={form.shelfLife} onChange={(e) => setForm({ ...form, shelfLife: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">购买渠道</label>
                <select value={form.purchaseChannel} onChange={(e) => setForm({ ...form, purchaseChannel: e.target.value as PurchaseChannel })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                  {(['online', 'offline', 'homemade'] as PurchaseChannel[]).map((ch) => (
                    <option key={ch} value={ch}>{PURCHASE_CHANNEL_LABELS[ch]}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.purchased} onChange={(e) => setForm({ ...form, purchased: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-red-600 focus:ring-red-500" />
                <label className="text-sm text-stone-700">是否已购买</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t">
              <button onClick={handleSave}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                {editing ? '保存修改' : '添加礼品'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-stone-800 mb-2">确认删除</h3>
            <p className="text-sm text-stone-600 mb-4">确定要删除这个礼品吗？此操作不可撤销。</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-stone-50">取消</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
