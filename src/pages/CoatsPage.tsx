import { useState, useMemo, useRef } from 'react'
import { useLabStore } from '@/store'
import { STAIN_COLORS, CLASSES } from '@/types'
import type { Coat } from '@/types'
import { Search, Plus, X, Shirt, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const
const STATUS_MAP: Record<Coat['status'], { label: string; bg: string; dot: string }> = {
  available: { label: '可用', bg: 'bg-[#0D7377]/10 text-[#0D7377]', dot: 'bg-[#0D7377]' },
  sent: { label: '已送洗', bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  damaged: { label: '已损坏', bg: 'bg-[#E8590C]/10 text-[#E8590C]', dot: 'bg-[#E8590C]' },
  lost: { label: '已丢失', bg: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
}

function StainDots({ level, interactive, onChange }: { level: number; interactive?: boolean; onChange?: (l: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {STAIN_COLORS.map((c, i) => (
        <span
          key={i}
          onClick={() => interactive && onChange?.(i + 1)}
          className={cn('w-3 h-3 rounded-full transition-all', i < level ? '' : 'bg-gray-200', interactive && 'cursor-pointer hover:scale-125')}
          style={i < level ? { backgroundColor: c } : undefined}
        />
      ))}
    </div>
  )
}

function StatusTag({ status }: { status: Coat['status'] }) {
  const s = STATUS_MAP[status]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', s.bg)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}

const EMPTY_FORM = { size: 'M' as Coat['size'], className: CLASSES[0] as string, studentName: '', stainLevel: 1, photoUrl: '' }

export default function CoatsPage() {
  const { coats, addCoat } = useLabStore()
  const [search, setSearch] = useState('')
  const [fc, setFc] = useState('')
  const [fs, setFs] = useState('')
  const [fst, setFst] = useState('')
  const [selected, setSelected] = useState<Coat | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setForm(f => ({ ...f, photoUrl: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const filtered = useMemo(() => {
    return coats.filter(c => {
      const q = search.toLowerCase()
      if (q && !c.code.toLowerCase().includes(q) && !c.studentName.includes(q)) return false
      if (fc && c.className !== fc) return false
      if (fs && c.size !== fs) return false
      if (fst && c.status !== fst) return false
      return true
    })
  }, [coats, search, fc, fs, fst])

  const nextCode = useMemo(() => {
    const nums = coats.map(c => { const m = c.code.match(/LBC-(\d+)/); return m ? +m[1] : 0 })
    return `LBC-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`
  }, [coats])

  const handleAdd = () => {
    addCoat({ code: nextCode, status: 'available', ...form })
    setForm(EMPTY_FORM)
    setShowNew(false)
  }

  const washHistory = useMemo(() => {
    if (!selected) return []
    const { washBatches, washBatchItems } = useLabStore.getState()
    return washBatchItems.filter(i => i.coatId === selected.id).map(i => ({
      ...i,
      batch: washBatches.find(b => b.id === i.batchId),
    }))
  }, [selected])

  return (
    <div className="p-6 min-h-screen bg-[#F7F8FA]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">实验服档案</h1>
          <p className="text-sm text-[#6B7280] mt-1">管理所有实验服的登记与状态</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#0D7377] text-white rounded-lg text-sm font-medium hover:bg-[#0D7377]/90 transition-colors">
          <Plus className="w-4 h-4" /> 新建档案
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索编号或姓名…" className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30" />
        </div>
        <select value={fc} onChange={e => setFc(e.target.value)} className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-[#6B7280] focus:outline-none">
          <option value="">全部班级</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={fs} onChange={e => setFs(e.target.value)} className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-[#6B7280] focus:outline-none">
          <option value="">全部尺码</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={fst} onChange={e => setFst(e.target.value)} className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-[#6B7280] focus:outline-none">
          <option value="">全部状态</option>
          {(Object.entries(STATUS_MAP) as [Coat['status'], typeof STATUS_MAP[Coat['status']]][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-4">
        {filtered.map(coat => (
          <div key={coat.id} onClick={() => setSelected(coat)} className="bg-white rounded-xl p-4 border border-gray-100 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <span className="font-mono text-sm font-semibold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{coat.code}</span>
              <StatusTag status={coat.status} />
            </div>
            {coat.photoUrl ? (
              <div className="w-full h-28 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                <img src={coat.photoUrl} alt={coat.code} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-28 rounded-lg bg-gradient-to-br from-[#0D7377]/5 to-[#0D7377]/10 flex flex-col items-center justify-center text-[#0D7377]/40">
                <Shirt className="w-10 h-10 mb-1" />
                <span className="text-[10px]">暂无照片</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-[#0D7377]/8 text-[#0D7377] rounded text-xs font-medium">{coat.size}</span>
              <span className="text-xs text-[#6B7280]">{coat.className}</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{coat.studentName}</p>
            <div className="flex items-center justify-between mt-auto">
              <StainDots level={coat.stainLevel} />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
          <Shirt className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">暂无匹配的实验服记录</p>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">实验服详情</h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {selected.photoUrl && (
              <div className="w-full mb-5 rounded-xl overflow-hidden border border-gray-100">
                <img src={selected.photoUrl} alt={selected.code} className="w-full h-48 object-cover" />
              </div>
            )}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#6B7280]">编号</span><span className="font-mono font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{selected.code}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">尺码</span><span>{selected.size}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">班级</span><span>{selected.className}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">姓名</span><span className="font-medium">{selected.studentName}</span></div>
              <div className="flex justify-between items-center"><span className="text-[#6B7280]">污渍等级</span><StainDots level={selected.stainLevel} /></div>
              <div className="flex justify-between items-center"><span className="text-[#6B7280]">状态</span><StatusTag status={selected.status} /></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">登记日期</span><span>{format(new Date(selected.createdAt), 'yyyy-MM-dd')}</span></div>
            </div>
            {washHistory.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">送洗记录</h3>
                <div className="space-y-2">
                  {washHistory.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-mono text-[#6B7280]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.batch?.batchNo}</span>
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', item.returnStatus === 'clean' ? 'bg-green-100 text-green-700' : item.returnStatus === 'damaged' ? 'bg-[#E8590C]/10 text-[#E8590C]' : 'bg-yellow-100 text-yellow-700')}>
                        {{ clean: '洁净', damaged: '损坏', pending: '待取回', missing: '遗失' }[item.returnStatus]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">新建实验服档案</h2>
              <button onClick={() => setShowNew(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1.5">编号（自动生成）</label>
                <input readOnly value={nextCode} className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1.5">尺码</label>
                  <select value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value as Coat['size'] }))} className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30">
                    {SIZES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1.5">班级</label>
                  <select value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30">
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1.5">学生姓名</label>
                <input value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} placeholder="请输入姓名" className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30" />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1.5">污渍等级</label>
                <StainDots level={form.stainLevel} interactive onChange={l => setForm(f => ({ ...f, stainLevel: l }))} />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1.5">照片</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {form.photoUrl ? (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={form.photoUrl} alt="预览" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100"
                    >
                      <Upload className="w-4 h-4 mr-1" /> 更换照片
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="w-full h-36 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#0D7377]/40 hover:bg-[#0D7377]/5 transition-all flex flex-col items-center justify-center gap-2 text-[#6B7280] hover:text-[#0D7377]"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs font-medium">点击上传实验服照片</span>
                    <span className="text-[10px] opacity-60">支持 JPG / PNG 格式</span>
                  </button>
                )}
              </div>
              <button onClick={handleAdd} disabled={!form.studentName.trim()} className="w-full py-2.5 bg-[#0D7377] text-white rounded-lg text-sm font-medium hover:bg-[#0D7377]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
