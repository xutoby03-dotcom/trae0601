import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { PROXIMITY_LABELS, PROXIMITY_COLORS, type Relative, type Proximity } from '@/types'
import { Plus, Search, MapPin, Edit2, Trash2, X, DollarSign, AlertCircle } from 'lucide-react'

const BORDER_COLORS: Record<Proximity, string> = {
  close: 'border-l-red-500',
  normal: 'border-l-amber-500',
  distant: 'border-l-stone-400',
}

const emptyForm = (): Relative => ({
  id: '',
  title: '',
  address: '',
  proximity: 'normal',
  lastYearGift: '',
  dietaryRestrictions: '',
  budget: 0,
})

type Filter = 'all' | Proximity

export default function Relatives() {
  const { relatives, addRelative, updateRelative, deleteRelative } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [panelOpen, setPanelOpen] = useState(false)
  const [form, setForm] = useState<Relative>(emptyForm())
  const [editing, setEditing] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = relatives.filter((r) => {
    if (filter !== 'all' && r.proximity !== filter) return false
    if (search && !r.title.includes(search)) return false
    return true
  })

  const openAdd = () => {
    setForm(emptyForm())
    setEditing(false)
    setPanelOpen(true)
  }

  const openEdit = (r: Relative) => {
    setForm({ ...r })
    setEditing(true)
    setPanelOpen(true)
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    if (editing) {
      updateRelative(form)
    } else {
      addRelative({ ...form, id: Date.now().toString() + Math.random().toString(36).slice(2) })
    }
    setPanelOpen(false)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteRelative(deleteId)
      setDeleteId(null)
    }
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'close', label: '近亲' },
    { key: 'normal', label: '一般' },
    { key: 'distant', label: '远亲' },
  ]

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur px-4 pt-4 pb-2 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索称呼..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === t.key ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-3 space-y-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={`bg-white rounded-xl border-l-4 ${BORDER_COLORS[r.proximity]} p-4 shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-stone-800">{r.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${PROXIMITY_COLORS[r.proximity]}`}>
                    {PROXIMITY_LABELS[r.proximity]}
                  </span>
                </div>
                {r.address && (
                  <div className="flex items-center gap-1 mt-1.5 text-stone-500 text-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{r.address}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-500">
                  {r.lastYearGift && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />去年: {r.lastYearGift}
                    </span>
                  )}
                  {r.dietaryRestrictions && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />忌口: {r.dietaryRestrictions}
                    </span>
                  )}
                  {r.budget > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />预算: ¥{r.budget}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-stone-100 text-stone-400">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(r.id)} className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-400">暂无亲友记录</div>
        )}
      </div>

      <button
        onClick={openAdd}
        className="fixed bottom-8 right-6 z-30 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>

      {deleteId && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 mx-6 w-80 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-stone-800 font-medium text-center">确认删除该亲友？</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-sm">取消</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm">删除</button>
            </div>
          </div>
        </div>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">{editing ? '编辑亲友' : '添加亲友'}</h2>
              <button onClick={() => setPanelOpen(false)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">称呼</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">地址</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">关系远近</label>
                <div className="flex gap-2">
                  {(['close', 'normal', 'distant'] as Proximity[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, proximity: p })}
                      className={`flex-1 py-2 rounded-xl text-sm ${form.proximity === p ? PROXIMITY_COLORS[p] + ' font-medium ring-2 ring-offset-1 ring-red-300' : 'bg-stone-50 text-stone-500'}`}
                    >
                      {PROXIMITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">去年送礼</label>
                <input
                  value={form.lastYearGift}
                  onChange={(e) => setForm({ ...form, lastYearGift: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">忌口</label>
                <input
                  value={form.dietaryRestrictions}
                  onChange={(e) => setForm({ ...form, dietaryRestrictions: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">预算（元）</label>
                <input
                  type="number"
                  value={form.budget || ''}
                  onChange={(e) => setForm({ ...form, budget: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-stone-100">
              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors"
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
