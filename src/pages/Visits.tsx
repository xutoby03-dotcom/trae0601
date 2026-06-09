import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { PROXIMITY_LABELS, PROXIMITY_COLORS } from '@/types'
import type { Visit, VisitGift } from '@/types'
import { Plus, CalendarCheck, MapPin, Gift, X, Check, Trash2, ChevronDown, Edit2, DollarSign, Package } from 'lucide-react'

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2)

function getCountdown(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (diff < 0) return { text: `已过${-diff}天`, color: 'text-stone-400' }
  if (diff === 0) return { text: '今天', color: 'text-red-600' }
  if (diff <= 3) return { text: `${diff}天后`, color: 'text-red-500' }
  return { text: `${diff}天后`, color: 'text-amber-600' }
}

export default function Visits() {
  const { visits, visitGifts, relatives, gifts, addVisit, updateVisit, deleteVisit, addVisitGift, deleteVisitGift } = useStore()
  const [tab, setTab] = useState<'pending' | 'visited'>('pending')
  const [panelOpen, setPanelOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formRelativeId, setFormRelativeId] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formGiftItems, setFormGiftItems] = useState<{ giftId: string; quantity: number }[]>([])

  const [editVisit, setEditVisit] = useState<Visit | null>(null)

  const pending = visits.filter((v) => v.status === 'pending').sort((a, b) => a.visitDate.localeCompare(b.visitDate))
  const visited = visits.filter((v) => v.status === 'visited').sort((a, b) => b.visitDate.localeCompare(a.visitDate))

  const openAddPanel = () => {
    setFormRelativeId(relatives[0]?.id ?? '')
    setFormDate(new Date().toISOString().slice(0, 10))
    setFormGiftItems([])
    setPanelOpen(true)
  }

  const addGiftItem = () => {
    if (gifts.length === 0) return
    setFormGiftItems([...formGiftItems, { giftId: gifts[0].id, quantity: 1 }])
  }

  const removeGiftItem = (idx: number) => {
    setFormGiftItems(formGiftItems.filter((_, i) => i !== idx))
  }

  const updateGiftItem = (idx: number, field: 'giftId' | 'quantity', val: string | number) => {
    const updated = [...formGiftItems]
    if (field === 'giftId') updated[idx].giftId = val as string
    else updated[idx].quantity = Math.max(1, val as number)
    setFormGiftItems(updated)
  }

  const handleCreate = () => {
    if (!formRelativeId || !formDate) return
    const visitId = genId()
    addVisit({ id: visitId, relativeId: formRelativeId, visitDate: formDate, status: 'pending', returnGift: '', childRedEnvelope: 0, notes: '' })
    formGiftItems.forEach((item) => {
      addVisitGift({ id: genId(), visitId, giftId: item.giftId, quantity: item.quantity })
    })
    setPanelOpen(false)
  }

  const markVisited = (v: Visit) => {
    updateVisit({ ...v, status: 'visited' })
  }

  const handleSaveVisited = (v: Visit) => {
    updateVisit(v)
    setEditVisit(null)
  }

  const confirmDelete = () => {
    if (deleteId) { deleteVisit(deleteId); setDeleteId(null) }
  }

  const getGiftsForVisit = (visitId: string) =>
    visitGifts.filter((vg) => vg.visitId === visitId).map((vg) => ({ ...vg, gift: gifts.find((g) => g.id === vg.giftId) }))

  const getTotalCost = (visitId: string) =>
    getGiftsForVisit(visitId).reduce((sum, vg) => sum + (vg.gift ? vg.gift.unitPrice * vg.quantity : 0), 0)

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur px-4 pt-4 pb-2 shadow-sm">
        <div className="flex gap-2">
          {([['pending', '待拜访'], ['visited', '已拜访']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tab === key ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-600'}`}>
              {label}
              <span className="ml-1.5 text-xs opacity-80">{key === 'pending' ? pending.length : visited.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-3 space-y-3">
        {tab === 'pending' && pending.map((v) => {
          const rel = relatives.find((r) => r.id === v.relativeId)
          if (!rel) return null
          const cd = getCountdown(v.visitDate)
          const vgs = getGiftsForVisit(v.id)
          const total = getTotalCost(v.id)
          const overBudget = rel.budget > 0 && total > rel.budget
          return (
            <div key={v.id} className="bg-white rounded-xl border-l-4 border-l-red-500 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-stone-800">{rel.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${PROXIMITY_COLORS[rel.proximity]}`}>{PROXIMITY_LABELS[rel.proximity]}</span>
                  </div>
                  {rel.address && (
                    <div className="flex items-center gap-1 mt-1 text-stone-500 text-sm"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{rel.address}</span></div>
                  )}
                  <div className={`flex items-center gap-1 mt-1.5 text-sm ${cd.color}`}>
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>{v.visitDate}</span>
                    <span className="font-medium">({cd.text})</span>
                  </div>
                </div>
                <button onClick={() => setDeleteId(v.id)} className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              {vgs.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-1 text-xs font-medium text-stone-500"><Gift className="w-3.5 h-3.5" />礼品清单</div>
                  {vgs.map((vg) => (
                    <div key={vg.id} className="flex items-center justify-between text-sm pl-5">
                      <span className={vg.gift && !vg.gift.purchased ? 'text-red-500' : 'text-stone-700'}>
                        {vg.gift?.name ?? '未知'} × {vg.quantity}
                        {vg.gift && !vg.gift.purchased && <span className="text-xs ml-1">(未购)</span>}
                      </span>
                      <span className="text-stone-400">¥{vg.gift ? vg.gift.unitPrice * vg.quantity : 0}</span>
                    </div>
                  ))}
                  <div className={`flex items-center justify-between text-sm font-medium pl-5 pt-1 border-t border-stone-100 ${overBudget ? 'text-red-600' : 'text-stone-700'}`}>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />合计</span>
                    <span>¥{total}{rel.budget > 0 ? ` / ¥${rel.budget}` : ''}</span>
                  </div>
                </div>
              )}
              <button onClick={() => markVisited(v)}
                className="mt-3 w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1">
                <Check className="w-4 h-4" />标记为已拜访
              </button>
            </div>
          )
        })}

        {tab === 'visited' && visited.map((v) => {
          const rel = relatives.find((r) => r.id === v.relativeId)
          const isEditing = editVisit?.id === v.id
          const current = isEditing ? editVisit! : v
          return (
            <div key={v.id} className="bg-white rounded-xl border-l-4 border-l-green-500 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-stone-800">{rel?.title ?? '未知'}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-stone-500 text-sm"><CalendarCheck className="w-3.5 h-3.5" />{v.visitDate}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditVisit({ ...v })} className="p-2 rounded-lg hover:bg-stone-100 text-stone-400"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(v.id)} className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">回礼</label>
                  <input value={current.returnGift} onChange={(e) => setEditVisit({ ...current, returnGift: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-stone-50 disabled:text-stone-700" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">小孩红包（元）</label>
                  <input type="number" value={current.childRedEnvelope || ''} onChange={(e) => setEditVisit({ ...current, childRedEnvelope: Number(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-stone-50 disabled:text-stone-700" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">备注</label>
                  <input value={current.notes} onChange={(e) => setEditVisit({ ...current, notes: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-stone-50 disabled:text-stone-700" />
                </div>
              </div>
              {isEditing && (
                <button onClick={() => handleSaveVisited(current)}
                  className="mt-3 w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" />保存记录
                </button>
              )}
            </div>
          )
        })}

        {(tab === 'pending' ? pending : visited).length === 0 && (
          <div className="text-center py-16 text-stone-400">{tab === 'pending' ? '暂无待拜访计划' : '暂无已拜访记录'}</div>
        )}
      </div>

      <button onClick={openAddPanel}
        className="fixed bottom-8 right-6 z-30 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
        <Plus className="w-6 h-6" />
      </button>

      {deleteId && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 mx-6 w-80 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-stone-800 font-medium text-center">确认删除该拜访计划？</p>
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
              <h2 className="text-lg font-bold text-stone-800">新建拜访计划</h2>
              <button onClick={() => setPanelOpen(false)} className="p-1 rounded-lg hover:bg-stone-100"><X className="w-5 h-5 text-stone-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">选择亲友</label>
                <select value={formRelativeId} onChange={(e) => setFormRelativeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                  {relatives.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">拜访日期</label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-stone-700">携带礼品</label>
                  <button onClick={addGiftItem} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-0.5"><Plus className="w-3 h-3" />添加</button>
                </div>
                <div className="space-y-2">
                  {formGiftItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select value={item.giftId} onChange={(e) => updateGiftItem(idx, 'giftId', e.target.value)}
                        className="flex-1 px-2 py-2 rounded-lg bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                        {gifts.map((g) => <option key={g.id} value={g.id}>{g.name} (¥{g.unitPrice})</option>)}
                      </select>
                      <input type="number" min={1} value={item.quantity} onChange={(e) => updateGiftItem(idx, 'quantity', +e.target.value)}
                        className="w-16 px-2 py-2 rounded-lg bg-stone-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-400" />
                      <button onClick={() => removeGiftItem(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {formGiftItems.length === 0 && <div className="text-xs text-stone-400 text-center py-2">点击上方"添加"选择礼品</div>}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-stone-100">
              <button onClick={handleCreate}
                className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors">
                创建计划
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
