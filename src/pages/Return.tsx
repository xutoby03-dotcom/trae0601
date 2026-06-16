import { useState } from 'react'
import { useStore } from '@/store'
import { STATUS_LABELS, STATUS_COLORS, DAMAGE_LABELS, DAMAGE_COLORS, type GoggleStatus, type DamageType, type DamageActionType } from '@/types'
import { RotateCcw, Search, AlertTriangle, X } from 'lucide-react'

const RETURN_STATUSES: { value: GoggleStatus; label: string }[] = [
  { value: 'pending_clean', label: '待清洗' },
  { value: 'disinfected', label: '已消毒' },
  { value: 'drying', label: '晾干中' },
  { value: 'stored', label: '已入柜' },
]

export default function Return() {
  const { goggles, returnGoggle, reportDamage, getLabById } = useStore()
  const [searchCode, setSearchCode] = useState('')
  const [returnedItems, setReturnedItems] = useState<Array<{ goggleId: string; status: GoggleStatus }>>([])
  const [showDamageModal, setShowDamageModal] = useState(false)
  const [damageGoggleId, setDamageGoggleId] = useState('')
  const [damageType, setDamageType] = useState<DamageType>('lens_scratched')
  const [damageDesc, setDamageDesc] = useState('')
  const [damageAction, setDamageAction] = useState<DamageActionType>('repair')
  const [toast, setToast] = useState('')

  const checkedOutGoggles = goggles.filter(g => g.status === 'checked_out')

  const handleSearch = () => {
    const goggle = checkedOutGoggles.find(g =>
      g.code.toLowerCase() === searchCode.toLowerCase().trim()
    )
    if (goggle) {
      if (!returnedItems.find(r => r.goggleId === goggle.id)) {
        setReturnedItems(prev => [...prev, { goggleId: goggle.id, status: 'pending_clean' }])
      }
      setSearchCode('')
    } else {
      setToast('未找到该编号的借出护目镜')
      setTimeout(() => setToast(''), 2000)
    }
  }

  const handleReturnAll = () => {
    returnedItems.forEach(item => {
      returnGoggle(item.goggleId, item.status)
    })
    setToast(`成功归还 ${returnedItems.length} 副护目镜`)
    setReturnedItems([])
    setTimeout(() => setToast(''), 3000)
  }

  const handleMarkDamage = (goggleId: string) => {
    setDamageGoggleId(goggleId)
    setShowDamageModal(true)
  }

  const handleDamageSubmit = () => {
    if (!damageDesc.trim()) return
    reportDamage(damageGoggleId, damageType, damageDesc, damageAction)
    setReturnedItems(prev => prev.filter(r => r.goggleId !== damageGoggleId))
    setShowDamageModal(false)
    setDamageDesc('')
    setDamageType('lens_scratched')
    setDamageAction('repair')
    setToast('已标记损坏并停用，已加入维修补购清单')
    setTimeout(() => setToast(''), 3000)
  }

  const getGoggle = (id: string) => goggles.find(g => g.id === id)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">归还管理</h2>
        <p className="text-slate-500 mt-1">逐副扫码归还护目镜，标记归还状态或损坏情况</p>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-pulse-slow">
          <RotateCcw className="w-4 h-4" />
          {toast}
        </div>
      )}

      <div className="card p-6 mb-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">扫码归还</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="输入护目镜编号（如 HM-001）后按回车"
              className="input-field pl-9 text-lg py-3"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary px-6">查找</button>
        </div>
        <p className="text-xs text-slate-500 mt-2">当前借出中：<span className="font-medium text-amber-600">{checkedOutGoggles.length} 副</span></p>
      </div>

      {returnedItems.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">待归还列表 ({returnedItems.length})</h3>
            <button onClick={handleReturnAll} className="btn-primary">
              <RotateCcw className="w-4 h-4" />
              确认全部归还
            </button>
          </div>
          <div className="space-y-3">
            {returnedItems.map(item => {
              const goggle = getGoggle(item.goggleId)
              if (!goggle) return null
              const lab = getLabById(goggle.labId)
              return (
                <div key={item.goggleId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs shrink-0">
                    {goggle.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">编号 {goggle.code}</p>
                    <p className="text-xs text-slate-500">{lab?.name} · {goggle.size}码</p>
                  </div>
                  <select
                    value={item.status}
                    onChange={e => {
                      const newStatus = e.target.value as GoggleStatus
                      setReturnedItems(prev =>
                        prev.map(r => r.goggleId === item.goggleId ? { ...r, status: newStatus } : r)
                      )
                    }}
                    className="select-field w-32"
                  >
                    {RETURN_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleMarkDamage(item.goggleId)}
                    className="btn-danger text-xs px-3 py-1.5"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    标记损坏
                  </button>
                  <button
                    onClick={() => setReturnedItems(prev => prev.filter(r => r.goggleId !== item.goggleId))}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">当前借出护目镜</h3>
        {checkedOutGoggles.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">暂无借出中的护目镜</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {checkedOutGoggles.map(g => {
              const lab = getLabById(g.labId)
              return (
                <div key={g.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-brand-300 transition-colors cursor-pointer"
                  onClick={() => {
                    if (!returnedItems.find(r => r.goggleId === g.id)) {
                      setReturnedItems(prev => [...prev, { goggleId: g.id, status: 'pending_clean' }])
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-800">{g.code}</span>
                    <span className={`badge ${STATUS_COLORS[g.status]}`}>{STATUS_LABELS[g.status]}</span>
                  </div>
                  <p className="text-xs text-slate-500">{lab?.name} · {g.size}码</p>
                  <p className="text-xs text-brand-600 mt-1">点击添加到归还列表</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showDamageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                标记损坏
              </h3>
              <button onClick={() => setShowDamageModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">损坏类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(DAMAGE_LABELS) as [DamageType, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setDamageType(key)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        damageType === key
                          ? 'border-rose-300 bg-rose-50 text-rose-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className={`badge ${DAMAGE_COLORS[key]} mb-1`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">损坏描述</label>
                <textarea
                  value={damageDesc}
                  onChange={e => setDamageDesc(e.target.value)}
                  placeholder="请描述损坏情况..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">处理方式</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDamageAction('repair')}
                    className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                      damageAction === 'repair'
                        ? 'border-brand-300 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    送修
                  </button>
                  <button
                    onClick={() => setDamageAction('replace')}
                    className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                      damageAction === 'replace'
                        ? 'border-accent-300 bg-accent-50 text-accent-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    补购
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowDamageModal(false)} className="btn-secondary flex-1">取消</button>
              <button
                onClick={handleDamageSubmit}
                className="btn-danger flex-1"
                disabled={!damageDesc.trim()}
              >
                确认停用并加入清单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
