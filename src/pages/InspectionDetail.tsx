import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Check, X, Plus, Trash2, Camera, Clock, ArrowLeft, AlertTriangle, Wallet, FileWarning } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS, CATEGORY_ICONS, SUPPLY_OPTIONS } from '@/types'
import type { CheckCategory } from '@/types'

const CATEGORIES: CheckCategory[] = ['bedding', 'bathroom', 'kitchen', 'floor', 'garbage', 'fridge', 'doorLock', 'remote']

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: '待清洁', cls: 'bg-warm-200 text-warm-700' },
  cleaning: { label: '清洁中', cls: 'bg-sage-200 text-sage-700' },
  rework: { label: '返工中', cls: 'bg-coral-200 text-coral-700' },
  completed: { label: '已完成', cls: 'bg-sage-100 text-sage-600' },
  reviewing: { label: '审核中', cls: 'bg-warm-100 text-warm-600' },
  approved: { label: '已通过', cls: 'bg-sage-300 text-sage-800' },
}

function useTimer(startedAt: string | null) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!startedAt) return
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0')
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
  const s = String(elapsed % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function CategoryGroup({ category, items, onToggle, onNote }: {
  category: CheckCategory
  items: { id: string; name: string; passed: boolean | null; note: string }[]
  onToggle: (id: string, passed: boolean) => void
  onNote: (id: string, note: string) => void
}) {
  const [open, setOpen] = useState(false)
  const passedCount = items.filter((i) => i.passed !== null).length
  return (
    <div className="border border-warm-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-warm-50 hover:bg-warm-100 transition">
        <span className="flex items-center gap-2">
          <span>{CATEGORY_ICONS[category]}</span>
          <span className="font-serif font-semibold text-warm-800">{CATEGORY_LABELS[category]}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', passedCount === items.length ? 'bg-sage-200 text-sage-700' : 'bg-warm-200 text-warm-600')}>
            {passedCount}/{items.length}
          </span>
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-warm-500" /> : <ChevronRight className="w-4 h-4 text-warm-500" />}
      </button>
      {open && (
        <div className="divide-y divide-warm-100">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-warm-800">{item.name}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => onToggle(item.id, true)} className={cn('w-7 h-7 rounded-full flex items-center justify-center transition', item.passed === true ? 'bg-sage-500 text-white' : 'bg-warm-100 text-warm-400 hover:bg-sage-200')}>
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => onToggle(item.id, false)} className={cn('w-7 h-7 rounded-full flex items-center justify-center transition', item.passed === false ? 'bg-coral-500 text-white' : 'bg-warm-100 text-warm-400 hover:bg-coral-200')}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {item.passed === false && (
                <input value={item.note} onChange={(e) => onNote(item.id, e.target.value)} placeholder="备注问题..." className="mt-1.5 w-full text-xs border border-warm-200 rounded px-2 py-1 focus:outline-none focus:border-coral-400" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PhotoSection({ title, photos, onAdd, onRemove }: {
  title: string
  photos: { id: string; url: string }[]
  onAdd: () => void
  onRemove: (id: string) => void
}) {
  return (
    <div>
      <h3 className="font-serif font-semibold text-warm-800 mb-2">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div key={p.id} className="relative aspect-video rounded-lg overflow-hidden border border-warm-200">
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => onRemove(p.id)} className="absolute top-1 right-1 w-5 h-5 bg-coral-500 text-white rounded-full flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button onClick={onAdd} className="aspect-video border-2 border-dashed border-warm-300 rounded-lg flex flex-col items-center justify-center text-warm-400 hover:border-warm-500 hover:text-warm-600 transition">
          <Camera className="w-5 h-5" />
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getInspection = useStore((s) => s.getInspection)
  const getProperty = useStore((s) => s.getProperty)
  const getStaff = useStore((s) => s.getStaff)
  const startCleaning = useStore((s) => s.startCleaning)
  const completeCleaning = useStore((s) => s.completeCleaning)
  const updateCheckItem = useStore((s) => s.updateCheckItem)
  const addPhoto = useStore((s) => s.addPhoto)
  const removePhoto = useStore((s) => s.removePhoto)
  const addSupplyRecord = useStore((s) => s.addSupplyRecord)
  const removeSupplyRecord = useStore((s) => s.removeSupplyRecord)

  const [supplyItem, setSupplyItem] = useState(SUPPLY_OPTIONS[0])
  const [supplyQty, setSupplyQty] = useState(1)

  const inspection = getInspection(id!)
  const property = inspection ? getProperty(inspection.propertyId) : undefined
  const cleaner = inspection ? getStaff(inspection.cleanerId) : undefined
  const timer = useTimer(inspection?.startedAt ?? null)

  if (!inspection || !property) return <div className="p-6 text-warm-500">未找到检查记录</div>

  const allEvaluated = inspection.checkItems.every((i) => i.passed !== null)
  const statusInfo = STATUS_MAP[inspection.status] ?? { label: inspection.status, cls: 'bg-warm-200 text-warm-600' }
  const beforePhotos = inspection.photos.filter((p) => p.type === 'before')
  const afterPhotos = inspection.photos.filter((p) => p.type === 'after')

  const handleToggle = (itemId: string, passed: boolean) => updateCheckItem(inspection.id, itemId, passed)
  const handleNote = (itemId: string, note: string) => updateCheckItem(inspection.id, itemId, inspection.checkItems.find((c) => c.id === itemId)!.passed!, note)
  const handleAddPhoto = (type: 'before' | 'after') => addPhoto(inspection.id, type, `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clean+hotel+room+spotless+realistic&image_size=landscape_16_9`)
  const handleAddSupply = () => { addSupplyRecord(inspection.id, supplyItem, supplyQty); setSupplyQty(1) }

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      <header className="sticky top-0 z-10 bg-warm-800 text-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif font-bold text-lg truncate">{property.name}</h1>
            <p className="text-xs text-warm-300">{cleaner?.name}</p>
          </div>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', statusInfo.cls)}>{statusInfo.label}</span>
        </div>
        {inspection.startedAt && (
          <div className="mt-2 flex items-center gap-2 text-sm text-warm-200">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{timer}</span>
          </div>
        )}
      </header>

      {inspection.status === 'rework' && inspection.reworkItems.length > 0 && (
        <div className="px-4 pt-3">
          <div className="bg-coral-50 border border-coral-300 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-coral-100/60 flex items-center gap-2 border-b border-coral-200">
              <AlertTriangle className="w-4 h-4 text-coral-600" />
              <span className="font-serif font-bold text-coral-700 text-sm">房东返工通知</span>
              <span className="ml-auto text-xs text-coral-500">{inspection.reworkItems.length}项需返工</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                {inspection.reworkItems.map((ri) => {
                  const ci = inspection.checkItems.find((c) => c.id === ri.checkItemId)
                  if (!ci) return null
                  return (
                    <div key={ri.id} className="flex items-start gap-2">
                      <span className="text-sm mt-px">{CATEGORY_ICONS[ci.category]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-warm-800 font-medium">{ci.name}</div>
                        {ri.reason && <div className="text-xs text-warm-500 mt-0.5">原因：{ri.reason}</div>}
                        <div className="flex items-center gap-2 mt-0.5">
                          {ri.deductionReason && <span className="text-xs text-coral-600">{ri.deductionReason}</span>}
                          {(ri.deductionAmount || 0) > 0 && <span className="text-xs font-bold text-coral-600">-¥{(ri.deductionAmount || 0).toFixed(2).replace(/\.?0+$/, '')}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-coral-200">
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const rm = new Map<string, number>()
                    inspection.reworkItems.forEach((ri) => { if (ri.deductionReason) rm.set(ri.deductionReason, (rm.get(ri.deductionReason) || 0) + 1) })
                    return [...rm.entries()].map(([r, c]) => (
                      <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-coral-100 rounded-full text-[11px] text-coral-600">
                        <FileWarning className="w-2.5 h-2.5" />{r} ×{c}
                      </span>
                    ))
                  })()}
                </div>
                <div className="flex items-center gap-1.5 text-coral-700">
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="font-bold text-sm">¥{inspection.reworkItems.reduce((s, ri) => s + (ri.deductionAmount || 0), 0).toFixed(2).replace(/\.?0+$/, '')}</span>
                  <span className="text-xs text-coral-500">扣费合计</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 space-y-6">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-warm-900 text-lg">检查清单</h2>
          {CATEGORIES.map((cat) => (
            <CategoryGroup key={cat} category={cat} items={inspection.checkItems.filter((i) => i.category === cat)} onToggle={handleToggle} onNote={handleNote} />
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="font-serif font-bold text-warm-900 text-lg">现场照片</h2>
          <PhotoSection title="🧹 清洁前" photos={beforePhotos} onAdd={() => handleAddPhoto('before')} onRemove={(pid) => removePhoto(inspection.id, pid)} />
          <PhotoSection title="✨ 清洁后" photos={afterPhotos} onAdd={() => handleAddPhoto('after')} onRemove={(pid) => removePhoto(inspection.id, pid)} />
        </section>

        <section>
          <h2 className="font-serif font-bold text-warm-900 text-lg mb-2">耗材补充</h2>
          {inspection.supplyRecords.length > 0 && (
            <div className="mb-3 border border-warm-200 rounded-lg overflow-hidden">
              {inspection.supplyRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-3 py-2 border-b border-warm-100 last:border-b-0">
                  <span className="text-sm text-warm-800">{r.itemName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-warm-600">×{r.quantity}</span>
                    <button onClick={() => removeSupplyRecord(inspection.id, r.id)} className="text-coral-500 hover:text-coral-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <select value={supplyItem} onChange={(e) => setSupplyItem(e.target.value)} className="flex-1 border border-warm-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-warm-400">
              {SUPPLY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input type="number" min={1} value={supplyQty} onChange={(e) => setSupplyQty(Math.max(1, Number(e.target.value)))} className="w-16 border border-warm-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-warm-400" />
            <button onClick={handleAddSupply} className="px-3 py-2 bg-warm-700 text-white rounded-lg hover:bg-warm-800 transition"><Plus className="w-4 h-4" /></button>
          </div>
        </section>
      </div>

      {['pending', 'cleaning', 'rework'].includes(inspection.status) && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur border-t border-warm-200">
          {inspection.status === 'pending' ? (
            <button onClick={() => startCleaning(inspection.id)} className="w-full py-3 rounded-xl bg-warm-700 text-white font-serif font-bold text-lg hover:bg-warm-800 transition">开始清洁</button>
          ) : (
            <button disabled={!allEvaluated} onClick={() => completeCleaning(inspection.id)} className={cn('w-full py-3 rounded-xl font-serif font-bold text-lg transition', allEvaluated ? 'bg-sage-600 text-white hover:bg-sage-700' : 'bg-warm-200 text-warm-400 cursor-not-allowed')}>提交完成</button>
          )}
        </div>
      )}
    </div>
  )
}
